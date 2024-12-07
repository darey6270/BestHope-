const express = require('express');
const router = express.Router();
const {
    createSelectedReferralUser,
    getSelectedReferralUsers,
    getSelectedReferralUserById,
    updateSelectedReferralUser,
    deleteSelectedReferralUser,
} = require('../controllers/selectedReferralController');

// Create a new user
router.post('/', createSelectedReferralUser);

// Get all users
router.get('/', getSelectedReferralUsers);

// Get a user by ID
router.get('/:id', getSelectedReferralUserById);

// Update a user by ID
router.put('/:id', updateSelectedReferralUser);

// Delete a user by ID
router.delete('/:id', deleteSelectedReferralUser);

module.exports = router;
