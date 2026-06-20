const Workout = require("../models/Workout");
const AppError = require("../utils/AppError");

exports.addWorkout = async (req, res) => {
    const userId = req.userId;
    const { workoutType, notes, exercises } = req.body;

    const workout = new Workout({ user: userId, workoutType, notes, exercises });
    await workout.save();
    await workout.populate("user", "name email");

    res.status(201).json({
        message: "Workout created successfully",
        workout,
    });
};

exports.getWorkouts = async (req, res) => {
    const userId = req.userId;

    const workouts = await Workout.find({ user: userId })
        .populate("user", "name email")
        .sort({ workoutDate: -1 });

    res.status(200).json({
        message: "Workouts retrieved successfully",
        totalWorkouts: workouts.length,
        workouts,
    });
};
