import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React, { useEffect, useState } from 'react';
import logo from '../assets/logomarkcamp.png';

const Dashboard = ({ obras, gestores, user }) => {
  const isCliente = user?.role === 'cliente';
  const listaObras = Array.isArray(obras) ? obras : [];
  const listaGestores = Array.isArray(gestores) ? gestores : [];
  const [itensFalta, setItensFalta] = useState([]);
  const [loadingItens, setLoadingItens] = useState(false);

  useEffect(() => {
    if (isCliente) return;
    carregarItensEmFalta();
  }, [obras]);

  const carregarItensEmFalta = async () => {
    setLoadingItens(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/materiais/abaixo-minimo/todos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao carregar itens');
      const data = await res.json();
      setItensFalta(data);
    } catch (err) {
      console.error('Erro ao carregar itens em falta:', err);
      setItensFalta([]);
    } finally {
      setLoadingItens(false);
    }
  };

  const baixarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor('#1e40af');
    doc.text('MARKCAMP - Itens em Falta', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor('#4b5563');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
    const colunas = ['Obra', 'Material', 'Unidade', 'Atual', 'Mínimo', 'Faltam'];
    const linhas = itensFalta.map(item => [
      item.obra_nome,
      item.material,
      item.unidade_medida,
      item.quantidade,
      item.estoque_minimo,
      item.estoque_minimo - item.quantidade
    ]);
    autoTable(doc, {
      head: [colunas],
      body: linhas,
      startY: 35,
      styles: { fontSize: 9 },
      headStyles: { fillColor: '#1e40af', textColor: '#ffffff' },
      alternateRowStyles: { fillColor: '#f3f4f6' },
    });
    doc.save(`itens-em-falta-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Dashboard do cliente
  if (isCliente && listaObras.length > 0) {
    const obra = listaObras[0];
    return (
      <div className="container mt-4">
        <h2>Acompanhamento da Obra</h2>
        <div className="card mb-4">
          <div className="card-body">
            <h5>{obra.nome}</h5>
            <p><strong>Código:</strong> {obra.codigo}</p>
            <p><strong>Localização:</strong> {obra.localizacao}</p>
            <p><strong>Gestor Responsável:</strong> {obra.gestor}</p>
            <p><strong>Mestre de Obras:</strong> {obra.mestre_obra || '-'}</p>
            <p><strong>Status:</strong>{' '}
              <span className={`badge ${obra.status === 'Concluída' ? 'bg-success' : obra.status === 'Em andamento' ? 'bg-primary' : obra.status === 'Pausada' ? 'bg-warning' : 'bg-secondary'}`}>
                {obra.status}
              </span>
            </p>
            <p><strong>Progresso:</strong></p>
            <div className="progress mb-3">
              <div className="progress-bar" style={{ width: `${obra.progresso}%` }}>{obra.progresso}%</div>
            </div>
            <p><strong>Orçamento:</strong> R$ {obra.orcamento}</p>
            <p><strong>Data de Início:</strong> {obra.dataInicio || '-'}</p>
            <p><strong>Data de Fim:</strong> {obra.dataFim || '-'}</p>
            <p><strong>Descrição:</strong> {obra.descricao || '-'}</p>
            
            {/* Botão de imprimir relatório */}
            <div className="text-center mt-4">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  const token = localStorage.getItem('token');
                  const url = `http://localhost:5000/api/obras/${obra.id}/relatorio`;
                  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
                    .then(res => {
                      if (!res.ok) throw new Error('Erro ao gerar relatório');
                      return res.blob();
                    })
                    .then(blob => {
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `relatorio-obra-${obra.id}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(link.href);
                    })
                    .catch(err => alert(err.message));
                }}
              >
                <i className="bi bi-file-earmark-pdf"></i> Imprimir Relatório
              </button>
            </div>
          </div>
        </div>
        <ChecklistObra obraId={obra.id} />
      </div>
    );
  }

  // Dashboard para gestor/mestre
  const obrasEmAndamento = listaObras.filter(o => o.status === 'Em andamento').length;
  const obrasConcluidas = listaObras.filter(o => o.status === 'Concluída').length;
  const obrasParalisadas = listaObras.filter(o => o.status === 'Atrasada' || o.status === 'Pausada').length;

  return (
    <>
      <div className="d-flex align-items-center mb-4">
        <img src={logo} alt="Logo" className="me-3" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
        <h2 className="page-title mb-0">Dashboard</h2>
      </div>

      <div className="row">
        <div className="col-md-3">
          <div className="card dashboard-card">
            <div className="card-body">
              <i className="bi bi-building fs-1 text-primary"></i>
              <h5 className="card-title">Total de Obras</h5>
              <p className="dashboard-number">{listaObras.length}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-card">
            <div className="card-body">
              <i className="bi bi-play-circle fs-1 text-success"></i>
              <h5 className="card-title">Em Andamento</h5>
              <p className="dashboard-number">{obrasEmAndamento}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-card">
            <div className="card-body">
              <i className="bi bi-pause-circle fs-1 text-warning"></i>
              <h5 className="card-title">Paralisadas</h5>
              <p className="dashboard-number">{obrasParalisadas}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card dashboard-card">
            <div className="card-body">
              <i className="bi bi-check-circle fs-1 text-info"></i>
              <h5 className="card-title">Concluídas</h5>
              <p className="dashboard-number">{obrasConcluidas}</p>
            </div>
          </div>
        </div>
      </div>

      {loadingItens ? (
        <div className="card mt-4"><div className="card-body text-center">Carregando itens em falta...</div></div>
      ) : itensFalta.length > 0 ? (
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5><i className="bi bi-exclamation-triangle"></i> Itens em Falta</h5>
            <button className="btn btn-outline-danger btn-sm" onClick={baixarPDF}>
              <i className="bi bi-download"></i> Baixar PDF
            </button>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm table-hover">
                <thead><tr><th>Obra</th><th>Material</th><th>Unidade</th><th>Estoque Atual</th><th>Mínimo</th><th>Faltam</th></tr></thead>
                <tbody>
                  {itensFalta.map((item, i) => (
                    <tr key={i}>
                      <td><span className="fw-bold">{item.obra_nome}</span></td>
                      <td>{item.material}</td>
                      <td>{item.unidade_medida}</td>
                      <td className="text-danger fw-bold">{item.quantidade}</td>
                      <td>{item.estoque_minimo}</td>
                      <td className="text-success fw-bold">{item.estoque_minimo - item.quantidade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card mt-4">
        <div className="card-header"><h5>Resumo das Obras</h5></div>
        <div className="card-body">
          <p>Total de obras cadastradas: <strong>{listaObras.length}</strong></p>
          <p>Total de gestores: <strong>{listaGestores.length}</strong></p>
        </div>
      </div>
    </>
  );
};

const ChecklistObra = ({ obraId }) => {
  const [etapas, setEtapas] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/api/obras/${obraId}/etapas`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setEtapas(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [obraId]);

  if (loading) return <p>Carregando checklist...</p>;

  return (
    <div className="card">
      <div className="card-header"><h5>Checklist de Etapas</h5></div>
      <div className="card-body">
        {etapas.length === 0 ? <p>Nenhuma etapa cadastrada.</p> : (
          <ul className="list-group">
            {etapas.map(etapa => (
              <li key={etapa.id} className="list-group-item d-flex justify-content-between align-items-center">
                {etapa.categoria} - {etapa.etapa}
                <span className={`badge ${etapa.concluida ? 'bg-success' : 'bg-secondary'}`}>
                  {etapa.concluida ? 'Concluída' : 'Pendente'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;