const express = require("express");
const db = require("../db");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   ADD MEMBER USING EMAIL
   ===================================================== */

router.post("/", verifyToken, (req, res) => {
    const { project_id, email } = req.body;

    if (!project_id || !email) {
        return res.status(400).json({
            message: "project_id and email are required"
        });
    }

    const checkProject = `
        SELECT *
        FROM projects
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
                return res.status(403).json({
                    message: "You are not the owner of this project"
                });
            }

            const findUser = `
                SELECT id, name, email
                FROM users
                WHERE email = ?
            `;

            db.query(
                findUser,
                [email],
                (err, userResults) => {

                    if (err) {
                        return res.status(500).json({
                            message: "Database error"
                        });
                    }

                    if (userResults.length === 0) {
                        return res.status(404).json({
                            message: "No user found with this email"
                        });
                    }

                    const user = userResults[0];

                    const insertQuery = `
                        INSERT INTO project_members
                        (project_id, user_id)
                        VALUES (?, ?)
                    `;

                    db.query(
                        insertQuery,
                        [project_id, user.id],
                        (err, result) => {

                            if (err) {

                                if (err.code === "ER_DUP_ENTRY") {
                                    return res.status(409).json({
                                        message: "User is already a project member"
                                    });
                                }

                                return res.status(500).json({
                                    message: "Failed to add member"
                                });
                            }

                            return res.status(201).json({
                                message: "Member added successfully",
                                member: user
                            });
                        }
                    );
                }
            );
        }
    );
});


/* =====================================================
   GET PROJECT MEMBERS
   ===================================================== */

router.get("/:projectId", verifyToken, (req, res) => {

    const projectId = req.params.projectId;

    const query = `
        SELECT
            users.id,
            users.name,
            users.email
        FROM project_members
        INNER JOIN users
            ON project_members.user_id = users.id
        INNER JOIN projects
            ON project_members.project_id = projects.id
        WHERE project_members.project_id = ?
        AND projects.owner_id = ?
    `;

    db.query(
        query,
        [projectId, req.user.id],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to fetch members"
                });
            }

            return res.status(200).json({
                members: results
            });
        }
    );
});


/* =====================================================
   REMOVE MEMBER
   ===================================================== */

router.delete("/:projectId/:userId", verifyToken, (req, res) => {

    const { projectId, userId } = req.params;

    const query = `
        DELETE project_members
        FROM project_members
        INNER JOIN projects
            ON project_members.project_id = projects.id
        WHERE project_members.project_id = ?
        AND project_members.user_id = ?
        AND projects.owner_id = ?
    `;

    db.query(
        query,
        [projectId, userId, req.user.id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to remove member"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Member not found"
                });
            }

            return res.status(200).json({
                message: "Member removed successfully"
            });
        }
    );
});


module.exports = router;