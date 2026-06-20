const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const workoutRoutes = require("./routes/workouts");
const analyticsRoutes = require("./routes/analytics");
const goalRoutes = require("./routes/goals");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Workout Tracker API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/goals", goalRoutes);

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
        method: req.method,
        path: req.path,
    });
});

app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((error) => {
    console.log(error);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
