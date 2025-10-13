import React, { useState, useEffect } from 'react';

const GestorForm = ({ gestor, onSubmit, onCancel }) => {
  const [nome, setNome] = useState('');
  const [cadastro_empresa, setCadastroEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  useEffect(() => {
    if (gestor) {
      setNome(gestor.nome);
      setCadastroEmpresa(gestor.cadastro_empresa);
      setEmail(gestor.email);
      setTelefone(gestor.telefone);
    }
  }, [gestor]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ nome, cadastro_empresa, email, telefone });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5>{gestor ? 'Editar Gestor' : 'Novo Gestor'}</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nome Completo</label>
              <input 
                type="text" 
                className="form-control" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                required 
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Cadastro na Empresa</label>
              <input 
                type="text" 
                className="form-control" 
                value={cadastro_empresa} 
                onChange={(e) => setCadastroEmpresa(e.target.value)} 
                placeholder="Ex: MAT-1234"
                required 
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Telefone</label>
              <input 
                type="text" 
                className="form-control" 
                value={telefone} 
                onChange={(e) => setTelefone(e.target.value)} 
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary me-2">
            {gestor ? 'Atualizar' : 'Salvar'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default GestorForm;