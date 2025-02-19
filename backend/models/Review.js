const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  agentId: String,
  location: String,
  rating: Number,
  comment: String,
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