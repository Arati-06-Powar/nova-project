const express = require("express");
const db = require("../db");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();


// ==================== CREATE PROJECT ====================

router.post("/", verifyToken, (req, res) => {

    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Project name is required"
        });
    }

    const query = `
        INSERT INTO projects (name, description, owner_id)
        VALUES (?, ?, ?)
    `;

    db.query(
        query,
        [name, description || null, req.user.id],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Failed to create project"
                });
            }

            res.status(201).json({
                message: "Project created successfully",
                projectId: result.insertId
            });

        }
    );

});


// ==================== GET MY PROJECTS ====================

router.get("/", verifyToken, (req, res) => {

    const query = `
        SELECT *
        FROM projects
        WHERE owner_id = ?
        ORDER BY created_at DESC
    `;

    db.query(
        query,
        [req.user.id],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to fetch projects"
                });
            }

            res.status(200).json({
                projects: results
            });

        }
    );

});


// ==================== GET SINGLE PROJECT ====================

router.get("/:id", verifyToken, (req, res) => {

    const projectId = req.params.id;

    const query = `
        SELECT *
        FROM projects
        WHERE id = ? AND owner_id = ?
    `;

    db.query(
        query,
        [projectId, req.user.id],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Project not found"
                });
            }

            res.status(200).json({
                project: results[0]
            });

        }
    );

});


// ==================== UPDATE PROJECT ====================

router.put("/:id", verifyToken, (req, res) => {

    const projectId = req.params.id;
    const { name, description, status } = req.body;

    const query = `
        UPDATE projects
        SET name = ?, description = ?, status = ?
        WHERE id = ? AND owner_id = ?
    `;

    db.query(
        query,
        [
            name,
            description,
            status,
            projectId,
            req.user.id
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to update project"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Project not found"
                });
            }

            res.status(200).json({
                message: "Project updated successfully"
            });

        }
    );

});


// ==================== DELETE PROJECT ====================

router.delete("/:id", verifyToken, (req, res) => {

    const projectId = req.params.id;

    const query = `
        DELETE FROM projects
        WHERE id = ? AND owner_id = ?
    `;

    db.query(
        query,
        [projectId, req.user.id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to delete project"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Project not found"
                });
            }

            res.status(200).json({
                message: "Project deleted successfully"
            });

        }
    );

});


module.exports = router;