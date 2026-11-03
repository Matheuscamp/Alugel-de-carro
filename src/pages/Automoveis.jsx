import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Automoveis() {
  const { usuario } = useAuth();
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({ matricula: '', ano: '', marca: '', modelo: '', placa: '' });
  const [erro, setErro] = useState('');

  const carregar = () => api('/automoveis').then(setLista);
  useEffect(() => { carregar(); }, []);
  const set = (c) => (e) => setForm({ ...form, [c]: e.target.value });

  async function cadastrar(e) {
    e.preventDefault();
    setErro('');
    try {
      await api('/automoveis', { method: 'POST', body: { ...form, ano: Number(form.ano) } });
      setForm({ matricula: '', ano: '', marca: '', modelo: '', placa: '' });
      carregar();
    } catch (err) { setErro(err.message); }
  }

  return (
    <div>
      <h1>Automóveis</h1>
      <table>
        <thead><tr><th>Marca / Modelo</th><th>Ano</th><th>Placa</th><th>Matrícula</th><th>Proprietário</th></tr></thead>
        <tbody>
          {lista.map((a) => (
            <tr key={a.id}><td>{a.marca} {a.modelo}</td><td>{a.ano}</td><td>{a.placa}</td><td>{a.matricula}</td><td>{a.proprietario}</td></tr>
          ))}
        </tbody>
      </table>
      {usuario.papel === 'AGENTE' && (
        <form onSubmit={cadastrar} className="form cartao">
          <h2>Cadastrar automóvel</h2>
          <div className="linha">
            <label>Matrícula<input value={form.matricula} onChange={set('matricula')} required /></label>
            <label>Ano<input type="number" value={form.ano} onChange={set('ano')} required /></label>
            <label>Placa<input value={form.placa} onChange={set('placa')} required /></label>
          </div>
          <div className="linha">
            <label>Marca<input value={form.marca} onChange={set('marca')} required /></label>
            <label>Modelo<input value={form.modelo} onChange={set('modelo')} required /></label>
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button>Cadastrar</button>
        </form>
      )}
    </div>
  );
}
