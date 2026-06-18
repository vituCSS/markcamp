import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DiarioObra = ({ obra, obraId, materiais = [], carregarMateriais }) => {
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [diarioAtual, setDiarioAtual] = useState({
    id: null, hora_inicio: '', hora_fim: '', clima: '', interferencia_clima: '',
  });
  const [atividadeDescricao, setAtividadeDescricao] = useState('');
  const [atividadeStatus, setAtividadeStatus] = useState('Pendente');
  const [ocorrenciaTexto, setOcorrenciaTexto] = useState('');
  const [materialRecebido, setMaterialRecebido] = useState('');
  const [quantidadeRecebida, setQuantidadeRecebida] = useState('');
  const [materialConsumido, setMaterialConsumido] = useState('');
  const [quantidadeConsumida, setQuantidadeConsumida] = useState('');
  const [atividades, setAtividades] = useState([]);
  const [materiaisDiario, setMateriaisDiario] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDia, setTempDia] = useState('');
  const [tempMes, setTempMes] = useState('');
  const [tempAno, setTempAno] = useState('');

  const BASE_URL = 'http://192.168.1.240:5000/api';

  const formatDateToAPI = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateToDisplay = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const carregarDiario = async (date) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const dataStr = formatDateToAPI(date);
      const res = await fetch(`${BASE_URL}/diario/${obraId}/${dataStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dados = await res.json();
      if (dados && dados.id) {
        setDiarioAtual({
          id: dados.id, hora_inicio: dados.hora_inicio || '', hora_fim: dados.hora_fim || '',
          clima: dados.clima || '', interferencia_clima: dados.interferencia_clima || '',
        });
        setAtividades(dados.atividades || []);
        setMateriaisDiario(dados.materiais || []);
        setOcorrencias(dados.ocorrencias || []);
      } else {
        setDiarioAtual({ id: null, hora_inicio: '', hora_fim: '', clima: '', interferencia_clima: '' });
        setAtividades([]);
        setMateriaisDiario([]);
        setOcorrencias([]);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const salvarDiario = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/diario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          obra_id: obraId,
          data_diario: formatDateToAPI(dataSelecionada),
          hora_inicio: diarioAtual.hora_inicio,
          hora_fim: diarioAtual.hora_fim,
          clima: diarioAtual.clima,
          interferencia_clima: diarioAtual.interferencia_clima,
        }),
      });
      const resultado = await res.json();
      setDiarioAtual(prev => ({ ...prev, id: resultado.id }));
      Alert.alert('Sucesso', 'Informações gerais salvas.');
      carregarDiario(dataSelecionada);
      return resultado.id;
    } catch (err) { Alert.alert('Erro', 'Não foi possível salvar.'); }
  };

  useEffect(() => { carregarDiario(dataSelecionada); }, [dataSelecionada]);

  const changeDate = (days) => {
    const newDate = new Date(dataSelecionada);
    newDate.setDate(newDate.getDate() + days);
    setDataSelecionada(newDate);
  };

  const openDatePicker = () => {
    setTempDia(String(new Date(dataSelecionada).getDate()));
    setTempMes(String(new Date(dataSelecionada).getMonth() + 1));
    setTempAno(String(new Date(dataSelecionada).getFullYear()));
    setShowDatePicker(true);
  };

  const confirmDate = () => {
    const dia = parseInt(tempDia, 10);
    const mes = parseInt(tempMes, 10) - 1;
    const ano = parseInt(tempAno, 10);
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) {
      Alert.alert('Data inválida');
      return;
    }
    const newDate = new Date(ano, mes, dia);
    if (newDate.getDate() !== dia || newDate.getMonth() !== mes || newDate.getFullYear() !== ano) {
      Alert.alert('Data inválida');
      return;
    }
    setDataSelecionada(newDate);
    setShowDatePicker(false);
  };

  const adicionarAtividade = async () => {
    if (!atividadeDescricao.trim()) { Alert.alert('Atenção', 'Descreva a atividade.'); return; }
    try {
      let diarioId = diarioAtual.id;
      if (!diarioId) diarioId = await salvarDiario();
      if (!diarioId) return;
      const token = await AsyncStorage.getItem('token');
      await fetch(`${BASE_URL}/diario/${diarioId}/atividade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ descricao: atividadeDescricao, status: atividadeStatus }),
      });
      setAtividadeDescricao(''); setAtividadeStatus('Pendente');
      carregarDiario(dataSelecionada);
    } catch (err) { Alert.alert('Erro', 'Falha ao adicionar atividade.'); }
  };

  const excluirAtividade = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${BASE_URL}/diario/atividade/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      carregarDiario(dataSelecionada);
    } catch (err) { Alert.alert('Erro', 'Falha ao excluir atividade.'); }
  };

  const adicionarMaterial = async (tipo) => {
    const materialId = tipo === 'recebido' ? materialRecebido : materialConsumido;
    const quantidade = tipo === 'recebido' ? quantidadeRecebida : quantidadeConsumida;
    if (!materialId || !quantidade) { Alert.alert('Atenção', 'Selecione o material e informe a quantidade.'); return; }
    try {
      let diarioId = diarioAtual.id;
      if (!diarioId) diarioId = await salvarDiario();
      if (!diarioId) return;
      const token = await AsyncStorage.getItem('token');
      await fetch(`${BASE_URL}/diario/${diarioId}/material`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ material_id: Number(materialId), quantidade: Number(quantidade), tipo }),
      });
      setMaterialRecebido(''); setQuantidadeRecebida('');
      setMaterialConsumido(''); setQuantidadeConsumida('');
      carregarDiario(dataSelecionada);
      if (carregarMateriais) carregarMateriais();
    } catch (err) { Alert.alert('Erro', 'Falha ao adicionar material.'); }
  };

  const excluirMaterial = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${BASE_URL}/diario/material/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      carregarDiario(dataSelecionada);
    } catch (err) { Alert.alert('Erro', 'Falha ao excluir material.'); }
  };

  const adicionarOcorrencia = async () => {
    if (!ocorrenciaTexto.trim()) { Alert.alert('Atenção', 'Descreva a ocorrência.'); return; }
    try {
      let diarioId = diarioAtual.id;
      if (!diarioId) diarioId = await salvarDiario();
      if (!diarioId) return;
      const token = await AsyncStorage.getItem('token');
      await fetch(`${BASE_URL}/diario/${diarioId}/ocorrencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ descricao: ocorrenciaTexto }),
      });
      setOcorrenciaTexto('');
      carregarDiario(dataSelecionada);
    } catch (err) { Alert.alert('Erro', 'Falha ao adicionar ocorrência.'); }
  };

  const excluirOcorrencia = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${BASE_URL}/diario/ocorrencia/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      carregarDiario(dataSelecionada);
    } catch (err) { Alert.alert('Erro', 'Falha ao excluir ocorrência.'); }
  };

  if (loading) return <ActivityIndicator size="large" color="#1e40af" style={{ marginTop: 20 }} />;

  const climaOptions = ['☀️ Ensolarado', '🌤️ Parcialmente nublado', '☁️ Nublado', '🌦️ Chuva fraca', '🌧️ Chuva moderada', '⛈️ Chuva forte / tempestade'];
  const interferenciaOptions = ['Não', 'Sim, parcialmente', 'Sim, totalmente'];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Diário de Obra</Text>

      <View style={styles.dateRow}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateArrow}>
          <Ionicons name="chevron-back" size={24} color="#1e40af" />
        </TouchableOpacity>
        <TouchableOpacity onPress={openDatePicker} style={styles.dateButton}>
          <Ionicons name="calendar" size={20} color="#1e40af" />
          <Text style={styles.dateText}>{formatDateToDisplay(dataSelecionada)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateArrow}>
          <Ionicons name="chevron-forward" size={24} color="#1e40af" />
        </TouchableOpacity>
      </View>

      <Modal visible={showDatePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Digite a data</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Dia</Text>
                <TextInput style={styles.input} value={tempDia} onChangeText={setTempDia} keyboardType="numeric" maxLength={2} placeholder="DD" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Mês</Text>
                <TextInput style={styles.input} value={tempMes} onChangeText={setTempMes} keyboardType="numeric" maxLength={2} placeholder="MM" />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={styles.label}>Ano</Text>
                <TextInput style={styles.input} value={tempAno} onChangeText={setTempAno} keyboardType="numeric" maxLength={4} placeholder="AAAA" />
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveBtn} onPress={confirmDate}>
                <Text style={{ color: '#fff' }}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDatePicker(false)}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Hora Início</Text>
          <TextInput style={styles.input} value={diarioAtual.hora_inicio} onChangeText={t => setDiarioAtual({ ...diarioAtual, hora_inicio: t })} placeholder="HH:MM" keyboardType="numbers-and-punctuation" />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Hora Fim</Text>
          <TextInput style={styles.input} value={diarioAtual.hora_fim} onChangeText={t => setDiarioAtual({ ...diarioAtual, hora_fim: t })} placeholder="HH:MM" keyboardType="numbers-and-punctuation" />
        </View>
      </View>

      <Text style={styles.label}>Mestre de Obras</Text>
      <TextInput style={styles.input} value={obra?.mestre_obra || ''} editable={false} />

      <Text style={styles.label}>Condição Climática</Text>
      <View style={styles.chipRow}>
        {climaOptions.map(opt => (
          <TouchableOpacity key={opt} style={[styles.chip, diarioAtual.clima === opt && styles.chipActive]} onPress={() => setDiarioAtual({ ...diarioAtual, clima: opt })}>
            <Text style={[styles.chipText, diarioAtual.clima === opt && styles.chipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Clima interferiu nas atividades?</Text>
      <View style={styles.chipRow}>
        {interferenciaOptions.map(opt => (
          <TouchableOpacity key={opt} style={[styles.chip, diarioAtual.interferencia_clima === opt && styles.chipActive]} onPress={() => setDiarioAtual({ ...diarioAtual, interferencia_clima: opt })}>
            <Text style={[styles.chipText, diarioAtual.interferencia_clima === opt && styles.chipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={salvarDiario}>
        <Ionicons name="save" size={18} color="#fff" />
        <Text style={styles.saveButtonText}> Salvar Informações Gerais</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.subtitle}>Atividades Executadas</Text>
      <View style={styles.row}>
        <View style={styles.flex1}>
          <TextInput style={styles.input} value={atividadeDescricao} onChangeText={setAtividadeDescricao} placeholder="Descrição da atividade" />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={adicionarAtividade}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.chipRow}>
        {['Pendente', 'Concluída'].map(s => (
          <TouchableOpacity key={s} style={[styles.chip, atividadeStatus === s && styles.chipActive]} onPress={() => setAtividadeStatus(s)}>
            <Text style={[styles.chipText, atividadeStatus === s && styles.chipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {atividades.map(a => (
        <View key={a.id} style={styles.listItem}>
          <Text style={{ flex: 1 }}>{a.descricao}</Text>
          <Text style={{ color: a.status === 'Concluída' ? '#10b981' : '#f59e0b', marginRight: 10 }}>{a.status}</Text>
          <TouchableOpacity onPress={() => excluirAtividade(a.id)}>
            <Ionicons name="trash" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.divider} />

      <Text style={styles.subtitle}>Materiais Recebidos</Text>
      <View style={styles.pickerRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {materiais.map(mat => (
            <TouchableOpacity key={mat.id} style={[styles.chip, materialRecebido === String(mat.id) && styles.chipActive]} onPress={() => setMaterialRecebido(String(mat.id))}>
              <Text style={[styles.chipText, materialRecebido === String(mat.id) && styles.chipTextActive]}>{mat.material}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.row}>
        <View style={styles.flex1}>
          <TextInput style={styles.input} value={quantidadeRecebida} onChangeText={setQuantidadeRecebida} placeholder="Quantidade" keyboardType="decimal-pad" />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => adicionarMaterial('recebido')}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Materiais Consumidos</Text>
      <View style={styles.pickerRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {materiais.map(mat => (
            <TouchableOpacity key={mat.id} style={[styles.chip, materialConsumido === String(mat.id) && styles.chipActive]} onPress={() => setMaterialConsumido(String(mat.id))}>
              <Text style={[styles.chipText, materialConsumido === String(mat.id) && styles.chipTextActive]}>{mat.material}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.row}>
        <View style={styles.flex1}>
          <TextInput style={styles.input} value={quantidadeConsumida} onChangeText={setQuantidadeConsumida} placeholder="Quantidade" keyboardType="decimal-pad" />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => adicionarMaterial('consumido')}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      {materiaisDiario.map(m => (
        <View key={m.id} style={styles.listItem}>
          <Text style={{ flex: 1 }}>{m.material} - {m.quantidade} {m.unidade_medida} ({m.tipo})</Text>
          <TouchableOpacity onPress={() => excluirMaterial(m.id)}>
            <Ionicons name="trash" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.divider} />

      <Text style={styles.subtitle}>Ocorrências e Problemas</Text>
      <View style={styles.row}>
        <View style={styles.flex1}>
          <TextInput style={[styles.input, styles.textArea]} value={ocorrenciaTexto} onChangeText={setOcorrenciaTexto} placeholder="Descreva a ocorrência" multiline numberOfLines={3} />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={adicionarOcorrencia}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      {ocorrencias.map(o => (
        <View key={o.id} style={styles.listItem}>
          <Text style={{ flex: 1 }}>{o.descricao}</Text>
          <TouchableOpacity onPress={() => excluirOcorrencia(o.id)}>
            <Ionicons name="trash" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e40af', marginBottom: 12 },
  subtitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginTop: 12, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, backgroundColor: '#fff', marginBottom: 8, fontSize: 14 },
  textArea: { height: 80, textAlignVertical: 'top' },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  dateArrow: { padding: 8 },
  dateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e7ff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginHorizontal: 10 },
  dateText: { fontSize: 16, fontWeight: '600', color: '#1e40af', marginLeft: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  flex1: { flex: 1, marginRight: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  pickerRow: { marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#e5e7eb', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#1e40af' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextActive: { color: '#fff' },
  saveButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10b981', padding: 12, borderRadius: 8, justifyContent: 'center', marginVertical: 10 },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 15, marginLeft: 5 },
  addBtn: { backgroundColor: '#1e40af', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  saveBtn: { backgroundColor: '#1e40af', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginRight: 10 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10 },
});

export default DiarioObra;