import React, { useState, useEffect } from 'react';
import GestorList from '../components/gestores/gestorlist';
import GestorForm from '../components/gestores/gestorform';

const Gestores = ({ gestores, setGestores }) => {
  const [editingGestor, setEditingGestor] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchGestores();
  }, []);

  const fetchGestores = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/gestores');
      const data = await response.json();
      setGestores(data);
    } catch (error) {
      console.error('Erro ao buscar gestores:', error);
    }
  };

  const addGestor = async (gestor) => {
    try {
      const response = await fetch('http://localhost:5000/api/gestores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gestor),
      });
      const newGestor = await response.json();
      setGestores([...gestores, newGestor]);
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao adicionar gestor:', error);
    }
  };

  const updateGestor = async (id, updatedGestor) => {
    try {
      const response = await fetch(`http://localhost:5000/api/gestores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGestor),
      });
      const data = await response.json();
      setGestores(gestores.map(gestor => (gestor.id === id ? data : gestor)));
      setEditingGestor(null);
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao atualizar gestor:', error);
    }
  };

  const deleteGestor = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/gestores/${id}`, {
        method: 'DELETE',
      });
      setGestores(gestores.filter(gestor => gestor.id !== id));
    } catch (error) {
      console.error('Erro ao excluir gestor:', error);
    }
  };

  const handleEdit = (gestor) => {
    setEditingGestor(gestor);
    setShowForm(true);
  };

  const handleSubmit = (gestor) => {
    if (editingGestor) {
      updateGestor(editingGestor.id, gestor);
    } else {
      addGestor(gestor);
    }
  };

  const handleCancel = () => {
    setEditingGestor(null);
    setShowForm(false);
  };

  return (
    <>
      <h2 className="page-title">Gestão de Gestores</h2>
      
      {showForm ? (
        <GestorForm 
          gestor={editingGestor} 
          onSubmit={handleSubmit} 
          onCancel={handleCancel} 
        />
      ) : (
        <>
          <button 
            className="btn btn-primary mb-3"
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-person-plus"></i> Novo Gestor
          </button>
          <GestorList 
            gestores={gestores} 
            onEdit={handleEdit} 
            onDelete={deleteGestor} 
          />
        </>
      )}
    </>
  );
};

export default Gestores;