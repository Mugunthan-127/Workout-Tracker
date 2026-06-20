const mongoose = require("mongoose");
const Workout = require("../models/Workout");
exports.getDashboardAnalytics = async (req, res) => {
    const userId = req.userId;

    const totalWorkouts = await Workout.countDocuments({ user: userId });

    const calorieData = await Workout.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
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

    const totalCalories = calorieData.length > 0 ? calorieData[0].total : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyWorkouts = await Workout.countDocuments({
        user: userId,
        workoutDate: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
        message: "Dashboard analytics retrieved",
        analytics: {
            totalWorkouts,
            totalCalories,
            weeklyWorkouts,
            avgCaloriesPerWorkout: totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0
        }
    });
};

exports.getWeeklyBreakdown = async (req, res) => {
    const userId = req.userId;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyData = await Workout.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                workoutDate: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$workoutDate" } },
                count: { $sum: 1 },
                calories: { $sum: { $sum: "$exercises.calories" } }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
        message: "Weekly breakdown retrieved",
        weeklyData
    });
};

exports.getWorkoutTypeDistribution = async (req, res) => {
    const userId = req.userId;

    const distribution = await Workout.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: "$workoutType",
                count: { $sum: 1 },
                totalCalories: { $sum: { $sum: "$exercises.calories" } }
            }
        },
        { $sort: { count: -1 } }
    ]);

    res.status(200).json({
        message: "Workout type distribution retrieved",
        distribution
    });
};

exports.getTopExercises = async (req, res) => {
    const userId = req.userId;

    const topExercises = await Workout.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $unwind: "$exercises" },
        {
            $group: {
                _id: "$exercises.exerciseName",
                count: { $sum: 1 },
                totalSets: { $sum: "$exercises.sets" },
                totalReps: { $sum: "$exercises.reps" },
                totalCalories: { $sum: "$exercises.calories" }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    res.status(200).json({
        message: "Top exercises retrieved",
        topExercises
    });
};
