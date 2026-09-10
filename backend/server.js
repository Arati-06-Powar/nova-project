const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const taskRoutes = require("./routes/tasks");
const memberRoutes = require("./routes/members");


const verifyToken = require("./middleware/authMiddleware");

const app = express();


// ==================== MIDDLEWARE ====================

app.use(cors());
app.use(express.json());


// ==================== AUTH ROUTES ====================

app.use("/api/auth", authRoutes);


// ==================== PROJECT ROUTES ====================

app.use("/api/projects", projectRoutes);


// ==================== TASK ROUTES ====================

app.use("/api/tasks", taskRoutes);
app.use("/api/members", memberRoutes);


// ==================== PUBLIC ROUTE ====================

app.get("/", (req, res) => {

    res.json({
        message: "NOVA Backend is running!"
    });

});


// ==================== PROTECTED TEST ROUTE ====================

app.get("/api/protected", verifyToken, (req, res) => {

    res.json({
        message: "You accessed a protected route!",
        user: req.user
    });

});


// ==================== SERVER ====================

const PORT = 5000;

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});