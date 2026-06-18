import React, { useState, useEffect } from 'react';
import DiarioObra from '../components/obras/diarioObra';

const DiarioPage = ({ user }) => {
  const [obras, setObras] = useState([]);
  const [obraSelecionada, setObraSelecionada] = useState(null);
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carrega as obras vinculadas ao mestre logado
  useEffect(() => {
    const carregarObras = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/obras', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        // O backend já filtra por mestre_obra, então só retorna as obras do mestre
        setObras(data);
      } catch (err) {
        console.error('Erro ao carregar obras:', err);
      } finally {
        setLoading(false);
      }
    };
    carregarObras();
  }, []);

  // Carrega materiais da obra selecionada
  const carregarMateriais = async (obraId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/materiais/${obraId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMateriais(data);
    } catch (err) {
      console.error('Erro ao carregar materiais:', err);
    }
  };

  const handleObraChange = (e) => {
    const obraId = e.target.value;
    if (!obraId) {
      setObraSelecionada(null);
      setMateriais([]);
      return;
    }
    const obra = obras.find(o => o.id === parseInt(obraId));
    setObraSelecionada(obra);
    carregarMateriais(obra.id);
  };

  if (user?.role !== 'mestre') {
    return <div className="container mt-4"><p>Acesso restrito.</p></div>;
  }

  return (
    <div className="container mt-4">
      <h2>Diário de Obra</h2>
      
      <div className="card mb-4">
        <div className="card-body">
          <label className="form-label">Selecione a obra</label>
          <select
            className="form-select"
            onChange={handleObraChange}
            defaultValue=""
          >
            <option value="">Escolha uma obra...</option>
            {obras.map(obra => (
              <option key={obra.id} value={obra.id}>{obra.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p>Carregando...</p>}

      {obraSelecionada && (
        <DiarioObra
          obra={obraSelecionada}
          obraId={obraSelecionada.id}
          materiais={materiais}
          carregarMateriais={() => carregarMateriais(obraSelecionada.id)}
        />
      )}

      {!loading && !obraSelecionada && (
        <p>Selecione uma obra para registrar o diário.</p>
      )}
    </div>
  );
};

export default DiarioPage;