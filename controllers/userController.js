const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Referral = require("../models/referralModel");
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const dotenv = require("dotenv").config();
const cloudinary = require('../utils/cloudinary'); // Import Cloudinary configuration
const { CloudinaryStorage } = require('multer-storage-cloudinary');


// Register User
const registerUser = asyncHandler(async (req, res) => {

  const { username,fullname,country,city,age,phone,referral, email, password,address,gender } = req.body;
  const image = req.file ? req.file.path : null;
  

  // Validation
  if (!username || !fullname || !country ||!city || !age || !phone ||!referral ||!password ||!address ||!gender) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }

  // Check if user email already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

  // Create new user
  const user = await User.create({username,fullname,country,city,age,phone,referral,
     email, password,address,image,gender});
  
  // Step 2: If a referralCode is provided, increment the referralledCount
  if (referral) {
    // Find the user who owns this referral code
    const referringUser = await User.findOne({ referral });
    
    if (referringUser) {
      // Find and update the referring user's Referral document
      await Referral.findOneAndUpdate(
        { userId: referringUser._id },
        { $inc: { referralledCount: 1 } },
        { new: true }
      );
    } else {
      console.log('Referral code is invalid.');
    }
  }   

  if (user) {
    const { _id, username,email, password, image } = user;
    res.status(201).json({
      _id,username,
      email, password,image
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validate Request
  if (!username || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }

  // Check if user exists
  const user = await User.findOne({ username });

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  // User exists, check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);


  if (user && passwordIsCorrect) {
    const { _id, username,fullname,country,city,age,phone,referral, email, password,address,image,gender } = user;
    res.status(200).json({
      _id,
      username,fullname,country,city,age,phone,referral,
      email, password,address,image,gender
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

// Logout User
const logout = asyncHandler(async (req, res) => {
  return res.status(200).json({ message: "Successfully Logged Out" });
});

// Get User Data
const getUser = asyncHandler(async (req, res) => {
  const{ id }=  req.params;
  console.log(req.params);
  const user = await User.findById(id);

  if (user) {
    const { _id, username,fullname,country,city,age,phone,referral, email, password,address,image,gender } = user;
    res.status(200).json({
      _id,
      username,fullname,country,city,age,phone,referral, email, password,address,image,gender});
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

// Update User
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { username,fullname,country,city,age,phone,referral, email, password,address,image,gender } = user;
    user.username = req.username || username;
    user.fullname = req.body.fullname || fullname;
    user.country = req.body.country || country;
    user.city = req.body.city || city;
    user.age = req.body.age || age;
    user.phone = req.body.phone || phone;
    user.referral = req.body.referral || referral;
    user.email = req.body.email || email;
    user.password = req.body.password || password;
    user.address = req.body.address || address;
    user.image = req.body.image || image;
    user.gender = req.body.gender || gender;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      referral: updatedUser.referral,
      image: updatedUser.image,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});


const getUsers = asyncHandler(async (req, res) => {
  
    // Fetch all users from the database
    const users = await User.find();
    if(users){
      console.log(users);
      res.status(200).json(users);  // Return the users in JSON format
    }
  
    res.status(500).json({ error: 'Failed to fetch users' });
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }
  //Validate
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please add old and new password");
  }

  // check if old password matches password in DB
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  // Save new password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).send("Password change successful");
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User does not exist");
  }

});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  

  // Find user
  const user = await User.findOne({ _id: userToken.userId });
  user.password = password;
  await user.save();
  res.status(200).json({
    message: "Password Reset Successful, Please Login",
  });
});

// Controller function to approve a pending user
const approveUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by ID and update the status to "approved"
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status === "approved") {
      return res.status(400).json({ message: "User is already approved" });
    }

    user.status = "approved";
    await user.save();

    res.status(200).json({ message: "User approved successfully", user });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  getUsers,
  approveUser,
};
