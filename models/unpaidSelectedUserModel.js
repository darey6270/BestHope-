const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
    },
    fullname: {
      type: String,
    },
    referral: {
      type: String,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined","seen","unpaid","paid"],
      default: "pending",
      trim: true,
    },
    amount: {
      type: Number,
      default: 0, // Default balance for a new user
    },
    userId:{
     type:String,
    },
    withdrawalId:{
     type:String,
    },
  }, 
  {
    timestamps: true,
  }
);

const UnpaidSelectedUser = mongoose.model("UnpaidSelectedUser", userSchema);
module.exports = UnpaidSelectedUser;