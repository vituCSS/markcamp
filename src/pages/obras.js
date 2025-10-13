import React, { useState } from 'react';
import ObraList from '../components/obras/obralist.js';
import ObraForm from '../components/obras/obraform.js';

const Obras = ({ obras, gestores, addObra, updateObra, deleteObra }) => {
  console.log('Gestores no Obras (pages/obras.js):', gestores);
  
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
          gestores={gestores}
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