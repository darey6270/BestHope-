const asyncHandler = require("express-async-handler");
const UserReferral = require("../models/userReferralModel");

// Get all UserReferrals
const getAllUserReferrals = asyncHandler(async (req, res) => {
  const userReferrals = await UserReferral.find();
  res.status(200).json(userReferrals);
});

// Get UserReferrals by referral
const getUsersByReferral = asyncHandler(async (req, res) => {
  const { usedReferral } = req.params;
  const userReferrals = await UserReferral.find({ usedReferral });

  if (!userReferrals || userReferrals.length === 0) {
    res.status(404);
    throw new Error("No users found with the specified referral");
  }

  res.status(200).json(userReferrals);
});

// Create a new UserReferral
const createUserReferral = asyncHandler(async (req, res) => {
  const { userId, username, fullname, referral, image, status,usedReferral,payment,amount} = req.body;

  if (!userId || !username || !fullname || !referral) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }
 

  const userReferral = await UserReferral.create({
    userId,
    username,
    fullname,
    referral,
    image,
    status,
    usedReferral,
    payment,
    amount,
  });

  res.status(201).json(userReferral);
});

// Update a UserReferral
const updateUserReferral = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userReferral = await UserReferral.findById(id);

  if (!userReferral) {
    res.status(404);
    throw new Error("UserReferral not found");
  }

  const updatedUserReferral = await UserReferral.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(updatedUserReferral);
});


// Delete a UserReferral
const deleteUserReferral = asyncHandler(async (req, res) => {
    const { usedReferral } = req.params; // Now we are using the referral parameter to delete
  
    if (!usedReferral) {
      res.status(400);
      throw new Error("Referral parameter is required");
    }
  
    const result = await UserReferral.deleteMany({ UserReferral });
  
    if (result.deletedCount === 0) {
      res.status(404);
      throw new Error(`No UserReferrals found with the referral: ${referral}`);
    }
  
    res.status(200).json({ message: `${result.deletedCount} UserReferrals deleted with referral: ${referral}` });
  });
  

// Reset all UserReferrals
const resetUserReferrals = asyncHandler(async (req, res) => {
  await UserReferral.deleteMany({});
  res.status(200).json({ message: "All UserReferrals have been reset" });
});

module.exports = {
  getAllUserReferrals,
  getUsersByReferral,
  createUserReferral,
  updateUserReferral,
  deleteUserReferral,
  resetUserReferrals,
};
