const mongoose = require("mongoose");

const withdrawalSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    bank_name: {
      type: String,
      required: [true, "Please add a bank name"],
      trim: true,
    },
    account_holder_name: {
      type: String,
      required: [true, "Please add an account holder name"],
      trim: true,
    },
    account_number: {
      type: String,
      required: [true, "Please add an account number"],
      trim: true,
    },
    image: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
module.exports = Withdrawal;