const express = require('express');
const router = express.Router();
const db = require('../server');
const { authenticateToken, authorize } = require('./auth');

console.log('✅ Rotas de classes_mestre carregadas');

// Listar todas
router.get('/', authenticateToken, (req, res) => {
  console.log('📋 GET /api/classes-mestre');
  db.query("SELECT * FROM colaboradores WHERE role = 'mestre'", (err, results) => {
    if (err) {
      console.error('❌ Erro ao listar:', err);
      return res.status(500).json({ error: 'Erro ao buscar classes mestre.' });
    }
    console.log('✅ Encontrados:', results.length);
    res.json(results);
  });
});

// Criar nova
router.post('/', authenticateToken, authorize('gestor'), (req, res) => {
  console.log('📝 POST /api/classes-mestre');
  console.log('Body:', req.body);
  console.log('User:', req.user);
  
  const { nome, email, telefone } = req.body;
  if (!nome) {
    return res.status(400).json({ error: 'O campo nome é obrigatório.' });
  }

  const cadastro = 'MES-' + Date.now();

  db.query(
    "INSERT INTO colaboradores (nome, cadastro_empresa, email, telefone, role) VALUES (?, ?, ?, ?, 'mestre')",
    [nome, cadastro, email, telefone],
    (err, result) => {
      if (err) {
        console.error('❌ Erro ao inserir:', err);
        return res.status(500).json({ error: 'Erro ao criar classe mestre.' });
      }
      
      console.log('✅ Inserido ID:', result.insertId);

      db.query('SELECT * FROM colaboradores WHERE id = ?', [result.insertId], (err, rows) => {
        if (err) {
          console.error('❌ Erro ao recuperar:', err);
          return res.status(500).json({ error: 'Erro ao recuperar dados.' });
        }
        console.log('✅ Retornando:', rows[0]);
        res.status(201).json(rows[0]);
      });
    }
  );
});

// Atualizar
router.put('/:id', authenticateToken, authorize('gestor'), (req, res) => {
  const { id } = req.params;
  const {
      nome,
      cadastro_empresa,
      email,
      telefone
  } = req.body;
  if (!nome) {
    return res.status(400).json({ error: 'O campo nome é obrigatório.' });
  }

  db.query(
    `UPDATE colaboradores
    SET nome = ?,
        cadastro_empresa = ?,
        email = ?,
        telefone = ?
    WHERE id = ?`,
    [
      nome,
      cadastro_empresa,
      email,
      telefone,
      id
    ],
    (err) => {
      if (err) {
        console.error('❌ Erro ao atualizar:', err);
        return res.status(500).json({ error: 'Erro ao atualizar.' });
      }

      db.query('SELECT * FROM colaboradores WHERE id = ?', [id], (err, rows) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao recuperar dados.' });
        }
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Não encontrado.' });
        }
        res.json(rows[0]);
      });
    }
  );
});

// Deletar
router.delete('/:id', authenticateToken, authorize('gestor'), (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM colaboradores WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('❌ Erro ao deletar:', err);
      return res.status(500).json({ error: 'Erro ao deletar.' });
    }
    res.json({ message: 'Removido com sucesso', id: Number(id) });
  });
});

module.exports = router;
