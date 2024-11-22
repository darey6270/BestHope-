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
      required: true,
      enum: ["withdrew", "approved", "rejected"],
      default: "approved",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


const SelectedUser = mongoose.model("SelectedUser", userSchema);
module.exports = SelectedUser;
