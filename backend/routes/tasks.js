const express = require("express");
const db = require("../db");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();


// ==================== CREATE TASK ====================

router.post("/", verifyToken, (req, res) => {

    const {
        title,
        description,
        project_id,
        assigned_to,
        priority,
        due_date
    } = req.body;

    if (!title || !project_id) {
        return res.status(400).json({
            message: "Title and project_id are required"
        });
    }

    // Check if project belongs to logged-in user
    const checkProject = `
        SELECT * FROM projects
        WHERE id = ? AND owner_id = ?
    `;

    db.query(
        checkProject,
        [project_id, req.user.id],
        (err, projectResults) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (projectResults.length === 0) {
                return res.status(404).json({
                    message: "Project not found or access denied"
                });
            }

            const query = `
                INSERT INTO tasks
                (title, description, project_id, assigned_to, priority, due_date)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(
                query,
                [
                    title,
                    description || null,
                    project_id,
                    assigned_to || null,
                    priority || "medium",
                    due_date || null
                ],
                (err, result) => {

                    if (err) {
                        return res.status(500).json({
                            message: "Failed to create task"
                        });
                    }

                    res.status(201).json({
                        message: "Task created successfully",
                        taskId: result.insertId
                    });

                }
            );

        }
    );

});


// ==================== GET TASKS OF PROJECT ====================

router.get("/project/:projectId", verifyToken, (req, res) => {

    const projectId = req.params.projectId;

    const query = `
        SELECT tasks.*
        FROM tasks
        INNER JOIN projects
        ON tasks.project_id = projects.id
        WHERE tasks.project_id = ?
        AND projects.owner_id = ?
        ORDER BY tasks.created_at DESC
    `;

    db.query(
        query,
        [projectId, req.user.id],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to fetch tasks"
                });
            }

            res.status(200).json({
                tasks: results
            });

        }
    );

});


// ==================== UPDATE TASK ====================

router.put("/:id", verifyToken, (req, res) => {

    const taskId = req.params.id;

    const {
        title,
        description,
        status,
        priority,
        assigned_to,
        due_date
    } = req.body;

    const query = `
        UPDATE tasks
        INNER JOIN projects
        ON tasks.project_id = projects.id
        SET
            tasks.title = ?,
            tasks.description = ?,
            tasks.status = ?,
            tasks.priority = ?,
            tasks.assigned_to = ?,
            tasks.due_date = ?
        WHERE tasks.id = ?
        AND projects.owner_id = ?
    `;

    db.query(
        query,
        [
            title,
            description,
            status,
            priority,
            assigned_to || null,
            due_date || null,
            taskId,
            req.user.id
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to update task"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }

            res.status(200).json({
                message: "Task updated successfully"
            });

        }
    );

});


// ==================== DELETE TASK ====================

router.delete("/:id", verifyToken, (req, res) => {

    const taskId = req.params.id;

    const query = `
        DELETE tasks
        FROM tasks
        INNER JOIN projects
        ON tasks.project_id = projects.id
        WHERE tasks.id = ?
        AND projects.owner_id = ?
    `;

    db.query(
        query,
        [taskId, req.user.id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to delete task"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }

            res.status(200).json({
                message: "Task deleted successfully"
            });

        }
    );

});


module.exports = router;