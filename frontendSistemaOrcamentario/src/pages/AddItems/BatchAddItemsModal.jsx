import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import FilterableSelect from '../../components/FilterableSelect';
import './BatchAddItemsModal.css';

const createRow = () => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  tipoItem: 'material',
  itemId: '',
  quantidade: '',
  valorUnitario: '',
  touched: {},
});

const toNumber = (value) => {
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const getDefaultUnitValue = (option) => {
  const value = option?.valorUnitario ?? option?.valor ?? option?.salario ?? option?.preco ?? option?.precoUnitario;
  return value !== undefined && value !== null && value !== '' ? String(value) : '';
};

const isRowBlank = (row) => {
  return !row.itemId && !row.quantidade && !row.valorUnitario;
};

const BatchAddItemsModal = ({
  isOpen,
  materiais = [],
  cargos = [],
  maquinarios = [],
  projetoSelecionado,
  orcamentoId,
  onClose,
  onConfirm,
}) => {
  const firstInputRef = useRef(null);
  const [rows, setRows] = useState([createRow()]);
  const [submitted, setSubmitted] = useState(false);

  const itemTypes = useMemo(() => ({
    material: {
      label: 'Material',
      options: materiais,
      idField: 'idMaterial',
      emptyMessage: 'Nenhum material encontrado.',
      placeholder: 'Selecione um material',
      searchPlaceholder: 'Buscar material...',
    },
    cargo: {
      label: 'Cargo',
      options: cargos,
      idField: 'idCargo',
      emptyMessage: 'Nenhum cargo encontrado.',
      placeholder: 'Selecione um cargo',
      searchPlaceholder: 'Buscar cargo...',
    },
    maquinario: {
      label: 'Maquinário',
      options: maquinarios,
      idField: 'idMaquinario',
      emptyMessage: 'Nenhum maquinário encontrado.',
      placeholder: 'Selecione um maquinário',
      searchPlaceholder: 'Buscar maquinário...',
    },
  }), [cargos, maquinarios, materiais]);

  const itemsByTypeAndId = useMemo(() => {
    return Object.entries(itemTypes).reduce((acc, [type, config]) => {
      acc[type] = config.options.reduce((itemsAcc, option) => {
        itemsAcc[String(option.value)] = option;
        return itemsAcc;
      }, {});

      return acc;
    }, {});
  }, [itemTypes]);

  const filledRows = useMemo(() => rows.filter((row) => !isRowBlank(row)), [rows]);

  const validRows = useMemo(() => {
    return filledRows.filter((row) => {
      return row.itemId && toNumber(row.quantidade) > 0 && toNumber(row.valorUnitario) > 0;
    });
  }, [filledRows]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setRows([createRow()]);
    setSubmitted(false);

    window.setTimeout(() => {
      firstInputRef.current?.querySelector('.filterable-select-trigger')?.focus();
    }, 0);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const updateRow = (rowId, changes) => {
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === rowId ? { ...row, ...changes } : row))
    );
  };

  const markTouched = (rowId, field) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId
          ? { ...row, touched: { ...row.touched, [field]: true } }
          : row
      )
    );
  };

  const handleTypeChange = (row, tipoItem) => {
    updateRow(row.id, {
      tipoItem,
      itemId: '',
      touched: { ...row.touched, itemId: false },
    });
  };

  const handleItemChange = (row, value) => {
    const selectedItem = itemsByTypeAndId[row.tipoItem]?.[String(value)];
    const changes = {
      itemId: value,
    };

    if (selectedItem) {
      const defaultValue = getDefaultUnitValue(selectedItem);
      if (defaultValue) {
        changes.valorUnitario = defaultValue;
      }
    }

    updateRow(row.id, changes);
  };

  const addRow = () => {
    setRows((currentRows) => [...currentRows, createRow()]);
  };

  const removeRow = (rowId) => {
    setRows((currentRows) => {
      if (currentRows.length === 1) {
        return [createRow()];
      }

      return currentRows.filter((row) => row.id !== rowId);
    });
  };

  const handleKeyDown = (event, rowIndex) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    if (rowIndex === rows.length - 1) {
      addRow();
      window.setTimeout(() => {
        const triggers = document.querySelectorAll('.batch-item-select .filterable-select-trigger');
        triggers[triggers.length - 1]?.focus();
      }, 0);
    }
  };

  const shouldShowError = (row, field) => row.touched[field] || (submitted && !isRowBlank(row));

  const getFieldError = (row, field) => {
    if (field === 'itemId' && !row.itemId) {
      return `Selecione um ${itemTypes[row.tipoItem].label.toLowerCase()}.`;
    }

    if (field === 'quantidade' && toNumber(row.quantidade) <= 0) {
      return 'Informe uma quantidade maior que zero.';
    }

    if (field === 'valorUnitario' && toNumber(row.valorUnitario) <= 0) {
      return 'Informe um valor maior que zero.';
    }

    return '';
  };

  const handleConfirm = () => {
    setSubmitted(true);

    if (validRows.length === 0 || validRows.length !== filledRows.length) {
      return;
    }

    const items = filledRows.map((row, index) => {
      const itemType = itemTypes[row.tipoItem];
      const selectedItem = itemsByTypeAndId[row.tipoItem]?.[String(row.itemId)];
      const quantidade = toNumber(row.quantidade);
      const valorUnitario = toNumber(row.valorUnitario);

      const newItem = {
        id: Date.now() + index,
        descricao: '',
        unidade: '',
        quantidade,
        valorUnitario,
        valorTotal: quantidade * valorUnitario,
        tipoItem: row.tipoItem,
        tipoItemLabel: itemType.label,
        itemNome: selectedItem?.label || '',
        idProjeto: parseInt(projetoSelecionado, 10),
        idOrcamento: parseInt(orcamentoId, 10),
        idMaterial: null,
        idCargo: null,
        idMaquinario: null,
      };

      newItem[itemType.idField] = parseInt(row.itemId, 10);

      return newItem;
    });

    onConfirm(items);
  };

  const itemCount = filledRows.length;
  const confirmLabel = `Adicionar ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`;

  return (
    <div className="batch-modal-backdrop" role="presentation">
      <div className="batch-modal" role="dialog" aria-modal="true" aria-labelledby="batch-modal-title">
        <div className="batch-modal-header">
          <div>
            <h3 id="batch-modal-title">Adicionar vários itens</h3>
            <p>Lance materiais, cargos e maquinários em lote para este orçamento.</p>
          </div>
          <button type="button" className="batch-icon-button" onClick={onClose} aria-label="Fechar modal">
            <FaTimes />
          </button>
        </div>

        <div className="batch-table-wrapper">
          <table className="batch-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Item</th>
                <th>Quantidade</th>
                <th>Valor Unitário</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const rowType = itemTypes[row.tipoItem];
                const itemError = shouldShowError(row, 'itemId') ? getFieldError(row, 'itemId') : '';
                const quantityError = shouldShowError(row, 'quantidade') ? getFieldError(row, 'quantidade') : '';
                const unitValueError = shouldShowError(row, 'valorUnitario') ? getFieldError(row, 'valorUnitario') : '';

                return (
                  <tr key={row.id}>
                    <td>
                      <select
                        className="batch-input"
                        value={row.tipoItem}
                        onChange={(event) => handleTypeChange(row, event.target.value)}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                      >
                        {Object.entries(itemTypes).map(([type, config]) => (
                          <option key={type} value={type}>{config.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div
                        ref={index === 0 ? firstInputRef : null}
                        className={`batch-item-select ${itemError ? 'invalid' : ''}`}
                      >
                        <FilterableSelect
                          value={row.itemId}
                          onChange={(value) => handleItemChange(row, value)}
                          options={rowType.options}
                          placeholder={rowType.placeholder}
                          searchPlaceholder={rowType.searchPlaceholder}
                          emptyMessage={rowType.emptyMessage}
                        />
                      </div>
                      {itemError && <span className="batch-field-error">{itemError}</span>}
                    </td>
                    <td>
                      <input
                        className={`batch-input ${quantityError ? 'invalid' : ''}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.quantidade}
                        onChange={(event) => updateRow(row.id, { quantidade: event.target.value })}
                        onBlur={() => markTouched(row.id, 'quantidade')}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                        placeholder="0"
                      />
                      {quantityError && <span className="batch-field-error">{quantityError}</span>}
                    </td>
                    <td>
                      <input
                        className={`batch-input ${unitValueError ? 'invalid' : ''}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.valorUnitario}
                        onChange={(event) => updateRow(row.id, { valorUnitario: event.target.value })}
                        onBlur={() => markTouched(row.id, 'valorUnitario')}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                        placeholder="0,00"
                      />
                      {unitValueError && <span className="batch-field-error">{unitValueError}</span>}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="batch-remove-button"
                        onClick={() => removeRow(row.id)}
                        aria-label="Remover linha"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="batch-modal-footer">
          <button type="button" className="batch-secondary-button" onClick={addRow}>
            <FaPlus /> Nova linha
          </button>
          <div className="batch-modal-actions">
            <button type="button" className="batch-cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="batch-primary-button" onClick={handleConfirm} disabled={itemCount === 0}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchAddItemsModal;
