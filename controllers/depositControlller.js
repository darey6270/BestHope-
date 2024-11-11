const express = require('express');
const router = express.Router();
const Deposit = require('../models/depositModel');
const User = require('../models/userModel');
const dotenv = require("dotenv").config();
const cloudinary = require('../utils/cloudinary'); // Import Cloudinary configuration
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const {fileSizeFormatter } = require("../utils/fileUpload");
const uploadMiddleware = require("../utils/uploadMiddleware");
const upload = uploadMiddleware("uploads");

// CREATE: Add a new deposit
router.post('/',upload.single('image'), async (req, res) => {
    try {
        const { userId, status } = req.body;
        const image = req.file ? req.file.path : null;    

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Create new deposit
        const deposit = new Deposit({
            userId,
            image,
            status
        });

        const savedDeposit = await deposit.save();
        res.status(201).json(savedDeposit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// READ: Get all deposits
router.get('/', async (req, res) => {
    try {
        const deposits = await Deposit.find().populate('userId', 'username email');
        res.status(200).json(deposits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// READ: Get a single deposit by ID
router.get('/:id', async (req, res) => {
    try {
        const userId=req.params.id;
        const deposit = await Deposit.find({userId});
        if (!deposit) return res.status(404).json({ message: 'No deposit found for this user' });
        res.status(200).json(deposit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE: Update a deposit by ID
router.put('/:id',upload.single('image'), async (req, res) => {
    try {
        const { status } = req.body;
        const image = req.file ? req.file.path : null;

        const deposit = await Deposit.findById(req.params.id);
        if (!deposit) return res.status(404).json({ message: 'Deposit not found' });

        // Update fields if provided in the request body
        if (image !== undefined) deposit.image = image;
        if (status !== undefined) deposit.status = status;

        const updatedDeposit = await deposit.save();
        res.status(200).json(updatedDeposit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE: Delete a deposit by ID
router.delete('/:id', async (req, res) => {
    try {
        const deposit = await Deposit.findByIdAndDelete(req.params.id);
        if (!deposit) return res.status(404).json({ message: 'Deposit not found' });
        res.status(200).json({ message: 'Deposit deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
