const express = require("express");
const { register, login, getUser, deleteUser, getAllUsers } = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

/* Register */
router.post("/register", register);

/* Login */
router.post("/login", login);

/* Get User Details (Protected) */
router.get("/user", verifyToken, getUser);

/* Delete User (Protected) */
router.delete("/user", verifyToken, deleteUser);

/* Get All Users (Development Only) */
router.get("/all-users", getAllUsers);

module.exports = router;
