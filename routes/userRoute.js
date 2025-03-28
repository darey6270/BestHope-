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
  getApprovedUsers,
  userContribution,
  deleteAllUsersExcept,
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
router.patch("/changepassword/:id", changePassword);
router.patch("/forgotpassword/:id", forgotPassword);
router.put("/resetpassword", resetPassword);
router.put("/approveuser/:id", approveUser);
router.get("/getApprovedUsers", getApprovedUsers);
router.get("/userContribution", userContribution);
// DELETE: Delete all users except specified user
// router.delete("/deleteAllExcept", deleteAllUsersExcept);

module.exports = router;
