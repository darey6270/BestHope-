const Withdrawal = require('../models/withdrawalModel');
/**
 * Updates the status of a withdrawal by its ID.
 * @param {string} withdrawalId - The ID of the withdrawal document to update.
 * @param {string} newStatus - The new status to set ("pending", "approved", or "rejected").
 * @returns {Promise<Object>} - The updated withdrawal document.
 * @throws {Error} - If the withdrawal ID is not found or an invalid status is provided.
 */
async function updateWithdrawalStatus(withdrawalId, newStatus) {
  // Check if the provided status is valid
  const validStatuses = ["pending", "approved", "rejected"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status. Valid statuses are: ${validStatuses.join(', ')}`);
  }

  // Update only the status field
  const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(
    withdrawalId,
    { status: newStatus },
    { new: true, runValidators: true } // `new: true` returns the updated document; `runValidators` checks schema validation
  );

  if (!updatedWithdrawal) {
    throw new Error("Withdrawal not found");
  }

  return updatedWithdrawal;
}

module.exports = updateWithdrawalStatus;
