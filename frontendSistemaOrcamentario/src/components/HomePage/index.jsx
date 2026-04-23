import React, { useContext } from 'react';
import './style.css';
import { FaPlus } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

// import { Container } from './styles';

function HomePage({ titulo, botao, onButtonClick }) {

    const { user } = useContext(AuthContext);

    const isUserRole = user?.role === 'user';
    return (
        <div className="containerPages">
            <div className="headerPages">
                <h1>{titulo}</h1>
                {
                    !isUserRole  && (
                        <button className="btn-novo" onClick={onButtonClick} aria-label={botao}>
                            <div className="btn-content">
                                <FaPlus />
                                <span className="btn-label">{botao}</span>
                            </div>
                        </button>
                    )
                }
            </div>
        </div>
    );
}

export default HomePage;