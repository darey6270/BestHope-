const express = require("express"); 
const router = express.Router();
const {
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
} = require("../controllers/userController");
const protect = require("../middleWare/authMiddleware");
const {fileSizeFormatter } = require("../utils/fileUpload");
const uploadMiddleware = require("../utils/uploadMiddleware");
const upload = uploadMiddleware("uploads");


router.post("/register",upload.single('image'), registerUser);
router.post("/login", loginUser);
router.get("/getusers", getUsers);
router.get("/logout", logout);
router.get("/getuser/:id", getUser);
router.get("/loggedin", loginStatus);
router.patch("/updateuser", updateUser);
router.patch("/changepassword", protect, changePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);
router.patch("/approve-user/:userId", approveUser);

module.exports = router;
