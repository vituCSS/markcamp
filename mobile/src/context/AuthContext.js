import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchObras, fetchGestores, fetchMestres } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [obras, setObras] = useState([]);
  const [gestores, setGestores] = useState([]);
  const [mestres, setMestres] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const savedUser = await AsyncStorage.getItem('user');
        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Erro ao carregar sessão:', err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      carregarDados(user);
    }
  }, [isAuthenticated, user]);

  const carregarDados = async (currentUser) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const obrasData = await fetchObras(token);
      setObras(obrasData);
      if (currentUser.role === 'gestor') {
        const gestoresData = await fetchGestores(token);
        setGestores(gestoresData);
        const mestresData = await fetchMestres(token);
        setMestres(mestresData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleLogin = async (userData, token) => {
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Erro ao salvar sessão:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (err) {
      console.error('Erro ao remover sessão:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setObras([]);
      setGestores([]);
      setMestres([]);
    }
  };

  const refreshObras = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    const obrasData = await fetchObras(token);
    setObras(obrasData);
  };

  return (
    <AuthContext.Provider
      value={{
        obras,
        setObras,
        gestores,
        setGestores,
        mestres,
        setMestres,
        isAuthenticated,
        user,
        handleLogin,
        handleLogout,
        carregarDados,
        refreshObras,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);