const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add a username"],
    },
    fullname: {
      type: String,
      required: [true, "Please add a fullname"],
    },
    country: {
      type: String,
      required: [true, "Please add a country"],
    },
    city: {
      type: String,
      required: [true, "Please add a city"],
    },
    age: {
      type: String,
      required: [true, "Please add a age"],
    },
    phone: {
      type: String,
      default: "+234",
    },
    referral: {
      type: String,
      required: [true, "Please add a referral id"],
      minLength: [11, "Referral must be up to 11 characters"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please add a email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minLength: [6, "Password must be up to 6 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    image: {
      type: String,
      required: [true, "Please add a photo"],
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
      required: true,
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
      default: 0, // Separate field for referral earnings
  },
  usedReferral: {
    type: String,
    required: [true, "Please add a referral id"],
    minLength: [11, "Referral must be up to 11 characters"],
    unique: true,
},
  
},
{
  timestamps: true,
} 
);

// Encrypt password before saving to DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
