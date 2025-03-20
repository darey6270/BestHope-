const express = require('express');
const router = express.Router();
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  paidUser,
  resetSelectedUser
} = require('../controllers/selectedUserController');

// Create a new user
router.post('/', createUser);

// Get all users
router.get('/', getUsers);

// Get a user by ID
router.get('/:id', getUserById);

// Update a user by ID
router.put('/:id', updateUser);

// Delete a user by ID
router.delete('/:id', deleteUser);

// Delete a
 router.delete('/delete/all', resetSelectedUser);

router.put('/paidUser/:id',paidUser);

module.exports = router;
