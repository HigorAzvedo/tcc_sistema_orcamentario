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

const Aside = ({ isCollapsed = false, onNavigate = () => {} }) => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isUserRole = user?.role === 'user';
  const isOrcamentistaRole = user?.role === 'orcamentista';
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  const renderMenuItem = (to, icon, label) => (
    <li>
      <Link
        to={to}
        className={isActive(to) ? 'active' : ''}
        onClick={onNavigate}
        title={isCollapsed ? label : undefined}
      >
        {icon}
        <span className="sidebar-label">{label}</span>
      </Link>
    </li>
  );

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>

      <nav className="sidebar-nav">
        <ul>
          {isOrcamentistaRole && renderMenuItem('/dashboard-orcamentista', <FaTachometerAlt />, 'Meu Painel')}
          {!isUserRole && !isOrcamentistaRole && renderMenuItem('/dashboard', <FaTachometerAlt />, 'Dashboard')}
          
          {!isOrcamentistaRole && renderMenuItem('/projetos', <FaProjectDiagram />, 'Projetos')}
          {!isOrcamentistaRole && renderMenuItem('/orcamentos', <FaFileInvoiceDollar />, 'Orçamentos')}
          
          {!isUserRole && !isOrcamentistaRole && renderMenuItem('/itens-orcamentos', <FaItunes />, 'Itens Orçamentos')}
          {!isUserRole && !isOrcamentistaRole && renderMenuItem('/clientes', <FaUsers />, 'Clientes')}
          {/* {!isUserRole && !isOrcamentistaRole && <li><Link to="/produtos" className={isActive('/produtos') ? 'active' : ''}><FaBoxOpen /> Produtos</Link></li>} */}
          {!isUserRole && !isOrcamentistaRole && renderMenuItem('/fornecedores', <FaTruck />, 'Fornecedores')}
          {!isUserRole && !isOrcamentistaRole && renderMenuItem('/materiais', <FaBoxes />, 'Materiais')}
          {!isUserRole && !isOrcamentistaRole && renderMenuItem('/maquinario', <FaTools />, 'Maquinário')}
          {isAdminOrManager && renderMenuItem('/orcamentistas', <FaUserTie />, 'Orçamentistas')}
          {!isUserRole && !isOrcamentistaRole && renderMenuItem('/areas', <FaChartArea />, 'Áreas')}
          {!isUserRole && !isOrcamentistaRole && renderMenuItem('/cargos', <FaIdBadge />, 'Cargos')}
          {!isUserRole && !isOrcamentistaRole && renderMenuItem('/relatorios', <FaChartBar />, 'Relatórios')}
          {renderMenuItem('/configuracoes', <FaCogs />, 'Configurações')}
        </ul>
      </nav>
    </aside>
  );
};

export default Aside;