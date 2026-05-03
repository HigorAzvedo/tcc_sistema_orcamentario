import React, { useEffect, useMemo, useRef, useState } from 'react';
import './style.css';

function normalize(text) {
  return String(text || '').toLowerCase().trim();
}

const FilterableSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Selecione',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhuma opcao encontrada.',
  disabled = false,
}) => {
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const normalizedValue = String(value || '');

  const selectedOption = useMemo(() => {
    return options.find((option) => String(option.value) === normalizedValue);
  }, [options, normalizedValue]);

  const filteredOptions = useMemo(() => {
    const query = normalize(searchTerm);

    if (!query) {
      return options;
    }

    return options.filter((option) => normalize(option.label).includes(query));
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    if (typeof onChange === 'function') {
      onChange(String(optionValue));
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleOpen = () => {
    if (disabled) {
      return;
    }

    setIsOpen((prev) => !prev);
  };

  return (
    <div className={`filterable-select ${disabled ? 'filterable-select-disabled' : ''}`} ref={containerRef}>
      <button
        type="button"
        className="filterable-select-trigger form-input"
        onClick={toggleOpen}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? 'filterable-select-value' : 'filterable-select-placeholder'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="filterable-select-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="filterable-select-dropdown">
          <input
            ref={searchInputRef}
            type="search"
            className="filterable-select-search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Buscar opcao"
          />

          <ul className="filterable-select-options" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = String(option.value) === normalizedValue;

                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      className={`filterable-select-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelect(option.value)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="filterable-select-empty">{emptyMessage}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterableSelect;
