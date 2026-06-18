import React from 'react';

const ObraList = ({ obras, onEdit, onDelete, user }) => {
  const isGestor = user?.role === 'gestor';

  return (
    <div className="card">
      <div className="card-header">
        <h5>Lista de Obras</h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Localização</th>
                {!isGestor && <th>Gestor</th>}
                <th>Mestre de Obras</th>
                <th>Código</th>
                <th>Status</th>
                <th>Progresso</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {obras && obras.length > 0 ? (
                obras.map(obra => (
                  <tr key={obra.id}>
                    <td>{obra.nome}</td>
                    <td>{obra.localizacao}</td>
                    {!isGestor && <td>{obra.gestor}</td>}
                    <td>{obra.mestre_obra || '-'}</td>
                    <td><span className="badge bg-dark">{obra.codigo || '-'}</span></td>
                    <td>
                      <span className={`badge ${obra.status === 'Concluída' ? 'bg-success' : obra.status === 'Em andamento' ? 'bg-primary' : 'bg-warning'}`}>
                        {obra.status}
                      </span>
                    </td>
                    <td>
                      <div className="progress">
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${obra.progresso}%` }}
                        >
                          {obra.progresso}%
                        </div>
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-info me-2"
                        onClick={() => onEdit(obra)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => onDelete(obra.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isGestor ? 7 : 8} className="text-center">
                    Nenhuma obra cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ObraList;