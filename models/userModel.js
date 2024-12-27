const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [false, "Please add a username"],
      unique:true,
    },
    fullname: {
      type: String,
      required: [false, "Please add a fullname"],
    },
    country: {
      type: String,
      required: [false, "Please add a country"],
    },
    city: {
      type: String,
      required: [false, "Please add a city"],
    },
    age: {
      type: String,
      required: [false, "Please add a age"],
    },
    phone: {
      type: String,
      default: "+234",
    },
    referral: {
      type: String,
      required: [false, "Please add a referral id"],
      minLength: [11, "Referral must be up to 11 characters"],
      unique: true,
    },
    email: {
      type: String,
      required: [false, "Please add a email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [false, "Please add a password"],
    },
    address: {
      type: String,
      required: [false, "Please add an address"],
    },
    image: {
      type: String,
      required: [false, "Please add a photo"],
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    gender: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined","seen"],
      default: "pending",
      trim: true,
    },
    userStatus: {
      type: String,
      required: false,
      enum: ["unpaid", "paid"],
      default: "unpaid",
      trim: true,
    },
    referralStatus: {
      type: String,
      enum: ["unpaid", "paid","pending", "approved", "declined","seen"],
      default: "unpaid",
      trim: true,
    },
    balance: {
      type: Number,
      default: 0, // Default balance for a new user
    },
    referralBalance: {
      type: Number,
  },
  usedReferral: {
    type: String,
    required: false,
    minLength: [11, "Referral must be up to 11 characters"],
    unique: true,
},
isSelectedWithdraw: { type: Boolean, default: false },
withdrawId: { type: String, default: "0" },
currentPeriod: { type: String }, // e.g., "March 2024"
},
{
  timestamps: true,
} 
);

// Encrypt password before saving to DB
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }

//   // Hash password
//   // const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(this.password, 10);
//   this.password = hashedPassword;
//   next();
// });

const User = mongoose.model("User", userSchema);
module.exports = User;
