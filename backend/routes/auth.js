<<<<<<< HEAD
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
=======
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const jwt = require('jsonwebtoken');

// POST login - com criação automática
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar gestor pelo email
    db.query('SELECT * FROM gestores WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Se não encontrou o gestor, cria automaticamente
      if (results.length === 0) {
        console.log('Criando gestor automaticamente para:', email);
        
        const criarGestor = `
          INSERT INTO gestores (nome, cadastro_empresa, email, telefone) 
          VALUES (?, 'AUTO-001', ?, '(11) 99999-9999')
        `;
        
        db.query(criarGestor, [`Gestor ${email}`, email], (err, insertResults) => {
          if (err) {
            console.error('Erro ao criar gestor:', err);
            return res.status(500).json({ error: 'Erro ao criar gestor' });
          }

          const novoGestor = {
            id: insertResults.insertId,
            nome: `Gestor ${email}`,
            email: email,
            cadastro_empresa: 'AUTO-001'
          };

          // QUALQUER SENHA FUNCIONA para desenvolvimento
          console.log('Login automático bem-sucedido para:', email);

          // Gerar token JWT
          const token = jwt.sign(
            { id: novoGestor.id, email: novoGestor.email },
            'seu_jwt_secret',
            { expiresIn: '24h' }
          );

          res.json({
            token,
            user: novoGestor
          });
        });
        
      } else {
        // Gestor já existe no banco
        const gestor = results[0];

        // QUALQUER SENHA FUNCIONA para desenvolvimento
        console.log('Login bem-sucedido para gestor existente:', email);

        // Gerar token JWT
        const token = jwt.sign(
          { id: gestor.id, email: gestor.email },
          'seu_jwt_secret',
          { expiresIn: '24h' }
        );

        res.json({
          token,
          user: {
            id: gestor.id,
            nome: gestor.nome,
            email: gestor.email,
            cadastro_empresa: gestor.cadastro_empresa
          }
        });
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  jwt.verify(token, 'seu_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
    req.user = user;
    next();
  });
};
<<<<<<< HEAD

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso não permitido.' });
    }
    next();
  };
};

module.exports = { router, authenticateToken, authorize };
=======
//
module.exports = { router, authenticateToken };
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
