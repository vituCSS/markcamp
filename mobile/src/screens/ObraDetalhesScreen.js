import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import {
  fetchObraPorId, fetchEtapas, atualizarEtapa, pausarObra,
  fetchDocumentos, uploadDocumento, deleteDocumento,
  fetchMateriais, addMaterial, updateMaterial, deleteMaterial,
} from '../api';
import DiarioObra from '../components/diarioObra';

const ObraDetalhesScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user, refreshObras } = useAuth();
  const isGestor = user?.role === 'gestor';

  const [obra, setObra] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [aba, setAba] = useState('Planejamento');
  const [loading, setLoading] = useState(true);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialForm, setMaterialForm] = useState({ material: '', unidade_medida: '' });

  const carregarDados = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const [obraData, etapasData, docsData, matsData] = await Promise.all([
        fetchObraPorId(token, id),
        fetchEtapas(token, id),
        fetchDocumentos(token, id),
        fetchMateriais(token, id),
      ]);
      setObra(obraData);
      setEtapas(etapasData);
      setDocumentos(docsData);
      setMateriais(matsData);
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, [id]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#1e40af" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const toggleEtapa = async (etapa) => {
    if (!isGestor) return;
    try {
      const token = await AsyncStorage.getItem('token');
      await atualizarEtapa(token, etapa.id, !etapa.concluida);
      carregarDados();
    } catch (err) { Alert.alert('Erro', err.message); }
  };

  const handlePausarRetomar = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await pausarObra(token, id);
      carregarDados();
      refreshObras();
    } catch (err) { Alert.alert('Erro', err.message); }
  };

  const pickFile = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { Alert.alert('Permissão necessária'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 1 });
    if (!result.canceled && result.assets.length > 0) {
      try {
        const token = await AsyncStorage.getItem('token');
        await uploadDocumento(token, id, result.assets[0]);
        carregarDados();
      } catch (err) { Alert.alert('Erro', err.message); }
    }
  };

  const excluirDocumento = (docId) => {
    Alert.alert('Remover documento', 'Tem certeza?', [
      { text: 'Cancelar' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await deleteDocumento(token, id, docId);
            carregarDados();
          } catch (err) { Alert.alert('Erro', err.message); }
      }},
    ]);
  };

  const salvarMaterial = async () => {
    if (!materialForm.material.trim() || !materialForm.unidade_medida.trim()) return;
    try {
      const token = await AsyncStorage.getItem('token');
      if (editingMaterial) {
        await updateMaterial(token, editingMaterial.id, materialForm);
      } else {
        await addMaterial(token, id, materialForm);
      }
      setShowMaterialForm(false);
      setEditingMaterial(null);
      setMaterialForm({ material: '', unidade_medida: '' });
      carregarDados();
    } catch (err) { Alert.alert('Erro', err.message); }
  };

  const excluirMaterial = (matId) => {
    Alert.alert('Excluir material', 'Tem certeza?', [
      { text: 'Cancelar' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await deleteMaterial(token, matId);
            carregarDados();
          } catch (err) { Alert.alert('Erro', err.message); }
      }},
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#1e40af" style={{ flex: 1 }} />;
  if (!obra) return <Text style={{ textAlign: 'center', marginTop: 40 }}>Obra não encontrada</Text>;

  const progresso = obra.progresso || 0;
  const isPausada = obra.status === 'Pausada';
  const tabs = ['Planejamento', 'Execução', 'Finalização', 'Materiais', 'Diário de Obra', 'Documentos'];
  const unidades = ['un', 'pct', 'cx', 'sc', 'kg', 't', 'g', 'L', 'mL', 'm', 'm²', 'm³', 'rolo', 'barra', 'chapa', 'galão', 'balde', 'jogo', 'kit'];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <View style={styles.card}>
        <Text style={styles.obraNome}>{obra.nome}</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progresso}%` }]} />
          </View>
          <Text style={styles.progressText}>{progresso}%</Text>
        </View>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: getStatusColor(obra.status) }]}>
            <Text style={styles.badgeText}>{obra.status}</Text>
          </View>
          <Text style={styles.codigo}>Código: {obra.codigo}</Text>
        </View>
        <InfoRow label="Local" value={obra.localizacao} />
        <InfoRow label="Gestor" value={obra.gestor} />
        {obra.mestre_obra && <InfoRow label="Mestre" value={obra.mestre_obra} />}
        {isGestor && (
          <TouchableOpacity style={[styles.pausarBtn, isPausada ? styles.retomarBtn : styles.pausarBtnStyle]} onPress={handlePausarRetomar}>
            <Ionicons name={isPausada ? 'play' : 'pause'} size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 5 }}>{isPausada ? 'Retomar' : 'Pausar'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal style={{ marginVertical: 10, marginHorizontal: 12 }}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, aba === tab && styles.tabActive]} onPress={() => setAba(tab)}>
            <Text style={[styles.tabText, aba === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {aba === 'Documentos' ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Documentos</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickFile}>
            <Ionicons name="cloud-upload" size={20} color="#fff" />
            <Text style={{ color: '#fff', marginLeft: 5 }}>Anexar</Text>
          </TouchableOpacity>
          {documentos.map(doc => (
            <View key={doc.id} style={styles.docItem}>
              <Text style={{ flex: 1 }}>{doc.nome_original}</Text>
              <Text style={{ color: '#6b7280', marginRight: 10 }}>{(doc.tamanho / 1024).toFixed(1)} KB</Text>
              <TouchableOpacity onPress={() => excluirDocumento(doc.id)}>
                <Ionicons name="trash" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : aba === 'Materiais' ? (
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>Materiais</Text>
            <TouchableOpacity onPress={() => { setShowMaterialForm(!showMaterialForm); setEditingMaterial(null); setMaterialForm({ material: '', unidade_medida: '' }); }}>
              <Ionicons name="add-circle" size={24} color="#1e40af" />
            </TouchableOpacity>
          </View>
          {showMaterialForm && (
            <View style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <TextInput style={styles.input} placeholder="Material" value={materialForm.material} onChangeText={t => setMaterialForm({ ...materialForm, material: t })} />
              <Text style={styles.label}>Unidade</Text>
              <View style={styles.chipRow}>
                {unidades.map(u => (
                  <TouchableOpacity key={u} style={[styles.chip, materialForm.unidade_medida === u && styles.chipActive]} onPress={() => setMaterialForm({ ...materialForm, unidade_medida: u })}>
                    <Text style={[styles.chipText, materialForm.unidade_medida === u && styles.chipTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity style={styles.saveBtn} onPress={salvarMaterial}>
                  <Text style={{ color: '#fff' }}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowMaterialForm(false)}>
                  <Text>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {materiais.map(mat => (
            <View key={mat.id} style={styles.docItem}>
              <Text style={{ flex: 1 }}>{mat.material} ({mat.unidade_medida}) - {mat.quantidade}</Text>
              <TouchableOpacity onPress={() => { setEditingMaterial(mat); setMaterialForm({ material: mat.material, unidade_medida: mat.unidade_medida }); setShowMaterialForm(true); }}>
                <Ionicons name="pencil" size={18} color="#1e40af" style={{ marginRight: 12 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => excluirMaterial(mat.id)}>
                <Ionicons name="trash" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : aba === 'Diário de Obra' ? (
        <DiarioObra obra={obra} obraId={id} materiais={materiais} carregarMateriais={carregarDados} />
      ) : (
        <View style={styles.card}>
          {etapas.filter(e => e.categoria === aba).map(etapa => (
            <TouchableOpacity key={etapa.id} style={styles.etapaItem} onPress={() => toggleEtapa(etapa)} disabled={!isGestor}>
              <Ionicons name={etapa.concluida ? 'checkbox' : 'square-outline'} size={22} color={etapa.concluida ? '#10b981' : '#9ca3af'} />
              <Text style={[styles.etapaText, etapa.concluida && { textDecorationLine: 'line-through', color: '#9ca3af' }]}>{etapa.etapa}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
    <Text style={{ color: '#6b7280' }}>{label}:</Text>
    <Text style={{ fontWeight: '500' }}>{value}</Text>
  </View>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'Concluída': return '#10b981';
    case 'Em andamento': return '#1e40af';
    case 'Pausada': return '#f59e0b';
    default: return '#6b7280';
  }
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', margin: 12, padding: 16, borderRadius: 10, elevation: 2 },
  obraNome: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  progressBar: { flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4 },
  progressFill: { height: '100%', backgroundColor: '#1e40af' },
  progressText: { marginLeft: 10, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginRight: 10 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  codigo: { fontSize: 14, fontWeight: '500', backgroundColor: '#e5e7eb', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  pausarBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 10, borderRadius: 8, marginTop: 10 },
  pausarBtnStyle: { backgroundColor: '#f59e0b' },
  retomarBtn: { backgroundColor: '#10b981' },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: '#e5e7eb' },
  tabActive: { backgroundColor: '#1e40af' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#4b5563' },
  tabTextActive: { color: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  uploadBtn: { flexDirection: 'row', backgroundColor: '#1e40af', padding: 10, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
  docItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  etapaItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  etapaText: { marginLeft: 10, fontSize: 15 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 8, backgroundColor: '#fff' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: '#e5e7eb', marginRight: 6, marginBottom: 6 },
  chipActive: { backgroundColor: '#1e40af' },
  chipText: { fontSize: 12, color: '#374151' },
  chipTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: '#1e40af', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, marginRight: 10 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8 },
});

export default ObraDetalhesScreen;