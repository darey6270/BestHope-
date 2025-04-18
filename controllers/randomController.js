const RandomModel = require('../models/randomModel');
const Withdrawal=require('../models/withdrawalModel'); 
const SelectedUser=require('../models/selectedUserModel');
const asyncHandler = require('express-async-handler');
const User = require("../models/userModel");

// Create a new record
exports.createRandomRecord = async (req, res) => {
  const { userId, notes } = req.body;

  try {
    const newRecord = await RandomModel.create({ userId, notes });
    res.status(201).json({ message: 'Record created successfully', record: newRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  };
}

// Get all records
exports.getAllRecords = async (req, res) => {
  try {
    const records = await RandomModel.find().populate('userId');
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all selected users (excluded: false)
exports.getselectedUsers = async (req, res) => {
  try {
    const unselectedUsers = await RandomModel.find({ excluded: true }).populate('userId');
    
    if (unselectedUsers.length === 0) {
      return res.status(404).json({ message: 'No unselected users found.' });
    }

    res.status(200).json(unselectedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Select a random user who has not been previously selected
exports.selectRandomUser = async (req, res) => {
  try {
    const eligibleUsers = await RandomModel.find({ excluded: true });

    if (eligibleUsers.length === 0) {
      return res.status(404).json({ message: 'No eligible users found for selection.' });
    }

    // Select a random user from the eligible list
    const randomIndex = Math.floor(Math.random() * eligibleUsers.length);
    const selectedUser = eligibleUsers[randomIndex];

    // Update selected user's record
    selectedUser.excluded = true;
    selectedUser.selectionCount += 1;
    selectedUser.selectedAt = new Date();
    await selectedUser.save();

    res.status(200).json({ message: 'Random user selected', user: selectedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk update exclusion status for multiple users
exports.bulkUpdateExclusion = async (req, res) => {
  const { userIds, exclude, amounts } = req.body;

  try {
    if (exclude) {
      for (const [index, userId] of userIds.entries()) {
        try {
          const user = await User.findById(userId);
          if (!user) {
            console.log(`User not found: ${userId}`);
            continue; // Skip this user if not found
          }

          // ✅ Ensure `RandomModel` does not create duplicates
          await RandomModel.findOneAndUpdate(
            { userId },
            { notes: "You are among the selected users", excluded: true },
            { upsert: true, new: true }
          );

          
          const  withdrawal = await Withdrawal.create({
              userId,
              bank_name: "",
              account_holder_name: "",
              account_number: "",
              image: "",
              normalStatus: "approved",
              referralStatus: "pending",
              amount: amounts,
              type: "normal",
            });

          console.log("you were choose randomly for withdrawal",JSON.stringify(withdrawal));

          

          // ✅ Ensure `SelectedUser` entry is unique for the user
          await SelectedUser.findOneAndUpdate(
            { userId },
            {
              username: user.username,
              fullname: user.fullname,
              referral: user.referral,
              image: user.image,
              status: "approved",
              amount: amounts,
              withdrawalId: withdrawal._id,
            },
            { upsert: true, new: true }
          );

          // ✅ Update the user balance without duplicates
          await User.findOneAndUpdate(
            { _id: userId },
            { balance: amounts, isSelectedWithdraw: true, withdrawalId: withdrawal._id },
            { new: true }
          );

          console.log(`User with ID ${userId} was approved.`);
        } catch (error) {
          console.error(`Error processing user ${userId}:`, error.message);
        }
      }
    }

    res.status(200).json({
      message: `Users successfully ${exclude ? "excluded" : "included"} in selection pool.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete a user's record from RandomModel
exports.deleteRecord = async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedRecord = await RandomModel.findOneAndDelete({ userId });

    if (!deletedRecord) {
      return res.status(404).json({ message: 'User not found in RandomModel.' });
    }

    res.status(200).json({ message: 'Record deleted successfully', record: deletedRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetRandomSelectedUser = asyncHandler(async (req, res) => {
  await RandomModel.deleteMany({});
  res.status(200).json({ message: "All randomly selected users have been reset" });
});
