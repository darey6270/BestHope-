const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the User model
      },
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
      required: [true, "Please add a photo"],
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    status: {
        type: String,
        required: true,
        enum: ["pending", "approved", "rejected","seen"],
        default: "pending",
        trim: true,
      },
      usedReferral: {
        type: String,
        required: [true, "Please add a referral id"],
        minLength: [11, "Referral must be up to 11 characters"],
        unique: true,
    },
    payment: {
      type: String,
      required: true,
      enum: ["unpaid", "paid"],
      default: "unpaid",
      trim: true,
    },
    amount:{
      type: Number,
      default: 0, // Default balance for a new user
    },
  },
  {
    timestamps: true,
  }
);

//   Encrypt password before saving to DB


const UserReferral = mongoose.model("UserReferral", userSchema);
module.exports = UserReferral;
