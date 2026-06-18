import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ user }) => {
  const role = user?.role;

  return (
    <div className="col-md-2 sidebar d-none d-md-block">
      <div className="list-group">
        <Link to="/" className="list-group-item list-group-item-action">
          <i className="bi bi-speedometer2"></i> Dashboard
        </Link>

        {role === 'gestor' && (
          <>
            <Link to="/obras" className="list-group-item list-group-item-action">
              <i className="bi bi-building"></i> Obras
            </Link>
            <Link to="/gestores" className="list-group-item list-group-item-action">
              <i className="bi bi-people-fill"></i> Gestores
            </Link>
            <Link to="/mestres" className="list-group-item list-group-item-action">
              <i className="bi bi-diagram-3"></i> Mestres
            </Link>
          </>
        )}

        {role === 'mestre' && (
          <>
            <Link to="/diario" className="list-group-item list-group-item-action">
              <i className="bi bi-journal-text"></i> Diário de Obra
            </Link>
            <Link to="/relatorio" className="list-group-item list-group-item-action">
              <i className="bi bi-journal-plus"></i> Registrar Relatório
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;