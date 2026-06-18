import React, { useState } from 'react';
import './login.css';

const Login = ({ onLogin }) => {
  const [tipo, setTipo] = useState(''); // 'gestor', 'mestre', 'cliente'
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const [modo, setModo] = useState('login'); // 'login' ou 'register'
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    // Se for cliente, usa a rota de login por código
    if (tipo === 'cliente') {
      try {
        const res = await fetch('http://localhost:5000/api/auth/login/codigo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codigo })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro desconhecido');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } catch (err) {
        setErro(err.message);
      }
      return;
    }

    // Gestor ou mestre: login/registro normal
    const url = modo === 'register' 
      ? 'http://localhost:5000/api/auth/register'
      : 'http://localhost:5000/api/auth/login';
    const body = modo === 'register' 
      ? { nome, email, password, role: tipo }
      : { email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro desconhecido');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setErro(err.message);
    }
  };

  if (!tipo) {
    return (
      <div className="login-container">
        <div className="login-card">

          <div className="login-header">
            <div className="login-logo">
              <i className="bi bi-building"></i>
            </div>

            <h1>Markcamp</h1>

            <p>
              Gestão Inteligente de Obras
            </p>
          </div>

          <h5 className="text-center mb-4">
            Como deseja acessar?
          </h5>

          <div className="d-grid gap-3">

            <button
              className="btn btn-primary btn-lg"
              onClick={() => setTipo('gestor')}
            >
              Sou Gestor de Obras
            </button>

            <button
              className="btn btn-success btn-lg"
              onClick={() => setTipo('mestre')}
            >
              Sou Mestre de Obras
            </button>

            <button
              className="btn btn-info btn-lg"
              onClick={() => setTipo('cliente')}
            >
              Acompanhar Obra
            </button>

          </div>

        </div>
      </div>
    );
  }

  // Se for cliente, mostra apenas campo de código
  if (tipo === 'cliente') {
  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-header">
          <div className="login-logo">
            <i className="bi bi-search"></i>
          </div>

          <h2>Acompanhar Obra</h2>

          <p>
            Informe o código fornecido pelo responsável
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-3"
            placeholder="Código da obra"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            required
          />

          {erro && (
            <div className="alert alert-danger">
              {erro}
            </div>
          )}

          <button
            className="btn btn-primary w-100"
            type="submit"
          >
            Acessar obra
          </button>
        </form>

        <div className="login-links">
          <button
            className="btn btn-secondary"
            onClick={() => setTipo('')}
          >
            Voltar
          </button>
        </div>

      </div>
    </div>
  );
}

  // Gestor ou mestre: formulário de login/registro
  return (
  <div className="login-container">
    <div className="login-card">

      <div className="login-header">
        <div className="login-logo">
          <i className="bi bi-person-circle"></i>
        </div>

        <h2>
          {modo === 'register'
            ? 'Cadastro'
            : 'Login'}
        </h2>

        <p>
          {tipo.charAt(0).toUpperCase() +
            tipo.slice(1)}
        </p>
      </div>

      <form onSubmit={handleSubmit}>

        {modo === 'register' && (
          <input
            className="form-control mb-3"
            placeholder="Nome completo"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
          />
        )}

        <input
          className="form-control mb-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          className="form-control mb-3"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {erro && (
          <div className="alert alert-danger">
            {erro}
          </div>
        )}

        <button
          className="btn btn-primary w-100"
          type="submit"
        >
          {modo === 'register'
            ? 'Cadastrar'
            : 'Entrar'}
        </button>

      </form>

      <div className="login-links">

        <button
          className="btn btn-outline-primary"
          onClick={() =>
            setModo(
              modo === 'login'
                ? 'register'
                : 'login'
            )
          }
        >
          {modo === 'login'
            ? 'Cadastrar'
            : 'Fazer login'}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => setTipo('')}
        >
          Voltar
        </button>

      </div>

    </div>
  </div>
);
};

export default Login;