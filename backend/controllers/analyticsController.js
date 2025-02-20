const Review = require("../models/Review");

exports.getAnalytics = async (req, res) => {
  try {
    const matchStage = {};

    const priceRanges = await Review.aggregate([
      { $match: matchStage },
      {
        $bucket: {
          groupBy: "$orderPrice",
          boundaries: [0, 26, 51, 101, Infinity],
          default: "Other",
          output: {
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" },
          },
        },
      },
    ]);

    const priceRangeMap = {
      0: "$0-25",
      26: "$26-50",
      51: "$51-100",
      101: "$100+",
    };

    const formattedPriceRanges = priceRanges.reduce((acc, curr) => {
      const rangeLabel = priceRangeMap[curr._id] || "Other";
      acc[rangeLabel] = curr.count;
      return acc;
    }, {});

    res.json({ priceRanges: formattedPriceRanges });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
