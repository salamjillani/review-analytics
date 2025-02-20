//backend/scripts/generateSampleData.js
const mongoose = require('mongoose');
const Review = require('../models/Review');
require('dotenv').config();

const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
const comments = [
  'Very fast delivery, great service!',
  'Delivery was late and food was cold',
  'Perfect delivery, right on time',
  'Wrong items in my order',
  'Excellent service, very professional',
  'The delivery was quick but items were missing',
  'Average delivery time, nothing special',
  'Outstanding service and very punctual',
  'Delayed delivery but driver was apologetic',
  'Food arrived hot and on time'
];

// Helper functions for analysis
const analyzeIssues = (comment) => {
  const issues = [];
  const lowerComment = comment.toLowerCase();
  
  if (lowerComment.includes('late') || lowerComment.includes('delayed')) {
    issues.push('LATE_DELIVERY');
  }
  if (lowerComment.includes('cold')) {
    issues.push('FOOD_QUALITY');
}
  if (lowerComment.includes('wrong') || lowerComment.includes('missing')) {
    issues.push('WRONG_ITEMS');
  }
  return issues;
};

const analyzeSentiment = (rating) => {
  if (rating >= 4) return 'Positive';
  if (rating === 3) return 'Neutral';
  return 'Negative';
};

const analyzeSpeed = (comment) => {
  const lowerComment = comment.toLowerCase();
  if (lowerComment.includes('fast') || lowerComment.includes('quick')) {
    return 'Fast';
  }
  if (lowerComment.includes('late') || lowerComment.includes('delayed')) {
    return 'Slow';
  }
  return 'Average';
};

const generateRandomReview = () => {
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];
  const randomComment = comments[Math.floor(Math.random() * comments.length)];
  const randomPrice = Math.floor(Math.random() * 150) + 10; // Random price between 10 and 160
  const randomRating = Math.floor(Math.random() * 5) + 1;
  const randomAgentId = Math.floor(Math.random() * 20) + 1;

  return {
    agentId: `AG${randomAgentId.toString().padStart(3, '0')}`,
    location: randomLocation,
    rating: randomRating,
    comment: randomComment,
    orderPrice: randomPrice,
    discountApplied: Math.random() > 0.7, // 30% chance of discount
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
    issues: analyzeIssues(randomComment),
    tags: {
      sentiment: analyzeSentiment(randomRating),
      performance: analyzeSpeed(randomComment),
      accuracy: analyzeIssues(randomComment).includes('WRONG_ITEMS') ? 'Mistake' : 'Accurate'
    }
  };
};

const generateSampleData = async (count) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const reviews = Array(count).fill().map(generateRandomReview);
    await Review.insertMany(reviews);
    
    console.log(`Successfully inserted ${count} sample reviews`);
    process.exit(0);
  } catch (error) {
    console.error('Error generating sample data:', error);
    process.exit(1);
  }
};

// Generate 500 sample reviews
generateSampleData(500);