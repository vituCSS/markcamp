import React, { useState, useEffect } from 'react';

const MestreForm = ({ mestre, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cadastro_empresa: '',
    email: '',
    telefone: ''
  });

  useEffect(() => {
    if (mestre) {
      setFormData({
        nome: mestre.nome || '',
        cadastro_empresa: mestre.cadastro_empresa || '',
        email: mestre.email || '',
        telefone: mestre.telefone || ''
      });
    } else {
      setFormData({
        nome: '',
        cadastro_empresa: '',
        email: '',
        telefone: ''
      });
    }
  }, [mestre]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5>
          {mestre ? 'Editar Mestre' : 'Novo Mestre'}
        </h5>
      </div>

      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">

            <div className="col-md-6 mb-3">
              <label className="form-label">
                Nome
              </label>

              <input
                type="text"
                className="form-control"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>

            {!mestre ? (
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Telefone
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                />
              </div>
            ) : (
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Cadastro na Empresa
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="cadastro_empresa"
                  value={formData.cadastro_empresa}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="col-md-6 mb-3">
              <label className="form-label">
                Email
              </label>

              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {mestre && (
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Telefone
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

          </div>

          <button
            type="submit"
            className="btn btn-primary me-2"
          >
            {mestre ? 'Atualizar' : 'Cadastrar'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default MestreForm;