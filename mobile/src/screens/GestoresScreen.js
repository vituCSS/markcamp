import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, TextInput, Modal, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchGestores } from '../api';
import { useAuth } from '../context/AuthContext';

const GestoresScreen = () => {
  const { gestores, setGestores } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingGestor, setEditingGestor] = useState(null);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const BASE_URL = 'http://192.168.1.240:5000/api';

  const loadGestores = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const data = await fetchGestores(token);
      setGestores(data || []);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar gestores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGestores();
  }, []);

  const handleSave = async () => {
    if (!form.nome.trim() || !form.email.trim()) {
      Alert.alert('Atenção', 'Nome e email são obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      const url = editingGestor
        ? `${BASE_URL}/gestores/${editingGestor.id}`
        : `${BASE_URL}/gestores`;
      
      const method = editingGestor ? 'PUT' : 'POST';
      
      const body = editingGestor
        ? {
            nome: form.nome,
            cadastro_empresa: editingGestor.cadastro_empresa,
            email: form.email,
            telefone: form.telefone,
          }
        : {
            nome: form.nome,
            email: form.email,
            telefone: form.telefone,
          };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert('Sucesso', editingGestor ? 'Gestor atualizado.' : 'Gestor cadastrado.');
        setShowForm(false);
        setEditingGestor(null);
        setForm({ nome: '', email: '', telefone: '' });
        loadGestores();
      } else {
        Alert.alert('Erro', data.error || data.message || 'Falha ao salvar.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de rede. Verifique sua conexão.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Excluir gestor', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/gestores/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              loadGestores();
            } else {
              Alert.alert('Erro', 'Falha ao excluir gestor.');
            }
          } catch (error) {
            Alert.alert('Erro', 'Erro de rede.');
          }
        },
      },
    ]);
  };

  const openEdit = (gestor) => {
    setEditingGestor(gestor);
    setForm({
      nome: gestor.nome || '',
      email: gestor.email || '',
      telefone: gestor.telefone || '',
    });
    setShowForm(true);
  };

  const openAdd = () => {
    setEditingGestor(null);
    setForm({ nome: '', email: '', telefone: '' });
    setShowForm(true);
  };

  const renderGestor = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openEdit(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.nome}>{item.nome}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
            <Ionicons name="pencil" size={18} color="#1e40af" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
            <Ionicons name="trash" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
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
        data={gestores}
        keyExtractor={item => item.id.toString()}
        renderItem={renderGestor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={50} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhum gestor cadastrado.</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingGestor ? 'Editar Gestor' : 'Novo Gestor'}
            </Text>

            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              value={form.nome}
              onChangeText={t => setForm({ ...form, nome: t })}
              placeholder="Nome do gestor"
            />

            {editingGestor && (
              <>
                <Text style={styles.label}>Cadastro Empresa</Text>
                <TextInput
                  style={styles.input}
                  value={editingGestor.cadastro_empresa || ''}
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
                    {editingGestor ? 'Atualizar' : 'Salvar'}
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

export default GestoresScreen;