
const Review = require('../models/Review');
const natural = require('natural');


const ISSUE_INDICATORS = {
  LATE_DELIVERY: ['late', 'delay', 'slow', 'waited', 'forever', 'waiting'],
  WRONG_ITEMS: ['wrong', 'incorrect', 'missing', 'different'],
  DAMAGED: ['damaged', 'broken', 'poor condition', 'bad condition'],
  CUSTOMER_SERVICE: ['rude', 'unhelpful', 'unprofessional', 'poor service'],
  FOOD_QUALITY: ['cold', 'stale', 'bad', 'poor quality', 'not fresh']
};

const SPEED_INDICATORS = {
  fast: ['quick', 'rapid', 'prompt', 'speedy', 'early', 'lightning', 'fast'],
  slow: ['delay', 'late', 'slow', 'forever', 'waited', 'waiting', 'long']
};

const ISSUE_LABELS = {
  LATE_DELIVERY: 'Late Delivery',
  WRONG_ITEMS: 'Wrong Items',
  DAMAGED: 'Damaged Items',
  CUSTOMER_SERVICE: 'Poor Service',
  FOOD_QUALITY: 'Food Quality Issues'
};

const PRICE_RANGE_MAP = {
  0: '$0-25',
  25: '$26-50',
  50: '$51-100',
  100: '$100+'
};


const analyzeIssues = (text) => {
  const lowercaseText = text.toLowerCase();
  return Object.entries(ISSUE_INDICATORS)
    .filter(([_, keywords]) => keywords.some(kw => lowercaseText.includes(kw)))
    .map(([issue]) => issue);
};

const analyzeSpeed = (text) => {
  const lowercaseText = text.toLowerCase();
  const hasFast = SPEED_INDICATORS.fast.some(word => lowercaseText.includes(word));
  const hasSlow = SPEED_INDICATORS.slow.some(word => lowercaseText.includes(word));

  if (hasFast && !hasSlow) return 'Fast';
  if (hasSlow && !hasFast) return 'Slow';
  return 'Average';
};

const analyzeSentiment = (rating) => {
  if (rating >= 4) return 'Positive';
  if (rating <= 2) return 'Negative';
  return 'Neutral';
};

const buildMatchStage = (query) => {
  const matchStage = {};
  if (query.location) matchStage.location = query.location;
  if (query.minRating) matchStage.rating = { $gte: parseInt(query.minRating) };
  if (query.priceRange) {
    const [min, max] = query.priceRange.replace('$', '').split('-').map(Number);
    matchStage.orderPrice = { $gte: min, $lte: max || Infinity };
  }
  if (query.hasDiscount !== undefined) {
    matchStage.discountApplied = query.hasDiscount === 'true';
  }
  return matchStage;
};

exports.autoTagReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    
    for (const review of reviews) {
      const issues = analyzeIssues(review.comment);
      
      review.tags = {
        sentiment: analyzeSentiment(review.rating),
        performance: analyzeSpeed(review.comment),
        accuracy: issues.includes('WRONG_ITEMS') ? 'Mistake' : 'Accurate',
        confidence: 'High'
      };
      
      review.issues = issues;
      review.tagMethod = 'auto';
      review.lastTaggedAt = new Date();
      await review.save();
    }

    res.json({ 
      success: true,
      message: `${reviews.length} reviews auto-tagged successfully` 
    });
  } catch (error) {
    console.error('Auto-tag error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Auto-tagging failed',
      details: error.message
    });
  }
};

exports.manualTagReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    review.tags = {
      ...review.tags,
      ...req.body.tags
    };
    review.tagMethod = 'manual';
    review.lastTaggedAt = new Date();
    review.taggedBy = req.user._id;

    await review.save();
    res.json({ success: true, message: 'Review manually tagged', review });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Manual tagging failed',
      details: error.message
    });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const matchStage = buildMatchStage(req.query);
    
    const [
      commonComplaints,
      averageRatings,
      agentPerformance,
      priceRanges,
      locations
    ] = await Promise.all([
      Review.aggregate([
        { 
          $match: {
            ...matchStage,
            "issues": { $exists: true, $not: { $size: 0 } }
          }
        },
        { $unwind: "$issues" },
        { $group: { _id: "$issues", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      Review.aggregate([
        { $match: matchStage },
        { 
          $group: { 
            _id: "$location",
            averageRating: { $avg: "$rating" },
            count: { $sum: 1 }
          }
        },
        { $sort: { averageRating: -1 } }
      ]),
      
      Review.aggregate([
        { $match: matchStage },
        { 
          $group: { 
            _id: "$agentId",
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
            issueCount: { $sum: { $cond: [{ $lt: ["$rating", 3] }, 1, 0] } }
          }
        },
        { 
          $project: {
            _id: 1,
            avgRating: { $round: ["$avgRating", 1] },
            totalReviews: 1,
            issueRate: { $multiply: [{ $divide: ["$issueCount", "$totalReviews"] }, 100] }
          }
        },
        { $sort: { avgRating: -1 } }
      ]),
      
      Review.aggregate([
        { $match: matchStage },
        {
          $bucket: {
            groupBy: "$orderPrice",
            boundaries: [0, 25, 50, 100, Infinity],
            default: "Other",
            output: {
              count: { $sum: 1 },
              avgRating: { $avg: "$rating" }
            }
          }
        }
      ]),
      
      Review.distinct('location')
    ]);


    const priceRangesResult = priceRanges.reduce((acc, curr) => {
      const rangeLabel = PRICE_RANGE_MAP[curr._id] || 'Other';
      acc[rangeLabel] = curr.count;
      return acc;
    }, {});

  
    res.json({
      success: true,
      data: {
        commonComplaints: commonComplaints.map(c => ({
          _id: c._id,
          label: ISSUE_LABELS[c._id] || c._id,
          count: c.count
        })),
        averageRatings: averageRatings.map(r => ({
          ...r,
          averageRating: Number(r.averageRating.toFixed(1))
        })),
        topAgents: agentPerformance.slice(0, 5),
        bottomAgents: agentPerformance.slice(-5).reverse(),
        priceRanges: {
          '$0-25': priceRangesResult['$0-25'] || 0,
          '$26-50': priceRangesResult['$26-50'] || 0,
          '$51-100': priceRangesResult['$51-100'] || 0,
          '$100+': priceRangesResult['$100+'] || 0
        },
        locations
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Analytics failed',
      details: error.message
    });
  }
};