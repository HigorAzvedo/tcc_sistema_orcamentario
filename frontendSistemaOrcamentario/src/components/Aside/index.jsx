import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './style.css';
import {
  FaTachometerAlt,
  FaFileInvoiceDollar,
  FaUsers,
  FaBoxOpen,
  FaChartBar,
  FaCogs,
  FaTruck,
  FaBoxes,
  FaTools,
  FaUserTie,
  FaProjectDiagram,
  FaChartArea,
  FaIdBadge,
  FaItunes
} from 'react-icons/fa';

const Aside = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isUserRole = user?.role === 'user';
  const isOrcamentistaRole = user?.role === 'orcamentista';
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  return (
    <aside className="sidebar">

      <nav className="sidebar-nav">
        <ul>
          {isOrcamentistaRole && <li><Link to="/dashboard-orcamentista" className={isActive('/dashboard-orcamentista') ? 'active' : ''}><FaTachometerAlt /> Meu Painel</Link></li>}
          {!isUserRole && !isOrcamentistaRole && <li><Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}><FaTachometerAlt /> Dashboard</Link></li>}
          
          {!isOrcamentistaRole && <li><Link to="/projetos" className={isActive('/projetos') ? 'active' : ''}><FaProjectDiagram /> Projetos</Link></li>}
          {!isOrcamentistaRole && <li><Link to="/orcamentos" className={isActive('/orcamentos') ? 'active' : ''}><FaFileInvoiceDollar /> Orçamentos</Link></li>}
          
          {!isUserRole && !isOrcamentistaRole && <li><Link to="/itens-orcamentos" className={isActive('/itens-orcamentos') ? 'active' : ''}><FaItunes /> Itens Orçamentos</Link></li>}
          {!isUserRole && !isOrcamentistaRole && <li><Link to="/clientes" className={isActive('/clientes') ? 'active' : ''}><FaUsers /> Clientes</Link></li>}
          {!isUserRole && !isOrcamentistaRole && <li><Link to="/produtos" className={isActive('/produtos') ? 'active' : ''}><FaBoxOpen /> Produtos</Link></li>}
          {!isUserRole && !isOrcamentistaRole && <li><Link to="/fornecedores" className={isActive('/fornecedores') ? 'active' : ''}><FaTruck /> Fornecedores</Link></li>}
          {!isUserRole && !isOrcamentistaRole && <li><Link to="/materiais" className={isActive('/materiais') ? 'active' : ''}><FaBoxes /> Materiais</Link></li>}
          {!isUserRole && !isOrcamentistaRole && <li><Link to="/maquinario" className={isActive('/maquinario') ? 'active' : ''}><FaTools /> Maquinário</Link></li>}
          {isAdminOrManager && <li><Link to="/orcamentistas" className={isActive('/orcamentistas') ? 'active' : ''}><FaUserTie /> Orçamentistas</Link></li>}
          {!isUserRole && !isOrcamentistaRole && <li><Link to="/areas" className={isActive('/areas') ? 'active' : ''}><FaChartArea /> Áreas</Link></li>}
          {!isUserRole && !isOrcamentistaRole && <li><Link to="/cargos" className={isActive('/cargos') ? 'active' : ''}><FaIdBadge /> Cargos</Link></li>}
          {!isUserRole && !isOrcamentistaRole && <li><Link to="/relatorios" className={isActive('/relatorios') ? 'active' : ''}><FaChartBar /> Relatórios</Link></li>}
          {!isUserRole && !isOrcamentistaRole && <li><Link to="/configuracoes" className={isActive('/configuracoes') ? 'active' : ''}><FaCogs /> Configurações</Link></li>}
        </ul>
      </nav>
    </aside>
  );
};

export default Aside;