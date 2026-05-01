// src/components/Table.jsx
import React, { useMemo, useState } from "react";
import "./style.css";

function normalizeValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("pt-BR");
  }

  return "";
}

function Table({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Pesquisar na tabela...",
  searchableColumns,
  emptyMessage = "Nenhum registro encontrado.",
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const columnsToSearch = useMemo(() => {
    if (Array.isArray(searchableColumns) && searchableColumns.length > 0) {
      return searchableColumns;
    }

    return columns.map((col) => col.accessor);
  }, [columns, searchableColumns]);

  const filteredData = useMemo(() => {
    if (!searchable || !normalizedSearch) {
      return data;
    }

    return data.filter((row) =>
      columnsToSearch.some((accessor) => {
        const value = normalizeValue(row?.[accessor]);
        return value.toLowerCase().includes(normalizedSearch);
      })
    );
  }, [columnsToSearch, data, normalizedSearch, searchable]);

  return (
    <div className="table-wrapper">
      {searchable && (
        <div className="table-search-container">
          <input
            type="search"
            className="table-search-input"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Pesquisar registros da tabela"
          />
        </div>
      )}

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, i) => (
                <tr key={i}>
                  {columns.map((col, index) => (
                    <td key={index}>
                      {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="table-empty-state" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;

    