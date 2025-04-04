const Referral = require('../models/referralModel');

// CREATE a new referral
exports.createReferral = async (req, res) => {
  try {
    const { userId, referralledCount, amount } = req.body;
    
    const newReferral = new Referral({ userId, referralledCount, amount });
    await newReferral.save();

    res.status(201).json(newReferral);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ all referrals
exports.getAllReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find().populate('userId',
       'username referral image usedReferral balance referralBalance');
    res.status(200).json(referrals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ a single referral by ID
exports.getReferralById = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id).populate('userId', 
      'username referral image usedReferral balance referralBalance');
    
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    res.status(200).json(referral);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a referral by ID
exports.updateReferral = async (req, res) => {
  try {
    const { referralledCount, amount } = req.body;
    const updatedReferral = await Referral.findByIdAndUpdate(
      req.params.id,
      { referralledCount, amount },
      { new: true, runValidators: true }
    );

    if (!updatedReferral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    res.status(200).json(updatedReferral);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a referral by ID
exports.deleteReferral = async (req, res) => {
  try {
    const deletedReferral = await Referral.findByIdAndDelete(req.params.id);

    if (!deletedReferral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    res.status(200).json({ message: 'Referral deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ all referrals for a specific user
exports.getUserReferrals = async (req, res) => {
  try {
    const { userId } = req.params;

    const userReferrals = await Referral.find({ userId }).populate('userId', 'username referral image usedReferral balance referralBalance ');;

    if (!userReferrals.length) {
      return res.status(200).json({ message: 'No referrals found for this user' });
    }

    res.status(200).json(userReferrals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE all referrals
exports.deleteAllReferrals = async (req, res) => {
  try {
      await Referral.deleteMany({});
      res.status(200).json({ message: "All referrals deleted successfully." });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};
