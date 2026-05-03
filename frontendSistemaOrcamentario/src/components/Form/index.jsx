import React, { useState } from 'react';
import FilterableSelect from '../FilterableSelect';
import './style.css';

const Form = ({ fields, onSubmit, initialValues = {}, submitButtonText = 'Salvar' }) => {
  const [values, setValues] = useState(initialValues);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
              onChange={(value) => setValues({ ...values, [field.name]: value })}
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
            />
          )}
        </div>
      ))}
      <button type="submit" className="btn-submit">{submitButtonText}</button>
    </form>
  );
};

export default Form;