const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Config", configSchema);
