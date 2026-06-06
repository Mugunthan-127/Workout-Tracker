const mongoose = require("mongoose");
const Goal = require("../models/Goal");
const Workout = require("../models/Workout");

/* Create Goal */
exports.createGoal = async (req, res) => {
    try {
        const { goalType, targetValue, timeframe, exerciseName, workoutType } = req.body;
        const userId = req.userId;

        /* Validation */
        if (!goalType || !targetValue || !timeframe) {
            return res.status(400).json({ message: "Goal type, target value, and timeframe are required" });
        }

        if (goalType === "Specific Exercise" && !exerciseName) {
            return res.status(400).json({ message: "Exercise name is required for Specific Exercise goals" });
        }

        if (goalType === "Workout Type" && !workoutType) {
            return res.status(400).json({ message: "Workout type is required for Workout Type goals" });
        }

        const newGoal = new Goal({
            user: userId,
            goalType,
            targetValue,
            timeframe,
            exerciseName: exerciseName || null,
            workoutType: workoutType || null,
            currentValue: 0,
            status: "Active"
        });

        await newGoal.save();

        res.status(201).json({
            message: "Goal created successfully",
            goal: newGoal
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* Update Goal */
exports.updateGoal = async (req, res) => {
    try {
        const { goalId } = req.params;
        const { targetValue, status } = req.body;
        const userId = req.userId;

        const goal = await Goal.findById(goalId);

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        if (goal.user.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized to update this goal" });
        }

        if (targetValue) goal.targetValue = targetValue;
        if (status) goal.status = status;
        goal.updatedAt = Date.now();

        await goal.save();

        res.status(200).json({
            message: "Goal updated successfully",
            goal
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* Get All User Goals */
exports.getUserGoals = async (req, res) => {
    try {
        const userId = req.userId;

        const goals = await Goal.find({ user: userId }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "User goals retrieved",
            goals
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* Get Goal Progress */
exports.getGoalProgress = async (req, res) => {
    try {
        const { goalId } = req.params;
        const userId = req.userId;

        const goal = await Goal.findById(goalId);

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        if (goal.user.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized to view this goal" });
        }

        /* Calculate current value based on goal type and timeframe */
        let currentValue = 0;
        const startDate = calculateStartDate(goal.timeframe);

        if (goal.goalType === "Total Workouts") {
            const count = await Workout.countDocuments({
                user: userId,
                workoutDate: { $gte: startDate }
            });
            currentValue = count;
        } else if (goal.goalType === "Total Calories") {
            const result = await Workout.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(userId),
                        workoutDate: { $gte: startDate }
                    }
                },
                {
                    $project: {
                        totalCalories: { $sum: "$exercises.calories" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalCalories" }
                    }
                }
            ]);
            currentValue = result.length > 0 ? result[0].total : 0;
        } else if (goal.goalType === "Specific Exercise") {
            const result = await Workout.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(userId),
                        workoutDate: { $gte: startDate }
                    }
                },
                { $unwind: "$exercises" },
                {
                    $match: {
                        "exercises.exerciseName": goal.exerciseName
                    }
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 }
                    }
                }
            ]);
            currentValue = result.length > 0 ? result[0].count : 0;
        } else if (goal.goalType === "Workout Type") {
            const count = await Workout.countDocuments({
                user: userId,
                workoutType: goal.workoutType,
                workoutDate: { $gte: startDate }
            });
            currentValue = count;
        } else if (goal.goalType === "Average Calories Per Workout") {
            const result = await Workout.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(userId),
                        workoutDate: { $gte: startDate }
                    }
                },
                {
                    $project: {
                        totalCalories: { $sum: "$exercises.calories" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgCalories: { $avg: "$totalCalories" }
                    }
                }
            ]);
            currentValue = result.length > 0 ? Math.round(result[0].avgCalories) : 0;
        }

        goal.currentValue = currentValue;
        await goal.save();

        const progressPercentage = Math.min(Math.round((currentValue / goal.targetValue) * 100), 100);
        const isCompleted = currentValue >= goal.targetValue;

        res.status(200).json({
            message: "Goal progress retrieved",
            goalProgress: {
                goalId: goal._id,
                goalType: goal.goalType,
                targetValue: goal.targetValue,
                currentValue,
                progressPercentage,
                isCompleted,
                status: goal.status,
                timeframe: goal.timeframe
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* Delete Goal */
exports.deleteGoal = async (req, res) => {
    try {
        const { goalId } = req.params;
        const userId = req.userId;

        const goal = await Goal.findById(goalId);

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        if (goal.user.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized to delete this goal" });
        }

        await Goal.deleteOne({ _id: goalId });

        res.status(200).json({ message: "Goal deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* Helper function to calculate start date based on timeframe */
function calculateStartDate(timeframe) {
    const now = new Date();
    
    if (timeframe === "Weekly") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return sevenDaysAgo;
    } else if (timeframe === "Monthly") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return thirtyDaysAgo;
    } else {
        /* All-Time: return a very old date */
        return new Date("2000-01-01");
    }
}
