const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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
    });
  });
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// ROTAS
const obrasRoutes = require('./routes/obras.js');
app.use('/api/obras', obrasRoutes);

const gestoresRoutes = require('./routes/gestores.js');
app.use('/api/gestores', gestoresRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

module.exports = connection;