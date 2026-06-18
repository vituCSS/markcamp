import { downloadAsync, documentDirectory } from 'expo-file-system/legacy';

const BASE_URL = 'http://192.168.1.240:5000/api';

const req = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(err.error || 'Erro na requisição');
  }
  return res.json();
};

// Obras
export const fetchObras = (token) =>
  req(`${BASE_URL}/obras`, { headers: { Authorization: `Bearer ${token}` } });

export const fetchObraPorId = (token, id) =>
  req(`${BASE_URL}/obras/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export const addObra = (token, obra) =>
  req(`${BASE_URL}/obras`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(obra),
  });

export const updateObra = (token, id, obra) =>
  req(`${BASE_URL}/obras/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(obra),
  });

export const deleteObra = (token, id) =>
  req(`${BASE_URL}/obras/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });

export const pausarObra = (token, id) =>
  req(`${BASE_URL}/obras/${id}/pausar`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });

// Etapas
export const fetchEtapas = (token, obraId) =>
  req(`${BASE_URL}/obras/${obraId}/etapas`, { headers: { Authorization: `Bearer ${token}` } });

export const atualizarEtapa = (token, etapaId, concluida) =>
  req(`${BASE_URL}/obras/etapas/${etapaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ concluida }),
  });

// Documentos
export const fetchDocumentos = (token, obraId) =>
  req(`${BASE_URL}/obras/${obraId}/documentos`, { headers: { Authorization: `Bearer ${token}` } });

export const uploadDocumento = async (token, obraId, file) => {
  const formData = new FormData();
  formData.append('arquivo', {
    uri: file.uri,
    type: file.mimeType || 'image/jpeg',
    name: file.fileName || 'upload.jpg',
  });
  return req(`${BASE_URL}/obras/${obraId}/documentos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    body: formData,
  });
};

export const deleteDocumento = (token, obraId, docId) =>
  req(`${BASE_URL}/obras/${obraId}/documentos/${docId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

// Materiais
export const fetchMateriais = (token, obraId) =>
  req(`${BASE_URL}/materiais/${obraId}`, { headers: { Authorization: `Bearer ${token}` } });

export const addMaterial = (token, obraId, material) =>
  req(`${BASE_URL}/materiais`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ obra_id: obraId, ...material }),
  });

export const updateMaterial = (token, materialId, material) =>
  req(`${BASE_URL}/materiais/${materialId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(material),
  });

export const deleteMaterial = (token, materialId) =>
  req(`${BASE_URL}/materiais/${materialId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });

// Itens em falta
export const fetchItensEmFalta = async (token) => {
  const res = await fetch(`${BASE_URL}/materiais/abaixo-minimo/todos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

// Gestores / Mestres
export const fetchGestores = (token) =>
  req(`${BASE_URL}/gestores`, { headers: { Authorization: `Bearer ${token}` } });

export const fetchMestres = (token) =>
  req(`${BASE_URL}/classes-mestre`, { headers: { Authorization: `Bearer ${token}` } });

export const addMestre = (token, mestre) =>
  req(`${BASE_URL}/classes-mestre`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(mestre),
  });

export const updateMestre = (token, id, mestre) =>
  req(`${BASE_URL}/classes-mestre/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(mestre),
  });

export const deleteMestre = (token, id) =>
  req(`${BASE_URL}/classes-mestre/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });

// Auth
export const login = (email, password) =>
  req(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

export const register = (nome, email, password, role) =>
  req(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, password, role }),
  });

export const loginCodigo = (codigo) =>
  req(`${BASE_URL}/auth/login/codigo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo }),
  });

// Relatório PDF
export const downloadRelatorio = async (token, obraId) => {
  const url = `${BASE_URL}/obras/${obraId}/relatorio`;
  const fileUri = documentDirectory + `relatorio-obra-${obraId}.pdf`;

  const res = await downloadAsync(url, fileUri, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status !== 200) throw new Error('Erro ao baixar relatório');
  return res.uri;
};

// Notificação de primeiro acesso
export const notificarAcesso = async (token, usuario, email, role) => {
  await fetch(`${BASE_URL}/dashboard/acesso`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ usuario, email, role }),
  });
};