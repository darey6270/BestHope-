const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
    chatId: String, // Unique ID for each chat session (e.g., userId or a generated ID)
    sender: String, // Identifies the message sender ('admin' or 'user')
    text: String,   // Message content
    timestamp: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model("Chat", chatSchema);
  