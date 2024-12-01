const mongoose = require("mongoose");

const depositSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    image: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "declined","seen"],
      default: "pending",
      trim: true,
    },
    amount: {
      type: Number,
      default: 0, // Default balance for a new user
    },
  },
  {
    timestamps: true,
  }
);

const Deposit = mongoose.model("Deposit", depositSchema);
module.exports = Deposit;
