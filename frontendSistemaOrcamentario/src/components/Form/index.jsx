import React, { useState } from 'react';
import FilterableSelect from '../FilterableSelect';
import { toast } from 'react-toastify';
import './style.css';

const Form = ({ fields, onSubmit, initialValues = {}, submitButtonText = 'Salvar' }) => {
  const [values, setValues] = useState(initialValues);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const hasDateRange =
      fields.some((f) => f.name === 'dataInicio') &&
      fields.some((f) => f.name === 'dataFim');

    if (hasDateRange && values.dataInicio && values.dataFim) {
      if (new Date(values.dataInicio) > new Date(values.dataFim)) {
        toast.error('A Data de Início não pode ser maior que a Data de Fim.');
        return;
      }
    }

    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {fields.map((field) => (
        <div key={field.name} className="form-group">
          <label htmlFor={field.name}>{field.label}:</label>
          {field.type === 'select' ? (
            <select
              id={field.name}
              name={field.name}
              value={values[field.name] || ''}
              onChange={handleChange}
              required={field.required}
              disabled={field.disabled}
            >
              <option value="">Selecione</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === 'searchSelect' ? (
            <FilterableSelect
              value={values[field.name] || ''}
              onChange={(value) => setValues((prev) => ({ ...prev, [field.name]: value }))}
              options={field.options || []}
              placeholder={field.placeholder || 'Selecione'}
              searchPlaceholder={field.searchPlaceholder || 'Buscar...'}
              emptyMessage={field.emptyMessage || 'Nenhuma opcao encontrada.'}
              disabled={field.disabled}
            />
          ) : (
            <input
              id={field.name}
              type={field.type || 'text'}
              name={field.name}
              value={values[field.name] || ''}
              onChange={handleChange}
              required={field.required}
              disabled={field.disabled}
              min={field.name === 'dataFim' && values.dataInicio ? values.dataInicio : undefined}
              max={field.name === 'dataInicio' && values.dataFim ? values.dataFim : undefined}
            />
          )}
        </div>
      ))}
      <button type="submit" className="btn-submit">{submitButtonText}</button>
    </form>
  );
};

export default Form;
