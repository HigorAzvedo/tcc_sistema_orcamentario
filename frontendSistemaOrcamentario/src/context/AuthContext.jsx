import React, { createContext, useState, useEffect } from 'react';
import api from '../service/api';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`
        }
      });
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        setLoading(false);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      logout();
    }
  };

  const login = async (email, senha) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        senha
      });

      if (response.data && response.data.token) {
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
    
        setToken(newToken);
        setUser(userData);

        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        return { success: true };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (nome, email, senha, role) => {
    try {
      const response = await api.post('/auth/register', {
        nome,
        email,
        senha,
        role: role || 'user'
      });

      if (response.status === 201) {
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao cadastrar usuário';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh-token', {
        token
      });

      if (response.data && response.data.token) {
        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return { success: true };
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      logout();
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshToken,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

