import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Relatorio = ({ user }) => {
  const [obras, setObras] = useState([]);
  const [obraSelecionada, setObraSelecionada] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'mestre') {
      navigate('/');
      return;
    }
    carregarObras();
  }, []);

  const carregarObras = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/obras', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setObras(await res.json());
  };

  const handleUpload = async () => {
    if (!arquivo || !obraSelecionada) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    const res = await fetch(`http://localhost:5000/api/obras/${obraSelecionada}/documentos`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (res.ok) {
      alert('Documento enviado!');
      setArquivo(null);
      setObraSelecionada('');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Registrar Relatório de Obra</h2>
      <div className="card">
        <div className="card-body">
          <select
            className="form-select mb-3"
            value={obraSelecionada}
            onChange={(e) => setObraSelecionada(e.target.value)}
          >
            <option value="">Selecione a obra</option>
            {obras.map(obra => (
              <option key={obra.id} value={obra.id}>{obra.nome}</option>
            ))}
          </select>

          <input
            type="file"
            className="form-control mb-3"
            onChange={(e) => setArquivo(e.target.files[0])}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />

          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!arquivo || !obraSelecionada}
          >
            Enviar Documento/Foto
          </button>
        </div>
      </div>
    </div>
  );
};

export default Relatorio;