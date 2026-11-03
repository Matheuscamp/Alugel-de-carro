import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ClienteForm from '../components/ClienteForm.jsx';

/** CRUD de clientes pela visão do agente. */
export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [editando, setEditando] = useState(null); // null | 'novo' | cliente
  const [erro, setErro] = useState('');

  const carregar = () => api('/clientes').then(setClientes).catch((e) => setErro(e.message));
  useEffect(() => { carregar(); }, []);

  async function salvar(dados) {
    if (editando === 'novo') await api('/clientes', { method: 'POST', body: dados });
    else await api(`/clientes/${editando.id}`, { method: 'PUT', body: dados });
    setEditando(null);
    carregar();
  }

  async function excluir(c) {
    if (!window.confirm(`Excluir o cliente ${c.nome}?`)) return;
    try { await api(`/clientes/${c.id}`, { method: 'DELETE' }); carregar(); }
    catch (e) { setErro(e.message); }
  }

  if (editando) {
    return (
      <div className="cartao">
        <h1>{editando === 'novo' ? 'Novo cliente' : `Editar ${editando.nome}`}</h1>
        <ClienteForm inicial={editando === 'novo' ? {} : editando} onSalvar={salvar} senhaObrigatoria={editando === 'novo'} />
        <button className="secundario" onClick={() => setEditando(null)}>Voltar</button>
      </div>
    );
  }

  return (
    <div>
      <div className="titulo"><h1>Clientes</h1><button onClick={() => setEditando('novo')}>+ Novo cliente</button></div>
      {erro && <p className="erro">{erro}</p>}
      <table>
        <thead><tr><th>Nome</th><th>CPF</th><th>Profissão</th><th>Renda total</th><th></th></tr></thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id}>
              <td>{c.nome}</td><td>{c.cpf}</td><td>{c.profissao}</td>
              <td>R$ {c.rendimentos.reduce((s, r) => s + Number(r.valor), 0).toFixed(2)}</td>
              <td className="acoes">
                <button className="secundario" onClick={() => setEditando(c)}>Editar</button>
                <button className="perigo" onClick={() => excluir(c)}>Excluir</button>
              </td>
            </tr>
          ))}
          {clientes.length === 0 && <tr><td colSpan="5">Nenhum cliente cadastrado.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
