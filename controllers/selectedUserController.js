const SelectedUser = require('../models/selectedUserModel');

// CREATE: Add a new user
const createUser = async (req, res) => {
  try {
    const { username, fullname, referral, image, status } = req.body;
    const user = new SelectedUser({ username, fullname, referral, image, status });
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ: Get all users
const getUsers = async (req, res) => {
  try {
    const users = await SelectedUser.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: Get a user by ID
const getUserById = async (req, res) => {
  try {
    const user = await SelectedUser.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE: Update a user by ID
const updateUser = async (req, res) => {
  try {
    const { username, fullname, referral, image, status } = req.body;
    const user = await SelectedUser.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username !== undefined) user.username = username;
    if (fullname !== undefined) user.fullname = fullname;
    if (referral !== undefined) user.referral = referral;
    if (image !== undefined) user.image = image;
    if (status !== undefined) user.status = status;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE: Delete a user by ID
const deleteUser = async (req, res) => {
  try {
    const user = await SelectedUser.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
