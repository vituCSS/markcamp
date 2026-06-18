import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const MestreForm = ({ mestre, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cadastro_empresa: '',
    email: '',
    telefone: '',
  });

  useEffect(() => {
    if (mestre) {
      setFormData({
        nome: mestre.nome || '',
        cadastro_empresa: mestre.cadastro_empresa || '',
        email: mestre.email || '',
        telefone: mestre.telefone || '',
      });
    } else {
      setFormData({ nome: '', cadastro_empresa: '', email: '', telefone: '' });
    }
  }, [mestre]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{mestre ? 'Editar Mestre' : 'Novo Mestre'}</Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={formData.nome} onChangeText={(text) => handleChange('nome', text)} placeholder="Nome" />

      {!mestre ? (
        <>
          <Text style={styles.label}>Telefone</Text>
          <TextInput style={styles.input} value={formData.telefone} onChangeText={(text) => handleChange('telefone', text)} placeholder="Telefone" keyboardType="phone-pad" />
        </>
      ) : (
        <>
          <Text style={styles.label}>Cadastro na Empresa</Text>
          <TextInput style={styles.input} value={formData.cadastro_empresa} onChangeText={(text) => handleChange('cadastro_empresa', text)} placeholder="Cadastro" />
        </>
      )}

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={formData.email} onChangeText={(text) => handleChange('email', text)} placeholder="Email" keyboardType="email-address" />

      {mestre && (
        <>
          <Text style={styles.label}>Telefone</Text>
          <TextInput style={styles.input} value={formData.telefone} onChangeText={(text) => handleChange('telefone', text)} placeholder="Telefone" keyboardType="phone-pad" />
        </>
      )}

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>{mestre ? 'Atualizar' : 'Cadastrar'}</Text>
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

export default MestreForm;