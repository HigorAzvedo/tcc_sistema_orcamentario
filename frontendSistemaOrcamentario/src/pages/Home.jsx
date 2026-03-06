import React from 'react';
import { Link } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import Footer from '../components/Footer';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-header">
        <div className="home-nav">
        <img src="/logo-sem-fundo.png" alt="Logo" className="logo" />
          <div className="home-actions">
            <Link to="/login" className="btn-login">Entrar</Link>
            <Link to="/cadastro" className="btn-register">Cadastrar</Link>
          </div>
        </div>
      </div>
      <Dashboard />
      <Footer />
    </div>
  );
};

export default Home;

