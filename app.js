import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import taskRoutes from './routes/tasks.js';
import authRoutes from './routes/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const PORT = 3000;


app.use(express.json());

app.use('/api/auth', authRoutes);


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado con MongoDB'))
    .catch((err) => console.error('Error conectando a MongoDB:', err));

app.use('/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
    res.send('todo está funcionando :D!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
