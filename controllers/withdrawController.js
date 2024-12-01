const Withdrawal = require('../models/withdrawalModel');
const User = require("../models/userModel");
const Referral = require("../models/referralModel");


const autoApproveWithdrawals = async (req, res) => {
  try {
    // Step 1: Find all users in Referral model with total >= 10,000
    const eligibleReferrals = await Referral.find({ total: { $gte: 10000 } });

    if (eligibleReferrals.length === 0) {
      return res.status(404).json({ message: "No users found with sufficient total for approval" });
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

      const user = await User.findById(userId);
      if (user.referralBalance < pendingWithdrawal.amount) {
        console.warn(`User's referralBalance is insufficient for withdrawal: ${userId}`);
        continue; // Skip if referralBalance is insufficient
      }

      // Deduct the amount from the user's referral balance
      user.referralBalance -= pendingWithdrawal.amount;
      await user.save();

      // Approve the pending withdrawal
      pendingWithdrawal.status = "approved";
      await pendingWithdrawal.save();

      approvedWithdrawals.push(pendingWithdrawal);
    }

    if (approvedWithdrawals.length === 0) {
      return res.status(404).json({ message: "No pending withdrawals found for approval" });
    }

    res.status(200).json({
      message: "Withdrawals approved successfully",
      approvedWithdrawals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * Automatically approves withdrawals for users with referral totals >= 10,000.
 */

/**
 * Updates the status of a withdrawal by its ID and handles amount deduction.
 * @param {string} withdrawalId - The ID of the withdrawal document to update.
 * @param {string} newStatus - The new status to set ("pending", "approved", or "rejected").
 * @returns {Promise<Object>} - The updated withdrawal document.
 * @throws {Error} - If the withdrawal ID is not found or an invalid status is provided.
 */
async function updateWithdrawalStatus(withdrawalId, newStatus) {
  try {
    // Validate the new status
    const validStatuses = ["pending", "approved", "rejected","seen"];
    if (!validStatuses.includes(newStatus)) {
      console.error(`Invalid status. Valid statuses are: ${validStatuses.join(', ')}`);
      throw new Error("Invalid status.");
    }

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      console.error("Withdrawal not found.");
      throw new Error("Withdrawal not found.");
    }

    // Step 2: Handle withdrawal approval (if status is approved)
    if (newStatus === "approved") {
      const user = await User.findById(withdrawal.userId);
      if (!user) {
        console.error("User not found.");
        throw new Error("User not found.");
      }

      if (user.referralBalance < withdrawal.amount) {
        console.warn(`User's referralBalance is insufficient for withdrawal: ${withdrawal.userId}`);
      }

      // Deduct the amount from the user's referral balance
      // user.referralBalance -= withdrawal.amount;
      await user.save();
    }

    // Update withdrawal status
    withdrawal.status = newStatus;
    const updatedWithdrawal = await withdrawal.save();
    return updatedWithdrawal;

  } catch (error) {
    console.error(`Error in updateWithdrawalStatus: ${error.message}`);
    throw new Error(error.message);
  }
}

module.exports = { updateWithdrawalStatus, autoApproveWithdrawals };
