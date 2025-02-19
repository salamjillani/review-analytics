const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  agentId: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  tags: {
    sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative'] },
    performance: { type: String, enum: ['Fast', 'Average', 'Slow'] },
    accuracy: { type: String, enum: ['Accurate', 'Mistake'] }
  },
  orderPrice: Number,
  discountApplied: Boolean,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);