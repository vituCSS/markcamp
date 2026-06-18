const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
const path = require('path');
const fs = require('fs');
=======
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

<<<<<<< HEAD
// ─── Conexão única com MySQL ──────────────────────────────────
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao MySQL:', err);
    process.exit(1);
  }
  console.log('✅ Conectado ao MySQL');

  // Criar banco de dados
  db.query('CREATE DATABASE IF NOT EXISTS markcamp_db', (err) => {
    if (err) {
      console.error('❌ Erro ao criar banco:', err);
      process.exit(1);
    }
    console.log('✅ Banco markcamp_db verificado');

    // Selecionar o banco
    db.changeUser({ database: 'markcamp_db' }, (err) => {
      if (err) {
        console.error('❌ Erro ao selecionar banco:', err);
        process.exit(1);
      }
      console.log('✅ Usando banco markcamp_db');

      // Criar tabelas
      createAllTables();

      // Iniciar o servidor HTTP
      startServer();
=======
// Conexão com MySQL - COM CRIAÇÃO AUTOMÁTICA DO BANCO
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// CONECTA/CRIA BANCO
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }

  connection.query('CREATE DATABASE IF NOT EXISTS markcamp_db', (err) => {
    if (err) {
      console.error('Erro ao criar banco:', err);
      return;
    }
    console.log('Banco criado/verificado');
    
    connection.query('USE markcamp_db', (err) => {
      if (err) {
        console.error('Erro ao usar banco:', err);
        return;
      }
      console.log('Usando banco markcamp_db');
      
      // CRIA TABELAS
      const tabelaObras = `
        CREATE TABLE IF NOT EXISTS obras (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          localizacao VARCHAR(255) NOT NULL,
          gestor VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL,
          progresso INT NOT NULL,
          descricao TEXT,
          dataInicio DATE,
          dataFim DATE,
          orcamento DECIMAL(15,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      const tabelaGestores = `
        CREATE TABLE IF NOT EXISTS gestores (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          cadastro_empresa VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          telefone VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // Cria tabela obras
      connection.query(tabelaObras, (err) => {
        if (err) {
          console.error('Erro ao criar tabela obras:', err);
          return;
        }
        console.log('Tabela obras criada/verificada');
        
        // Cria tabela gestores
        connection.query(tabelaGestores, (err) => {
          if (err) {
            console.error('Erro ao criar tabela gestores:', err);
            return;
          }
          console.log('Tabela gestores criada/verificada');
        });
      });
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
    });
  });
});

<<<<<<< HEAD
// ─── Criação de tabelas ───────────────────────────────────────
function createAllTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS obras (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      localizacao VARCHAR(255) NOT NULL,
      gestor VARCHAR(255) NOT NULL,
      mestre_obra VARCHAR(255) DEFAULT NULL,
      status VARCHAR(50) NOT NULL,
      progresso INT NOT NULL,
      descricao TEXT,
      dataInicio DATE,
      dataFim DATE,
      orcamento DECIMAL(15,2),
      codigo VARCHAR(10) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS colaboradores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      cadastro_empresa VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      telefone VARCHAR(20),
      role ENUM('gestor','mestre','cliente','operador') DEFAULT 'gestor',
      obra_id INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS classes_mestre (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      descricao TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS etapas_obra (
      id INT AUTO_INCREMENT PRIMARY KEY,
      obra_id INT NOT NULL,
      categoria VARCHAR(50) NOT NULL,
      etapa VARCHAR(150) NOT NULL,
      concluida BOOLEAN DEFAULT FALSE,
      data_conclusao DATETIME NULL,
      FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS documentos_obra (
      id INT AUTO_INCREMENT PRIMARY KEY,
      obra_id INT NOT NULL,
      nome_original VARCHAR(255) NOT NULL,
      nome_servidor VARCHAR(255) NOT NULL,
      tipo VARCHAR(50) NOT NULL,
      tamanho INT NOT NULL,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS materiais_obra (
      id INT AUTO_INCREMENT PRIMARY KEY,
      obra_id INT NOT NULL,
      material VARCHAR(255) NOT NULL,
      unidade_medida VARCHAR(20) NOT NULL,
      quantidade DECIMAL(10,2) NOT NULL DEFAULT 0,
      estoque_minimo DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS diario_obra (
      id INT AUTO_INCREMENT PRIMARY KEY,
      obra_id INT NOT NULL,
      data_diario DATE NOT NULL,
      hora_inicio TIME,
      hora_fim TIME,
      clima VARCHAR(50),
      interferencia_clima VARCHAR(30),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY obra_data (obra_id, data_diario),
      FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS diario_atividades (
      id INT AUTO_INCREMENT PRIMARY KEY,
      diario_id INT NOT NULL,
      descricao TEXT NOT NULL,
      status ENUM('Pendente','Concluída') DEFAULT 'Pendente',
      FOREIGN KEY (diario_id) REFERENCES diario_obra(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS diario_materiais (
      id INT AUTO_INCREMENT PRIMARY KEY,
      diario_id INT NOT NULL,
      material_id INT NOT NULL,
      quantidade DECIMAL(10,2),
      tipo ENUM('recebido','consumido'),
      FOREIGN KEY (diario_id) REFERENCES diario_obra(id) ON DELETE CASCADE,
      FOREIGN KEY (material_id) REFERENCES materiais_obra(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS diario_ocorrencias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      diario_id INT NOT NULL,
      descricao TEXT NOT NULL,
      FOREIGN KEY (diario_id) REFERENCES diario_obra(id) ON DELETE CASCADE
    )`
  ];

  tables.forEach(sql => {
    db.query(sql, (err) => {
      if (err) console.error('Erro ao criar tabela:', err.message);
    });
  });

  // Ajustes para bancos já existentes
  const alters = [
    `ALTER TABLE colaboradores MODIFY COLUMN role ENUM('gestor','mestre','cliente','operador') DEFAULT 'gestor'`,
    `ALTER TABLE obras ADD COLUMN IF NOT EXISTS codigo VARCHAR(10) UNIQUE`,
    `ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS obra_id INT DEFAULT NULL`,
    `ALTER TABLE materiais_obra ADD COLUMN IF NOT EXISTS estoque_minimo DECIMAL(10,2) DEFAULT 0`
  ];

  alters.forEach(sql => {
    db.query(sql, (err) => {
      if (err) console.warn('Aviso ALTER:', err.message);
    });
  });

  console.log('✅ Tabelas verificadas/atualizadas');
}

// ─── Iniciar servidor ─────────────────────────────────────────
function startServer() {
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

  // Rotas – todas importam a mesma conexão "db" via require('../server')
  app.use('/api/materiais', require('./routes/materiais'));
  app.use('/api/diario', require('./routes/diarioObra'));
  app.use('/api/obras', require('./routes/obras'));
  app.use('/api/gestores', require('./routes/gestores'));
  app.use('/api/classes-mestre', require('./routes/mestres'));
  app.use('/api/auth', require('./routes/auth').router);

  app.use((err, req, res, next) => {
    console.error('🔥 ERRO:', err.stack);
    res.status(500).json({ error: 'Erro interno no servidor' });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    // Verificação automática de estoque
    const { iniciarVerificacaoEstoque } = require('./services/estoqueAlerta');
    iniciarVerificacaoEstoque();
  });
}

// Exporta a conexão única para todas as rotas
module.exports = db;
=======
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// IMPORTAR ROTAS
const obrasRoutes = require('./routes/obras.js');
const gestoresRoutes = require('./routes/gestores.js');
const auth = require('./routes/auth.js');

// USAR ROTAS
app.use('/api/obras', obrasRoutes);
app.use('/api/gestores', gestoresRoutes);
app.use('/api/auth', auth.router);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

module.exports = connection;
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
