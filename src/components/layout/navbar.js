import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <i className="bi bi-building"></i> MARKCAMP
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="#"><i className="bi bi-person-circle"></i> Administrador</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#"><i className="bi bi-box-arrow-right"></i> Sair</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;