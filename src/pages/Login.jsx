import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { usuario, entrar } = useAuth();
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  if (usuario) return <Navigate to="/pedidos" replace />;

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    try {
      await entrar(login, senha);
      navigate('/pedidos');
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div className="cartao estreito">
      <h1>Entrar</h1>
      <form onSubmit={enviar} className="form">
        <label>Usuário<input value={login} onChange={(e) => setLogin(e.target.value)} required autoFocus /></label>
        <label>Senha<input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required /></label>
        {erro && <p className="erro" role="alert">{erro}</p>}
        <button>Entrar</button>
      </form>
      <p>Não tem conta? <Link to="/registro">Cadastre-se como cliente</Link></p>
      <p className="dica">Agentes de teste: <code>locadora</code> / <code>banco</code> — senha <code>123456</code></p>
    </div>
  );
}
