const Config = require("../models/Config");

// Get all configurations
exports.getAllConfigs = async (req, res) => {
  try {
    const configs = await Config.find();
    res.status(200).json(configs);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve configurations", error });
  }
};

// Get a configuration by key
exports.getConfigByKey = async (req, res) => {
  try {
    const config = await Config.findOne({ key: req.params.key });
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve configuration", error });
  }
};

// Add or update a configuration
exports.upsertConfig = async (req, res) => {
  try {
    const { key, value } = req.body;
    const updatedConfig = await Config.findOneAndUpdate(
      { key },
      { value, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.status(200).json(updatedConfig);
  } catch (error) {
    res.status(500).json({ message: "Failed to save configuration", error });
  }
};

// Delete a configuration
exports.deleteConfig = async (req, res) => {
  try {
    const result = await Config.findOneAndDelete({ key: req.params.key });
    if (!result) {
      return res.status(404).json({ message: "Configuration not found" });
    }
    res.status(200).json({ message: "Configuration deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete configuration", error });
  }
};
