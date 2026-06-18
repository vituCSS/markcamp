// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../server');
const jwt = require('jsonwebtoken');

// Registro de gestor/mestre
router.post('/register', (req, res) => {
  const { nome, email, password, role } = req.body;
  if (!nome || !email || !password || !role) {
    return res.status(400).json({ error: 'Nome, email, senha e perfil são obrigatórios.' });
  }

  db.query('SELECT id FROM colaboradores WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(409).json({ error: 'Email já cadastrado.' });

    const cadastro = (role === 'gestor' ? 'GES-' : 'MES-') + Date.now();
    db.query(
      'INSERT INTO colaboradores (nome, cadastro_empresa, email, telefone, role) VALUES (?, ?, ?, ?, ?)',
      [nome, cadastro, email, '(11) 00000-0000', role],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        const user = { id: result.insertId, nome, email, role };
        const token = jwt.sign(user, 'seu_jwt_secret', { expiresIn: '24h' });
        res.status(201).json({ token, user });
      }
    );
  });
});

// Login de gestor/mestre
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM colaboradores WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'Email não encontrado.' });

    const user = results[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, nome: user.nome, role: user.role, obra_id: user.obra_id },
      'seu_jwt_secret',
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cadastro_empresa: user.cadastro_empresa,
        role: user.role,
        obra_id: user.obra_id
      }
    });
  });
});

// Acesso de cliente por código da obra
router.post('/login/codigo', (req, res) => {
  const { codigo } = req.body;
  if (!codigo) return res.status(400).json({ error: 'Código da obra é obrigatório.' });

  db.query('SELECT * FROM obras WHERE codigo = ?', [codigo], (err, obras) => {
    if (err) return res.status(500).json({ error: err.message });
    if (obras.length === 0) return res.status(404).json({ error: 'Código de obra inválido.' });

    const obra = obras[0];
    const user = {
      id: 0,
      nome: 'Cliente',
      email: '',
      role: 'cliente',
      obra_id: obra.id
    };
    const token = jwt.sign(user, 'seu_jwt_secret', { expiresIn: '24h' });
    res.json({ token, user, obra });
  });
});

// Middlewares
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token de acesso requerido.' });
  jwt.verify(token, 'seu_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido ou expirado.' });
    req.user = user;
    next();
  });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso não permitido.' });
    }
    next();
  };
};

module.exports = { router, authenticateToken, authorize };
