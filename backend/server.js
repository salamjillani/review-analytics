
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const auth = require('./routes/auth');
const analyticsRouter = require('./routes/analytics');
 
const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));



app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/analytics', analyticsRouter);
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', auth);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));