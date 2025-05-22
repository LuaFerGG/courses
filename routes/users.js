import express from 'express';
import User from '../models/user.js';

const router = express.Router();




router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

router.post('/', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(400).json({ error: 'Error al crear usuario', details: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user);
    } catch {
        res.status(400).json({ error: 'ID inválido' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user);
    } catch {
        res.status(400).json({ error: 'Error al actualizar usuario' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const result = await User.deleteOne({ _id: req.params.id });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado con éxito' });
    } catch {
        res.status(400).json({ error: 'Error al eliminar usuario' });
    }
});

export default router;
