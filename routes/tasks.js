import express from "express";
import Task from "../models/task.js";

const router = express.Router();

// Aprendiz: Crear una tarea
router.post("/", async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Profesor: Calificar tareas
router.patch("/:id/grade", async (req, res) => {
    try {
        const { grade } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        task.grade = grade;
        task.status = "revisada";
        await task.save();

        res.json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('creator', 'name email role')
            .populate('course', 'name');

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
