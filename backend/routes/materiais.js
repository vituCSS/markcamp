const express = require('express');
const router = express.Router();
const db = require('../server');
const { authenticateToken } = require('./auth');

router.get('/:obraId', authenticateToken, (req, res) => {
  db.query('SELECT * FROM materiais_obra WHERE obra_id = ?', [req.params.obraId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { obra_id, material, unidade_medida, estoque_minimo } = req.body;
  db.query(
    'INSERT INTO materiais_obra (obra_id, material, unidade_medida, quantidade, estoque_minimo) VALUES (?, ?, ?, 0, ?)',
    [obra_id, material, unidade_medida, estoque_minimo || 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId });
    }
  );
});

router.put('/:id', authenticateToken, (req, res) => {
  const { material, unidade_medida, estoque_minimo } = req.body;
  db.query(
    'UPDATE materiais_obra SET material = ?, unidade_medida = ?, estoque_minimo = ? WHERE id = ?',
    [material, unidade_medida, estoque_minimo || 0, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

router.delete('/:id', authenticateToken, (req, res) => {
  db.query('DELETE FROM materiais_obra WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ========= NOVA ROTA =========
router.get('/abaixo-minimo/todos', authenticateToken, (req, res) => {
  const query = `
    SELECT m.id, m.material, m.unidade_medida, m.quantidade, m.estoque_minimo,
           o.nome AS obra_nome, o.status AS obra_status
    FROM materiais_obra m
    JOIN obras o ON m.obra_id = o.id
    WHERE m.estoque_minimo > 0
      AND m.quantidade < m.estoque_minimo
      AND o.status != 'Concluída'
    ORDER BY o.nome, m.material
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar itens abaixo do mínimo:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
