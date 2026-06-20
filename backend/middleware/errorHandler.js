const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);

    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ message: messages.join(". ") });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({ message: `${field} already exists` });
    }

    if (err.name === "CastError") {
        return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
    }

    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
    }

    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : "Internal Server Error";

    res.status(statusCode).json({
        message,
        ...(process.env.NODE_ENV === "development" && { error: err.stack })
    });
};

module.exports = errorHandler;
