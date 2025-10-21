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
    req.user = user;
    next();
  });
};

module.exports = { router, authenticateToken };