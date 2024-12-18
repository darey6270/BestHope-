const express = require("express");
const router = express.Router();
const ConfigController = require("../controllers/ConfigController");

// Get all configurations
router.get("/", ConfigController.getAllConfigs);

// Get a specific configuration by key
router.get("/:key", ConfigController.getConfigByKey);

// Add or update a configuration
router.post("/", ConfigController.upsertConfig);

// Delete a configuration
router.delete("/:key", ConfigController.deleteConfig);

module.exports = router;
