import React from 'react';
import Aside from '../Aside';
import Footer from '../Footer';
import './style.css';
import Header from '../Header';

const Layout = ({ children }) => {
  return (
    <div className='container'>
      <div className='containerHeader'>
        < Header />
      </div>

      <div className='containerMain'>
        <div className='containerAside'>
          <Aside />
        </div>
        <div className='containerLayoutDashboard'>
          {children}
        </div>
       
      </div>

      <div className='containerFooter'>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;


