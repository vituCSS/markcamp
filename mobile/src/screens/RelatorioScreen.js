import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { fetchObras, uploadDocumento } from '../api';

const RelatorioScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [obras, setObras] = useState([]);
  const [obraSelecionada, setObraSelecionada] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (user?.role !== 'mestre') {
      navigation.replace('Dashboard');
      return;
    }
    carregarObras();
  }, []);

  const carregarObras = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const data = await fetchObras(token);
      setObras(data);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar obras.');
    } finally {
      setLoading(false);
    }
  };

  const escolherObra = (obra) => {
    setObraSelecionada(obra);
    setArquivo(null);
  };

  const pickFile = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { Alert.alert('Permissão necessária'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setArquivo(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!arquivo || !obraSelecionada) {
      Alert.alert('Atenção', 'Selecione uma obra e um arquivo.');
      return;
    }
    setEnviando(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await uploadDocumento(token, obraSelecionada.id, arquivo);
      Alert.alert('Sucesso', 'Documento enviado!');
      setArquivo(null);
      setObraSelecionada(null);
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao enviar.');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="journal" size={40} color="#1e40af" />
        <Text style={styles.title}>Registrar Relatório</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Selecione a obra</Text>
        {obras.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma obra disponível.</Text>
        ) : (
          obras.map((obra) => (
            <TouchableOpacity
              key={obra.id}
              style={[styles.obraItem, obraSelecionada?.id === obra.id && styles.obraItemActive]}
              onPress={() => escolherObra(obra)}
            >
              <Ionicons name="business-outline" size={20} color={obraSelecionada?.id === obra.id ? '#fff' : '#374151'} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.obraNome, obraSelecionada?.id === obra.id && styles.obraNomeActive]}>{obra.nome}</Text>
                <Text style={styles.obraCodigo}>{obra.codigo || 'Sem código'}</Text>
              </View>
              {obraSelecionada?.id === obra.id && <Ionicons name="checkmark-circle" size={22} color="#fff" />}
            </TouchableOpacity>
          ))
        )}
      </View>

      {obraSelecionada && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Anexar arquivo</Text>
          <TouchableOpacity style={styles.pickButton} onPress={pickFile}>
            <Ionicons name="attach" size={20} color="#1e40af" />
            <Text style={styles.pickButtonText}>
              {arquivo ? arquivo.fileName || 'Arquivo selecionado' : 'Escolher arquivo'}
            </Text>
          </TouchableOpacity>
          {arquivo && (
            <Text style={styles.fileInfo}>
              Tipo: {arquivo.mimeType || 'desconhecido'} - Tamanho:{' '}
              {arquivo.fileSize ? `${(arquivo.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
            </Text>
          )}
          <TouchableOpacity
            style={[styles.uploadButton, (!arquivo || enviando) && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={!arquivo || enviando}
          >
            {enviando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={20} color="#fff" />
                <Text style={styles.uploadButtonText}> Enviar Documento/Foto</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginVertical: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e40af', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 15, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  obraItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  obraItemActive: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  obraNome: { fontSize: 15, fontWeight: '500', color: '#1f2937' },
  obraNomeActive: { color: '#fff' },
  obraCodigo: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 10 },
  pickButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e7ff', padding: 12, borderRadius: 8, marginBottom: 8 },
  pickButtonText: { marginLeft: 8, color: '#1e40af', fontWeight: '600' },
  fileInfo: { fontSize: 12, color: '#6b7280', marginBottom: 12, marginLeft: 4 },
  uploadButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e40af', padding: 14, borderRadius: 8 },
  uploadButtonDisabled: { backgroundColor: '#9ca3af' },
  uploadButtonText: { color: '#fff', fontWeight: '600', fontSize: 16, marginLeft: 5 },
});

export default RelatorioScreen;