import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const GestorForm = ({ gestor, onSubmit, onCancel }) => {
  const [nome, setNome] = useState('');
  const [cadastroEmpresa, setCadastroEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  useEffect(() => {
    if (gestor) {
      setNome(gestor.nome || '');
      setCadastroEmpresa(gestor.cadastro_empresa || '');
      setEmail(gestor.email || '');
      setTelefone(gestor.telefone || '');
    }
  }, [gestor]);

  const handleSubmit = () => {
    if (!nome.trim()) return;
    if (gestor) {
      onSubmit({ nome, cadastro_empresa: cadastroEmpresa, email, telefone });
    } else {
      onSubmit({ nome, email, telefone });
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{gestor ? 'Editar Gestor' : 'Novo Gestor'}</Text>

      <Text style={styles.label}>Nome Completo</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome" />

      {gestor && (
        <>
          <Text style={styles.label}>Cadastro na Empresa</Text>
          <TextInput style={styles.input} value={cadastroEmpresa} onChangeText={setCadastroEmpresa} placeholder="Cadastro" />
        </>
      )}

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="Email" />

      <Text style={styles.label}>Telefone</Text>
      <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="(11) 99999-9999" />

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>{gestor ? 'Atualizar' : 'Salvar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, margin: 12, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, backgroundColor: '#f9fafb', fontSize: 15, marginBottom: 8 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  submitBtn: { backgroundColor: '#1e40af', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginRight: 10 },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  cancelBtnText: { color: '#6b7280', fontWeight: '600', fontSize: 14 },
});

export default GestorForm;