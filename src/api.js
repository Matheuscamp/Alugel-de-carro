const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const KEY = 'aluguel.credenciais';

export function salvarCredenciais(login, senha) {
  sessionStorage.setItem(KEY, btoa(`${login}:${senha}`));
}
export function limparCredenciais() {
  sessionStorage.removeItem(KEY);
}

/** Chamada à API com login (HTTP Basic). Lança Error com a mensagem do back-end. */
export async function api(caminho, { method = 'GET', body, credenciais } = {}) {
  const token = credenciais ?? sessionStorage.getItem(KEY);
  const res = await fetch(BASE + caminho, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Basic ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const dados = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = dados?.mensagem || (res.status === 401 ? 'Usuário ou senha inválidos.' : `Erro ${res.status}`);
    throw new Error(msg);
  }
  return dados;
}
