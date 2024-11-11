const RandomModel = require('../models/randomModel');
const updateWithdrawalStatus = require('./withdrawController');



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

exports.getAllRecords = async (req, res) => {
    try {
      const records = await RandomModel.find().populate('userId');
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  exports.selectRandomUser = async (req, res) => {
    try {
      const eligibleUsers = await RandomModel.find({ excluded: false });
  
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

  exports.bulkUpdateExclusion = async (req, res) => {
    const { userIds, exclude } = req.body; // userIds: array of user IDs, exclude: true/false
    
    for (const userId of userIds) {

          try {
            await updateWithdrawalStatus(userId, 'approved');
            console.log('Updated Withdrawal:', updatedWithdrawal);
          } catch (error) {
            console.error('Error updating withdrawal status:', error.message);
          }
        
      }
 
    try {
      await RandomModel.updateMany(
        { userId: { $in: userIds } }, // Filter users by provided IDs
        { $set: { excluded: exclude } } // Set excluded status to true/false
      );
  
      res.status(200).json({
        message: `Users successfully ${exclude ? 'excluded' : 'included'} in selection pool.`,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

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
    
