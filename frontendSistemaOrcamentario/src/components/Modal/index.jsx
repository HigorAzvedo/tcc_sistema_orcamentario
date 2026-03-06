import React from 'react';
import './style.css';
import { FaTimes } from 'react-icons/fa';


const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}><FaTimes /></button>
                {children}
            </div>
        </div>
    );
};

export default Modal;