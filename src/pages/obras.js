import React, { useState } from 'react';
import ObraList from '../components/obras/ObraList';
import ObraForm from '../components/obras/ObraForm';

const Obras = ({ obras, addObra, updateObra, deleteObra }) => {
  const [editingObra, setEditingObra] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (obra) => {
    setEditingObra(obra);
    setShowForm(true);
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
            obras={obras} 
            onEdit={handleEdit} 
            onDelete={deleteObra} 
          />
        </>
      )}
    </>
  );
};

export default Obras;