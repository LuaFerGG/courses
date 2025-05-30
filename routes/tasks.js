import express from "express";
import Task from "../models/task.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import upload from '../middleware/uploadMiddleware.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

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
    const { token } = req.query;
    const { id } = req.params;

    if (!token) {
        return res.status(401).json({ error: 'Token requerido en la URL' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const task = await Task.findById(id)
            .populate('course', 'students')
            .populate('creator', '_id');
        console.log('Tarea encontrada para descarga:', task);
        if (!task || !task.pdfUrl) {
            return res.status(404).json({ error: 'Tarea o archivo no encontrado' });
        }

        const isCreator = task.creator._id.toString() === userId;
        const isStudentInCourse = task.course.students
            .map((s) => s.toString())
            .includes(userId);

        if (!isCreator && !isStudentInCourse) {
            return res.status(403).json({ error: 'No tienes permiso para descargar este archivo' });
        }

        const filePath = path.resolve(task.pdfUrl);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Archivo no existe en el servidor' });
        }

        res.download(filePath);
    } catch (error) {
        console.error('Error al verificar token o descargar archivo:', error.message);
        return res.status(400).json({ error: 'Token inválido o expirado' });
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
