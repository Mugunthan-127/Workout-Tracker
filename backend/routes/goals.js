const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
    createGoal,
    updateGoal,
    getUserGoals,
    getGoalProgress,
    deleteGoal
} = require("../controllers/goalController");

/* Create Goal */
router.post("/add", verifyToken, createGoal);

/* Get All User Goals */
router.get("/all", verifyToken, getUserGoals);

/* Get Goal Progress */
router.get("/progress/:goalId", verifyToken, getGoalProgress);

/* Update Goal */
router.put("/update/:goalId", verifyToken, updateGoal);

/* Delete Goal */
router.delete("/delete/:goalId", verifyToken, deleteGoal);

module.exports = router;
