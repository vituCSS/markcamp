import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GestorList = ({ gestores, onEdit, onDelete }) => {
  const renderGestor = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.nome}>{item.nome}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
            <Ionicons name="pencil" size={18} color="#1e40af" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionBtn}>
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
    </View>
  );

  return (
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
  );
};

const styles = StyleSheet.create({
  listContent: { padding: 12, paddingBottom: 80 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 10, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  actions: { flexDirection: 'row' },
  actionBtn: { marginLeft: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#4b5563', marginLeft: 6 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#9ca3af', marginTop: 10 },
});

export default GestorList;