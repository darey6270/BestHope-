const express = require('express');
const router = express.Router();
const Social = require('../models/socialModel');

// CREATE: Add a new Social
router.post('/', async (req, res) => {
    try {
        const { whatsapp, instagram, tiktok,facebook,youtube,twitter } = req.body;

        const Social = new Social({
            whatsapp, instagram, tiktok,facebook,youtube,twitter
        });

        const savedSocial = await Social.save();
        res.status(201).json(savedSocial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// READ: Get all Socials
router.get('/', async (req, res) => {
    try {
        const Socials = await Social.find();
        res.status(200).json(Socials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// READ: Get a single Social by ID
router.get('/:id', async (req, res) => {
    try {
        const Social = await Social.findById(req.params.id);
        if (!Social) return res.status(404).json({ message: 'Social not found' });
        res.status(200).json(Social);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE: Update an Social by ID
router.put('/:id', async (req, res) => {
    try {
        const { whatsapp, instagram, tiktok,facebook,youtube,twitter } = req.body;

        const Social = await Social.findById(req.params.id);
        if (!Social) return res.status(404).json({ message: 'Social not found' });

        // Update fields if provided in the request body
        if (whatsapp !== undefined) Social.whatsapp = whatsapp;
        if (instagram !== undefined) Social.instagram = instagram;
        if (tiktok !== undefined) Social.tiktok = tiktok;
        if (facebook !== undefined) Social.facebook = facebook;
        if (youtube !== undefined) Social.youtube = youtube;
        if (twitter !== undefined) Social.twitter = twitter;

        const updatedSocial = await Social.save();
        res.status(200).json(updatedSocial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE: Delete an Social by ID
router.delete('/:id', async (req, res) => {
    try {
        const Social = await Social.findByIdAndDelete(req.params.id);
        if (!Social) return res.status(404).json({ message: 'Social not found' });
        res.status(200).json({ message: 'Social deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
