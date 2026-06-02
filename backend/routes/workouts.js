const express = require("express");
const { addWorkout, getWorkouts } = require("../controllers/workoutController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

/* Add Workout (Protected) */
router.post("/", verifyToken, addWorkout);

/* Get All Workouts (Protected) */
router.get("/", verifyToken, getWorkouts);

module.exports = router;
