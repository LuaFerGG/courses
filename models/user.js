import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ["student", "teacher"],
        required: true,
    },
    cohort: {
        type: String,
        required: false,
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
