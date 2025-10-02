import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './App.css'

import Navbar from './components/layout/NavBar';
import Sidebar from './components/layout/SideBar';
import Dashboard from './pages/Dashboard';
import Obras from './pages/Obras';
import Gestores from './pages/Gestores';

function App() {
  const [obras, setObras] = useState([]);
  const [gestores, setGestores] = useState([]);

  useEffect(() => {
    fetchObras();
  }, []);

  const fetchObras = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/obras');
      const data = await response.json();
      setObras(data);
    } catch (error) {
      console.error('Erro ao buscar obras:', error);
    }
  };

  const addObra = async (obra) => {
    try {
      const response = await fetch('http://localhost:5000/api/obras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetch(`http://localhost:5000/api/obras/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
      await fetch(`http://localhost:5000/api/obras/${id}`, {
        method: 'DELETE',
      });
      setObras(obras.filter(obra => obra.id !== id));
    } catch (error) {
      console.error('Erro ao excluir obra:', error);
    }
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
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
                    addObra={addObra} 
                    updateObra={updateObra}
                    deleteObra={deleteObra} 
                  />
                } />
                {/*<Route path="/gestores" element={
                  <Gestores 
                    gestores={gestores} 
                    setGestores={setGestores} 
                  />
                } />*/}
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;