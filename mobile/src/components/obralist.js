import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ObraList = ({ obras, onEdit, onDelete, user }) => {
  const isGestor = user?.role === 'gestor';

  const renderObra = ({ item }) => {
    const statusColors = {
      'Concluída': '#10b981',
      'Em andamento': '#1e40af',
      'Pausada': '#f59e0b',
      'Planejada': '#6b7280',
    };

    return (
      <TouchableOpacity style={styles.card} onPress={() => onEdit(item)}>
        <View style={styles.cardHeader}>
          <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
          {isGestor && (
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
                <Ionicons name="eye" size={18} color="#1e40af" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionBtn}>
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
    <FlatList
      data={obras}
      keyExtractor={item => item.id.toString()}
      renderItem={renderObra}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="business-outline" size={50} color="#9ca3af" />
          <Text style={styles.emptyText}>Nenhuma obra cadastrada.</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: { padding: 12, paddingBottom: 80 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 10, elevation: 2 },
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
  emptyText: { fontSize: 16, color: '#9ca3af', marginTop: 10 },
});

export default ObraList;