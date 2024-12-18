const DepositBox = require("../models/depositBoxModel");


// Create a new deposit box with an image
const createDepositBox = async (req, res) => {
  try {
    const image = req.file ? req.file.path : null;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const depositBox = new DepositBox({ image });
    await depositBox.save();

    res.status(201).json({ message: "DepositBox created successfully", depositBox });
  } catch (error) {
    console.error("Error creating deposit box:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all deposit boxes
const getAllDepositBoxes = async (req, res) => {
  try {
    const depositBoxes = await DepositBox.find();
    res.status(200).json(depositBoxes);
  } catch (error) {
    console.error("Error fetching deposit boxes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a single deposit box by ID
const getDepositBoxById = async (req, res) => {
  try {
    const { id } = req.params;
    const depositBox = await DepositBox.findById(id);

    if (!depositBox) {
      return res.status(404).json({ message: "DepositBox not found" });
    }

    res.status(200).json(depositBox);
  } catch (error) {
    console.error("Error fetching deposit box:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a deposit box's image
const updateDepositBoxImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = req.file ? req.file.path : null;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const depositBox = await DepositBox.findByIdAndUpdate(id, { image }, { new: true });

    if (!depositBox) {
      return res.status(404).json({ message: "DepositBox not found" });
    }

    res.status(200).json({ message: "DepositBox updated successfully", depositBox });
  } catch (error) {
    console.error("Error updating deposit box:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a deposit box
const deleteDepositBox = async (req, res) => {
  try {
    const { id } = req.params;

    const depositBox = await DepositBox.findByIdAndDelete(id);

    if (!depositBox) {
      return res.status(404).json({ message: "DepositBox not found" });
    }

    res.status(200).json({ message: "DepositBox deleted successfully" });
  } catch (error) {
    console.error("Error deleting deposit box:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createDepositBox,
  getAllDepositBoxes,
  getDepositBoxById,
  updateDepositBoxImage,
  deleteDepositBox,
};
