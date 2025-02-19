const router = require('express').Router();
const Review = require('../models/Review');

router.get('/', async (req, res) => {
  try {
    const { location } = req.query;
    const matchStage = location ? { location } : {};

    const [averageRatings, agentPerformance, accuracyStats, locations] = await Promise.all([
      Review.aggregate([
        { $match: matchStage },
        { $group: { _id: "$location", averageRating: { $avg: "$rating" } } }
      ]),
      Review.aggregate([
        { $match: matchStage },
        { $group: { _id: "$agentId", avgRating: { $avg: "$rating" } } },
        { $sort: { avgRating: -1 } }
      ]),
      Review.aggregate([
        { $match: matchStage },
        { $group: { _id: "$tags.accuracy", count: { $sum: 1 } } }
      ]),
      Review.distinct('location')
    ]);

    res.json({
      averageRatings,
      topAgents: agentPerformance.slice(0, 5),
      bottomAgents: agentPerformance.slice(-5),
      accuracyStats,
      locations
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;