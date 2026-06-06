const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        goalType: {
            type: String,
            enum: ["Total Workouts", "Total Calories", "Specific Exercise", "Workout Type", "Average Calories Per Workout"],
            required: true
        },
        targetValue: {
            type: Number,
            required: true
        },
        currentValue: {
            type: Number,
            default: 0
        },
        timeframe: {
            type: String,
            enum: ["Weekly", "Monthly", "All-Time"],
            required: true
        },
        exerciseName: {
            type: String,
            default: null
        },
        workoutType: {
            type: String,
            enum: ["Leg Day", "Chest Day", "Back Day", "Arm Day", "Shoulder Day", "Cardio", "Full Body", null],
            default: null
        },
        status: {
            type: String,
            enum: ["Active", "Completed", "Paused"],
            default: "Active"
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
