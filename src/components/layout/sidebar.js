import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="col-md-2 sidebar d-none d-md-block">
      <div className="list-group">
        <Link to="/" className="list-group-item list-group-item-action">
          <i className="bi bi-speedometer2"></i> Dashboard
        </Link>
        <Link to="/obras" className="list-group-item list-group-item-action">
          <i className="bi bi-building"></i> Obras
        </Link>
        <Link to="/gestores" className="list-group-item list-group-item-action">
          <i className="bi bi-people-fill"></i> Gestores
        </Link>
        <a href="#" className="list-group-item list-group-item-action">
          <i className="bi bi-file-text"></i> Relatórios
        </a>
        <a href="#" className="list-group-item list-group-item-action">
          <i className="bi bi-calendar-event"></i> Cronogramas
        </a>
        <a href="#" className="list-group-item list-group-item-action">
          <i className="bi bi-wallet2"></i> Orçamentos
        </a>
        <a href="#" className="list-group-item list-group-item-action">
          <i className="bi bi-chat-left-text"></i> Documentos
        </a>
        <a href="#" className="list-group-item list-group-item-action">
          <i className="bi bi-gear-fill"></i> Configurações
        </a>
      </div>
    </div>
  );
};

export default Sidebar;