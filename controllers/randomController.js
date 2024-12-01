const RandomModel = require('../models/randomModel');
const Withdrawal=require('../models/withdrawalModel'); 
const {updateWithdrawalStatus,autoAppoveWithdrawal} = require("../controllers/withdrawController");
const SelectedUser=require('../models/selectedUserModel');
const asyncHandler = require('express-async-handler');

// Create a new record
exports.createRandomRecord = async (req, res) => {
  const { userId, notes } = req.body;

  try {
    const newRecord = await RandomModel.create({ userId, notes });
    res.status(201).json({ message: 'Record created successfully', record: newRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
  const { userIds, exclude ,amounts } = req.body;


  try {

    // Optionally update withdrawal status if exclude is true
    if (exclude) {
      for (const userId of userIds) {
        try {
          await RandomModel.create({ userId:userId._id, notes:"you are among the selected user",excluded:true });
          // Create new user
  const withdrawal = await Withdrawal.create({ userId:userId._id,bank_name:"",account_holder_name:"",account_number:"",image:"",normalStatus: "approved",referralStatus: "pending",amount:amounts,type:"normal"});

    let {_id}=withdrawal;

    const selectedUser = await SelectedUser.create({ username:userId.username, fullname:userId.fullname, referral:userId.referral, image:userId.image, status:"approved", amount:amounts, userId:userId._id,withdrawalId:withdrawal._id});

          console.log(`user with this id number ${userId._id} was approved`);
        } catch (error) {
          console.error('Error updating withdrawal status:', error.message);
        }
      }
    }

    res.status(200).json({
      message: `Users successfully ${exclude ? 'excluded' : 'included'} in selection pool.`,
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
