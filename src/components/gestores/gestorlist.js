import React from 'react';

const GestorList = ({ gestores, onEdit, onDelete }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h5>Lista de Gestores</h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cadastro Empresa</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {gestores.map(gestor => (
                <tr key={gestor.id}>
                  <td>{gestor.nome}</td>
                  <td>
                    <span className="badge bg-secondary">
                      {gestor.cadastro_empresa}
                    </span>
                  </td>
                  <td>{gestor.email}</td>
                  <td>{gestor.telefone}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-info me-2"
                      onClick={() => onEdit(gestor)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => onDelete(gestor.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestorList;