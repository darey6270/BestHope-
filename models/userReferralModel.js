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
        enum: ["pending", "approved", "rejected"],
        default: "pending",
        trim: true,
      },
  },
  {
    timestamps: true,
  }
);

//   Encrypt password before saving to DB


const UserReferral = mongoose.model("UserReferral", userSchema);
module.exports = UserReferral;
