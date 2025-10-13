const express = require('express');
const cors = require('cors');
require('dotenv').config();
const obrasRoutes = require('./routes/obras');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/obras', obrasRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});