import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ObraList from '../components/obras/obralist.js';
import ObraForm from '../components/obras/obraform.js';

const Obras = ({ obras, gestores, mestres, addObra, updateObra, deleteObra, fetchObras, user }) => {
  const navigate = useNavigate();
  const [editingObra, setEditingObra] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchObras();
  }, []);

  const handleEdit = (obra) => {
    navigate(`/obras/${obra.id}`);
  };

  const handleSubmit = (obra) => {
    if (editingObra) {
      updateObra(editingObra.id, obra);
    } else {
      addObra(obra);
    }
    setEditingObra(null);
    setShowForm(false);
  };

  const handleCancel = () => {
    setEditingObra(null);
    setShowForm(false);
  };

  return (
    <>
      <h2 className="page-title">Gestão de Obras</h2>
      
      {showForm ? (
        <ObraForm 
          obra={editingObra} 
          gestores={gestores || []}
          mestres={mestres || []}
          onSubmit={handleSubmit} 
          onCancel={handleCancel} 
        />
      ) : (
        <>
          <button 
            className="btn btn-primary mb-3"
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-plus-circle"></i> Nova Obra
          </button>
          <ObraList 
            obras={obras || []} 
            onEdit={handleEdit} 
            onDelete={deleteObra} 
            user={user}
          />
        </>
      )}
    </>
  );
};

export default Obras;