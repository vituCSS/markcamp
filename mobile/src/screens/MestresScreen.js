import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, TextInput, Modal, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMestres, addMestre, updateMestre, deleteMestre } from '../api';
import { useAuth } from '../context/AuthContext';

const MestresScreen = () => {
  const { mestres, setMestres, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingMestre, setEditingMestre] = useState(null);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isGestor = user?.role === 'gestor';

  const loadMestres = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const data = await fetchMestres(token);
      setMestres(data || []);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar mestres.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMestres();
  }, []);

  const handleSave = async () => {
    if (!form.nome.trim() || !form.email.trim()) {
      Alert.alert('Atenção', 'Nome e email são obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');

      if (editingMestre) {
        const data = await updateMestre(token, editingMestre.id, {
          nome: form.nome,
          cadastro_empresa: editingMestre.cadastro_empresa,
          email: form.email,
          telefone: form.telefone,
        });
        setMestres(prev => prev.map(m => m.id === editingMestre.id ? data : m));
        Alert.alert('Sucesso', 'Mestre atualizado.');
      } else {
        const data = await addMestre(token, {
          nome: form.nome,
          email: form.email,
          telefone: form.telefone,
        });
        setMestres(prev => [...prev, data]);
        Alert.alert('Sucesso', 'Mestre cadastrado.');
      }

      setShowForm(false);
      setEditingMestre(null);
      setForm({ nome: '', email: '', telefone: '' });
      loadMestres();
    } catch (error) {
      Alert.alert('Erro', error.message || 'Erro de rede. Verifique sua conexão.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Excluir mestre', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await deleteMestre(token, id);
            setMestres(prev => prev.filter(m => m.id !== id));
            Alert.alert('Sucesso', 'Mestre excluído.');
          } catch (error) {
            Alert.alert('Erro', error.message || 'Erro de rede.');
          }
        },
      },
    ]);
  };

  const openEdit = (mestre) => {
    setEditingMestre(mestre);
    setForm({
      nome: mestre.nome || '',
      email: mestre.email || '',
      telefone: mestre.telefone || '',
    });
    setShowForm(true);
  };

  const openAdd = () => {
    setEditingMestre(null);
    setForm({ nome: '', email: '', telefone: '' });
    setShowForm(true);
  };

  const renderMestre = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => isGestor && openEdit(item)}
      activeOpacity={isGestor ? 0.7 : 1}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.nome}>{item.nome}</Text>
        {isGestor && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
              <Ionicons name="pencil" size={18} color="#1e40af" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
              <Ionicons name="trash" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="briefcase-outline" size={14} color="#6b7280" />
        <Text style={styles.infoText}>{item.cadastro_empresa || '-'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="mail-outline" size={14} color="#6b7280" />
        <Text style={styles.infoText}>{item.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="call-outline" size={14} color="#6b7280" />
        <Text style={styles.infoText}>{item.telefone || '-'}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={mestres}
        keyExtractor={item => item.id.toString()}
        renderItem={renderMestre}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="layers-outline" size={50} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhum mestre cadastrado.</Text>
          </View>
        }
      />
      {isGestor && (
        <TouchableOpacity style={styles.fab} onPress={openAdd}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingMestre ? 'Editar Mestre' : 'Novo Mestre'}
            </Text>

            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              value={form.nome}
              onChangeText={t => setForm({ ...form, nome: t })}
              placeholder="Nome do mestre"
            />

            {editingMestre && (
              <>
                <Text style={styles.label}>Cadastro Empresa</Text>
                <TextInput
                  style={styles.input}
                  value={editingMestre.cadastro_empresa || ''}
                  editable={false}
                />
              </>
            )}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={t => setForm({ ...form, email: t })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="email@exemplo.com"
            />

            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={form.telefone}
              onChangeText={t => setForm({ ...form, telefone: t })}
              keyboardType="phone-pad"
              placeholder="(11) 99999-9999"
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.disabledBtn]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingMestre ? 'Atualizar' : 'Cadastrar'}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowForm(false)}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 12, paddingBottom: 80 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  actions: { flexDirection: 'row' },
  actionBtn: { marginLeft: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#4b5563', marginLeft: 6 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#9ca3af', marginTop: 10 },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1e40af',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9fafb',
    fontSize: 15,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  saveBtn: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledBtn: { backgroundColor: '#9ca3af' },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  cancelBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cancelBtnText: { color: '#6b7280', fontWeight: '600', fontSize: 15 },
});

export default MestresScreen;