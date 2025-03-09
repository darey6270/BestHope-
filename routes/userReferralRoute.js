const express = require("express");
const router = express.Router();
const {
  getAllUserReferrals,
  getUsersByReferral,
  createUserReferral,
  updateUserReferral,
  deleteUserReferral,
  resetUserReferrals,
} = require("../controllers/userReferralController");

// Routes for UserReferral
router.get("/", getAllUserReferrals); // Get all user referrals
router.get("/referral/:referral", getUsersByReferral); // Get users by referral
router.post("/", createUserReferral); // Create a new user referral
router.put("/:id", updateUserReferral); // Update a user referral
router.delete("/:id", deleteUserReferral); // Delete a user referral
// router.delete("/referrals/all", resetUserReferrals); // Delete all referrals



module.exports = router;