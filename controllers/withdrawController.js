const Withdrawal = require('../models/withdrawalModel');
const User = require("../models/userModel");
const Referral = require("../models/referralModel");
/**
 * Updates the status of a withdrawal by its ID.
 * @param {string} withdrawalId - The ID of the withdrawal document to update.
 * @param {string} newStatus - The new status to set ("pending", "approved", or "rejected").
 * @returns {Promise<Object>} - The updated withdrawal document.
 * @throws {Error} - If the withdrawal ID is not found or an invalid status is provided.
 */


async function autoAppoveWithdrawal (){
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
};
async function updateWithdrawalStatus(withdrawalId, newStatus) {
  // Check if the provided status is valid
  const validStatuses = ["pending", "approved", "rejected"];
  if (!validStatuses.includes(newStatus)) {
    console.log(`Invalid status. Valid statuses are: ${validStatuses.join(', ')}`);
  }

  // // Update only the status field
  // const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(
  //   withdrawalId,
  //   { status: newStatus },
  //   { new: true, runValidators: true } // `new: true` returns the updated document; `runValidators` checks schema validation
  // );
try{
  const withdrawal = new Withdrawal({
    userId:withdrawalId,
    bank_name:"",
    account_holder_name:"",
    account_number:"",
    image:"",
    status:newStatus,
});

const savedWithdrawal = await withdrawal.save();
}catch(error){
  console.log(`message:${error.message}`);
}
  // if (!updatedWithdrawal) {
  //   console.log("Withdrawal not found");
  // }

  // return updatedWithdrawal;
}




module.exports = {updateWithdrawalStatus,autoAppoveWithdrawal};
