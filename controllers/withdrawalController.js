const express = require("express");
const router = express.Router();
const Withdrawal = require("../models/withdrawalModel");
const User = require("../models/userModel");
const dotenv = require("dotenv").config();
const cloudinary = require('../utils/cloudinary'); // Import Cloudinary configuration
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const {fileSizeFormatter } = require("../utils/fileUpload");
const uploadMiddleware = require("../utils/uploadMiddleware");
const upload = uploadMiddleware("uploads");
const SelectedReferralUser = require("../models/selectedReferralModel");
const Referral = require('../models/referralModel');

// POST: Withdraw the entire referralBalance
router.post("/withdrawAllReferralBalance", async (req, res) => {
  try {
    const { userId, bank_name, account_holder_name, account_number } = req.body;
    console.log("Request Body:", req.body);

    // Validate request body
    if (!userId || !bank_name || !account_holder_name || !account_number) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found with ID:", userId);
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure referralBalance is greater than zero
    if (user.referralBalance <= 0) {
      console.log("No referral balance available for withdrawal.");
      return res.status(400).json({ message: "No referral balance available for withdrawal." });
    }

    // Create a new withdrawal record
    const existingWithdrawal = new Withdrawal({
      userId,
      bank_name,
      account_holder_name,
      account_number,
      image: "",
      normalStatus: "pending",
      referralStatus: "approved",
      amount: user.referralBalance,
      type: "referral",
    });

    const savedWithdrawal = await existingWithdrawal.save();
    console.log("Withdrawal saved:", savedWithdrawal);


    await User.updateOne(
      { _id: userId },
      { referralBalance: 0 }
    );


    await Referral.updateOne(
      { userId },
      { referralledCount: 0,amount:0 , total:0}
    );
    
    console.log("User referral balance reset to 0.");

    // Create a referral entry
    const selectedReferral = await SelectedReferralUser.create({
      userId,
      withdrawalId: savedWithdrawal._id,
      status: "normal",
    });
    console.log("New selected user for withdrawal:", selectedReferral);

    res.status(200).json({
      message: "Referral balance withdrawn successfully.",
      withdrawal: savedWithdrawal,
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
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
      pendingWithdrawal=new Withdrawal({
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

      const selectedReferral= await SelectedReferralUser.Create({userId:user._id,withdrawalId:pendingWithdrawal._id,status:"autoapprover"});
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


router.get("/getSelectedReferralWithdrawals", async (req, res) => {
  try {
    // Fetch all SelectedReferralUser documents
    const selectedReferralUsers = await SelectedReferralUser.find();

    if (!selectedReferralUsers.length) {
      console.log("No selected referrals found");
      return res.status(200).json({ message: "No SelectedReferralUsers found", withdrawals: [] });
    }

    // Extract withdrawalIds
    const withdrawalIds = selectedReferralUsers.map((user) => user.withdrawalId);
    
    console.log(withdrawalIds);

    // Fetch all Withdrawals that match the withdrawalIds
    const withdrawals = await Withdrawal.find({ _id: { $in: withdrawalIds } });

    return res.status(200).json({ withdrawals });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    res.status(500).json({ message: "Error fetching withdrawals" });
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
    const withdrawals = await Withdrawal.find({type}).populate("userId","username email referral image");
    res.status(200).json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/referral", async (req, res) => {
  try {
    const referralStatus="approved";
    const type="referral";
    const withdrawals = await Withdrawal.find({type}).populate("userId","username email referral image" );
    res.status(200).json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ: Get a single withdrawal by userId
router.get("/normal/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const _id = req.params.id;
    const type="normal";
    const withdrawal = await Withdrawal.find({ _id , type}).populate("userId","username email referral image");

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
    const referralStatus="paid";
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

router.put("/referral/paid/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const referralStatus="paid";
    const type="referral";
    const withdrawal = await Withdrawal.findById(req.params.id);
          withdrawal.referralStatus = "paid";
    const updatedWithdrawal = await withdrawal.save();
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
router.put("/uploadReceipt/referral/:id",upload.single("image"), async (req, res) => {
  try {
    let {image} = req.body;
    image = req.file ? req.file.path : null;


    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "unable to upload receipt withdrawal not found." });
    }


    if (image !== undefined) withdrawal.image = image;
        withdrawal.referralStatus="paid";

    const updatedWithdrawal = await withdrawal.save();
    res.status(200).json(updatedWithdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/uploadReceipt/normal/:id",upload.single("image"), async (req, res) => {
  try {
    let {image} = req.body;
    image = req.file ? req.file.path : null;


    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "unable to upload receipt withdrawal not found." });
    }


    if (image !== undefined) withdrawal.image = image;
        withdrawal.normalStatus="paid";
    
        await User.updateOne(
          { _id: withdrawal.userId },
          { userStatus:"paid",isSelectedWithdraw:true,withdrawalId:withdrawal._id },
          { new: true }
        );
        


    const updatedWithdrawal = await withdrawal.save();
    res.status(200).json(updatedWithdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/update/accountdetails/:id", async (req, res) => {
  try {
    const {
      bank_name,
      account_holder_name,
      account_number,
    } = req.body;

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found." });
    }

    if (bank_name !== undefined) withdrawal.bank_name = bank_name;
    if (account_holder_name !== undefined)
      withdrawal.account_holder_name = account_holder_name;
    if (account_number !== undefined) withdrawal.account_number = account_number;
  

    const updatedWithdrawal = await withdrawal.save();
    res.status(200).json(updatedWithdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/normal/search/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const withdrawals = await Withdrawal.find({ userId: user._id, type: 'normal' }).populate("userId","username email referral image");

    res.status(200).json(withdrawals);
  } catch (error) {
    console.error("Error searching withdrawals:", error); // Log the error
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/referral/search/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const withdrawals = await Withdrawal.find({ userId: user._id, type: 'referral' }).populate("userId","username email referral image");

    res.status(200).json(withdrawals);
  } catch (error) {
    console.error("Error searching withdrawals:", error); // Log the error
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update/withdraw/accountdetails/:id", async (req, res) => {
  try {
    const {
      bank_name,
      account_holder_name,
      account_number,
    } = req.body;

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found." });
    }

    if (bank_name !== undefined) withdrawal.bank_name = bank_name;
    if (account_holder_name !== undefined)
      withdrawal.account_holder_name = account_holder_name;
    if (account_number !== undefined) withdrawal.account_number = account_number;
  

    const updatedWithdrawal = await withdrawal.save();
    await User.updateOne(
      { _id: withdrawal.userId },
      { userStatus:"paid",isSelectedWithdraw:false,withdrawalId:withdrawal._id,balance:0 },
      { new: true }
    );

    res.status(200).json(updatedWithdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// DELETE: Delete all withdrawals
// router.delete("/all", async (req, res) => {
//   try {
//       await Withdrawal.deleteMany({});
//       res.status(200).json({message: "All withdrawals deleted successfully."});
//   } catch (error) {
//       res.status(500).json({message: error.message});
//   }
// });

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
