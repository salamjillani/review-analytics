const router = require('express').Router();
const Review = require('../models/Review');

// Get average ratings per location
router.get('/average-ratings', async (req, res) => {
  try {
    const results = await Review.aggregate([
      {
        $group: {
          _id: "$location",
          averageRating: { $avg: "$rating" }
        }
      }
    ]);
    res.json(results);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Get top/bottom performing agents
router.get('/agent-performance', async (req, res) => {
  try {
    const topAgents = await Review.aggregate([
      { $group: { _id: "$agentId", avgRating: { $avg: "$rating" } } },
      { $sort: { avgRating: -1 } },
      { $limit: 5 }
    ]);

    const bottomAgents = await Review.aggregate([
      { $group: { _id: "$agentId", avgRating: { $avg: "$rating" } } },
      { $sort: { avgRating: 1 } },
      { $limit: 5 }
    ]);

    res.json({ topAgents, bottomAgents });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;