const express = require("express");
const { body } = require("express-validator");
const { addWorkout, getWorkouts } = require("../controllers/workoutController");
const { verifyToken } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

const WORKOUT_TYPES = ["Leg Day", "Chest Day", "Back Day", "Arm Day", "Shoulder Day", "Cardio", "Full Body"];

const addWorkoutValidation = [
    body("workoutType")
        .isIn(WORKOUT_TYPES)
        .withMessage(`Workout type must be one of: ${WORKOUT_TYPES.join(", ")}`),
    body("exercises")
        .isArray({ min: 1 })
        .withMessage("At least one exercise is required"),
    body("exercises.*.exerciseName")
        .trim()
        .notEmpty()
        .withMessage("Exercise name is required for all exercises"),
    body("exercises.*.sets")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Sets must be a non-negative integer"),
    body("exercises.*.reps")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Reps must be a non-negative integer"),
    body("exercises.*.duration")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Duration must be a non-negative integer"),
    body("exercises.*.calories")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Calories must be a non-negative integer"),
];

router.post("/add", verifyToken, addWorkoutValidation, validate, addWorkout);
router.get("/user", verifyToken, getWorkouts);

module.exports = router;
