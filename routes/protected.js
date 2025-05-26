import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/teachers", authMiddleware, (req, res) => {
    if (req.user.role !== "teacher") {
        return res.status(403).json({ error: "Only teachers can access this route" });
    }
    res.json({ message: "Welcome, teacher!" });
});

export default router;
