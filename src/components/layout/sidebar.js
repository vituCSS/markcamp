import React from 'react';
import { Link } from 'react-router-dom';

<<<<<<< HEAD
const Sidebar = ({ user }) => {
  const role = user?.role;

=======
const Sidebar = () => {
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
  return (
    <div className="col-md-2 sidebar d-none d-md-block">
      <div className="list-group">
        <Link to="/" className="list-group-item list-group-item-action">
          <i className="bi bi-speedometer2"></i> Dashboard
        </Link>
<<<<<<< HEAD

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
=======
        <Link to="/obras" className="list-group-item list-group-item-action">
          <i className="bi bi-building"></i> Obras
        </Link>
        <Link to="/gestores" className="list-group-item list-group-item-action">
          <i className="bi bi-people-fill"></i> Gestores
        </Link>
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
      </div>
    </div>
  );
};

export default Sidebar;