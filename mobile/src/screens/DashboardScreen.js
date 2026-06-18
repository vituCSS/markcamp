import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../context/AuthContext';
import {
  fetchObraPorId, fetchEtapas, fetchItensEmFalta,
  downloadRelatorio, notificarAcesso,
} from '../api';

const DashboardScreen = () => {
  const { user, obras, gestores } = useAuth();
  const [obra, setObra] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [itensFalta, setItensFalta] = useState([]);
  const [loading, setLoading] = useState(true);
  const isCliente = user?.role === 'cliente';

  useEffect(() => {
    if (isCliente) {
      carregarObraCliente();
    } else {
      carregarItens();
      setLoading(false);
    }
    notificarPrimeiroAcesso();
  }, []);

  const notificarPrimeiroAcesso = async () => {
    try {
      const hoje = new Date().toISOString().slice(0, 10);
      const ultimo = await AsyncStorage.getItem('ultimo_acesso_email');
      if (ultimo === hoje) return;
      const token = await AsyncStorage.getItem('token');
      await notificarAcesso(token, user?.nome, user?.email, user?.role);
      await AsyncStorage.setItem('ultimo_acesso_email', hoje);
    } catch (err) {
      // silencioso
    }
  };

  const carregarObraCliente = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const obraData = await fetchObraPorId(token, user.obra_id);
      setObra(obraData);
      const etapasData = await fetchEtapas(token, user.obra_id);
      setEtapas(etapasData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const carregarItens = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const data = await fetchItensEmFalta(token);
      setItensFalta(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadRelatorio = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const fileUri = await downloadRelatorio(token, user.obra_id);
      await Sharing.shareAsync(fileUri);
    } catch (err) {
      Alert.alert('Erro', err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  // Dashboard do cliente
  if (isCliente) {
    if (!obra) return <Text style={styles.errorText}>Nenhuma obra vinculada.</Text>;
    const progresso = obra.progresso || 0;
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerCard}>
          <Ionicons name="business" size={40} color="#1e40af" />
          <Text style={styles.obraNome}>{obra.nome}</Text>
          <Text style={styles.obraCodigo}>Código: {obra.codigo}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações da Obra</Text>
          <InfoRow label="Localização" value={obra.localizacao} />
          <InfoRow label="Gestor" value={obra.gestor} />
          <InfoRow label="Mestre" value={obra.mestre_obra || '-'} />
          <InfoRow label="Status" value={<Badge status={obra.status} />} />
          <InfoRow label="Orçamento" value={`R$ ${obra.orcamento}`} />
          <InfoRow label="Início" value={obra.dataInicio || '-'} />
          <InfoRow label="Término" value={obra.dataFim || '-'} />
          <Text style={styles.progressLabel}>Progresso</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progresso}%` }]} />
          </View>
          <Text style={styles.progressText}>{progresso}%</Text>

          <TouchableOpacity style={styles.relatorioBtn} onPress={handleDownloadRelatorio}>
            <Ionicons name="document-text" size={20} color="#fff" />
            <Text style={styles.relatorioBtnText}> Imprimir Relatório</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Checklist</Text>
          {etapas.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma etapa.</Text>
          ) : (
            etapas.map(etapa => (
              <View key={etapa.id} style={styles.etapaRow}>
                <Ionicons
                  name={etapa.concluida ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={etapa.concluida ? '#10b981' : '#6b7280'}
                />
                <View style={styles.etapaInfo}>
                  <Text style={styles.etapaCategoria}>{etapa.categoria}</Text>
                  <Text style={styles.etapaNome}>{etapa.etapa}</Text>
                </View>
                <Text style={[styles.etapaStatus, etapa.concluida ? styles.concluida : styles.pendente]}>
                  {etapa.concluida ? 'Concluída' : 'Pendente'}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    );
  }

  // Dashboard gestor/mestre
  const obrasEmAndamento = obras.filter(o => o.status === 'Em andamento').length;
  const obrasConcluidas = obras.filter(o => o.status === 'Concluída').length;
  const obrasParalisadas = obras.filter(o => o.status === 'Atrasada' || o.status === 'Pausada').length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Ionicons name="speedometer" size={40} color="#1e40af" />
        <Text style={styles.dashboardTitle}>Dashboard</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard title="Total" value={obras.length} icon="business" color="#1e40af" />
        <StatCard title="Em Andamento" value={obrasEmAndamento} icon="play-circle" color="#10b981" />
        <StatCard title="Paralisadas" value={obrasParalisadas} icon="pause-circle" color="#f59e0b" />
        <StatCard title="Concluídas" value={obrasConcluidas} icon="checkmark-circle" color="#06b6d4" />
      </View>

      {itensFalta.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Ionicons name="warning" size={18} color="#f59e0b" /> Itens em Falta
          </Text>
          {itensFalta.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemObra}>{item.obra_nome}</Text>
                <Text style={styles.itemMaterial}>{item.material} ({item.unidade_medida})</Text>
              </View>
              <Text style={styles.itemFaltam}>Faltam: {item.estoque_minimo - item.quantidade}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo</Text>
        <InfoRow label="Total de obras" value={obras.length.toString()} />
        <InfoRow label="Total de gestores" value={gestores.length.toString()} />
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    {typeof value === 'string' ? <Text style={styles.infoValue}>{value}</Text> : value}
  </View>
);

const Badge = ({ status }) => {
  const colors = {
    'Concluída': '#10b981',
    'Em andamento': '#1e40af',
    'Pausada': '#f59e0b',
    'Planejada': '#6b7280',
  };
  return (
    <View style={[styles.badge, { backgroundColor: colors[status] || '#6b7280' }]}>
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={30} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { backgroundColor: '#fff', padding: 20, alignItems: 'center', marginBottom: 10 },
  obraNome: { fontSize: 22, fontWeight: 'bold', color: '#1e40af', marginTop: 8 },
  obraCodigo: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  dashboardTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e40af', marginTop: 8 },
  card: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 12, borderRadius: 10, padding: 16, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  infoLabel: { fontSize: 14, color: '#6b7280' },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#1f2937' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  progressLabel: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginTop: 12, marginBottom: 4 },
  progressBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#1e40af' },
  progressText: { fontSize: 14, fontWeight: '600', color: '#1e40af', marginTop: 4, textAlign: 'right' },
  etapaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  etapaInfo: { flex: 1, marginLeft: 10 },
  etapaCategoria: { fontSize: 12, color: '#6b7280' },
  etapaNome: { fontSize: 14, fontWeight: '500', color: '#1f2937' },
  etapaStatus: { fontSize: 12, fontWeight: '600' },
  concluida: { color: '#10b981' },
  pendente: { color: '#6b7280' },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginVertical: 20 },
  errorText: { textAlign: 'center', color: '#ef4444', fontSize: 16, marginTop: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 12, marginBottom: 12 },
  statCard: { width: '48%', backgroundColor: '#fff', borderRadius: 10, padding: 16, margin: '1%', alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginTop: 8 },
  statTitle: { fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  relatorioBtn: {
    flexDirection: 'row', backgroundColor: '#1e40af', padding: 14, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', marginTop: 16,
  },
  relatorioBtnText: { color: '#fff', fontWeight: '600', fontSize: 16, marginLeft: 6 },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f0f0f0',
  },
  itemObra: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  itemMaterial: { fontSize: 13, color: '#4b5563' },
  itemFaltam: { fontSize: 14, fontWeight: 'bold', color: '#ef4444' },
});

export default DashboardScreen;