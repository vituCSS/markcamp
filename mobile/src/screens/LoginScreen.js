import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { login, register, loginCodigo } from '../api';

const LoginScreen = () => {
  const { handleLogin } = useAuth();
  const [tipo, setTipo] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const [modo, setModo] = useState('login');

  const handleSubmit = async () => {
    try {
      if (tipo === 'cliente') {
        if (!codigo.trim()) {
          Alert.alert('Erro', 'Informe o código da obra.');
          return;
        }
        const data = await loginCodigo(codigo);
        await handleLogin(data.user, data.token);
        return;
      }

      if (!email.trim() || !password.trim()) {
        Alert.alert('Erro', 'Preencha email e senha.');
        return;
      }

      let data;
      if (modo === 'register') {
        if (!nome.trim()) {
          Alert.alert('Erro', 'Informe seu nome.');
          return;
        }
        data = await register(nome, email, password, tipo);
      } else {
        data = await login(email, password);
      }

      await handleLogin(data.user, data.token);
    } catch (err) {
      Alert.alert('Erro', err.message || 'Erro desconhecido');
    }
  };

  if (!tipo) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Ionicons name="business" size={60} color="#1e40af" style={styles.logo} />
          <Text style={styles.title}>Markcamp</Text>
          <Text style={styles.subtitle}>Gestão Inteligente de Obras</Text>
          <Text style={styles.question}>Como deseja acessar?</Text>

          <TouchableOpacity style={styles.btnPrimary} onPress={() => setTipo('gestor')}>
            <Ionicons name="person" size={20} color="#fff" />
            <Text style={styles.btnText}>Sou Gestor de Obras</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSuccess} onPress={() => setTipo('mestre')}>
            <Ionicons name="construct" size={20} color="#fff" />
            <Text style={styles.btnText}>Sou Mestre de Obras</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnInfo} onPress={() => setTipo('cliente')}>
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.btnText}>Acompanhar Obra</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (tipo === 'cliente') {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Ionicons name="search" size={50} color="#1e40af" style={styles.logo} />
            <Text style={styles.title}>Acompanhar Obra</Text>
            <Text style={styles.subtitle}>Informe o código fornecido pelo responsável</Text>
            <TextInput style={styles.input} placeholder="Código da obra" value={codigo} onChangeText={setCodigo} autoCapitalize="characters" />
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
              <Text style={styles.btnText}>Acessar obra</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOutline} onPress={() => setTipo('')}>
              <Text style={styles.btnOutlineText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Ionicons name="person-circle" size={60} color="#1e40af" style={styles.logo} />
          <Text style={styles.title}>{modo === 'register' ? 'Cadastro' : 'Login'}</Text>
          <Text style={styles.subtitle}>{tipo === 'gestor' ? 'Gestor' : 'Mestre'}</Text>

          {modo === 'register' && (
            <TextInput style={styles.input} placeholder="Nome completo" value={nome} onChangeText={setNome} />
          )}

          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
            <Text style={styles.btnText}>{modo === 'register' ? 'Cadastrar' : 'Entrar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnOutline} onPress={() => setModo(modo === 'login' ? 'register' : 'login')}>
            <Text style={styles.btnOutlineText}>{modo === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnOutline} onPress={() => setTipo('')}>
            <Text style={styles.btnOutlineText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 30, width: '100%', maxWidth: 400, alignItems: 'center', elevation: 5 },
  logo: { marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e40af' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  question: { fontSize: 16, color: '#333', marginBottom: 15 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  btnPrimary: { flexDirection: 'row', backgroundColor: '#1e40af', padding: 15, borderRadius: 8, width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  btnSuccess: { flexDirection: 'row', backgroundColor: '#10b981', padding: 15, borderRadius: 8, width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  btnInfo: { flexDirection: 'row', backgroundColor: '#06b6d4', padding: 15, borderRadius: 8, width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  btnOutline: { padding: 12, marginTop: 5 },
  btnOutlineText: { color: '#1e40af', fontSize: 14 },
});

export default LoginScreen;