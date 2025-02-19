const router = require('express').Router();
const natural = require('natural');
const auth = require('../middleware/auth');
const Review = require('../models/Review');


const analyzer = new natural.SentimentAnalyzer(
  'English',
  natural.PorterStemmer,
  'afinn'
);
const stemmer = natural.PorterStemmer;


router.put('/:id/tags', auth('admin'), async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { tags: req.body.tags },
    { new: true }
  );
  res.json(review);
});


function analyzeSentiment(text) {
  const tokenized = new natural.WordTokenizer().tokenize(text);
  const stemmed = tokenized.map(stemmer.stem);
  const score = analyzer.getSentiment(stemmed);
  return score > 0.2 ? 'Positive' : score < -0.2 ? 'Negative' : 'Neutral';
}


router.post('/auto-tag', auth('admin'), async (req, res) => {
  const reviews = await Review.find({ 'tags': { $exists: false } });
  
  reviews.forEach(async review => {
    const tags = {
      sentiment: analyzeSentiment(review.comment),
      performance: review.comment.match(/fast|quick/i) ? 'Fast' :
        review.comment.match(/slow|late/i) ? 'Slow' : 'Average',
      accuracy: review.comment.match(/mistake|missing|wrong/i) ? 'Mistake' : 'Accurate'
    };
    review.tags = tags;
    await review.save();
  });

  res.send('Auto-tagging completed');
});

module.exports = router;