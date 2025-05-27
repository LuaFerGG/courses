import express from "express";
import Task from "../models/task.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Estudiante: Subir tarea con PDF
router.post('/', authMiddleware, authorizeRoles('student'), upload.single('pdf'), async (req, res) => {
    try {
        const { title, course } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "PDF file is required" });
        }

        const task = new Task({
            title,
            course,
            creator: req.user.id,
            pdfUrl: req.file.path,
        });

        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/download/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task || !task.pdfUrl) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        res.download(task.pdfUrl); // Descarga el archivo
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Profesor: Calificar tareas
router.patch("/:id/grade", authMiddleware, authorizeRoles('teacher'), async (req, res) => {
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

// Obtener todas las tareas (para profesor o estudiante del curso)
router.get("/", authMiddleware, authorizeRoles('teacher', 'student'), async (req, res) => {
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
