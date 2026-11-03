import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import ClienteForm from '../components/ClienteForm.jsx';

export default function Registro() {
  const { entrar } = useAuth();
  const navigate = useNavigate();

  async function salvar(dados) {
    await api('/auth/registrar', { method: 'POST', body: dados, credenciais: null });
    await entrar(dados.login, dados.senha);
    navigate('/pedidos');
  }

  return (
    <div className="cartao">
      <h1>Cadastro de cliente</h1>
      <ClienteForm onSalvar={salvar} textoBotao="Cadastrar" senhaObrigatoria />
      <p><Link to="/login">Já tenho conta</Link></p>
    </div>
  );
}
