import { createContext, useContext, useEffect, useState } from 'react';
import { api, salvarCredenciais, limparCredenciais } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Restaura a sessão da aba, se houver
  useEffect(() => {
    api('/auth/me').then(setUsuario).catch(() => limparCredenciais()).finally(() => setCarregando(false));
  }, []);

  async function entrar(login, senha) {
    const credenciais = btoa(`${login}:${senha}`);
    const u = await api('/auth/me', { credenciais });
    salvarCredenciais(login, senha);
    setUsuario(u);
    return u;
  }

  function sair() {
    limparCredenciais();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, sair, setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
