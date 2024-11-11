const mongoose = require('mongoose');

const randomSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Ensures each user is only stored once in the RandomModel collection
  },
  selectedAt: {
    type: Date,
    default: Date.now, // Stores the timestamp of selection
  },
  excluded: {
    type: Boolean,
    default: false, // Default to false; will be set to true once user is selected
  },
  selectionCount: {
    type: Number,
    default: 1, // Initializes count at first selection
  },
  notes: {
    type: String,
    trim: true,
  }
}, { timestamps: true });

const RandomModel = mongoose.model('RandomModel', randomSchema);

module.exports = RandomModel;
