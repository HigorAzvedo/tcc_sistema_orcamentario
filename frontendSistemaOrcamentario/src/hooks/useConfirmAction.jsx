import { useEffect, useRef, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

const defaultOptions = {
  title: 'Confirmar ação',
  message: 'Deseja realmente continuar?',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  confirmVariant: 'danger'
};

const useConfirmAction = () => {
  const resolverRef = useRef(null);
  const [dialogOptions, setDialogOptions] = useState({
    ...defaultOptions,
    isOpen: false
  });

  const closeDialog = (confirmed) => {
    setDialogOptions((previous) => ({
      ...previous,
      isOpen: false
    }));

    if (resolverRef.current) {
      resolverRef.current(confirmed);
      resolverRef.current = null;
    }
  };

  const confirmAction = (options = {}) => {
    setDialogOptions({
      ...defaultOptions,
      ...options,
      isOpen: true
    });

    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  };

  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current(false);
        resolverRef.current = null;
      }
    };
  }, []);

  const confirmDialog = (
    <ConfirmDialog
      isOpen={dialogOptions.isOpen}
      title={dialogOptions.title}
      message={dialogOptions.message}
      confirmText={dialogOptions.confirmText}
      cancelText={dialogOptions.cancelText}
      confirmVariant={dialogOptions.confirmVariant}
      onConfirm={() => closeDialog(true)}
      onCancel={() => closeDialog(false)}
    />
  );

  return {
    confirmAction,
    confirmDialog
  };
};

export default useConfirmAction;