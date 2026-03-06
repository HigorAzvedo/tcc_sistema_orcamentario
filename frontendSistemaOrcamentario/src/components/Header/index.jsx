import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './style.css';
import {
  FaHome,
  FaSignOutAlt,
  FaUser
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/');
  };

  return (
    <header className="cabecalho">
      <img src="/logo-sem-fundo.png" alt="Logo" className="logo" />

      <div className="header-actions">
        
        {user && (
          <div className="user-info">
            <FaUser size={18} />
            <span className="user-name">{user.nome}</span>
            <button onClick={handleLogout} className="btn-logout" title="Sair">
              <FaSignOutAlt size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
