const mongoose = require("mongoose");
const Goal = require("../models/Goal");
const Workout = require("../models/Workout");
const AppError = require("../utils/AppError");
exports.createGoal = async (req, res) => {
    const { goalType, targetValue, timeframe, exerciseName, workoutType } = req.body;
    const userId = req.userId;

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
};

exports.updateGoal = async (req, res) => {
    const { goalId } = req.params;
    const { targetValue, status } = req.body;
    const userId = req.userId;

    const goal = await Goal.findById(goalId);
    if (!goal) {
        throw new AppError("Goal not found", 404);
    }

    if (goal.user.toString() !== userId) {
        throw new AppError("Unauthorized to update this goal", 403);
    }

    if (targetValue !== undefined) goal.targetValue = targetValue;
    if (status !== undefined) goal.status = status;
    goal.updatedAt = Date.now();

    await goal.save();

    res.status(200).json({
        message: "Goal updated successfully",
        goal
    });
};

exports.getUserGoals = async (req, res) => {
    const userId = req.userId;

    const goals = await Goal.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
        message: "User goals retrieved",
        goals
    });
};

exports.getGoalProgress = async (req, res) => {
    const { goalId } = req.params;
    const userId = req.userId;

    const goal = await Goal.findById(goalId);
    if (!goal) {
        throw new AppError("Goal not found", 404);
    }

    if (goal.user.toString() !== userId) {
        throw new AppError("Unauthorized to view this goal", 403);
    }

    let currentValue = 0;
    const startDate = calculateStartDate(goal.timeframe);

    if (goal.goalType === "Total Workouts") {
        currentValue = await Workout.countDocuments({
            user: userId,
            workoutDate: { $gte: startDate }
        });
    } else if (goal.goalType === "Total Calories") {
        const result = await Workout.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), workoutDate: { $gte: startDate } } },
            { $project: { totalCalories: { $sum: "$exercises.calories" } } },
            { $group: { _id: null, total: { $sum: "$totalCalories" } } }
        ]);
        currentValue = result.length > 0 ? result[0].total : 0;
    } else if (goal.goalType === "Specific Exercise") {
        const result = await Workout.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), workoutDate: { $gte: startDate } } },
            { $unwind: "$exercises" },
            { $match: { "exercises.exerciseName": goal.exerciseName } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);
        currentValue = result.length > 0 ? result[0].count : 0;
    } else if (goal.goalType === "Workout Type") {
        currentValue = await Workout.countDocuments({
            user: userId,
            workoutType: goal.workoutType,
            workoutDate: { $gte: startDate }
        });
    } else if (goal.goalType === "Average Calories Per Workout") {
        const result = await Workout.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), workoutDate: { $gte: startDate } } },
            { $project: { totalCalories: { $sum: "$exercises.calories" } } },
            { $group: { _id: null, avgCalories: { $avg: "$totalCalories" } } }
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
};

exports.deleteGoal = async (req, res) => {
    const { goalId } = req.params;
    const userId = req.userId;

    const goal = await Goal.findById(goalId);
    if (!goal) {
        throw new AppError("Goal not found", 404);
    }

    if (goal.user.toString() !== userId) {
        throw new AppError("Unauthorized to delete this goal", 403);
    }

    await Goal.deleteOne({ _id: goalId });

    res.status(200).json({ message: "Goal deleted successfully"     });
};

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
        return new Date("2000-01-01");
    }
}
