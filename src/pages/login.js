import React, { useState } from 'react';
import './login.css';

const Login = ({ onLogin }) => {
<<<<<<< HEAD
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
=======
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.message || 'Erro ao fazer login');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <i className="bi bi-building"></i>
          </div>
          <h1>MARKCAMP</h1>
          <p>Sistema de Gestão de Obras</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Senha</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 login-btn">
            <i className="bi bi-box-arrow-in-right"></i> Entrar
          </button>
        </form>

        <div className="login-footer">
          <small>Acesso restrito a gestores autorizados</small>
        </div>
      </div>
    </div>
  );
>>>>>>> 594784b01a8965604b7340eeb0c0a5c27df0bf89
};

export default Login;