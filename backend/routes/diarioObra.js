const express = require('express');
const router = express.Router();
const db = require('../server');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: { user: 'teste@ethereal.email', pass: 'senha-teste' }
});

// GET diário
router.get('/:obraId/:data', (req, res) => {
  const { obraId, data } = req.params;
  db.query('SELECT * FROM diario_obra WHERE obra_id = ? AND data_diario = ?', [obraId, data], (err, diario) => {
    if (err) return res.status(500).json({ error: err.message });
    if (diario.length === 0) return res.json(null);
    const diarioId = diario[0].id;
    db.query('SELECT * FROM diario_atividades WHERE diario_id = ?', [diarioId], (err, atividades) => {
      if (err) return res.status(500).json({ error: err.message });
      db.query('SELECT dm.*, m.material, m.unidade_medida FROM diario_materiais dm JOIN materiais_obra m ON m.id = dm.material_id WHERE dm.diario_id = ?', [diarioId], (err, materiais) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query('SELECT * FROM diario_ocorrencias WHERE diario_id = ?', [diarioId], (err, ocorrencias) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ ...diario[0], atividades, materiais, ocorrencias });
        });
      });
    });
  });
});

// POST criar/atualizar diário
router.post('/', (req, res) => {
  const { obra_id, data_diario, hora_inicio, hora_fim, clima, interferencia_clima } = req.body;
  db.query('SELECT id FROM diario_obra WHERE obra_id = ? AND data_diario = ?', [obra_id, data_diario], (err, existente) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existente.length > 0) {
      db.query('UPDATE diario_obra SET hora_inicio=?, hora_fim=?, clima=?, interferencia_clima=? WHERE id=?', [hora_inicio, hora_fim, clima, interferencia_clima, existente[0].id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: existente[0].id });
      });
    } else {
      db.query('INSERT INTO diario_obra (obra_id, data_diario, hora_inicio, hora_fim, clima, interferencia_clima) VALUES (?,?,?,?,?,?)', [obra_id, data_diario, hora_inicio, hora_fim, clima, interferencia_clima], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId });
      });
    }
  });
});

// POST enviar para revisão
router.post('/revisao', (req, res) => {
  const { obraId, data_diario } = req.body;
  if (!obraId || !data_diario) return res.status(400).json({ error: 'obraId e data_diario obrigatórios.' });
  db.query("SELECT o.nome AS obra_nome, o.gestor, g.email AS gestor_email FROM obras o JOIN colaboradores g ON o.gestor = g.nome WHERE o.id = ?", [obraId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Obra ou gestor não encontrado.' });
    const { obra_nome, gestor_email } = results[0];
    transporter.sendMail({
      from: '"Diário de Obra" <diario@markcamp.com>',
      to: gestor_email,
      subject: `Diário de Obra - ${obra_nome} (${data_diario})`,
      text: `O mestre de obras enviou o relatório diário da obra "${obra_nome}" referente à data ${data_diario} para revisão.`
    }, (err) => {
      if (err) return res.status(500).json({ error: 'Falha ao enviar e-mail.' });
      res.json({ message: 'Relatório enviado para revisão do gestor.' });
    });
  });
});

// POST atividade
router.post('/:diarioId/atividade', (req, res) => {
  const { diarioId } = req.params;
  const { descricao, status } = req.body;
  db.query('INSERT INTO diario_atividades (diario_id, descricao, status) VALUES (?,?,?)', [diarioId, descricao, status || 'Pendente'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// DELETE atividade
router.delete('/atividade/:id', (req, res) => {
  db.query('DELETE FROM diario_atividades WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// POST material
router.post('/:diarioId/material', (req, res) => {
  const { diarioId } = req.params;
  const { material_id, quantidade, tipo } = req.body;
  db.query('INSERT INTO diario_materiais (diario_id, material_id, quantidade, tipo) VALUES (?,?,?,?)', [diarioId, material_id, quantidade, tipo], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const operacao = tipo === 'recebido' ? '+' : '-';
    db.query(`UPDATE materiais_obra SET quantidade = quantidade ${operacao} ? WHERE id = ?`, [quantidade, material_id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      // Verifica estoque mínimo e se a obra não está concluída
      db.query(
        'SELECT m.estoque_minimo, m.quantidade, m.material, o.status FROM materiais_obra m JOIN obras o ON m.obra_id = o.id WHERE m.id = ?',
        [material_id],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          if (rows.length === 0) return res.json({ id: result.insertId });
          const { estoque_minimo, quantidade: qtd, material, status } = rows[0];
          const alerta = estoque_minimo > 0 && qtd < estoque_minimo && status !== 'Concluída'
            ? `⚠️ Estoque de "${material}" abaixo do mínimo! (${qtd} < ${estoque_minimo}). Comprar mais.`
            : null;
          res.json({ id: result.insertId, alerta });
        }
      );
    });
  });
});

// DELETE material
router.delete('/material/:id', (req, res) => {
  db.query('DELETE FROM diario_materiais WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// POST ocorrência
router.post('/:diarioId/ocorrencia', (req, res) => {
  const { diarioId } = req.params;
  const { descricao } = req.body;
  db.query('INSERT INTO diario_ocorrencias (diario_id, descricao) VALUES (?,?)', [diarioId, descricao], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// DELETE ocorrência
router.delete('/ocorrencia/:id', (req, res) => {
  db.query('DELETE FROM diario_ocorrencias WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
