const express = require("express");
const { createUser,
    getUsers,
    updateUser,
    deleteUser, } = require("../controllers/unpaidSelectedUser");
const router = express.Router();

router.post("/create", createUser);
router.get("/getusers", getUsers);
router.delete("/:id", getUser);
router.patch("/updateuser", updateUser);


module.exports = router;
