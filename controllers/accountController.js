const express = require('express');
const router = express.Router();
const Account = require('../models/accountModel');

// CREATE: Add a new account
router.post('/', async (req, res) => {
    try {
        const { bank_name, account_holder_name, account_number } = req.body;

        const account = new Account({
            bank_name,
            account_holder_name,
            account_number
        });

        const savedAccount = await account.save();
        res.status(201).json(savedAccount);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// READ: Get all accounts
router.get('/', async (req, res) => {
    try {
        const accounts = await Account.find();
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// READ: Get a single account by ID
router.get('/:id', async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);
        if (!account) return res.status(404).json({ message: 'Account not found' });
        res.status(200).json(account);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE: Update an account by ID
router.put('/:id', async (req, res) => {
    try {
        const { bank_name, account_holder_name, account_number } = req.body;

        const account = await Account.findById(req.params.id);
        if (!account) return res.status(404).json({ message: 'Account not found' });

        // Update fields if provided in the request body
        if (bank_name !== undefined) account.bank_name = bank_name;
        if (account_holder_name !== undefined) account.account_holder_name = account_holder_name;
        if (account_number !== undefined) account.account_number = account_number;

        const updatedAccount = await account.save();
        res.status(200).json(updatedAccount);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE: Delete an account by ID
router.delete('/:id', async (req, res) => {
    try {
        const account = await Account.findByIdAndDelete(req.params.id);
        if (!account) return res.status(404).json({ message: 'Account not found' });
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
