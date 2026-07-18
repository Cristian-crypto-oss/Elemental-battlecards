require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Sequelize models

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_secreto_y_largo'; // Deberías mover esto a un .env

// Registro de usuario
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Por favor, proporciona todos los campos.' });
        }

        // Verificar si el usuario o email ya existe
        const existingUser = await User.findOne({ 
            where: { 
                [require('sequelize').Op.or]: [
                    { username },
                    { email }
                ]
            }
        });
        
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'El correo electrónico ya está en uso.' });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const savedUser = await User.create({ username, email, password: hashedPassword });
        console.log('Usuario registrado:', savedUser.id);

        const payload = {
            user: {
                id: savedUser.id,
                username: savedUser.username,
                email: savedUser.email
            }
        };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ 
                message: 'Usuario registrado exitosamente.',
                token,
                user: payload.user 
            });
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

// Login de usuario (acepta username o email)
exports.loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Por favor, proporciona todos los campos.' });
        }

        // Buscar por username o email
        let user = null;
        if (username) {
            user = await User.findOne({ where: { username } });
        } else if (email) {
            user = await User.findOne({ where: { email } });
        } else {
            return res.status(400).json({ message: 'Por favor, proporciona username o email y contraseña.' });
        }

        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const payload = {
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: payload.user });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};
