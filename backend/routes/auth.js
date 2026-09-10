const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();


// ==================== SIGNUP ====================

router.post("/signup", async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {

        const checkQuery = "SELECT * FROM users WHERE email = ?";

        db.query(checkQuery, [email], async (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (results.length > 0) {
                return res.status(409).json({
                    message: "Email already registered"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const insertQuery = `
                INSERT INTO users (name, email, password)
                VALUES (?, ?, ?)
            `;

            db.query(
                insertQuery,
                [name, email, hashedPassword],
                (err, result) => {

                    if (err) {
                        return res.status(500).json({
                            message: "Failed to create user"
                        });
                    }

                    res.status(201).json({
                        message: "User registered successfully",
                        userId: result.insertId
                    });

                }
            );

        });

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ==================== LOGIN ====================

router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const query = "SELECT * FROM users WHERE email = ?";

    db.query(query, [email], async (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = results[0];

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        // ==================== JWT TOKEN ====================

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );


        // ==================== LOGIN RESPONSE ====================

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    });

});


// ==================== EXPORT ====================

module.exports = router;