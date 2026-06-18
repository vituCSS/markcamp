import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css'

import Navbar from './components/layout/navbar.js';
import Sidebar from './components/layout/sidebar.js';
import Login from './pages/login.js';
import Dashboard from './pages/dashboard.js';
import Obras from './pages/obras.js';
import Gestores from './pages/gestores.js';
import Mestres from './pages/mestres.js';
import ObraDetalhes from './pages/obradetalhes.js';
import Relatorio from './pages/relatorio.js';
import DiarioPage from './pages/DiarioPage';


function App() {
  const [obras, setObras] = useState([]);
  const [gestores, setGestores] = useState([]);
  const [mestres, setMestres] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setIsAuthenticated(true);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchObras();
      if (user?.role === 'gestor') {
        fetchGestores();
        fetchMestres();
      }
    }
  }, [isAuthenticated, user]);

  const fetchGestores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/gestores', {
        headers: { Authorization: `Bearer ${token}` }
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
        headers: { Authorization: `Bearer ${token}` }
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(obra)
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Erro ao cadastrar obra');
      await fetchObras();
    } catch (error) {
      console.error('Erro ao adicionar obra:', error);
      alert(error.message);
    }
  };

  const updateObra = async (id, updatedObra) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/obras/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedObra)
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Erro ao atualizar obra');
      await fetchObras();
    } catch (error) {
      console.error('Erro ao atualizar obra:', error);
      alert(error.message);
    }
  };

  const deleteObra = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/obras/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Erro ao excluir obra');
      await fetchObras();
    } catch (error) {
      console.error('Erro ao excluir obra:', error);
      alert(error.message);
    }
  };

  const fetchMestres = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/classes-mestre', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Erro ao buscar mestres.');
      setMestres(await response.json());
    } catch (error) {
      console.error('Erro ao buscar mestres:', error);
    }
  };

  const addMestre = async (mestre) => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/classes-mestre', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(mestre)
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Erro ao adicionar mestre.');
    }
    const newMestre = await response.json();
    setMestres(prev => [...prev, newMestre]);
  };

  const updateMestre = async (id, updatedMestre) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/classes-mestre/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updatedMestre)
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Erro ao atualizar mestre.');
    const data = await response.json();
    setMestres(prev => prev.map(m => m.id === id ? data : m));
  };

  const deleteMestre = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/classes-mestre/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Erro ao excluir mestre.');
    setMestres(prev => prev.filter(m => m.id !== id));
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setObras([]);
    setGestores([]);
    setMestres([]);
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  const isGestor = user?.role === 'gestor';
  const isMestre = user?.role === 'mestre';
  const isCliente = user?.role === 'cliente';

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="container-fluid">
          <div className="row">
            <Sidebar user={user} />
            <div className="col-md-10 main-content">
              <Routes>
                {/* Dashboard comum a todos */}
                <Route path="/" element={
                  <Dashboard obras={obras} gestores={gestores} user={user} />
                } />

                {/* Rotas exclusivas do gestor */}
                {isGestor && (
                  <>
                    <Route path="/obras" element={
                      <Obras obras={obras} gestores={gestores} mestres={mestres}
                        addObra={addObra} updateObra={updateObra} deleteObra={deleteObra}
                        fetchObras={fetchObras} user={user} />
                    } />
                    <Route path="/gestores" element={
                      <Gestores gestores={gestores} setGestores={setGestores} user={user} />
                    } />
                    <Route path="/mestres" element={
                      <Mestres mestres={mestres} setMestres={setMestres}
                        addMestre={addMestre} updateMestre={updateMestre}
                        deleteMestre={deleteMestre} user={user} />
                    } />
                  </>
                )}

                {/* Detalhes da obra (gestor e mestre) */}
                {(isGestor || isMestre) && (
                  <Route path="/obras/:id" element={
                    <ObraDetalhes fetchObras={fetchObras} user={user} />
                  } />
                )}

                {/* Relatório (apenas mestre) */}
                {isMestre && (
                  <>
                    <Route path="/diario" element={<DiarioPage user={user} />} />
                    <Route path="/relatorio" element={<Relatorio user={user} obras={obras} />} />
                  </>
                )}

                {/* Qualquer outra rota redireciona para dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;