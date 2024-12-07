const express = require("express");
const router = express.Router();
const Withdrawal = require("../models/withdrawalModel");
const SelectedUser = require("../models/selectedReferralModel");
const User = require("../models/userModel");

// CREATE: Add a new SelectedUser and approve their withdrawal if conditions are met
const createSelectedReferralUser = async (req, res) => {
  try {
    const { userId,withdrawalId } = req.body;

    // Create a new SelectedUser instance
    const selectedUser = new SelectedUser({  userId,withdrawalId });
    const savedUser = await selectedUser.save();

    
  
    // Find a pending withdrawal for the user
    const pendingWithdrawal = await Withdrawal.findOne({
      userId: user._id,
      status: "pending",
    });

    if (!pendingWithdrawal) {
      return res.status(404).json({ message: "No pending withdrawal found for this user." });
    }

    // Update the withdrawal status to approved
    pendingWithdrawal.status = "approved";
    await pendingWithdrawal.save();

    res.status(201).json({
      message: "Selected user created and withdrawal approved.",
      selectedUser: savedUser,
      updatedWithdrawal: pendingWithdrawal,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// READ: Get all users
const getSelectedReferralUsers = async (req, res) => {
  try {
    const users = await SelectedUser.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: Get a user by ID
const getSelectedReferralUserById = async (req, res) => {
  try {
    const user = await SelectedUser.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE: Update a user by ID
const updateSelectedReferralUser = async (req, res) => {
  try {
    const {  userId,withdrawalId } = req.body;

    const user = await SelectedUser.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

   
    if (userId !== undefined) user.userId = userId;
    if (withdrawalId !== undefined) user.withdrawalId = withdrawalId;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// DELETE: Delete a user by ID
const deleteSelectedReferralUser = async (req, res) => {
  try {
    const user = await SelectedUser.findOneAndDelete({withdrawalId:req.params.id});
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSelectedReferralUser,
  getSelectedReferralUsers,
  getSelectedReferralUserById,
  updateSelectedReferralUser,
  deleteSelectedReferralUser,
};
