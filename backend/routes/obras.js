<<<<<<< HEAD
// backend/routes/obras.js
const express = require('express');
const router = express.Router();
const db = require('../server');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, authorize } = require('./auth');

// Configuração do multer
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    cb(null, extname && mimetype);
  }
});

// Listar obras (com filtro por papel)
router.get('/', authenticateToken, (req, res) => {
  let query = 'SELECT * FROM obras';
  const params = [];
  if (req.user.role === 'gestor') {
    query += ' WHERE gestor = ?';
    params.push(req.user.nome);
  } else if (req.user.role === 'mestre') {
    query += ' WHERE mestre_obra = ?';
    params.push(req.user.nome);
  } else if (req.user.role === 'cliente') {
    query += ' WHERE id = ?';
    params.push(req.user.obra_id);
  }
  query += ' ORDER BY created_at DESC';
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
=======
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET todas as obras
router.get('/', (req, res) => {
  db.query('SELECT * FROM obras', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
    res.json(results);
  });
});

<<<<<<< HEAD
// Criar obra
router.post('/', authenticateToken, authorize('gestor'), (req, res) => {
  const { nome, localizacao, gestor, mestre_obra, descricao, dataInicio, dataFim, orcamento } = req.body;
  if (!nome || !localizacao || !gestor) {
    return res.status(400).json({ error: 'Nome, localização e gestor são obrigatórios.' });
  }

  db.query(
    'INSERT INTO obras (nome, localizacao, gestor, mestre_obra, status, progresso, descricao, dataInicio, dataFim, orcamento) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)',
    [nome, localizacao, gestor, mestre_obra || null, 'Planejada', descricao || null, dataInicio || null, dataFim || null, orcamento || 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      const obraId = result.insertId;
      // Gera código único
      const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
      db.query('UPDATE obras SET codigo = ? WHERE id = ?', [codigo, obraId], (err) => {
        if (err) console.error('Erro ao definir código:', err);
      });

      // Etapas padrão
      const etapas = [
        ['Planejamento', 'Estudo de Viabilidade e Terreno'],
        ['Planejamento', 'Projeto Arquitetônico'],
        ['Planejamento', 'Projeto Estrutural'],
        ['Planejamento', 'Projeto Elétrico'],
        ['Planejamento', 'Projeto Hidráulico'],
        ['Planejamento', 'Orçamento e Cronograma'],
        ['Planejamento', 'Legalização'],
        ['Execução', 'Terraplenagem'],
        ['Execução', 'Fundação'],
        ['Execução', 'Estrutura'],
        ['Execução', 'Alvenaria'],
        ['Execução', 'Cobertura'],
        ['Execução', 'Instalações'],
        ['Execução', 'Revestimento e Acabamento'],
        ['Finalização', 'Pintura e Detalhes'],
        ['Finalização', 'Limpeza e Vistoria'],
        ['Finalização', 'Entrega Final']
      ];
      const values = etapas.map(e => [obraId, e[0], e[1], false, null]);
      db.query('INSERT INTO etapas_obra (obra_id, categoria, etapa, concluida, data_conclusao) VALUES ?', [values], (etapaErr) => {
        if (etapaErr) return res.status(500).json({ error: etapaErr.message });
        db.query('SELECT * FROM obras WHERE id = ?', [obraId], (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json(rows[0]);
        });
      });
    }
  );
});

// Pausar/Retomar (antes de :id)
router.put('/:id/pausar', authenticateToken, authorize('gestor'), (req, res) => {
  const { id } = req.params;
  db.query('SELECT status FROM obras WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Obra não encontrada.' });
    const current = results[0].status;
    const newStatus = current === 'Pausada' ? 'Em andamento' : 'Pausada';
    db.query('UPDATE obras SET status = ? WHERE id = ?', [newStatus, id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: `Status alterado para ${newStatus}`, status: newStatus });
    });
  });
});

// Obra por ID (DEVE vir antes das sub-rotas com :id/documentos, etc.)
router.get('/:id', authenticateToken, (req, res) => {
  db.query('SELECT * FROM obras WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Obra não encontrada.' });
=======
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
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
    res.json(results[0]);
  });
});

<<<<<<< HEAD
// Atualizar obra
router.put('/:id', authenticateToken, authorize('gestor'), (req, res) => {
  const { id } = req.params;
  const { nome, localizacao, gestor, mestre_obra, descricao, dataInicio, dataFim, orcamento } = req.body;
  if (!nome || !localizacao || !gestor) {
    return res.status(400).json({ error: 'Nome, localização e gestor são obrigatórios.' });
  }
  db.query(
    'UPDATE obras SET nome=?, localizacao=?, gestor=?, mestre_obra=?, descricao=?, dataInicio=?, dataFim=?, orcamento=? WHERE id=?',
    [nome, localizacao, gestor, mestre_obra || null, descricao || null, dataInicio || null, dataFim || null, orcamento || 0, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Obra não encontrada.' });
      db.query('SELECT * FROM obras WHERE id = ?', [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows[0]);
      });
=======
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
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
    }
  );
});

<<<<<<< HEAD
// Excluir obra
router.delete('/:id', authenticateToken, authorize('gestor'), (req, res) => {
  db.query('DELETE FROM obras WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Obra excluída com sucesso.' });
  });
});

// Etapas da obra
router.get('/:id/etapas', authenticateToken, (req, res) => {
  db.query('SELECT * FROM etapas_obra WHERE obra_id = ? ORDER BY id', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Atualizar etapa
router.put('/etapas/:id', authenticateToken, authorize('gestor'), (req, res) => {
  const { concluida } = req.body;
  const etapaId = req.params.id;

  db.query('UPDATE etapas_obra SET concluida=?, data_conclusao=? WHERE id=?',
    [concluida, concluida ? new Date() : null, etapaId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      db.query('SELECT obra_id FROM etapas_obra WHERE id=?', [etapaId], (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2.message });
        if (rows.length === 0) return res.status(404).json({ message: 'Etapa não encontrada.' });
        const obraId = rows[0].obra_id;

        db.query('SELECT COUNT(*) as total, SUM(CASE WHEN concluida=1 THEN 1 ELSE 0 END) as concluidas FROM etapas_obra WHERE obra_id=?',
          [obraId], (err3, prog) => {
            if (err3) return res.status(500).json({ error: err3.message });
            const total = prog[0].total;
            const concluidas = prog[0].concluidas || 0;
            const progresso = Math.round((concluidas / total) * 100);

            let newStatus = 'Planejada';
            if (progresso === 100) newStatus = 'Concluída';
            else if (progresso > 0) newStatus = 'Em andamento';

            db.query('SELECT status FROM obras WHERE id=?', [obraId], (err4, statusRow) => {
              if (err4) return res.status(500).json({ error: err4.message });
              const currentStatus = statusRow[0].status;

              if (currentStatus === 'Pausada') {
                db.query('UPDATE obras SET progresso=? WHERE id=?', [progresso, obraId], (err5) => {
                  if (err5) return res.status(500).json({ error: err5.message });
                  res.json({ message: 'Progresso atualizado (obra pausada)', progresso, status: currentStatus });
                });
              } else {
                db.query('UPDATE obras SET progresso=?, status=? WHERE id=?', [progresso, newStatus, obraId], (err5) => {
                  if (err5) return res.status(500).json({ error: err5.message });
                  res.json({ message: 'Etapa atualizada', progresso, status: newStatus });
                });
              }
            });
          });
      });
    });
});

// Documentos
router.post('/:id/documentos', authenticateToken, authorize('gestor', 'mestre'), upload.single('arquivo'), (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

  db.query('SELECT id FROM obras WHERE id = ?', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Obra não encontrada.' });
    }
    const { originalname, filename, mimetype, size } = req.file;
    const tipo = mimetype.startsWith('image') ? 'imagem' : 'documento';
    db.query('INSERT INTO documentos_obra (obra_id, nome_original, nome_servidor, tipo, tamanho) VALUES (?,?,?,?,?)',
      [id, originalname, filename, tipo, size],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Documento enviado.', id: result.insertId, nome_original: originalname, tipo });
      });
  });
});

router.get('/:id/documentos', authenticateToken, (req, res) => {
  db.query('SELECT * FROM documentos_obra WHERE obra_id = ? ORDER BY uploaded_at DESC', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.delete('/:id/documentos/:docId', authenticateToken, authorize('gestor'), (req, res) => {
  const { docId } = req.params;
  db.query('SELECT nome_servidor FROM documentos_obra WHERE id = ?', [docId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ message: 'Documento não encontrado.' });
    const filePath = path.join('uploads', rows[0].nome_servidor);
    db.query('DELETE FROM documentos_obra WHERE id = ?', [docId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.json({ message: 'Documento removido.' });
    });
  });
});

// GET relatório diário da obra (PDF)
router.get('/:id/relatorio', authenticateToken, (req, res) => {
  const obraId = req.params.id;

  // 1. Buscar dados da obra
  db.query('SELECT * FROM obras WHERE id = ?', [obraId], (err, obraRows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (obraRows.length === 0) return res.status(404).json({ message: 'Obra não encontrada.' });
    const obra = obraRows[0];

    // 2. Buscar diário mais recente (data atual ou último)
    const hoje = new Date().toISOString().slice(0, 10);
    db.query(
      'SELECT d.*, a.descricao AS atividade, a.status AS atividade_status FROM diario_obra d LEFT JOIN diario_atividades a ON d.id = a.diario_id WHERE d.obra_id = ? AND d.data_diario <= ? ORDER BY d.data_diario DESC, a.id LIMIT 1',
      [obraId, hoje],
      (err, diarioRows) => {
        if (err) return res.status(500).json({ error: err.message });
        const diario = diarioRows.length > 0 ? diarioRows[0] : null;

        // 3. Buscar materiais da obra
        db.query('SELECT * FROM materiais_obra WHERE obra_id = ?', [obraId], (err, materiais) => {
          if (err) return res.status(500).json({ error: err.message });

          // 4. Buscar todas as atividades do diário (se existir)
          db.query(
            'SELECT * FROM diario_atividades WHERE diario_id = ?',
            [diario ? diario.id : -1],
            (err, atividades) => {
              if (err) return res.status(500).json({ error: err.message });

              // 5. Buscar ocorrências do diário
              db.query(
                'SELECT * FROM diario_ocorrencias WHERE diario_id = ?',
                [diario ? diario.id : -1],
                (err, ocorrencias) => {
                  if (err) return res.status(500).json({ error: err.message });

                  // 6. Buscar etapas concluídas / totais para andamento
                  db.query(
                    'SELECT COUNT(*) AS total, SUM(CASE WHEN concluida = 1 THEN 1 ELSE 0 END) AS concluidas FROM etapas_obra WHERE obra_id = ?',
                    [obraId],
                    (err, etapas) => {
                      if (err) return res.status(500).json({ error: err.message });

                      gerarPDFRelatorio(res, obra, diario, materiais, atividades, ocorrencias, etapas[0]);
                    }
                  );
                }
              );
            }
          );
        });
      }
    );
  });
});

const PDFDocument = require('pdfkit');

function gerarPDFRelatorio(res, obra, diario, materiais, atividades, ocorrencias, etapas) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const filename = `relatorio-obra-${obra.id}.pdf`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);

  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const clima = diario ? diario.clima || 'Não informado' : 'Não informado';
  const horaInicio = diario ? diario.hora_inicio || '--' : '--';
  const horaFim = diario ? diario.hora_fim || '--' : '--';

  // Cabeçalho
  doc.fontSize(14).fillColor('#1e40af').text('RELATÓRIO DIÁRIO DE OBRA', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#000').text(`Nº ${String(obra.id).padStart(3, '0')}/${hoje.getFullYear()}`, { align: 'center' });
  doc.moveDown(0.8);

  // Informações gerais (tabela simples)
  const linhaY = doc.y;
  doc.fontSize(10).fillColor('#000');
  doc.text(`Obra: ${obra.nome}`, 40, linhaY);
  doc.text(`Data: ${dataFormatada}`, 300, linhaY);
  doc.text(`Local: ${obra.localizacao}`, 40, linhaY + 18);
  doc.text(`Clima: ${clima}`, 300, linhaY + 18);
  doc.text(`Eng. Responsável: ${obra.gestor}`, 40, linhaY + 36);
  doc.text(`Período: ${horaInicio} às ${horaFim}`, 300, linhaY + 36);
  doc.moveDown(2.5);

  // 1. RESUMO EXECUTIVO
  doc.fontSize(11).fillColor('#1e40af').text('1. RESUMO EXECUTIVO (Atividades do Dia)');
  doc.moveDown(0.3);
  if (atividades.length > 0) {
    atividades.forEach((ativ, i) => {
      doc.fontSize(9).fillColor('#000').text(`${i + 1}. ${ativ.descricao} (${ativ.status})`);
    });
  } else {
    doc.fontSize(9).fillColor('#666').text('Nenhuma atividade registrada hoje.');
  }
  doc.moveDown(0.8);

  // 2. QUADRO DE PESSOAL (simplificado – sem dados específicos)
  doc.fontSize(11).fillColor('#1e40af').text('2. QUADRO DE PESSOAL (Mão de Obra)');
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#000').text('Mestre de Obras: Presente');
  doc.text('Demais funções: não informadas no sistema.');
  doc.moveDown(0.8);

  // 3. MATERIAIS
  doc.fontSize(11).fillColor('#1e40af').text('3. MATERIAIS RECEBIDOS / UTILIZADOS');
  doc.moveDown(0.3);
  if (materiais.length > 0) {
    const colMaterial = [
      { h: 'Material', w: 140 },
      { h: 'Unid.', w: 50 },
      { h: 'Quantidade', w: 70, align: 'right' },
      { h: 'Mínimo', w: 70, align: 'right' },
      { h: 'Estoque', w: 70, align: 'right' }
    ];
    let x = doc.x;
    const startX = x;
    doc.fontSize(8).fillColor('#fff');
    colMaterial.forEach(c => {
      doc.rect(x, doc.y, c.w, 15).fill('#1e40af');
      doc.fillColor('#fff').text(c.h, x + 2, doc.y + 3, { width: c.w - 4, align: c.align || 'left' });
      x += c.w;
    });
    doc.fillColor('#000').moveDown(0.5);
    let y = doc.y;
    materiais.forEach((mat, i) => {
      if (i % 2 === 0) doc.rect(startX, y, colMaterial.reduce((s, c) => s + c.w, 0), 15).fill('#f3f4f6');
      doc.fillColor('#000').fontSize(8);
      x = startX;
      doc.text(mat.material, x + 2, y + 3, { width: 140 - 4 });
      x += 140;
      doc.text(mat.unidade_medida, x + 2, y + 3, { width: 50 - 4 });
      x += 50;
      doc.text(mat.quantidade.toString(), x + 2, y + 3, { width: 70 - 4, align: 'right' });
      x += 70;
      doc.text(mat.estoque_minimo.toString(), x + 2, y + 3, { width: 70 - 4, align: 'right' });
      x += 70;
      doc.text((mat.quantidade).toString(), x + 2, y + 3, { width: 70 - 4, align: 'right' });
      y += 15;
    });
  } else {
    doc.fontSize(9).fillColor('#666').text('Nenhum material cadastrado.');
  }
  doc.moveDown(1);

  // 4. ANDAMENTO FÍSICO
  doc.fontSize(11).fillColor('#1e40af').text('4. ANDAMENTO FÍSICO (Cronograma)');
  doc.moveDown(0.3);
  if (etapas && etapas.total > 0) {
    const percent = Math.round((etapas.concluidas / etapas.total) * 100);
    doc.fontSize(9).fillColor('#000').text(`Estrutura: ${percent}% concluída (${etapas.concluidas}/${etapas.total} etapas)`);
  } else {
    doc.fontSize(9).fillColor('#666').text('Nenhuma etapa cadastrada.');
  }
  doc.moveDown(0.8);

  // 5. REGISTRO FOTOGRÁFICO
  doc.fontSize(11).fillColor('#1e40af').text('5. REGISTRO FOTOGRÁFICO');
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#666').text('Nenhuma foto anexada ao diário de hoje.');
  doc.moveDown(0.8);

  // 6. OCORRÊNCIAS E IMPREVISTOS
  doc.fontSize(11).fillColor('#1e40af').text('6. OCORRÊNCIAS E IMPREVISTOS');
  doc.moveDown(0.3);
  if (ocorrencias && ocorrencias.length > 0) {
    ocorrencias.forEach((o, i) => {
      doc.fontSize(9).fillColor('#000').text(`${i + 1}. ${o.descricao}`);
    });
  } else {
    doc.fontSize(9).fillColor('#666').text('Nenhuma ocorrência registrada.');
  }
  doc.moveDown(0.8);

  // 7. OBSERVAÇÕES GERAIS
  doc.fontSize(11).fillColor('#1e40af').text('7. OBSERVAÇÕES GERAIS');
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#000').text(obra.descricao || 'Nenhuma observação cadastrada.');
  doc.moveDown(0.8);

  // 8. PRÓXIMAS ATIVIDADES (placeholder)
  doc.fontSize(11).fillColor('#1e40af').text('8. PRÓXIMAS ATIVIDADES');
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#666').text('Não informado.');
  doc.moveDown(1.5);

  // Assinatura
  doc.fontSize(10).fillColor('#000').text('Responsável pelo Preenchimento:', { align: 'center' });
  doc.moveDown(1);
  doc.text(obra.gestor || '___________________________', { align: 'center' });
  doc.text('Engenheiro Responsável', { align: 'center' });

  doc.end();
}

module.exports = router;
=======
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
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
