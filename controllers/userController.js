const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Referral = require("../models/referralModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const dotenv = require("dotenv").config();
const cloudinary = require('../utils/cloudinary');
const UserReferral = require("../models/userReferralModel");
const Config = require("../models/Config");

// Function to generate a unique referral code
const generateReferralCode = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let referralCode;
  let isUnique = false;

  while (!isUnique) {
    referralCode = Array.from({ length: 11 }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
    const existingUser = await User.findOne({ referral: referralCode });
    if (!existingUser) {
      isUnique = true; // Ensure uniqueness
    }
  }

  return referralCode;
};

const registerUser = asyncHandler(async (req, res) => {
  let {
    username, fullname, country, city, age, phone,
    referral, email, password, address, gender, status,
    userStatus, referralStatus, balance, referralBalance,currentPeriod
  } = req.body;
  
  const image = req.file ? req.file.path : null;
  const usedReferral = referral;

  // Validation
  if (!username || !fullname || !country || !city || !age || !phone || !password || !address || !gender) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

 

  // Check if user email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("Email has already been registered");
  }

  const referralExists = await User.findOne({ referral:usedReferral });
  
  if (!referralExists) {
    throw new Error(`No user exist with this referral Id:${referral}`);
  }

  // Handle referrals
  if (referral) {
    const referringUser = await User.findOne({ referral:usedReferral });
    if (referringUser) {
      const existingReferral = await Referral.findOne({ userId: referringUser._id });
      if (existingReferral) {
        // Update referral stats
        const updatedReferralledCount = existingReferral.referralledCount + 1;
        const newTotal = updatedReferralledCount * existingReferral.amount;

        await Referral.findByIdAndUpdate(
          existingReferral._id,
          { referralledCount: updatedReferralledCount, total: newTotal },
          { new: true }
        );

        await User.findByIdAndUpdate(
          referringUser._id,
          { referralBalance: newTotal },
          { new: true }
        );
      } else {
        // Create new Referral document
        const initialCount = 1;
        const amountPerReferral = 500;
        const initialTotal = initialCount * amountPerReferral;

        await Referral.create({
          userId: referringUser._id,
          referralledCount: initialCount,
          amount: amountPerReferral,
          total: initialTotal,
        });

        await User.findByIdAndUpdate(
          referringUser._id,
          { referralBalance: initialTotal },
          { new: true }
        );
      }
    } else {
      res.status(400);
      throw new Error("Invalid referral code");
    }
  }

  // Generate unique referral code for the new user
  const uniqueReferralCode = await generateReferralCode();

  // Hash password
    // // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, 8);
  
  const user = await User.create({
    username,
    fullname,
    country,
    city,
    age,
    phone,
    referral: uniqueReferralCode,
    email,
    password,
    address,
    image,
    gender,
    status,
    userStatus,
    referralStatus,
    balance,
    referralBalance,
    usedReferral,
    currentPeriod
  });

  if (user) {
    const userReferral = await UserReferral.create({
      userId: user._id,
      username: user.username,
      fullname: user.fullname,
      referral: user.referral,
      image: user.image,
      status: "pending",
      usedReferral: user.usedReferral,
      payment: "unpaid",
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      country: user.country,
      city: user.city,
      age: user.age,
      phone: user.phone,
      referral: user.referral,
      email: user.email,
      address: user.address,
      image: user.image,
      gender: user.gender,
    });
  } else {
    throw new Error("Invalid user data");
  }
});





const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  console.log(`Received username: ${username}, password: ${password}`);

  // Validate Request
  if (!username || !password) {
    res.status(400);
    throw new Error("Please add username and password");
  }

  // Check if user exists
  const usernameExists = await User.findOne({ username});

  if(!usernameExists){
    res.status(400);
    throw new Error("Username is not found or registered with us, please signup");
  }

  // Check if user exists
  const user = await User.findOne({ username , password});
  if (!user) {
    res.status(400);
    throw new Error("Username and passworo not found, please signup");
  }
 
  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  // console.log(`Password match: ${passwordIsCorrect}`);

  // console.log(`Hashed Password from DB: ${user.password}`);
  // console.log(`Provided Password: ${password}`);

  // // Validate Password
  // const passwordIsCorrect = await bcrypt.compare(password, user.password);
  // console.log(`Password match: ${passwordIsCorrect}`);

  // if (!passwordIsCorrect) {
  //   res.status(400);
  //   throw new Error("Invalid Username or password");
  // }

  // Successful Login: Return User Info
  const {
    _id,
    username: userUsername,
    fullname,
    country,
    city,
    age,
    phone,
    referral,
    email,
    address,
    image,
    gender,
    status,
    userStatus,
    referralStatus,
    balance,
    referralBalance,
    usedReferral,
    currentPeriod,
  } = user;

  // Store session data
  req.session.user = { id: _id, email };

  res.status(200).json({
    _id,
    username: userUsername,
    fullname,
    country,
    city,
    age,
    phone,
    referral,
    email,
    address,
    image,
    gender,
    status,
    userStatus,
    referralStatus,
    balance,
    referralBalance,
    usedReferral,
    currentPeriod,
  });
});


// Logout User
const logout = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Failed to destroy session:", err);
      return res.status(500).json({ message: "Failed to logout" });
    }

  });
   return res.status(200).json({ message: "Successfully Logged Out" });
});

// Get User Data
const getUser = asyncHandler(async (req, res) => {
  const{ id }=  req.params;
  console.log(req.params);
  const user = await User.findById(id);

  if (user) {
    const {  _id, username,fullname,country,city,age,phone,referral, email, password,address,image,gender ,status,userStatus,
      referralStatus,
      balance,
      referralBalance,
      usedReferral,currentPeriod} = user;
    res.status(200).json({
      _id, username,fullname,country,city,age,phone,referral, email, password,address,image,gender ,status,userStatus,
      referralStatus,
      balance,
      referralBalance,
      usedReferral,currentPeriod});
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
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Return the users in JSON format if found
    if (users) {
      console.log(users);
      return res.status(200).json(users);
    }

    // If no users are found, send an error response
    res.status(404).json({ error: 'No users found' });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

const getApprovedUsers = asyncHandler(async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find({ status: 'approved' });

    // Return the users in JSON format if found
    if (users) {
      console.log(users);
      return res.status(200).json(users);
    }

    // If no users are found, send an error response
    res.status(404).json({ error: 'No users found' });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
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
  // const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  // Save new password
  if (user) {
    user.password = password;
    await user.save();
    res.status(200).send("Password change successful");
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email} = req.params;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User does not exist");
  }
  
  // Save new password
  if (user) {
    user.password = req.body.password;
    await user.save();
    res.status(200).send("Password change successful");
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }

});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const {userId } = req.params;

  

  // Find user
  const user = await User.findOne({ _id: userId });
  user.password = password;
  await user.save();
  res.status(200).json({
    message: "Password Reset Successful, Please Login",
  });
});

// Controller function to approve a pending user
const approveUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndUpdate(userId, { status: 'approved' });
    res.status(200).json({ message: 'User approved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve user' });
  }
}



const userContribution = async (req, res) => {
  try {
    // Fetch all users from the database
    const current_period = await Config.findOne({ key: "currentPeriod" });
    const currentPer=current_period ? current_period.value : "";
    console.log(`currentPer ${currentPer}`);
    const users = await User.find({ currentPeriod: currentPer});

    // Return the users in JSON format if found
    if (users) {
      console.log(users);
      return res.status(200).json(users);
    }

    // If no users are found, send an error response
    res.status(404).json({ error: 'No users found' });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
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
  getApprovedUsers,
  userContribution,
};