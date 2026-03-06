import React from 'react';
import './style.css';

const Loading = ({ message = 'Carregando...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default Loading;