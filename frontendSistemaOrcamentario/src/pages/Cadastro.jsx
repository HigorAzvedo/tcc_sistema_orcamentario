import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';
import { FaHome, FaEye, FaEyeSlash } from 'react-icons/fa';

const Cadastro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome || !email || !senha || !confirmarSenha) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    const result = await register(nome, email, senha, role);
    setLoading(false);

    if (result.success) {
      toast.success('Cadastro realizado com sucesso! Faça login para continuar.');
      navigate('/login');
    } else {
      toast.error(result.error || 'Erro ao cadastrar usuário');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" >
            <img src="/logo-sem-fundo.png" alt="Logo" className="logo" />
          </Link>
          <h2>Cadastro</h2>
          <p>Crie sua conta para começar a usar o sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmarSenha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Digite a senha novamente"
                required
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">Tipo de Usuário</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <div className="auth-footer">
            <p>
              Já tem uma conta?{' '}
              <Link to="/login" className="auth-link">
                Faça login aqui
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Cadastro;

