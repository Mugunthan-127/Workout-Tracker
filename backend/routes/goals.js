const express = require("express");
const { body, param } = require("express-validator");
const { verifyToken } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
    createGoal,
    updateGoal,
    getUserGoals,
    getGoalProgress,
    deleteGoal
} = require("../controllers/goalController");

const router = express.Router();

const GOAL_TYPES = ["Total Workouts", "Total Calories", "Specific Exercise", "Workout Type", "Average Calories Per Workout"];
const TIMEFRAMES = ["Weekly", "Monthly", "All-Time"];
const WORKOUT_TYPES = ["Leg Day", "Chest Day", "Back Day", "Arm Day", "Shoulder Day", "Cardio", "Full Body"];

const createGoalValidation = [
    body("goalType")
        .isIn(GOAL_TYPES)
        .withMessage(`Goal type must be one of: ${GOAL_TYPES.join(", ")}`),
    body("targetValue")
        .isInt({ min: 1 })
        .withMessage("Target value must be a positive integer"),
    body("timeframe")
        .isIn(TIMEFRAMES)
        .withMessage(`Timeframe must be one of: ${TIMEFRAMES.join(", ")}`),
    body("exerciseName")
        .if(body("goalType").equals("Specific Exercise"))
        .trim()
        .notEmpty()
        .withMessage("Exercise name is required for Specific Exercise goals"),
    body("workoutType")
        .if(body("goalType").equals("Workout Type"))
        .isIn(WORKOUT_TYPES)
        .withMessage(`Workout type must be one of: ${WORKOUT_TYPES.join(", ")}`),
];

const updateGoalValidation = [
    param("goalId").isMongoId().withMessage("Invalid goal ID"),
    body("targetValue")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Target value must be a positive integer"),
    body("status")
        .optional()
        .isIn(["Active", "Completed", "Paused"])
        .withMessage("Status must be Active, Completed, or Paused"),
];

const goalIdValidation = [
    param("goalId").isMongoId().withMessage("Invalid goal ID"),
];

router.post("/add", verifyToken, createGoalValidation, validate, createGoal);
router.get("/all", verifyToken, getUserGoals);
router.get("/progress/:goalId", verifyToken, goalIdValidation, validate, getGoalProgress);
router.put("/update/:goalId", verifyToken, updateGoalValidation, validate, updateGoal);
router.delete("/delete/:goalId", verifyToken, goalIdValidation, validate, deleteGoal);

module.exports = router;
