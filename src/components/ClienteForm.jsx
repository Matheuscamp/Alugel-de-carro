import { useState } from 'react';

const vazio = { login: '', senha: '', nome: '', rg: '', cpf: '', endereco: '', profissao: '', rendimentos: [] };

/** Formulário de cliente usado no cadastro e na edição (CRUD de cliente). */
export default function ClienteForm({ inicial, onSalvar, textoBotao = 'Salvar', senhaObrigatoria = false }) {
  const [form, setForm] = useState({ ...vazio, ...inicial, senha: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const setRend = (i, campo, valor) => {
    const r = [...form.rendimentos];
    r[i] = { ...r[i], [campo]: valor };
    setForm({ ...form, rendimentos: r });
  };

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await onSalvar({
        ...form,
        senha: form.senha || null,
        rendimentos: form.rendimentos.map((r) => ({ ...r, valor: Number(r.valor) })),
      });
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="form">
      <fieldset>
        <legend>Acesso</legend>
        <label>Usuário<input value={form.login} onChange={set('login')} required /></label>
        <label>Senha {senhaObrigatoria ? '' : '(deixe em branco para manter)'}
          <input type="password" value={form.senha} onChange={set('senha')} required={senhaObrigatoria} minLength={6} />
        </label>
      </fieldset>
      <fieldset>
        <legend>Identificação</legend>
        <label>Nome<input value={form.nome} onChange={set('nome')} required /></label>
        <div className="linha">
          <label>RG<input value={form.rg} onChange={set('rg')} required /></label>
          <label>CPF<input value={form.cpf} onChange={set('cpf')} placeholder="000.000.000-00" required /></label>
        </div>
        <label>Endereço<input value={form.endereco} onChange={set('endereco')} required /></label>
        <label>Profissão<input value={form.profissao ?? ''} onChange={set('profissao')} /></label>
      </fieldset>
      <fieldset>
        <legend>Rendimentos (máximo 3)</legend>
        {form.rendimentos.map((r, i) => (
          <div className="linha" key={i}>
            <label>Entidade empregadora
              <input value={r.entidadeEmpregadora} onChange={(e) => setRend(i, 'entidadeEmpregadora', e.target.value)} required />
            </label>
            <label>Valor (R$)
              <input type="number" min="0" step="0.01" value={r.valor} onChange={(e) => setRend(i, 'valor', e.target.value)} required />
            </label>
            <button type="button" className="secundario"
              onClick={() => setForm({ ...form, rendimentos: form.rendimentos.filter((_, j) => j !== i) })}>Remover</button>
          </div>
        ))}
        {form.rendimentos.length < 3 && (
          <button type="button" className="secundario"
            onClick={() => setForm({ ...form, rendimentos: [...form.rendimentos, { entidadeEmpregadora: '', valor: '' }] })}>
            + Adicionar rendimento
          </button>
        )}
      </fieldset>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <button disabled={enviando}>{enviando ? 'Salvando…' : textoBotao}</button>
    </form>
  );
}
