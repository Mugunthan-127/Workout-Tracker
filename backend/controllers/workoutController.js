const Workout = require("../models/Workout");

/* Add Workout (Protected Route) */
exports.addWorkout = async (req, res) => {
    try {
        const userId = req.userId;
        const { workoutType, notes, exercises } = req.body;

        /* Validation */
        if (!workoutType) {
            return res.status(400).json({ message: "Workout type is required" });
        }

        if (!exercises || exercises.length === 0) {
            return res.status(400).json({ message: "At least one exercise is required" });
        }

        /* Validate each exercise */
        for (let exercise of exercises) {
            if (!exercise.exerciseName) {
                return res.status(400).json({ message: "Exercise name is required for all exercises" });
            }
        }

        /* Create new workout */
        const workout = new Workout({
            user: userId,
            workoutType,
            notes,
            exercises,
        });

        await workout.save();

        /* Populate user info */
        await workout.populate("user", "name email");

        res.status(201).json({
            message: "Workout created successfully",
            workout,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* Get All Workouts (Protected Route) */
exports.getWorkouts = async (req, res) => {
    try {
        const userId = req.userId;

        /* Fetch workouts for user, sorted by latest date first */
        const workouts = await Workout.find({ user: userId })
            .populate("user", "name email")
            .sort({ workoutDate: -1 });

        res.status(200).json({
            message: "Workouts retrieved successfully",
            totalWorkouts: workouts.length,
            workouts,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
