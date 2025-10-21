import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './App.css'

import Navbar from './components/layout/navbar.js';
import Sidebar from './components/layout/sidebar.js';
import Login from './pages/login.js';
import Dashboard from './pages/dashboard.js';
import Obras from './pages/obras.js';
import Gestores from './pages/gestores.js';

function App() {
  const [obras, setObras] = useState([]);
  const [gestores, setGestores] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificar se usuário já está logado
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    
    if (isAuthenticated) {
      fetchObras();
      fetchGestores();
    }
  }, [isAuthenticated]);

  const fetchGestores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/gestores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setGestores(data);
    } catch (error) {
      console.error('Erro ao buscar gestores:', error);
    }
  };

  const fetchObras = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/obras', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setObras(data);
    } catch (error) {
      console.error('Erro ao buscar obras:', error);
    }
  };

  const addObra = async (obra) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/obras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(obra),
      });
      const newObra = await response.json();
      setObras([...obras, newObra]);
    } catch (error) {
      console.error('Erro ao adicionar obra:', error);
    }
  };

  const updateObra = async (id, updatedObra) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/obras/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedObra),
      });
      const data = await response.json();
      setObras(obras.map(obra => (obra.id === id ? data : obra)));
    } catch (error) {
      console.error('Erro ao atualizar obra:', error);
    }
  };

  const deleteObra = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/obras/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setObras(obras.filter(obra => obra.id !== id));
    } catch (error) {
      console.error('Erro ao excluir obra:', error);
    }
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="container-fluid">
          <div className="row">
            <Sidebar />
            <div className="col-md-10 main-content">
              <Routes>
                <Route path="/" element={
                  <Dashboard obras={obras} gestores={gestores} />
                } />
                <Route path="/obras" element={
                  <Obras 
                    obras={obras} 
                    gestores={gestores}
                    addObra={addObra} 
                    updateObra={updateObra}
                    deleteObra={deleteObra} 
                  />
                } />
                <Route path="/gestores" element={
                  <Gestores 
                    gestores={gestores} 
                    setGestores={setGestores} 
                  />
                } />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;