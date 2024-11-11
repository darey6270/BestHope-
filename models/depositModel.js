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
      default: "false",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Deposit = mongoose.model("Deposit", depositSchema);
module.exports = Deposit;
