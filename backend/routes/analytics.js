//routes/analytics.js
const router = require('express').Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');

router.get('/', auth(), async (req, res) => {
  try {
    const { location, minRating, priceRange, hasDiscount } = req.query;
    
    // Build match stage based on filters
    const matchStage = {};
    if (location) matchStage.location = location;
    if (minRating) matchStage.rating = { $gte: parseInt(minRating) };
    if (priceRange) {
      const [min, max] = priceRange.replace('$', '').split('-').map(Number);
      matchStage.orderPrice = { $gte: min, $lte: max || Infinity };
    }
    if (hasDiscount !== undefined) {
      matchStage.discountApplied = hasDiscount === 'true';
    }

    const [
      averageRatings,
      agentPerformance,
      priceRanges,
      commonComplaints,
      locations
    ] = await Promise.all([
      // Average ratings by location
      Review.aggregate([
        { $match: matchStage },
        { 
          $group: { 
            _id: "$location", 
            averageRating: { $avg: "$rating" },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Agent performance
      Review.aggregate([
        { $match: matchStage },
        { 
          $group: { 
            _id: "$agentId", 
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 }
          }
        },
        { $sort: { avgRating: -1 } }
      ]),
      
      // Price range distribution with proper boundaries
      Review.aggregate([
        { $match: matchStage },
        {
          $bucket: {
            groupBy: "$orderPrice",
            boundaries: [0, 25, 50, 100, Infinity],
            default: "Other",
            output: {
              count: { $sum: 1 }
            }
          }
        }
      ]).then(results => {
        const ranges = { '$0-25': 0, '$26-50': 0, '$51-100': 0, '$100+': 0 };
        
        results.forEach(bucket => {
          switch (bucket._id) {
            case 0: ranges['$0-25'] = bucket.count; break;
            case 25: ranges['$26-50'] = bucket.count; break;
            case 50: ranges['$51-100'] = bucket.count; break;
            case 100: ranges['$100+'] = bucket.count; break;
          }
        });
        return ranges;
      }),
      
      // Common complaints with improved categorization
      Review.aggregate([
        { 
          $match: { 
            ...matchStage,
            "tags.sentiment": "Negative",
            "tags.accuracy": { $exists: true }
          }
        },
        { 
          $group: { 
            _id: "$tags.accuracy",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      
      // All unique locations
      Review.distinct('location')
    ]);

    res.json({
      success: true,
      data: { 
        averageRatings,
        topAgents: agentPerformance.slice(0, 5),
        bottomAgents: agentPerformance.slice(-5),
        priceRanges,
        commonComplaints,
        locations
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;