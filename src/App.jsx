import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Pedidos from './pages/Pedidos.jsx';
import Perfil from './pages/Perfil.jsx';
import Clientes from './pages/Clientes.jsx';
import Automoveis from './pages/Automoveis.jsx';

function Protegida({ children, papel }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return <p className="container">Carregando…</p>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (papel && usuario.papel !== papel) return <Navigate to="/pedidos" replace />;
  return children;
}

export default function App() {
  const { usuario, sair } = useAuth();
  return (
    <>
      {usuario && (
        <header className="topo">
          <strong>🚗 Aluguel de Carros</strong>
          <nav>
            <NavLink to="/pedidos">Pedidos</NavLink>
            <NavLink to="/automoveis">Automóveis</NavLink>
            {usuario.papel === 'CLIENTE' && <NavLink to="/perfil">Meu cadastro</NavLink>}
            {usuario.papel === 'AGENTE' && <NavLink to="/clientes">Clientes</NavLink>}
          </nav>
          <span className="usuario">
            {usuario.nome} ({usuario.papel === 'AGENTE' ? usuario.tipoAgente : 'CLIENTE'})
            <button className="link" onClick={sair}>Sair</button>
          </span>
        </header>
      )}
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/pedidos" element={<Protegida><Pedidos /></Protegida>} />
          <Route path="/automoveis" element={<Protegida><Automoveis /></Protegida>} />
          <Route path="/perfil" element={<Protegida papel="CLIENTE"><Perfil /></Protegida>} />
          <Route path="/clientes" element={<Protegida papel="AGENTE"><Clientes /></Protegida>} />
          <Route path="*" element={<Navigate to={usuario ? '/pedidos' : '/login'} replace />} />
        </Routes>
      </main>
    </>
  );
}
