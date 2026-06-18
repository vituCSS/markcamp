import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { deleteObra } from '../api';
import ObraForm from '../components/obraform';

const ObrasScreen = ({ navigation }) => {
  const { obras, setObras, refreshObras, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const isGestor = user?.role === 'gestor';

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refreshObras);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = async (id) => {
    Alert.alert('Excluir obra', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await deleteObra(token, id);
            setObras(prev => prev.filter(o => o.id !== id));
          } catch (err) { Alert.alert('Erro', err.message); }
        },
      },
    ]);
  };

  const handleEdit = (obra) => {
    navigation.navigate('ObraDetalhes', { id: obra.id });
  };

  const renderObra = ({ item }) => {
    const statusColors = {
      'Concluída': '#10b981', 'Em andamento': '#1e40af', 'Pausada': '#f59e0b', 'Planejada': '#6b7280',
    };
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleEdit(item)}>
        <View style={styles.cardHeader}>
          <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
          {isGestor && (
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
                <Ionicons name="eye" size={18} color="#1e40af" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                <Ionicons name="trash" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color="#6b7280" />
          <Text style={styles.infoText} numberOfLines={1}>{item.localizacao}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={14} color="#6b7280" />
          <Text style={styles.infoText}>
            {isGestor ? `Mestre: ${item.mestre_obra || '-'}` : `Gestor: ${item.gestor}`}
          </Text>
        </View>
        <View style={styles.footer}>
          <View style={[styles.badge, { backgroundColor: statusColors[item.status] }]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
          <Text style={styles.codigo}>{item.codigo}</Text>
        </View>
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progresso}%` }]} />
          </View>
          <Text style={styles.progressText}>{item.progresso}%</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={obras}
        keyExtractor={item => item.id.toString()}
        renderItem={renderObra}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={50} color="#9ca3af" />
            <Text>Nenhuma obra cadastrada.</Text>
          </View>
        }
      />
      {isGestor && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal visible={showForm} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <ObraForm
            obra={null}
            onClose={() => setShowForm(false)}
            onSuccess={() => { setShowForm(false); refreshObras(); }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginHorizontal: 12, marginBottom: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  actions: { flexDirection: 'row' },
  actionBtn: { marginLeft: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#4b5563', marginLeft: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginRight: 8 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  codigo: { fontSize: 12, color: '#6b7280', backgroundColor: '#e5e7eb', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  progressBar: { flex: 1, height: 6, backgroundColor: '#e5e7eb', borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: '#1e40af' },
  progressText: { fontSize: 12, fontWeight: '600', color: '#1e40af', marginLeft: 8, width: 35 },
  empty: { alignItems: 'center', marginTop: 60 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#1e40af', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 },
});

export default ObrasScreen;