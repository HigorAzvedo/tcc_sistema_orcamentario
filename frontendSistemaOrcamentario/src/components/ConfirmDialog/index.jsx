import React from 'react';
import Modal from '../Modal';
import './style.css';

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  confirmVariant,
  onConfirm,
  onCancel
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="confirm-dialog">
        <h3>{title}</h3>
        <p>{message}</p>

        <div className="confirm-dialog-actions">
          <button type="button" className="confirm-dialog-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`confirm-dialog-confirm ${confirmVariant}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;