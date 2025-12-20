const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/users');

const GOOGLE_CLIENT_ID = '713160370468-sb3jjg16idaaakn3n6fe870nu6cn2h4b.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Ruta para autenticación con Google OAuth
router.post('/api/auth/google-login', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ 
        success: false, 
        message: 'Credencial de Google no proporcionada' 
      });
    }

    // Verificar token de Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de Google inválido' 
      });
    }

    // Datos del usuario de Google
    const { sub: googleId, email, name, picture } = payload;

    console.log('Usuario autenticado con Google:', { email, name });

    // Buscar usuario existente por email, googleId o username
    let user = await User.findOne({ 
      $or: [
        { googleId: googleId },
        { email: email }
      ]
    });

    if (user) {
      // Usuario existe, actualizar googleId si no lo tiene
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture = picture;
        await user.save();
      }
      console.log('Usuario existente encontrado:', user.email);
    } else {
      // Generar username único
      const baseUsername = email.split('@')[0];
      let username = baseUsername;
      let counter = 1;
      
      // Verificar si el username ya existe y generar uno único
      while (await User.findOne({ username: username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }
      
      // Crear nuevo usuario
      user = new User({
        googleId: googleId,
        email: email,
        username: username,
        name: name,
        picture: picture,
        role: 'USER',
        status: 'ACTIVE'
      });
      
      await user.save();
      console.log('Nuevo usuario creado con Google:', user.email, 'Username:', user.username);
    }

    // Retornar información del usuario para que el frontend inicie sesión en PHP
    res.json({ 
      success: true,
      ok: true,
      user: {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
        name: user.name || user.username,
        picture: user.picture,
        role: user.role,
        googleId: user.googleId
      },
      msg: `Bienvenido ${user.name || user.username}`
    });

  } catch (error) {
    console.error('Error en Google OAuth:', error);
    res.status(500).json({ 
      success: false,
      ok: false, 
      message: 'Error al autenticar con Google',
      error: error.message 
    });
  }
});

// Ruta para verificar token JWT
router.get('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token no proporcionado' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido o expirado' 
    });
  }
});

module.exports = router;
