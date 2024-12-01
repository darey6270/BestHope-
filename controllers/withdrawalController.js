const express = require("express");
const router = express.Router();
const Withdrawal = require("../models/withdrawalModel");
const User = require("../models/userModel");
const dotenv = require("dotenv").config();
const { fileSizeFormatter } = require("../utils/fileUpload");
const uploadMiddleware = require("../utils/uploadMiddleware");
const upload = uploadMiddleware("uploads");


// POST: Withdraw the entire referralBalance
router.post("/withdrawAllReferralBalance", async (req, res) => {
  try {
    const { userId, bank_name, account_holder_name, account_number} = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure referralBalance is greater than zero
    if (user.referralBalance <= 0) {
      return res
        .status(400)
        .json({ message: "No referral balance available for withdrawal." });
    }

    
      existingWithdrawal = new Withdrawal({
        userId,
        bank_name,
        account_holder_name,
        account_number,
        image:"",
        normalStatus: "pending",
        referralStatus: "approved",
        amount: user.referralBalance, // Set amount to the referralBalance
        type:"referral",
      });
   

    // Save the withdrawal record
    const savedWithdrawal = await existingWithdrawal.save();

    // Set referralBalance to zero
    user.referralBalance = 0;
    await user.save();

    res.status(200).json({
      message: "Referral balance withdrawn successfully.",
      withdrawal: savedWithdrawal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Approve withdrawals for users with referralBalance >= 10,000
router.get("/autoApprove", async (req, res) => {
  try {
    const eligibleUsers = await User.find({ referralBalance: { $gte: 10000 } });

    if (!eligibleUsers.length) {
      return res
        .status(404)
        .json({ message: "No users eligible for auto-approval." });
    }

    const approvedWithdrawals = [];

    for (const user of eligibleUsers) {
      new Withdrawal({
        userId:user._id,
        bank_name:"",
        account_holder_name:"",
        account_number:"",
        image:"",
        normalStatus: "pending",
        referralStatus: "approved",
        amount: user.referralBalance, // Set amount to the referralBalance
        type:"referral",
      });

      await pendingWithdrawal.save();

      approvedWithdrawals.push(pendingWithdrawal);

      // Deduct the withdrawal amount from the user's referralBalance
      user.referralBalance = 0;
      await user.save();
    }

    if (!approvedWithdrawals.length) {
      return res
        .status(404)
        .json({ message: "No pending withdrawals found for approval." });
    }

    res.status(200).json({
      message: `${approvedWithdrawals.length} withdrawals approved successfully.`,
      approvedWithdrawals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH: Update the status of a withdrawal by ID
router.patch("/:id/normal-status", async (req, res) => {
  try {
    const { status,amount } = req.body;

    // Validate the new status
    const validStatuses = ["pending", "approved", "declined", "seen","unpaid","paid"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Find the withdrawal by ID
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found." });
    }

    // Check if the status is being updated to "approved"
    // if (status === "approved") {
      // Find the user associated with the withdrawal
      // const user = await User.findById(withdrawal.userId);
      // if (!user) {
      //   return res.status(404).json({ message: "User not found." });
      // }

      // // Ensure the user has sufficient balance for the withdrawal
      // if (user.balance < amount) {
      //   return res
      //     .status(400)
      //     .json({ message: "Insufficient balance for this withdrawal." });
      // }

      // // Subtract the withdrawal amount from the user's balance
      // user.balance -= amount;
      // await user.save(); // Save the updated user balance
      // }

    // Update the withdrawal status
    withdrawal.normalStatus = status;
    withdrawal.type = "normal";
    const updatedWithdrawal = await withdrawal.save();

    res.status(200).json({
      message: `Withdrawal status updated to ${status}`,
      withdrawal: updatedWithdrawal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.patch("/:id/referral-status", async (req, res) => {
  try {
    const { status,amount } = req.body;

    // Validate the new status
    const validStatuses = ["pending", "approved", "declined", "seen","unpaid","paid"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Find the withdrawal by ID
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found." });
    }

    // Check if the status is being updated to "approved"
    // if (status === "approved") {
      // Find the user associated with the withdrawal
      // const user = await User.findById(withdrawal.userId);
      // if (!user) {
      //   return res.status(404).json({ message: "User not found." });
      // }

      // // Ensure the user has sufficient balance for the withdrawal
      // if (user.balance < amount) {
      //   return res
      //     .status(400)
      //     .json({ message: "Insufficient balance for this withdrawal." });
      // }

      // // Subtract the withdrawal amount from the user's balance
      // user.referralBalance -= amount;
      // await user.save(); // Save the updated user balance
    // }

    // Update the withdrawal status
    withdrawal.referralStatus = status;
    withdrawal.type = "referral";
    const updatedWithdrawal = await withdrawal.save();

    res.status(200).json({
      message: `Withdrawal status updated to ${status}`,
      withdrawal: updatedWithdrawal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// CREATE: Add a new withdrawal
router.post("/", upload.single("image"), async (req, res) => {
  try {
    let {
      userId,
      bank_name,
      account_holder_name,
      account_number,
      amount,
      status,
    } = req.body;
    const image = req.file ? req.file.path : null;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal amount." });
    }

    const withdrawal = new Withdrawal({
      userId,
      bank_name,
      account_holder_name,
      account_number,
      amount, // Include the amount field
      image,
      status,
    });

    const savedWithdrawal = await withdrawal.save();
    res.status(201).json(savedWithdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ: Get all withdrawals
router.get("/normal", async (req, res) => {
  try {
    const type="normal";
    const normalStatus="approved";
    const withdrawals = await Withdrawal.find({type,normalStatus}).populate("userId","username email referral image");
    res.status(200).json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/referral", async (req, res) => {
  try {
    const referralStatus="approved";
    const type="referral";
    const withdrawals = await Withdrawal.find({type,referralStatus}).populate("userId","username email referral image" );
    res.status(200).json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ: Get a single withdrawal by userId
router.get("/normal/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const normalStatus="approved";
    const type="normal";
    const withdrawal = await Withdrawal.find({ userId ,normalStatus, type}).populate("userId","username email referral image");

    if (!withdrawal.length) {
      return res
        .status(404)
        .json({ message: "No withdrawals found for this user." });
    }

    res.status(200).json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ: Get a single withdrawal by userId
router.get("/referral/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const referralStatus="approved";
    const type="referral";
    const withdrawal = await Withdrawal.find({ userId ,referralStatus, type}).populate("userId","username email referral image");

    if (!withdrawal.length) {
      return res
        .status(404)
        .json({ message: "No withdrawals  found for this user." });
    }

    res.status(200).json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE: Update a withdrawal by ID
router.put("/:id", async (req, res) => {
  try {
    const {
      bank_name,
      account_holder_name,
      account_number,
      amount,
      image,
      status,
    } = req.body;

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found." });
    }

    if (bank_name !== undefined) withdrawal.bank_name = bank_name;
    if (account_holder_name !== undefined)
      withdrawal.account_holder_name = account_holder_name;
    if (account_number !== undefined) withdrawal.account_number = account_number;
    if (amount !== undefined) withdrawal.amount = amount; // Update amount if provided
    if (image !== undefined) withdrawal.image = image;
    if (status !== undefined) withdrawal.status = status;

    const updatedWithdrawal = await withdrawal.save();
    res.status(200).json(updatedWithdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE: Delete a withdrawal by ID
router.delete("/:id", async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findByIdAndDelete(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found." });
    }
    res.status(200).json({ message: "Withdrawal deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
