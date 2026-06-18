import React, { useState, useEffect } from 'react';

<<<<<<< HEAD
const ObraForm = ({ obra, gestores, mestres, onSubmit, onCancel }) => {
  const [nome, setNome] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [gestor, setGestor] = useState('');
  const [mestreObra, setMestreObra] = useState('');
=======
const ObraForm = ({ obra, gestores, onSubmit, onCancel }) => {
  const [nome, setNome] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [gestor, setGestor] = useState('');
  const [status, setStatus] = useState('Planejada');
  const [progresso, setProgresso] = useState(0);
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [orcamento, setOrcamento] = useState('');

<<<<<<< HEAD
  // Proteção: garante que sempre sejam arrays
  const listaGestores = Array.isArray(gestores) ? gestores : [];
  const listaMestres = Array.isArray(mestres) ? mestres : [];

  useEffect(() => {
    if (obra) {
      setNome(obra.nome || '');
      setLocalizacao(obra.localizacao || '');
      setGestor(obra.gestor || '');
      setMestreObra(obra.mestre_obra || '');
      setDescricao(obra.descricao || '');
      setDataInicio(obra.dataInicio || '');
      setDataFim(obra.dataFim || '');
      setOrcamento(obra.orcamento || '');
=======
  useEffect(() => {
    if (obra) {
      setNome(obra.nome);
      setLocalizacao(obra.localizacao);
      setGestor(obra.gestor);
      setStatus(obra.status);
      setProgresso(obra.progresso);
      setDescricao(obra.descricao);
      setDataInicio(obra.dataInicio);
      setDataFim(obra.dataFim);
      setOrcamento(obra.orcamento);
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
    }
  }, [obra]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nome,
      localizacao,
      gestor,
<<<<<<< HEAD
      mestre_obra: mestreObra,
=======
      status,
      progresso,
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
      descricao,
      dataInicio,
      dataFim,
      orcamento
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5>{obra ? 'Editar Obra' : 'Nova Obra'}</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
<<<<<<< HEAD
              <label className="form-label">Nome da Obra</label>
              <input
                type="text"
                className="form-control"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Localização</label>
              <input
                type="text"
                className="form-control"
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Gestor Responsável</label>
              <select
                className="form-select"
                value={gestor}
                onChange={(e) => setGestor(e.target.value)}
                required
              >
                <option value="">Selecione um gestor</option>
                {listaGestores.map(g => (
                  <option key={g.id} value={g.nome}>
                    {g.nome} - {g.cadastro_empresa}
=======
              <label htmlFor="nome" className="form-label">Nome da Obra</label>
              <input 
                type="text" 
                className="form-control" 
                id="nome" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                required 
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="localizacao" className="form-label">Localização</label>
              <input 
                type="text" 
                className="form-control" 
                id="localizacao" 
                value={localizacao} 
                onChange={(e) => setLocalizacao(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="gestor" className="form-label">Gestor Responsável</label>
              <select 
                className="form-select" 
                id="gestor"
                value={gestor} 
                onChange={(e) => setGestor(e.target.value)} 
                required
              >
                <option value="">Selecione um gestor</option>
                {gestores.map(gestor => (
                  <option key={gestor.id} value={gestor.nome}>
                    {gestor.nome} - {gestor.cadastro_empresa}
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
<<<<<<< HEAD
              <label className="form-label">Mestre de Obras</label>
              <select
                className="form-select"
                value={mestreObra}
                onChange={(e) => setMestreObra(e.target.value)}
              >
                <option value="">Selecione um mestre (opcional)</option>
                {listaMestres.map(m => (
                  <option key={m.id} value={m.nome}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Orçamento (R$)</label>
              <input
                type="number"
                className="form-control"
                step="0.01"
                value={orcamento}
                onChange={(e) => setOrcamento(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Descrição</label>
            <textarea
              className="form-control"
              rows="3"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            ></textarea>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Data de Início</label>
              <input
                type="date"
                className="form-control"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Data de Conclusão Prevista</label>
              <input
                type="date"
                className="form-control"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>

=======
              <label htmlFor="status" className="form-label">Status</label>
              <select 
                className="form-select" 
                id="status" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                required
              >
                <option value="Planejada">Planejada</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Concluída">Concluída</option>
                <option value="Atrasada">Atrasada</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="progresso" className="form-label">Progresso (%)</label>
              <input 
                type="number" 
                className="form-control" 
                id="progresso" 
                min="0" 
                max="100" 
                value={progresso} 
                onChange={(e) => setProgresso(Number(e.target.value))} 
                required 
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="orcamento" className="form-label">Orçamento (R$)</label>
              <input 
                type="number" 
                className="form-control" 
                id="orcamento" 
                step="0.01" 
                value={orcamento} 
                onChange={(e) => setOrcamento(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="descricao" className="form-label">Descrição</label>
            <textarea 
              className="form-control" 
              id="descricao" 
              rows="3" 
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
            ></textarea>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="dataInicio" className="form-label">Data de Início</label>
              <input 
                type="date" 
                className="form-control" 
                id="dataInicio" 
                value={dataInicio} 
                onChange={(e) => setDataInicio(e.target.value)} 
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="dataFim" className="form-label">Data de Conclusão Prevista</label>
              <input 
                type="date" 
                className="form-control" 
                id="dataFim" 
                value={dataFim} 
                onChange={(e) => setDataFim(e.target.value)} 
              />
            </div>
          </div>
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
          <button type="submit" className="btn btn-primary me-2">
            {obra ? 'Atualizar' : 'Salvar'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default ObraForm;