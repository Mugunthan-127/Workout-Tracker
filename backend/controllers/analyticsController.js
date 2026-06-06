const mongoose = require("mongoose");
const Workout = require("../models/Workout");

/* Get Dashboard Analytics */
exports.getDashboardAnalytics = async (req, res) => {
    try {
        const userId = req.userId;

        /* Total Workouts */
        const totalWorkouts = await Workout.countDocuments({ user: userId });

        /* Total Calories */
        const calorieData = await Workout.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $project: {
                    totalCalories: {
                        $sum: "$exercises.calories"
                    }
                }
            }
        ]);

        const totalCalories = calorieData.length > 0 ? calorieData[0].totalCalories : 0;

        /* Weekly Workout Count */
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* Get Weekly Breakdown */
exports.getWeeklyBreakdown = async (req, res) => {
    try {
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
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$workoutDate"
                        }
                    },
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* Get Workout Type Distribution */
exports.getWorkoutTypeDistribution = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* Get Top Exercises */
exports.getTopExercises = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
