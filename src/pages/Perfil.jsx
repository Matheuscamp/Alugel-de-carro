import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import ClienteForm from '../components/ClienteForm.jsx';

export default function Perfil() {
  const { usuario, sair, entrar } = useAuth();
  const [cliente, setCliente] = useState(null);
  const [ok, setOk] = useState('');

  useEffect(() => { api(`/clientes/${usuario.id}`).then(setCliente); }, [usuario.id]);

  async function salvar(dados) {
    const atualizado = await api(`/clientes/${usuario.id}`, { method: 'PUT', body: dados });
    setCliente(atualizado);
    if (dados.senha || dados.login !== usuario.login) {
      // credenciais mudaram: entra novamente com os novos dados
      if (dados.senha) await entrar(dados.login, dados.senha); else sair();
    }
    setOk('Cadastro atualizado.');
  }

  async function excluir() {
    if (!window.confirm('Excluir sua conta? Esta ação não pode ser desfeita.')) return;
    await api(`/clientes/${usuario.id}`, { method: 'DELETE' });
    sair();
  }

  if (!cliente) return <p>Carregando…</p>;
  return (
    <div className="cartao">
      <h1>Meu cadastro</h1>
      {ok && <p className="sucesso" role="status">{ok}</p>}
      <ClienteForm key={cliente.id + JSON.stringify(cliente.rendimentos)} inicial={cliente} onSalvar={salvar} />
      <hr />
      <button className="perigo" onClick={excluir}>Excluir minha conta</button>
    </div>
  );
}
