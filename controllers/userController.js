const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Referral = require("../models/referralModel");
const UserReferral = require("../models/userReferralModel");
const Config = require("../models/Config");

const generateReferralCode = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const generateCode = () => Array.from({ length: 11 }, () => characters[Math.floor(Math.random() * characters.length)]).join('');

  let referralCodes = new Set();
  let uniqueReferral = null;

  while (!uniqueReferral) {
    // Generate a batch of random codes
    while (referralCodes.size < 5) {
      referralCodes.add(generateCode());
    }

    // Check if any of them already exist in the database
    const existingCodes = await User.find({ referral: { $in: [...referralCodes] } }).select('referral');

    // Find a code that is not in the database
    uniqueReferral = [...referralCodes].find(code => !existingCodes.some(user => user.referral === code));

    // If all are taken, repeat the loop
    referralCodes.clear();
  }

  return uniqueReferral;
};


const registerUser = asyncHandler(async (req, res) => {
  let {
    username, fullname, country, city, age, phone,
    referral, email, password, address, gender, status,
    userStatus, referralStatus, balance, referralBalance,currentPeriod,usedReferral
  } = req.body;
  
  const image = req.file ? req.file.path : null;
  
  // Validation
  if (!username || !fullname || !country || !city || !age || !phone || !password || !address || !gender) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

   // Check if user email already exists
   const userExists = await User.findOne({ email });
   if (userExists) {
     return res.status(400).json({ message: "Email has already been registered" });
   }
 
   // Check if username already exists
   const usernameExists = await User.findOne({ username });
   if (usernameExists) {
     return res.status(400).json({ message: "Username has already been registered" });
   }
 
   // Check if referral code is valid
   if (usedReferral) {
     const referralExists = await User.findOne({ referral: usedReferral });
     if (!referralExists) {
       return res.status(400).json({ message: `No user exists with this referral ID: ${referral}` });
     }
   }





  // Generate unique referral code for the new user
  const uniqueReferralCode = await generateReferralCode();

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
    isSelectedWithdraw:false,
    withdrawalId:0,
    currentPeriod,
    ajoStatus:"pending",
  });

  if (user) {
    const userReferral = await UserReferral.create({
      userId: user._id,
      username,
      fullname,
      referral: uniqueReferralCode,
      image,
      status: "pending",
      usedReferral,
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
      status: user.status,
      userStatus:user.userStatus,
      referralStatus:user.referralStatus,
      balance: user.balance,
      referralBalance:user.referralBalance,
      usedReferral:user.usedReferral,
      isSelectedWithdraw:user.isSelectedWithdraw,
      withdrawalId:user.withdrawalId,
      currentPeriod:user,
      ajoStatus:user.ajoStatus,
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
    return res.status(400).json({ message: "Please add username and password" });
  }

  // Find user by username and password
  const user = await User.findOne({ username, password });

  if (!user) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  // Destructure user details
  const {
    _id,
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

  // Send user data as response
  return res.status(200).json({
    _id,
    username,
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
      usedReferral,currentPeriod,withdrawalId,isSelectedWithdraw} = user;
    res.status(200).json({
      _id, username,fullname,country,city,age,phone,referral, email, password,address,image,gender ,status,userStatus,
      referralStatus,
      balance,
      referralBalance,
      usedReferral,currentPeriod,withdrawalId,isSelectedWithdraw});
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


  const user = await User.findOne({email:req.params.id});
  
  if (user) {
    res.status(200).json(user);
  }else{
    res.status(400).json({ message: "Email is not found, please reset password" });
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.params;
 
  console.log(`Received email: ${email}`);
  
  const user = await User.findOne({ email:req.params.email });
  if (user) {
    res.status(404).json({ message: "the email is found " });
  }else{
    res.status(200).json({ message: "Email is not found, please reset password" });
  }

});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password,email} = req.body;
  console.log(`Received password: ${password}, email: ${email}`);
  // Find user
  const user = await User.findOne({ email });
  if (user) {
    user.password = password;
    await user.save();
    res.status(200).json({
      message: "Password Reset Successful, Please Login",
    });
  }else{
    res.status(200).json({ message: "Email is not found, please reset password" });
  }

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
    const users = await User.find({ currentPeriod: currentPer,isSelectedWithdraw:false,ajoStatus:"approved" });
    // const users = await User.find({});

    // Return the users in JSON format if found
    if (Array.isArray(users)) {
      console.log("the length of contribution ", users.length);
      return res.status(200).json(users);
  }

    // If no users are found, send an error response
    res.status(404).json({ error: 'No users found' });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};


// Function to delete all users except specified user
const deleteAllUsersExcept = asyncHandler(async (req, res) => {
  try {
      const { username, password } = req.body;
      console.log("the username and password is",username,password);
      if (!username || !password) {
          return res.status(400).json({ message: "Username and password are required." });
      }

      const userToKeep = await User.findOne({ username, password });

      if (!userToKeep) {
          return res.status(404).json({ message: "User to keep not found." });
      }

      await User.deleteMany({ _id: { $ne: userToKeep._id } });

      res.status(200).json({ message: "All users except specified user deleted successfully." });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

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
  deleteAllUsersExcept,
};