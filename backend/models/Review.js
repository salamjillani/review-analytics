const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  agentId: { 
    type: String, 
    required: true,
    index: true
  },
  location: { 
    type: String, 
    required: true,
    index: true
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5,
    index: true
  },
  comment: { 
    type: String, 
    required: true 
  },
  issues: [{
    type: String,
    enum: ['LATE_DELIVERY', 'WRONG_ITEMS', 'DAMAGED', 'CUSTOMER_SERVICE', 'FOOD_QUALITY']
  }],
  tags: {
    sentiment: { 
      type: String, 
      enum: ['Positive', 'Neutral', 'Negative'],
      index: true
    },
    confidence: {
      type: String,
      enum: ['High', 'Medium', 'Low']
    },
    performance: { 
      type: String, 
      enum: ['Fast', 'Average', 'Slow'],
      index: true
    },
    accuracy: { 
      type: String, 
      enum: ['Accurate', 'Mistake', 'Unspecified'],
      index: true
    }
  },
  orderPrice: {
    type: Number,
    required: true,
    index: true
  },
  discountApplied: {
    type: Boolean,
    default: false,
    index: true
  },
  lastTaggedAt: {
    type: Date
  },
  tagMethod: {
    type: String,
    enum: ['auto', 'manual']
  },
  taggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
});


reviewSchema.index({ location: 1, rating: 1 });
reviewSchema.index({ agentId: 1, rating: 1 });
reviewSchema.index({ 'tags.sentiment': 1, createdAt: -1 });
reviewSchema.index({ issues: 1 });

module.exports = mongoose.model('Review', reviewSchema);