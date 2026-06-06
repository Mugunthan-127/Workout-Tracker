const express = require("express");
const {
    getDashboardAnalytics,
    getWeeklyBreakdown,
    getWorkoutTypeDistribution,
    getTopExercises
} = require("../controllers/analyticsController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

/* Get Dashboard Analytics (Protected) */
router.get("/dashboard", verifyToken, getDashboardAnalytics);

/* Get Weekly Breakdown (Protected) */
router.get("/weekly", verifyToken, getWeeklyBreakdown);

/* Get Workout Type Distribution (Protected) */
router.get("/type-distribution", verifyToken, getWorkoutTypeDistribution);

/* Get Top Exercises (Protected) */
router.get("/top-exercises", verifyToken, getTopExercises);

module.exports = router;
