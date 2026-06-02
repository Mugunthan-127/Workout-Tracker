const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    workoutType: {
        type: String,
        required: true,
        enum: ["Leg Day", "Chest Day", "Back Day", "Arm Day", "Shoulder Day", "Cardio", "Full Body"],
    },
    workoutDate: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
        optional: true,
    },
    exercises: [
        {
            exerciseName: {
                type: String,
                required: true,
            },
            sets: {
                type: Number,
                default: 0,
            },
            reps: {
                type: Number,
                default: 0,
            },
            duration: {
                type: Number,
                default: 0, // in minutes
            },
            calories: {
                type: Number,
                default: 0,
            },
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model("Workout", workoutSchema);
