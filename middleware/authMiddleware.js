import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Agregamos al req.user solo lo que necesitas
        req.user = {
            id: decoded.id,
            role: decoded.role,
            cohort: decoded.cohort
        };

        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export default authMiddleware;
