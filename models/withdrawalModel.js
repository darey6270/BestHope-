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
      trim: true,
    },
    account_holder_name: {
      type: String,
      trim: true,
    },
    account_number: {
      type: String,
      trim: true,
    },
    image: {
      type: Object,
      default: {},
    },
    normalStatus: {
      type: String,
      enum: ["pending", "approved", "declined","seen","unpaid","paid"],
      default: "pending",
      trim: true,
    },
    referralStatus: {
      type: String,
      enum: ["pending", "approved", "declined","seen","unpaid","paid"],
      default: "pending",
      trim: true,
    },
    amount: {
      type: Number, // Specify the type as Number
      required: true, // Make it a required field
      default:0,
    },
    type: {
      type: String,
      enum: ["normal", "referral", "none"],
      default: "none",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);




const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
module.exports = Withdrawal;