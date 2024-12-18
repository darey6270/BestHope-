const express = require('express');
const router = express.Router();
const Social = require('../models/socialModel');

// CREATE: Add a new Social
router.post('/', async (req, res) => {
    try {
        const { whatsapp, instagram, tiktok,facebook,youtube,twitter } = req.body;

        const social = new Social({
            whatsapp, instagram, tiktok,facebook,youtube,twitter
        });

        const savedSocial = await social.save();
        res.status(201).json(savedSocial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// READ: Get all Socials
router.get('/', async (req, res) => {
    try {
        const socials = await Social.find();
        res.status(200).json(socials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// READ: Get a single Social by ID
router.get('/:id', async (req, res) => {
    try {
        const social = await Social.findById(req.params.id);
        if (!social) return res.status(404).json({ message: 'Social not found' });
        res.status(200).json(social);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE: Update an Social by ID
router.put('/:id', async (req, res) => {
    try {
        const { whatsapp, instagram, tiktok,facebook,youtube,twitter } = req.body;
        

        const social = await Social.findById(req.params.id);
        if (!social) return res.status(404).json({ message: 'Social not found' });

        // Update fields if provided in the request body
        if (whatsapp !== undefined) social.whatsapp = whatsapp;
        if (instagram !== undefined) social.instagram = instagram;
        if (tiktok !== undefined) social.tiktok = tiktok;
        if (facebook !== undefined) social.facebook = facebook;
        if (youtube !== undefined) social.youtube = youtube;
        if (twitter !== undefined) social.twitter = twitter;

        const updatedSocial = await social.save();
        res.status(200).json(updatedSocial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE: Delete an Social by ID
router.delete('/:id', async (req, res) => {
    try {
        const social = await Social.findByIdAndDelete(req.params.id);
        if (!social) return res.status(404).json({ message: 'Social not found' });
        res.status(200).json({ message: 'Social deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
