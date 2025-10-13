const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET todos os gestores
router.get('/', (req, res) => {
  db.query('SELECT * FROM gestores', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET uma obra por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM gestores WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Gestor não encontrada' });
    }
    res.json(results[0]);
  });
});

// POST criar gestor
router.post('/', (req, res) => {
  const { nome, cadastro_empresa, email, telefone } = req.body;
  db.query(
    'INSERT INTO gestores (nome, cadastro_empresa, email, telefone) VALUES (?, ?, ?, ?)',
    [nome, cadastro_empresa, email, telefone],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: results.insertId, ...req.body });
    }
  );
});

// PUT atualizar gestor
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, cadastro_empresa, email, telefone } = req.body;
  db.query(
    'UPDATE gestores SET nome = ?, cadastro_empresa = ?, email = ?, telefone = ? WHERE id = ?',
    [nome, cadastro_empresa, email, telefone, id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0) return res.status(404).json({ message: 'Gestor não encontrado' });
      res.json({ id, ...req.body });
    }
  );
});

// DELETE gestor
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM gestores WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ message: 'Gestor não encontrado' });
    res.json({ message: 'Gestor excluído com sucesso' });
  });
});

module.exports = router;