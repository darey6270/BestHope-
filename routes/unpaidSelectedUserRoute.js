const express = require("express");
const { createPaid,
    getUsers,
    updateUser,
    deleteUser,
    paidUser,
} = require("../controllers/unpaidSelectedUser");
const router = express.Router();

router.post("/create", createPaid);
router.get("/getusers", getUsers);
router.delete("/:id", deleteUser);
router.patch("/updateuser", updateUser);
router.put('/paidUser/:id',paidUser);

module.exports = router;
