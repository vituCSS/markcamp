import React from 'react';

const MestreList = ({ mestres, onEdit, onDelete, showActions }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h5>Lista de Mestres de Obras</h5>
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
                {showActions && <th>Ações</th>}
              </tr>
            </thead>

            <tbody>
              {mestres.length === 0 ? (
                <tr>
                  <td
                    colSpan={showActions ? 5 : 4}
                    className="text-center"
                  >
                    Nenhum mestre cadastrado.
                  </td>
                </tr>
              ) : (
                mestres.map((mestre) => (
                  <tr key={mestre.id}>
                    <td>{mestre.nome}</td>
                    <td>
                      <span className="badge bg-secondary">
                        {mestre.cadastro_empresa}
                      </span>
                    </td>
                    <td>{mestre.email}</td>
                    <td>{mestre.telefone}</td>

                    {showActions && (
                      <td>
                        <button
                          className="btn btn-sm btn-info me-2"
                          onClick={() => onEdit(mestre)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => onDelete(mestre.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default MestreList;