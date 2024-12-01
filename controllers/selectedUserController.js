const express = require("express");
const router = express.Router();
const Withdrawal = require("../models/withdrawalModel");
const SelectedUser = require("../models/selectedUserModel");
const User = require("../models/userModel");

// CREATE: Add a new SelectedUser and approve their withdrawal if conditions are met
const createUser = async (req, res) => {
  try {
    const { username, fullname, referral, image, status, amount, userId,withdrawalId } = req.body;

    // Create a new SelectedUser instance
    const selectedUser = new SelectedUser({ username, fullname, referral, image, status, amount, userId,withdrawalId });
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

// CREATE: Add multiple SelectedUsers and approve their withdrawals
const createUsersAndApproveWithdrawals = async (req, res) => {
  try {
    const { users,amount} = req.body; // Expecting an array of user objects
    const createdUsers = [];
    const approvedWithdrawals = [];

    for (const userData of users) {
      const {_id, username, fullname, referral, image, status} = userData;

      // Check if the user exists in the User model
      const user = await User.findOne({ username });
      if (!user) {
        console.warn(`User not found for username: ${username}`);
        continue;
      }

      // Find a pending withdrawal for the user
      const pendingWithdrawal = new Withdrawal({
        userId: user._id,
        status: "approved",
      });
      await pendingWithdrawal.save();
      approvedWithdrawals.push(pendingWithdrawal);


      // Create a new SelectedUser
      const selectedUser = new SelectedUser({ username, fullname, referral, image, status, amount, userId:_id,withdrawalId:pendingWithdrawal._id });
      const savedUser = await selectedUser.save();
      createdUsers.push(savedUser);
    }

    res.status(201).json({
      message: "Selected users created and withdrawals approved.",
      createdUsers,
      approvedWithdrawals,
    });
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
    const { username, fullname, referral, image, status ,amount,userId,withdrawalId} = req.body;
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
  createUsersAndApproveWithdrawals,
};
