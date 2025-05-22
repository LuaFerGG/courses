import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    professors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    cohort: {
        type: String,
    },
}, {
    timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);
export default Course;
