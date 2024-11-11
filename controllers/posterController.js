const express = require('express');
const router = express.Router();
const Poster = require('../models/posterModel');
const dotenv = require("dotenv").config();
const cloudinary = require('../utils/cloudinary'); // Import Cloudinary configuration
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const {fileSizeFormatter } = require("../utils/fileUpload");
const uploadMiddleware = require("../utils/uploadMiddleware");
const upload = uploadMiddleware("uploads");

// CREATE: Add a new poster
router.post('/',upload.single('image'), async (req, res) => {
    try {
        //const { image } = req.body;

        const image = req.file ? req.file.path : null;

        const poster = new Poster({
            image
        });

        const savedPoster = await poster.save();
        res.status(201).json(savedPoster);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// READ: Get all posters
router.get('/', async (req, res) => {
    try {
        const posters = await Poster.find();
        res.status(200).json(posters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// READ: Get a single poster by ID
router.get('/:id', async (req, res) => {
    try {
        const poster = await Poster.findById(req.params.id);
        if (!poster) return res.status(404).json({ message: 'Poster not found' });
        res.status(200).json(poster);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE: Update a poster by ID
router.put('/:id',upload.single('image'), async (req, res) => {
    try {
        //const { image } = req.body;
        const image = req.file ? req.file.path : null;

        const poster = await Poster.findById(req.params.id);
        if (!poster) return res.status(404).json({ message: 'Poster not found' });

        poster.image = image || poster.image;

        const updatedPoster = await poster.save();
        res.status(200).json(updatedPoster);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE: Delete a poster by ID
router.delete('/:id', async (req, res) => {
    try {
        const poster = await Poster.findByIdAndDelete(req.params.id);
        if (!poster) return res.status(404).json({ message: 'Poster not found' });
        res.status(200).json({ message: 'Poster deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;