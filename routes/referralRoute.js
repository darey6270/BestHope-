const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');

// router.delete('/allReferral',referralController.deleteAllReferrals);

// CREATE a new referral
router.post('/', referralController.createReferral);

// READ all referrals
router.get('/', referralController.getAllReferrals);

// READ a single referral by ID
router.get('/:id', referralController.getReferralById);

// UPDATE a referral by ID
router.put('/:id', referralController.updateReferral);

// DELETE a referral by ID
router.delete('/:id', referralController.deleteReferral);

// New route to get referrals for a specific user
router.get('/user/:userId',referralController.getUserReferrals);

// delete all referrals

module.exports = router;
