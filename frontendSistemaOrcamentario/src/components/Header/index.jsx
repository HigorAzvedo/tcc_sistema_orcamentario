import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './style.css';
import {
  FaHome,
  FaSignOutAlt,
  FaUser,
  FaChevronDown,
  FaCog,
  FaUserEdit
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/');
  };

  const handleEditProfile = () => {
    setShowUserMenu(false);
    navigate('/configuracoes?secao=perfil');
  };

  const handleSettings = () => {
    setShowUserMenu(false);
    navigate('/configuracoes');
  };

  return (
    <header className="cabecalho">
      <img src="/logo-sem-fundo.png" alt="Logo" className="logo" />

      <div className="header-actions">
        
        {user && (
          <div className="user-info" ref={menuRef}>
            <div 
              className="user-display" 
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <FaUser size={18} />
              <span className="user-name">{user.nome}</span>
              <FaChevronDown size={12} className={`chevron ${showUserMenu ? 'rotated' : ''}`} />
            </div>

            {showUserMenu && (
              <div className="user-dropdown">
                <button onClick={handleEditProfile} className="dropdown-item">
                  <FaUserEdit size={16} />
                  <span>Editar Perfil</span>
                </button>
                <button onClick={handleSettings} className="dropdown-item">
                  <FaCog size={16} />
                  <span>Configurações</span>
                </button>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout-item">
                  <FaSignOutAlt size={16} />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
