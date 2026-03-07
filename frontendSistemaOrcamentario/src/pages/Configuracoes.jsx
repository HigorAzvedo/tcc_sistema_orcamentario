import React, { useState, useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../service/api';
import { toast } from 'react-toastify';
import { FaUserEdit, FaCog, FaBell, FaShieldAlt, FaPalette } from 'react-icons/fa';
import PasswordInput from '../components/PasswordInput';
import './Pages.css';

const Configuracoes = () => {
  const { user, setUser } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [secaoAtiva, setSecaoAtiva] = useState('perfil');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [alterarSenha, setAlterarSenha] = useState(false);

  useEffect(() => {
    const secao = searchParams.get('secao');
    if (secao) {
      setSecaoAtiva(secao);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSecaoChange = (secao) => {
    setSecaoAtiva(secao);
    setSearchParams({ secao });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.email) {
      toast.error('Nome e email são obrigatórios!');
      return;
    }

    if (alterarSenha) {
      if (!formData.senhaAtual) {
        toast.error('Digite sua senha atual!');
        return;
      }

      if (!formData.novaSenha || formData.novaSenha.length < 6) {
        toast.error('A nova senha deve ter no mínimo 6 caracteres!');
        return;
      }

      if (formData.novaSenha !== formData.confirmarSenha) {
        toast.error('As senhas não coincidem!');
        return;
      }
    }

    setLoading(true);

    try {
      const dataToSend = {
        nome: formData.nome,
        email: formData.email
      };

      if (alterarSenha && formData.senhaAtual && formData.novaSenha) {
        dataToSend.senhaAtual = formData.senhaAtual;
        dataToSend.novaSenha = formData.novaSenha;
      }

      const response = await api.put('/usuarios/perfil/atualizar', dataToSend);

      if (response.data.user) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      toast.success('Perfil atualizado com sucesso!');
      
      setFormData(prev => ({
        ...prev,
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      }));
      setAlterarSenha(false);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Erro ao atualizar perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'perfil', icon: <FaUserEdit />, label: 'Editar Perfil' },
    { id: 'geral', icon: <FaCog />, label: 'Geral' },
    { id: 'notificacoes', icon: <FaBell />, label: 'Notificações' },
    { id: 'seguranca', icon: <FaShieldAlt />, label: 'Segurança' },
    { id: 'aparencia', icon: <FaPalette />, label: 'Aparência' },
  ];

  const renderConteudo = () => {
    switch (secaoAtiva) {
      case 'perfil':
        return (
          <div className="form-container">
            <h2>Editar Perfil</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Informações Pessoais</h3>
                
                <div className="form-group">
                  <label htmlFor="nome">Nome *</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Tipo de Usuário</label>
                  <input
                    type="text"
                    id="role"
                    value={user?.role === 'admin' ? 'Administrador' : 
                           user?.role === 'manager' ? 'Gerente' : 
                           user?.role === 'orcamentista' ? 'Orçamentista' : 'Usuário'}
                    disabled
                    readOnly
                  />
                  <small>Este campo não pode ser alterado</small>
                </div>
              </div>

              <div className="form-section">
                <h3>Segurança</h3>
                
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={alterarSenha}
                      onChange={(e) => setAlterarSenha(e.target.checked)}
                      disabled={loading}
                      className='alterar_senha'
                    />
                    {' '}Alterar senha
                  </label>
                </div>

                {alterarSenha && (
                  <>
                    <div className="form-group">
                      <label htmlFor="senhaAtual">Senha Atual *</label>
                      <PasswordInput
                        id="senhaAtual"
                        name="senhaAtual"
                        value={formData.senhaAtual}
                        onChange={handleChange}
                        disabled={loading}
                        autoComplete="current-password"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="novaSenha">Nova Senha *</label>
                      <PasswordInput
                        id="novaSenha"
                        name="novaSenha"
                        value={formData.novaSenha}
                        onChange={handleChange}
                        disabled={loading}
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />
                      <small>Mínimo de 6 caracteres</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmarSenha">Confirmar Nova Senha *</label>
                      <PasswordInput
                        id="confirmarSenha"
                        name="confirmarSenha"
                        value={formData.confirmarSenha}
                        onChange={handleChange}
                        disabled={loading}
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'geral':
        return (
          <div className="config-content">
            <h2>Configurações Gerais</h2>
            <p>Configurações gerais do sistema - Em desenvolvimento</p>
          </div>
        );

      case 'notificacoes':
        return (
          <div className="config-content">
            <h2>Notificações</h2>
            <p>Configurações de notificações - Em desenvolvimento</p>
          </div>
        );

      case 'seguranca':
        return (
          <div className="config-content">
            <h2>Segurança</h2>
            <p>Configurações de segurança - Em desenvolvimento</p>
          </div>
        );

      case 'aparencia':
        return (
          <div className="config-content">
            <h2>Aparência</h2>
            <p>Configurações de aparência - Em desenvolvimento</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <h1>Configurações</h1>
      
      <div className="config-layout">
        <aside className="config-sidebar">
          <nav className="config-menu">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`config-menu-item ${secaoAtiva === item.id ? 'active' : ''}`}
                onClick={() => handleSecaoChange(item.id)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="config-content-area">
          {renderConteudo()}
        </main>
      </div>
    </div>
  );
};

export default Configuracoes;

