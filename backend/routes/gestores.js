const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const db = require('../server');

// GET todos os colaboradores
router.get('/', (req, res) => {
  db.query("SELECT * FROM colaboradores WHERE role = 'gestor'", (err, results) => {
=======
const db = require('../config/database');

// GET todos os gestores
router.get('/', (req, res) => {
  db.query('SELECT * FROM gestores', (err, results) => {
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET uma obra por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
<<<<<<< HEAD
  db.query('SELECT * FROM colaboradores WHERE id = ?', [id], (err, results) => {
=======
  db.query('SELECT * FROM gestores WHERE id = ?', [id], (err, results) => {
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
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
<<<<<<< HEAD
  const { nome, email, telefone } = req.body;
  const cadastro = 'GES-' + Date.now();
  db.query(
    "INSERT INTO colaboradores (nome, cadastro_empresa, email, telefone, role) VALUES (?, ?, ?, ?, 'gestor')",
    [nome, cadastro, email, telefone],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: results.insertId,
        nome,
        cadastro_empresa: cadastro,
        email,
        telefone,
        role: 'gestor'
      });
    }
  );
  
=======
  const { nome, cadastro_empresa, email, telefone } = req.body;
  db.query(
    'INSERT INTO gestores (nome, cadastro_empresa, email, telefone) VALUES (?, ?, ?, ?)',
    [nome, cadastro_empresa, email, telefone],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: results.insertId, ...req.body });
    }
  );
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
});

// PUT atualizar gestor
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, cadastro_empresa, email, telefone } = req.body;
  db.query(
<<<<<<< HEAD
    'UPDATE colaboradores SET nome = ?, cadastro_empresa = ?, email = ?, telefone = ? WHERE id = ?',
=======
    'UPDATE gestores SET nome = ?, cadastro_empresa = ?, email = ?, telefone = ? WHERE id = ?',
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
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
<<<<<<< HEAD
  db.query('DELETE FROM colaboradores WHERE id = ?', [id], (err, results) => {
=======
  db.query('DELETE FROM gestores WHERE id = ?', [id], (err, results) => {
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ message: 'Gestor não encontrado' });
    res.json({ message: 'Gestor excluído com sucesso' });
  });
});

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
