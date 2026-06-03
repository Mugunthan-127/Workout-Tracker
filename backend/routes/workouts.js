const express = require("express");
const { addWorkout, getWorkouts } = require("../controllers/workoutController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

/* Add Workout (Protected) */
router.post("/add", verifyToken, addWorkout);

/* Get All Workouts (Protected) */
router.get("/user", verifyToken, getWorkouts);

module.exports = router;
