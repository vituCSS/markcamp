import React from 'react';

const Dashboard = ({ obras, gestores }) => {
  const obrasEmAndamento = obras.filter(obra => obra.status === 'Em andamento').length;
  const obrasConcluidas = obras.filter(obra => obra.status === 'Concluída').length;
  const obrasAtrasadas = obras.filter(obra => obra.status === 'Atrasada').length;

  return (
    <>
      <h2 className="page-title">Dashboard</h2>
      
      <div className="row">
        <div className="col-md-3">
          <div className="card dashboard-card">
            <div className="card-body">
              <i className="bi bi-building fs-1 text-primary"></i>
              <h5 className="card-title">Total de Obras</h5>
              <p className="dashboard-number">{obras.length}</p>
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
              <p className="dashboard-number">{obrasAtrasadas}</p>
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

      <div className="card mt-4">
        <div className="card-header">
          <h5>Resumo das Obras</h5>
        </div>
        <div className="card-body">
          <p>Total de obras cadastradas: <strong>{obras.length}</strong></p>
          <p>Total de gestores: <strong>{gestores.length}</strong></p>
        </div>
      </div>
    </>
  );
};

export default Dashboard;