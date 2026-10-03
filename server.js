const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const User = require("./models/User");
const authenticateToken = require("./middleware/auth");

dotenv.config();

const app = express();


// ===============================
// Middleware
// ===============================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));


// ===============================
// MongoDB Connection
// ===============================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("❌ MongoDB connection failed:", error.message);
    });


// ===============================
// Home Route
// ===============================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ===============================
// Signup API
// ===============================

app.post("/api/signup", async (req, res) => {

    try {

        const { name, email, password } = req.body;


        // Basic validation

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }


        // Email validation

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }


        // Password validation

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }


        // Check duplicate email

        const existingUser =
            await User.findOne({
                email: email.toLowerCase()
            });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create user

        const user =
            new User({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword
            });


        await user.save();


        res.status(201).json({
            message: "Account created successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error during signup."
        });
    }
});


// ===============================
// Login API
// ===============================

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;


        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }


        // Find user

        const user =
            await User.findOne({
                email: email.toLowerCase().trim()
            });


        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }


        // Compare password

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }


        // Create JWT

        const token =
            jwt.sign(
                {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "2h"
                }
            );


        res.json({
            message: "Login successful.",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error during login."
        });
    }
});


// ===============================
// Protected Profile API
// ===============================

app.get(
    "/api/profile",
    authenticateToken,
    async (req, res) => {

        try {

            const user =
                await User.findById(req.user.id)
                    .select("-password");


            if (!user) {
                return res.status(404).json({
                    message: "User not found."
                });
            }


            res.json({
                user: user
            });

        } catch (error) {

            res.status(500).json({
                message: "Unable to load profile."
            });
        }
    }
);


// ===============================
// Logout API
// ===============================

app.post("/api/logout", (req, res) => {

    res.json({
        message:
            "Logout successful. Please remove the token on the client."
    });
});


// ===============================
// Start Server
// ===============================

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `🚀 Server running at http://localhost:${PORT}`
    );
});