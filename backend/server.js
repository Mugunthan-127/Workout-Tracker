const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

/* Test Route */
app.get("/", (req, res) => {
    res.send("Workout Tracker API Running");
});

/* Routes */
app.use("/api/auth", authRoutes);

/* 404 Error Handler - Invalid Routes */
app.use((req, res) => {
    res.status(404).json({ 
        message: "Route not found",
        method: req.method,
        path: req.path,
        availableEndpoints: {
            GET: ["/", "/api/auth/user", "/api/auth/all-users"],
            POST: ["/api/auth/register", "/api/auth/login"],
            DELETE: ["/api/auth/user"]
        }
    });
});

/* Global Error Handler */
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ 
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err : {}
    });
});

/* MongoDB Connection */
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((error) => {
    console.log(error);
});

/* Server */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});