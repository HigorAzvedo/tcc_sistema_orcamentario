import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';
import { FaLinkedinIn, FaInstagram, FaFacebookSquare } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      
      <div className="links">
        <span>Links úteis</span>
        <span>Recursos</span>
        <span>Legal</span>
      </div>
      <div className='redes-sociais'>
        <span className='linkedin'>
          <a href="#">
            <FaLinkedinIn size={25}/>
          </a>
        </span>
        <span className='instagram'>
          <a href="#">
            <FaInstagram size={25}/>
          </a>
        </span>
        <span className='facebook'>
          <a href="#">
            <FaFacebookSquare size={25}/>
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;