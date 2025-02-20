//backend/routes/reviews.js
const router = require('express').Router();
const { autoTagReviews, manualTagReview } = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const Review = require('../models/Review');


// Get all reviews with pagination and filters
router.get('/', auth(), async (req, res) => {
  try {
    const { page = 1, limit = 10, location, minRating, agentId } = req.query;
    
    const query = {};
    if (location) query.location = location;
    if (minRating) query.rating = { $gte: parseInt(minRating) };
    if (agentId) query.agentId = agentId;

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Review.countDocuments(query);

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create new review
router.post('/', auth(), async (req, res) => {
  try {
    const review = new Review({
      ...req.body,
      createdAt: new Date()
    });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Auto-tag reviews (admin only)
router.post('/auto-tag', auth('admin'), autoTagReviews);

// Manually tag a review (admin only)
router.put('/:id/tags', auth('admin'), manualTagReview);

// Delete a review (admin only)
router.delete('/:id', auth('admin'), async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;