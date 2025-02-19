const natural = require('natural');
const Review = require('../models/Review');

const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
const stemmer = natural.PorterStemmer;

const analyzeSentiment = (text) => {
  const tokenized = new natural.WordTokenizer().tokenize(text);
  const stemmed = tokenized.map(stemmer.stem);
  const score = analyzer.getSentiment(stemmed);
  return score > 0.2 ? 'Positive' : score < -0.2 ? 'Negative' : 'Neutral';
};

exports.autoTagReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ tags: { $exists: false } });
    
    for (const review of reviews) {
      const tags = {
        sentiment: analyzeSentiment(review.comment),
        performance: review.comment.match(/fast|quick/i) ? 'Fast' :
          review.comment.match(/slow|late/i) ? 'Slow' : 'Average',
        accuracy: review.comment.match(/mistake|missing|wrong/i) ? 'Mistake' : 'Accurate'
      };
      await Review.findByIdAndUpdate(review._id, { tags });
    }
    
    res.json({ message: `${reviews.length} reviews auto-tagged` });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

exports.manualTagReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { tags: req.body.tags },
      { new: true }
    );
    res.json(review);
  } catch (error) {
    res.status(500).send('Server error');
  }
};