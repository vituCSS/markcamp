import React, { useState } from 'react';
import MestreForm from '../components/mestres/mestresform';
import MestreList from '../components/mestres/mestreslist';

const Mestres = ({ mestres, setMestres, addMestre, updateMestre, deleteMestre, user }) => {
  const [editando, setEditando] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const isGestor = user?.role === 'gestor';

  const handleAdd = async (mestre) => {
    try {
      await addMestre(mestre);

      setShowForm(false);
      setEditando(null);

    } catch (error) {
      alert('Erro ao adicionar: ' + error.message);
      console.error(error);
    }
  };

  const handleUpdate = async (mestre) => {
    try {
      await updateMestre(editando.id, mestre);

      setEditando(null);
      setShowForm(false);

    } catch (error) {
      alert('Erro ao atualizar: ' + error.message);
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return;
    try {
      await deleteMestre(id);
    } catch (error) {
      alert('Erro ao excluir: ' + error.message);
      console.error(error);
    }
  };

  const handleEdit = (mestre) => {
    setEditando(mestre);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditando(null);
    setShowForm(false);
  };

  return (
  <>
    <h2 className="page-title">
      Gestão de Mestres de Obras
    </h2>

    {showForm ? (
      <MestreForm
        mestre={editando}
        onSubmit={editando ? handleUpdate : handleAdd}
        onCancel={handleCancel}
      />
    ) : (
      <>
        <button
          className="btn btn-primary mb-3"
          onClick={() => setShowForm(true)}
        >
          <i className="bi bi-person-plus"></i>
          {' '}Novo Mestre
        </button>

        <MestreList
          mestres={mestres}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={isGestor}
        />
      </>
    )}
  </>
);
};

export default Mestres;