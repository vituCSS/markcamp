const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET todas as obras
router.get('/', (req, res) => {
  db.query('SELECT * FROM obras', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// GET uma obra por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM obras WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Obra não encontrada' });
    }
    res.json(results[0]);
  });
});

// POST criar uma obra
router.post('/', (req, res) => {
  const { nome, localizacao, gestor, status, progresso, descricao, dataInicio, dataFim, orcamento } = req.body;
  
  db.query(
    'INSERT INTO obras (nome, localizacao, gestor, status, progresso, descricao, dataInicio, dataFim, orcamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [nome, localizacao, gestor, status, progresso, descricao, dataInicio, dataFim, orcamento],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: results.insertId, ...req.body });
    }
  );
});

// PUT atualizar uma obra
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, localizacao, gestor, status, progresso, descricao, dataInicio, dataFim, orcamento } = req.body;
  
  db.query(
    'UPDATE obras SET nome = ?, localizacao = ?, gestor = ?, status = ?, progresso = ?, descricao = ?, dataInicio = ?, dataFim = ?, orcamento = ? WHERE id = ?',
    [nome, localizacao, gestor, status, progresso, descricao, dataInicio, dataFim, orcamento, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Obra não encontrada' });
      }
      res.json({ id, ...req.body });
    }
  );
});

// DELETE uma obra
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM obras WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Obra não encontrada' });
    }
    res.json({ message: 'Obra excluída com sucesso' });
  });
});

module.exports = router;