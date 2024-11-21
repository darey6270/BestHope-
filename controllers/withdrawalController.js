const express = require('express');
const router = express.Router();
const Withdrawal = require('../models/withdrawalModel');
const User = require("../models/userModel");
const dotenv = require("dotenv").config();
const cloudinary = require('../utils/cloudinary'); // Import Cloudinary configuration
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const {fileSizeFormatter } = require("../utils/fileUpload");
const uploadMiddleware = require("../utils/uploadMiddleware");
const upload = uploadMiddleware("uploads");
const Referral = require("../models/referralModel");

// Function to approve withdrawals for users with a total of 10,000 in referralModel
 
router.get('/autoApprove',async (req, res) => {
    try {
      // Step 1: Find all users in Referral model with total >= 10,000
      const eligibleReferrals = await Referral.find({ total: { $gte: 10000 } });
      // Step 2: Loop through each eligible referral and update their withdrawal status to "approved"
  
      if (eligibleReferrals.length === 0 ) {
        console.log("No users found with sufficient total for approval" );
        return;
      }
  
      // Step 2: Loop through eligible referrals and approve their pending withdrawals
      const approvedWithdrawals = [];
  
      for (const referral of eligibleReferrals) {
        const { userId } = referral;
  
        // Find the user's pending withdrawal request
        const pendingWithdrawal = await Withdrawal.findOne({
          userId,
          status: "pending",
        });
  
        // Check if a pending withdrawal exists
        if (!pendingWithdrawal) {
          console.warn(`No pending withdrawal found for userId: ${userId}`);
          continue; // Skip to the next referral if no pending withdrawal
        }
  
        // Approve the pending withdrawal
        pendingWithdrawal.status = "approved";
        await pendingWithdrawal.save();
  
        approvedWithdrawals.push(pendingWithdrawal);
      }
  
      if (approvedWithdrawals.length === 0) {
        console.log("No pending withdrawals found for approval" );
      }
  
      console.log(`Withdrawals approved successfully ${approvedWithdrawals}`);
      return;
    } catch (error) {
      console.log("message: error.message ");
    }
  } );
// PATCH: Update the status of a withdrawal by ID
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        // Validate the new status
        const validStatuses = ["pending", "approved", "rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
        }

        // Find and update the withdrawal
        const withdrawal = await Withdrawal.findById(req.params.id);
        if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

        withdrawal.status = status;
        const updatedWithdrawal = await withdrawal.save();

        res.status(200).json({
            message: `Withdrawal status updated to ${status}`,
            withdrawal: updatedWithdrawal,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// CREATE: Add a new withdrawal
router.post('/',upload.single('image'), async (req, res) => {
    try {
        let { userId, bank_name, account_holder_name, account_number,image,status} = req.body;
         image = req.file ? req.file.path : null;
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Create new withdrawal
        const withdrawal = new Withdrawal({
            userId,
            bank_name,
            account_holder_name,
            account_number,
            image,
            status
        });

        const savedWithdrawal = await withdrawal.save();
        res.status(201).json(savedWithdrawal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// READ: Get all withdrawals
router.get('/', async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find().populate('userId', 'username email');
        res.status(200).json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// READ: Get a single withdrawal by ID
router.get('/:id', async (req, res) => {
    try {
        const userId=req.params.id;
        const withdrawal = await Withdrawal.find({userId});
        if (!withdrawal) return res.status(404).json({ message: 'No withdrawal found for this user' });
        res.status(200).json(withdrawal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE: Update a withdrawal by ID
router.put('/:id', async (req, res) => {
    try {
        const { bank_name, account_holder_name, account_number, image,status } = req.body;

        const withdrawal = await Withdrawal.findById(req.params.id);
        if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

        // Update fields if provided in the request body
        if (bank_name !== undefined) withdrawal.bank_name = bank_name;
        if (account_holder_name !== undefined) withdrawal.account_holder_name = account_holder_name;
        if (account_number !== undefined) withdrawal.account_number = account_number;
        if (image !== undefined) withdrawal.image = image;
        if (status !== undefined) withdrawal.status = status;

        const updatedWithdrawal = await withdrawal.save();
        res.status(200).json(updatedWithdrawal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE: Delete a withdrawal by ID
router.delete('/:id', async (req, res) => {
    try {
        const withdrawal = await Withdrawal.findByIdAndDelete(req.params.id);
        if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
        res.status(200).json({ message: 'Withdrawal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
