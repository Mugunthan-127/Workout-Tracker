const express = require("express");
const { body } = require("express-validator");
const { register, login, getUser, deleteUser, getAllUsers } = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

const registerValidation = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.get("/user", verifyToken, getUser);
router.delete("/user", verifyToken, deleteUser);
router.get("/all-users", getAllUsers);

module.exports = router;
