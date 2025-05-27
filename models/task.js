import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    status: {
        type: String,
        enum: ['pendiente', 'revisada', 'completed'],
        default: 'pendiente',
    },
    grade: {
        type: Number,
        min: 0,
        max: 100,
    },
    pdfUrl: {
        type: String,
    }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;