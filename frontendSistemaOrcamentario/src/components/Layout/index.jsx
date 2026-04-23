import React, { useEffect, useState } from 'react';
import Aside from '../Aside';
import Footer from '../Footer';
import './style.css';
import Header from '../Header';
import { FaBars, FaTimes, FaAngleLeft, FaAngleRight } from 'react-icons/fa';

const Layout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 992px)');

    const handleMediaChange = (event) => {
      if (!event.matches) {
        setIsMobileSidebarOpen(false);
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const toggleSidebar = () => {
    const isMobile = window.matchMedia('(max-width: 992px)').matches;

    if (isMobile) {
      setIsMobileSidebarOpen((prev) => !prev);
      return;
    }

    setIsSidebarCollapsed((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className='container'>
      <div className='containerHeader'>
        < Header />
      </div>

      <div className={`containerMain ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobileSidebarOpen ? 'sidebar-mobile-open' : ''}`}>
        <button
          type='button'
          className='sidebar-toggle sidebar-toggle-mobile'
          onClick={toggleSidebar}
          aria-label={isMobileSidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
        >
          {isMobileSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className='sidebar-overlay' onClick={closeMobileSidebar} />

        <div className='containerAside'>
          <Aside isCollapsed={isSidebarCollapsed} onNavigate={closeMobileSidebar} />
        </div>
        <div className='containerLayoutDashboard'>
          <div className='layout-toolbar'>
            <button
              type='button'
              className='sidebar-toggle sidebar-toggle-desktop'
              onClick={toggleSidebar}
              aria-label={isSidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            >
              {isSidebarCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
            </button>
          </div>
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


