const express = require("express");
const {
  createDepositBox,
  getAllDepositBoxes,
  getDepositBoxById,
  updateDepositBoxImage,
  deleteDepositBox,
} = require("../controllers/depositBoxController");
const dotenv = require("dotenv").config();
const cloudinary = require('../utils/cloudinary'); // Import Cloudinary configuration
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const {fileSizeFormatter } = require("../utils/fileUpload");
const uploadMiddleware = require("../utils/uploadMiddleware");
const upload = uploadMiddleware("uploads");
const router = express.Router();

// Create a new deposit box
router.post("/",upload.single('image'), createDepositBox);

// Get all deposit boxes
router.get("/", getAllDepositBoxes);

// Get a single deposit box by ID
router.get("/:id", getDepositBoxById);

// Update a deposit box's image
router.put("/:id",upload.single('image'), updateDepositBoxImage);

// Delete a deposit box
router.delete("/:id", deleteDepositBox);

module.exports = router;
