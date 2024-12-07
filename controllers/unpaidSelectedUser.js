const express = require("express");
const router = express.Router();
const Withdrawal = require("../models/withdrawalModel");
const UnpaidSelectedUser = require("../models/unpaidSelectedUserModel");
const User = require("../models/userModel");

// CREATE: Add a new UnpaidSelectedUser and approve their withdrawal if conditions are met
const createPaid = async (req, res) => {
  try {
    const { username, fullname, referral, image, status, amount, userId,withdrawalId } = req.body;

    // Create a new UnpaidSelectedUser instance
    const paidSelectedUser = new UnpaidSelectedUser({ username, fullname, referral, image, status, amount, userId,withdrawalId });
    const savedUser = await paidSelectedUser.save();


    res.status(201).json({
      message: "unpaidSelected user created and withdrawal approved.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};




// READ: Get all users
const getUsers = async (req, res) => {
  try {
    const users = await UnpaidSelectedUser.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE: Update a user by ID
const updateUser = async (req, res) => {
  try {
    const { username, fullname, referral, image, status ,amount,userId,withdrawalId} = req.body;
    const user = await UnpaidSelectedUser.findById(req.params.id);

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
    const user = await UnpaidSelectedUser.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const paidUser = async (req, res) => {
  try {

    const user = await UnpaidSelectedUser.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'Selected user not found' });
      user.status = "paid";
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createPaid,
  getUsers,
  updateUser,
  deleteUser,
  paidUser,
};
