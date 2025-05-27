import express from 'express';
import Course from '../models/course.js';
import Task from '../models/task.js';
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Crear un curso
router.post('/', authMiddleware, authorizeRoles('teacher'), async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Obtener cursos
router.get('/', authMiddleware, authorizeRoles('teacher', 'student'), async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('teachers', 'name email role')
            .populate('students', 'name email role cohort');

        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un curso por ID
router.get('/:id', authMiddleware, authorizeRoles('teacher', 'student'), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('teachers', 'name email role')
            .populate('students', 'name email role cohort');

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const tasks = await Task.find({ course: course._id });

        const statsByStudent = {};

        for (const task of tasks) {
            const studentId = task.creator.toString();

            if (!statsByStudent[studentId]) {
                statsByStudent[studentId] = {
                    tasksSubmitted: 0,
                    totalGrade: 0,
                    totalTasks: 0,
                };
            }

            statsByStudent[studentId].tasksSubmitted += 1;

            if (typeof task.grade === 'number') {
                statsByStudent[studentId].totalGrade += task.grade;
                statsByStudent[studentId].totalTasks += 1;
            }
        }

        const studentStats = course.students.map((student) => {
            const stats = statsByStudent[student._id.toString()] || {
                tasksSubmitted: 0,
                totalGrade: 0,
                totalTasks: 0,
            };

            const averageGrade = stats.totalTasks > 0
                ? stats.totalGrade / stats.totalTasks
                : null;

            return {
                _id: student._id,
                name: student.name,
                email: student.email,
                tasksSubmitted: stats.tasksSubmitted,
                averageGrade,
            };
        });

        const leaderboard = [...studentStats]
            .filter((s) => s.averageGrade !== null)
            .sort((a, b) => b.averageGrade - a.averageGrade)
            .slice(0, 5);

        res.json({
            _id: course._id,
            name: course.name,
            cohort: course.cohort,
            teachers: course.teachers,
            students: course.students,
            leaderboard,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;