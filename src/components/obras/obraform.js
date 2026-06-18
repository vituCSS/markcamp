import React, { useState, useEffect } from 'react';

const ObraForm = ({ obra, gestores, mestres, onSubmit, onCancel }) => {
  const [nome, setNome] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [gestor, setGestor] = useState('');
  const [mestreObra, setMestreObra] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [orcamento, setOrcamento] = useState('');

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
    }
  }, [obra]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nome,
      localizacao,
      gestor,
      mestre_obra: mestreObra,
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
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
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