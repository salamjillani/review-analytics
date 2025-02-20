
const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');


router.get('/', auth('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password'); 
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Deletion failed' });
  }
});

module.exports = router;