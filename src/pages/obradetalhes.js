import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DiarioObra from '../components/obras/diarioObra';

const ObraDetalhes = ({ fetchObras, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [obra, setObra] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    material: '',
    unidade_medida: '',
    estoque_minimo: '0'
  });
  const [aba, setAba] = useState('Planejamento');
  const [arquivo, setArquivo] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarDados();
    carregarDocumentos();
    carregarMateriais();
  }, [id]);

  const carregarDados = async () => {
    const token = localStorage.getItem('token');
    try {
      const obraRes = await fetch(`http://localhost:5000/api/obras/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!obraRes.ok) throw new Error('Obra não encontrada');
      const obraData = await obraRes.json();
      setObra(obraData);

      const etapasRes = await fetch(`http://localhost:5000/api/obras/${id}/etapas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (etapasRes.ok) setEtapas(await etapasRes.json());
    } catch (err) {
      setErro(err.message);
    }
  };

  const carregarDocumentos = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/obras/${id}/documentos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setDocumentos(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const carregarMateriais = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/materiais/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setMateriais(await res.json());
  };

  const salvarMaterial = async (e) => {
    e.preventDefault();
    
    if (!materialForm.material.trim() || !materialForm.unidade_medida.trim()) {
        alert('Preencha material e unidade.');
        return;
    }

    const token = localStorage.getItem('token');
    // Converte para número de forma segura
    const estoqueMinimo = parseFloat(materialForm.estoque_minimo) || 0;
    
    try {
        const url = editingMaterial
            ? `http://localhost:5000/api/materiais/${editingMaterial.id}`
            : 'http://localhost:5000/api/materiais';
        
        const method = editingMaterial ? 'PUT' : 'POST';
        
        const body = editingMaterial
            ? {
                material: materialForm.material,
                unidade_medida: materialForm.unidade_medida,
                estoque_minimo: estoqueMinimo
              }
            : {
                obra_id: parseInt(id),
                material: materialForm.material,
                unidade_medida: materialForm.unidade_medida,
                estoque_minimo: estoqueMinimo
              };

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Erro ao salvar.');
        }

        setShowMaterialForm(false);
        setEditingMaterial(null);
        setMaterialForm({ material: '', unidade_medida: '', estoque_minimo: '0' });
        carregarMateriais();
    } catch (err) {
        alert('Erro ao salvar material: ' + err.message);
    }
};

  const editarMaterial = (material) => {
    setEditingMaterial(material);
    setMaterialForm({
      material: material.material,
      unidade_medida: material.unidade_medida,
      estoque_minimo: material.estoque_minimo || '0'
    });
    setShowMaterialForm(true);
  };

  const excluirMaterial = async (materialId) => {
    if (!window.confirm('Excluir material?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5000/api/materiais/${materialId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      carregarMateriais();
    } catch (err) {
      alert('Erro ao excluir material');
    }
  };

  const atualizarEtapa = async (etapa) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/api/obras/etapas/${etapa.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ concluida: !etapa.concluida })
    });
    await carregarDados();
  };

  const handlePausarRetomar = async () => {
    if (!obra || user?.role !== 'gestor') return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/obras/${id}/pausar`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setObra(prev => ({ ...prev, status: result.status }));
        if (fetchObras) fetchObras();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpload = async () => {
    if (!arquivo) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    try {
      const res = await fetch(`http://localhost:5000/api/obras/${id}/documentos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setArquivo(null);
        carregarDocumentos();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao enviar arquivo');
      }
    } catch (err) {
      alert('Erro de rede');
    }
  };

  const handleDeleteDocumento = async (docId) => {
    if (!window.confirm('Remover este documento?')) return;
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/api/obras/${id}/documentos/${docId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    carregarDocumentos();
  };

  if (erro) return <div className="container mt-4"><div className="alert alert-danger">{erro}</div></div>;
  if (!obra) return <div className="container mt-4"><p>Carregando...</p></div>;

  const etapasAba = etapas.filter(e => e.categoria === aba);
  const progresso = obra.progresso || 0;
  const isPausada = obra.status === 'Pausada';
  const isGestor = user?.role === 'gestor';

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate('/obras')}>
        <i className="bi bi-arrow-left"></i> Voltar
      </button>

      <h2>{obra.nome}</h2>

      <div className="card mb-4">
        <div className="card-body">
          <h5>Progresso</h5>
          <div className="progress mb-3">
            <div className="progress-bar" style={{ width: `${progresso}%` }}>{progresso}%</div>
          </div>
          <p><strong>Status:</strong>{' '}
            <span className={`badge ${obra.status === 'Concluída' ? 'bg-success' : obra.status === 'Em andamento' ? 'bg-primary' : obra.status === 'Pausada' ? 'bg-warning' : 'bg-secondary'}`}>
              {obra.status}
            </span>
          </p>
          <p><strong>Código:</strong> {obra.codigo || '-'}</p>
          <p><strong>Local:</strong> {obra.localizacao}</p>
          <p><strong>Gestor:</strong> {obra.gestor}</p>
          {obra.mestre_obra && <p><strong>Mestre de Obras:</strong> {obra.mestre_obra}</p>}

          {isGestor && (
            <button
              className={`btn ${isPausada ? 'btn-success' : 'btn-warning'}`}
              onClick={handlePausarRetomar}
            >
              <i className={`bi ${isPausada ? 'bi-play-fill' : 'bi-pause-fill'}`}></i>{' '}
              {isPausada ? 'Retomar Obra' : 'Pausar Obra'}
            </button>
          )}
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        {['Planejamento', 'Execução', 'Finalização', 'Materiais', 'Diário de Obra'].map(cat => (
          <li className="nav-item" key={cat}>
            <button className={`nav-link ${aba === cat ? 'active' : ''}`} onClick={() => setAba(cat)}>{cat}</button>
          </li>
        ))}
        <li className="nav-item">
          <button className={`nav-link ${aba === 'Documentos' ? 'active' : ''}`} onClick={() => setAba('Documentos')}>Documentos</button>
        </li>
      </ul>

      {aba === 'Materiais' && (
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <h5>Materiais da Obra</h5>
              <button className="btn btn-primary" onClick={() => {
                setEditingMaterial(null);
                setMaterialForm({ material: '', unidade_medida: '', estoque_minimo: '0' });
                setShowMaterialForm(true);
              }}>
                Novo Material
              </button>
            </div>

            {showMaterialForm && (
              <form className="border rounded p-3 mb-4" onSubmit={salvarMaterial}>
                <div className="row">
                  <div className="col-md-4">
                    <label>Material</label>
                    <input className="form-control" required value={materialForm.material}
                      onChange={(e) => setMaterialForm({ ...materialForm, material: e.target.value })} />
                  </div>
                  <div className="col-md-4">
                    <label>Unidade</label>
                    <select className="form-select" required value={materialForm.unidade_medida}
                      onChange={(e) => setMaterialForm({ ...materialForm, unidade_medida: e.target.value })}>
                      <option value="">Selecione</option>
                      <option>un</option><option>pct</option><option>cx</option><option>sc</option>
                      <option>kg</option><option>t</option><option>g</option><option>L</option>
                      <option>mL</option><option>m</option><option>m²</option><option>m³</option>
                      <option>rolo</option><option>barra</option><option>chapa</option><option>galão</option>
                      <option>balde</option><option>jogo</option><option>kit</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label>Estoque Mínimo</label>
                    <input type="number" className="form-control" value={materialForm.estoque_minimo}
                      onChange={(e) => setMaterialForm({ ...materialForm, estoque_minimo: e.target.value })} placeholder="0" />
                  </div>
                </div>
                <div className="mt-3">
                  <button type="submit" className="btn btn-success me-2">Salvar</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowMaterialForm(false)}>Cancelar</button>
                </div>
              </form>
            )}

            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Unidade</th>
                  <th>Estoque Mínimo</th>
                  <th>Quantidade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {materiais.map(mat => (
                  <tr key={mat.id}>
                    <td>{mat.material}</td>
                    <td>{mat.unidade_medida}</td>
                    <td>{mat.estoque_minimo || 0}</td>
                    <td>
                      <span className={mat.estoque_minimo > 0 && mat.quantidade < mat.estoque_minimo ? 'text-danger fw-bold' : ''}>
                        {mat.quantidade}
                        {mat.estoque_minimo > 0 && mat.quantidade < mat.estoque_minimo && ' ⚠️'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-info me-2" onClick={() => editarMaterial(mat)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => excluirMaterial(mat.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {aba === 'Diário de Obra' && (
        <DiarioObra obra={obra} obraId={id} materiais={materiais} carregarMateriais={carregarMateriais} />
      )}

      {aba !== 'Materiais' && (aba === 'Documentos' ? (
        <div className="card">
          <div className="card-body">
            <h5>Documentos da Obra</h5>
            <div className="mb-3">
              <input type="file" className="form-control" onChange={(e) => setArquivo(e.target.files[0])} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" />
              <button className="btn btn-primary mt-2" onClick={handleUpload} disabled={!arquivo}>
                <i className="bi bi-upload"></i> Enviar
              </button>
            </div>
            {documentos.length === 0 ? <p>Nenhum documento anexado.</p> : (
              <div className="list-group">
                {documentos.map(doc => (
                  <div key={doc.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <a href={`http://localhost:5000/uploads/${doc.nome_servidor}`} target="_blank" rel="noreferrer">
                        {doc.tipo === 'imagem' ? <i className="bi bi-image me-2"></i> : <i className="bi bi-file-earmark-text me-2"></i>}
                        {doc.nome_original}
                      </a>
                      <small className="text-muted ms-2">({(doc.tamanho / 1024).toFixed(1)} KB)</small>
                    </div>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteDocumento(doc.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            {etapasAba.map(etapa => (
              <div key={etapa.id} className="form-check mb-2">
                <input className="form-check-input" type="checkbox" checked={Boolean(etapa.concluida)}
                  onChange={() => atualizarEtapa(etapa)} disabled={!isGestor} />
                <label className="form-check-label">{etapa.etapa}</label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ObraDetalhes;