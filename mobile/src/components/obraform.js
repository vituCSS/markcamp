import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addObra, updateObra } from '../api';
import { useAuth } from '../context/AuthContext';

const ObraForm = ({ obra, onClose, onSuccess }) => {
  const { gestores, mestres } = useAuth();

  const [nome, setNome] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [gestor, setGestor] = useState('');
  const [mestreObra, setMestreObra] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [orcamento, setOrcamento] = useState('');

  const [showGestorPicker, setShowGestorPicker] = useState(false);
  const [showMestrePicker, setShowMestrePicker] = useState(false);

  const listaGestores = Array.isArray(gestores) ? gestores : [];
  const listaMestres = Array.isArray(mestres) ? mestres : [];

  useEffect(() => {
    if (obra) {
      setNome(obra.nome || '');
      setLocalizacao(obra.localizacao || '');
      setGestor(obra.gestor || '');
      setMestreObra(obra.mestre_obra || '');
      setDescricao(obra.descricao || '');
      setDataInicio(obra.dataInicio || '');
      setDataFim(obra.dataFim || '');
      setOrcamento(obra.orcamento ? obra.orcamento.toString() : '');
    }
  }, [obra]);

  const handleSubmit = async () => {
    if (!nome.trim() || !localizacao.trim() || !gestor) {
      Alert.alert('Erro', 'Nome, localização e gestor são obrigatórios.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const payload = {
        nome, localizacao, gestor,
        mestre_obra: mestreObra || null,
        descricao,
        dataInicio: dataInicio || null,
        dataFim: dataFim || null,
        orcamento: orcamento || 0,
      };
      if (obra) {
        await updateObra(token, obra.id, payload);
      } else {
        await addObra(token, payload);
      }
      Alert.alert('Sucesso', obra ? 'Obra atualizada.' : 'Obra criada.');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{obra ? 'Editar Obra' : 'Nova Obra'}</Text>

      <Text style={styles.label}>Nome da Obra</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome" />

      <Text style={styles.label}>Localização</Text>
      <TextInput style={styles.input} value={localizacao} onChangeText={setLocalizacao} placeholder="Localização" />

      <Text style={styles.label}>Gestor Responsável</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setShowGestorPicker(true)}>
        <Text style={gestor ? styles.pickerText : styles.pickerPlaceholder}>{gestor || 'Selecione um gestor'}</Text>
        <Ionicons name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>

      <Text style={styles.label}>Mestre de Obras (opcional)</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setShowMestrePicker(true)}>
        <Text style={mestreObra ? styles.pickerText : styles.pickerPlaceholder}>{mestreObra || 'Selecione um mestre'}</Text>
        <Ionicons name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>

      <Text style={styles.label}>Orçamento (R$)</Text>
      <TextInput style={styles.input} value={orcamento} onChangeText={setOrcamento} keyboardType="decimal-pad" placeholder="0.00" />

      <Text style={styles.label}>Descrição</Text>
      <TextInput style={[styles.input, styles.textArea]} value={descricao} onChangeText={setDescricao} multiline numberOfLines={3} placeholder="Descrição" />

      <Text style={styles.label}>Data de Início</Text>
      <TextInput style={styles.input} value={dataInicio} onChangeText={setDataInicio} placeholder="AAAA-MM-DD" />

      <Text style={styles.label}>Data de Conclusão Prevista</Text>
      <TextInput style={styles.input} value={dataFim} onChangeText={setDataFim} placeholder="AAAA-MM-DD" />

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Ionicons name="save" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>{obra ? 'Atualizar' : 'Salvar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showGestorPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Gestor</Text>
            <FlatList
              data={listaGestores}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { setGestor(item.nome); setShowGestorPicker(false); }}>
                  <Text style={styles.modalItemText}>{item.nome} - {item.cadastro_empresa}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowGestorPicker(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: '#6b7280', textAlign: 'center' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showMestrePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Mestre</Text>
            <TouchableOpacity style={styles.modalItem} onPress={() => { setMestreObra(''); setShowMestrePicker(false); }}>
              <Text style={styles.modalItemText}>Nenhum</Text>
            </TouchableOpacity>
            <FlatList
              data={listaMestres}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { setMestreObra(item.nome); setShowMestrePicker(false); }}>
                  <Text style={styles.modalItemText}>{item.nome}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowMestrePicker(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: '#6b7280', textAlign: 'center' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e40af', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, backgroundColor: '#fff', fontSize: 15, marginBottom: 6 },
  textArea: { height: 80, textAlignVertical: 'top' },
  pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, backgroundColor: '#fff', marginBottom: 6 },
  pickerText: { fontSize: 15, color: '#1f2937' },
  pickerPlaceholder: { fontSize: 15, color: '#9ca3af' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e40af', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, flex: 2, justifyContent: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16, marginLeft: 6 },
  cancelBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { color: '#6b7280', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  modalItemText: { fontSize: 16, color: '#1f2937' },
});

export default ObraForm;