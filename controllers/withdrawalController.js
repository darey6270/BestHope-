const express = require('express');
const router = express.Router();
const Withdrawal = require('../models/withdrawalModel');
const User = require("../models/userModel");
const dotenv = require("dotenv").config();
const cloudinary = require('../utils/cloudinary'); // Import Cloudinary configuration
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const {fileSizeFormatter } = require("../utils/fileUpload");
const uploadMiddleware = require("../utils/uploadMiddleware");
const upload = uploadMiddleware("uploads");

// CREATE: Add a new withdrawal
router.post('/',upload.single('image'), async (req, res) => {
    try {
        const { userId, bank_name, account_holder_name, account_number,status} = req.body;
        const image = req.file ? req.file.path : null;
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Create new withdrawal
        const withdrawal = new Withdrawal({
            userId,
            bank_name,
            account_holder_name,
            account_number,
            image,
            status
        });

        const savedWithdrawal = await withdrawal.save();
        res.status(201).json(savedWithdrawal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// READ: Get all withdrawals
router.get('/', async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find().populate('userId', 'username email');
        res.status(200).json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// READ: Get a single withdrawal by ID
router.get('/:id', async (req, res) => {
    try {
        const userId=req.params.id;
        const withdrawal = await Withdrawal.find({userId});
        if (!withdrawal) return res.status(404).json({ message: 'No withdrawal found for this user' });
        res.status(200).json(withdrawal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE: Update a withdrawal by ID
router.put('/:id', async (req, res) => {
    try {
        const { bank_name, account_holder_name, account_number, image } = req.body;

        const withdrawal = await Withdrawal.findById(req.params.id);
        if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

        // Update fields if provided in the request body
        if (bank_name !== undefined) withdrawal.bank_name = bank_name;
        if (account_holder_name !== undefined) withdrawal.account_holder_name = account_holder_name;
        if (account_number !== undefined) withdrawal.account_number = account_number;
        if (image !== undefined) withdrawal.image = image;
        if (status !== undefined) withdrawal.status = status;

        const updatedWithdrawal = await withdrawal.save();
        res.status(200).json(updatedWithdrawal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE: Delete a withdrawal by ID
router.delete('/:id', async (req, res) => {
    try {
        const withdrawal = await Withdrawal.findByIdAndDelete(req.params.id);
        if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
        res.status(200).json({ message: 'Withdrawal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
