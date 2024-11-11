const express = require('express');
const router = express.Router();
const randomController = require('../controllers/randomController');

// Route to create a new record
router.post('/create', randomController.createRandomRecord);

// Route to get all records
router.get('/', randomController.getAllRecords);

// Route to select a random user (excluding previously selected users)
router.get('/select', randomController.selectRandomUser);

// Route to bulk update exclusion/inclusion of multiple users
router.patch('/bulk-exclude', randomController.bulkUpdateExclusion);

// Route to delete a record by userId
router.delete('/:userId', randomController.deleteRecord);

module.exports = router;
