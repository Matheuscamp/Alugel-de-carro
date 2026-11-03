import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const ROTULO = {
  EM_ANALISE: 'Em análise', APROVADO: 'Aprovado', REPROVADO: 'Reprovado',
  CANCELADO: 'Cancelado', CONTRATADO: 'Contratado',
};

function PedidoForm({ automoveis, inicial, onSalvar, onCancelar }) {
  const [f, setF] = useState(inicial ?? { automovelId: automoveis[0]?.id ?? '', dataInicio: '', dataFim: '' });
  const [erro, setErro] = useState('');
  async function enviar(e) {
    e.preventDefault();
    try { await onSalvar({ ...f, automovelId: Number(f.automovelId) }); } catch (err) { setErro(err.message); }
  }
  return (
    <form onSubmit={enviar} className="form cartao">
      <h2>{inicial ? 'Modificar pedido' : 'Novo pedido de aluguel'}</h2>
      <label>Automóvel
        <select value={f.automovelId} onChange={(e) => setF({ ...f, automovelId: e.target.value })} required>
          {automoveis.map((a) => <option key={a.id} value={a.id}>{a.marca} {a.modelo} ({a.ano}) – {a.placa}</option>)}
        </select>
      </label>
      <div className="linha">
        <label>Retirada<input type="date" value={f.dataInicio} onChange={(e) => setF({ ...f, dataInicio: e.target.value })} required /></label>
        <label>Devolução<input type="date" value={f.dataFim} onChange={(e) => setF({ ...f, dataFim: e.target.value })} required /></label>
      </div>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <div className="acoes">
        <button>Salvar</button>
        <button type="button" className="secundario" onClick={onCancelar}>Voltar</button>
      </div>
    </form>
  );
}

function ContratoForm({ bancos, onSalvar, onCancelar }) {
  const [f, setF] = useState({ tipoProprietario: 'EMPRESA', bancoCreditoId: '', valorCredito: '' });
  const [erro, setErro] = useState('');
  async function enviar(e) {
    e.preventDefault();
    try {
      await onSalvar({
        tipoProprietario: f.tipoProprietario,
        bancoCreditoId: f.bancoCreditoId ? Number(f.bancoCreditoId) : null,
        valorCredito: f.valorCredito ? Number(f.valorCredito) : null,
      });
    } catch (err) { setErro(err.message); }
  }
  return (
    <form onSubmit={enviar} className="form cartao">
      <h2>Executar contrato</h2>
      <label>Automóvel registrado como propriedade de
        <select value={f.tipoProprietario} onChange={(e) => setF({ ...f, tipoProprietario: e.target.value })}>
          <option value="CLIENTE">Cliente</option><option value="EMPRESA">Empresa</option><option value="BANCO">Banco</option>
        </select>
      </label>
      <div className="linha">
        <label>Contrato de crédito (banco)
          <select value={f.bancoCreditoId} onChange={(e) => setF({ ...f, bancoCreditoId: e.target.value })}>
            <option value="">Sem crédito</option>
            {bancos.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
          </select>
        </label>
        <label>Valor do crédito (R$)
          <input type="number" min="0" step="0.01" value={f.valorCredito} disabled={!f.bancoCreditoId}
            onChange={(e) => setF({ ...f, valorCredito: e.target.value })} />
        </label>
      </div>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <div className="acoes"><button>Assinar contrato</button><button type="button" className="secundario" onClick={onCancelar}>Voltar</button></div>
    </form>
  );
}

export default function Pedidos() {
  const { usuario } = useAuth();
  const ehCliente = usuario.papel === 'CLIENTE';
  const [pedidos, setPedidos] = useState([]);
  const [automoveis, setAutomoveis] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [modo, setModo] = useState(null); // {tipo:'novo'|'editar'|'contrato', pedido}
  const [erro, setErro] = useState('');

  const carregar = () => api('/pedidos').then(setPedidos).catch((e) => setErro(e.message));
  useEffect(() => {
    carregar();
    api('/automoveis').then(setAutomoveis);
    if (!ehCliente) api('/auth/bancos').then(setBancos);
  }, []);

  async function acao(fn) {
    setErro('');
    try { await fn(); setModo(null); carregar(); } catch (e) { setErro(e.message); }
  }

  const salvarPedido = async (dados) => {
    if (modo.tipo === 'novo') await api('/pedidos', { method: 'POST', body: dados });
    else await api(`/pedidos/${modo.pedido.id}`, { method: 'PUT', body: dados });
    setModo(null); carregar();
  };

  const avaliar = (p, aprovado) => {
    const parecer = window.prompt(aprovado ? 'Parecer financeiro (aprovação):' : 'Motivo da reprovação:') ?? '';
    acao(() => api(`/pedidos/${p.id}/avaliar`, { method: 'POST', body: { aprovado, parecer } }));
  };

  if (modo?.tipo === 'novo' || modo?.tipo === 'editar') {
    const ini = modo.pedido && { automovelId: modo.pedido.automovel.id, dataInicio: modo.pedido.dataInicio, dataFim: modo.pedido.dataFim };
    return <PedidoForm automoveis={automoveis} inicial={ini} onSalvar={salvarPedido} onCancelar={() => setModo(null)} />;
  }
  if (modo?.tipo === 'contrato') {
    return <ContratoForm bancos={bancos} onCancelar={() => setModo(null)}
      onSalvar={async (d) => { await api(`/pedidos/${modo.pedido.id}/contrato`, { method: 'POST', body: d }); setModo(null); carregar(); }} />;
  }

  return (
    <div>
      <div className="titulo">
        <h1>{ehCliente ? 'Meus pedidos' : 'Pedidos para análise'}</h1>
        {ehCliente && <button onClick={() => setModo({ tipo: 'novo' })}>+ Novo pedido</button>}
      </div>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <table>
        <thead>
          <tr><th>#</th>{!ehCliente && <th>Cliente</th>}<th>Automóvel</th><th>Período</th><th>Status</th><th>Parecer / Contrato</th><th></th></tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              {!ehCliente && <td>{p.clienteNome}</td>}
              <td>{p.automovel.marca} {p.automovel.modelo}<br /><small>{p.automovel.placa}</small></td>
              <td>{p.dataInicio} → {p.dataFim}</td>
              <td><span className={`status ${p.status}`}>{ROTULO[p.status]}</span></td>
              <td>
                {p.parecer && <div><small>{p.agenteAvaliador}: {p.parecer}</small></div>}
                {p.contrato && <small>Proprietário: {p.contrato.tipoProprietario}{p.contrato.bancoCredito && ` · Crédito ${p.contrato.bancoCredito} R$ ${p.contrato.valorCredito ?? '-'}`}</small>}
              </td>
              <td className="acoes">
                {ehCliente && p.status === 'EM_ANALISE' && (
                  <button className="secundario" onClick={() => setModo({ tipo: 'editar', pedido: p })}>Modificar</button>
                )}
                {ehCliente && !['CANCELADO', 'CONTRATADO'].includes(p.status) && (
                  <button className="perigo" onClick={() => window.confirm('Cancelar este pedido?') &&
                    acao(() => api(`/pedidos/${p.id}/cancelar`, { method: 'POST' }))}>Cancelar</button>
                )}
                {!ehCliente && p.status === 'EM_ANALISE' && (<>
                  <button className="secundario" onClick={() => setModo({ tipo: 'editar', pedido: p })}>Modificar</button>
                  <button onClick={() => avaliar(p, true)}>Aprovar</button>
                  <button className="perigo" onClick={() => avaliar(p, false)}>Reprovar</button>
                </>)}
                {!ehCliente && p.status === 'APROVADO' && (
                  <button onClick={() => setModo({ tipo: 'contrato', pedido: p })}>Executar contrato</button>
                )}
              </td>
            </tr>
          ))}
          {pedidos.length === 0 && <tr><td colSpan="7">Nenhum pedido.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
