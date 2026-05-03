// src/components/Table.jsx
import React, { useMemo, useState } from "react";
import "./style.css";
import { FaSearch, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from "react-icons/fa";

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

function parseDate(dateStr) {
  if (!dateStr) return null;

  // Tenta formato DD/MM/YYYY (brasileiro)
  const brFormatMatch = String(dateStr).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brFormatMatch) {
    return new Date(brFormatMatch[3], brFormatMatch[2] - 1, brFormatMatch[1]);
  }

  // Tenta ISO format (YYYY-MM-DD)
  const isoFormatMatch = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoFormatMatch) {
    return new Date(isoFormatMatch[1], isoFormatMatch[2] - 1, isoFormatMatch[3]);
  }

  // Tenta parse como Date nativo
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

function compareValues(a, b) {
  // Trata valores nulos/undefined
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  const normalizedA = normalizeValue(a).trim();
  const normalizedB = normalizeValue(b).trim();

  // Tenta comparar como datas
  const dateA = parseDate(normalizedA);
  const dateB = parseDate(normalizedB);

  if (dateA && dateB) {
    return dateA.getTime() - dateB.getTime();
  }

  // Tenta comparar como números
  const numA = parseFloat(normalizedA);
  const numB = parseFloat(normalizedB);

  if (!isNaN(numA) && !isNaN(numB) && normalizedA !== "" && normalizedB !== "") {
    return numA - numB;
  }

  // Compara como strings
  return normalizedA.toLowerCase().localeCompare(normalizedB.toLowerCase(), "pt-BR");
}

function Table({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Pesquisar na tabela",
  searchableColumns,
  emptyMessage = "Nenhum registro encontrado.",
  sortable = true,
  sortableColumns,
  pagination = true,
  pageSize = 8,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" ou "desc"
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const columnsToSearch = useMemo(() => {
    if (Array.isArray(searchableColumns) && searchableColumns.length > 0) {
      return searchableColumns;
    }

    return columns.map((col) => col.accessor);
  }, [columns, searchableColumns]);

  const columnsSortable = useMemo(() => {
    if (Array.isArray(sortableColumns) && sortableColumns.length > 0) {
      return sortableColumns;
    }

    return columns.map((col) => col.accessor);
  }, [columns, sortableColumns]);

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

  const sortedData = useMemo(() => {
    if (!sortable || !sortColumn) {
      return filteredData;
    }

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a?.[sortColumn];
      const bValue = b?.[sortColumn];

      let comparison = compareValues(aValue, bValue);

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [filteredData, sortColumn, sortDirection, sortable]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortColumn, sortDirection, data]);

  const totalPages = Math.max(1, Math.ceil((sortedData || []).length / (pagination ? pageSize : Infinity)));

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const handleHeaderClick = (accessor) => {
    if (!sortable || !columnsSortable.includes(accessor)) {
      return;
    }

    if (sortColumn === accessor) {
      // Inverte direção se clicar na mesma coluna
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Muda para nova coluna, começa com ascendente
      setSortColumn(accessor);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (accessor) => {
    if (!sortable || !columnsSortable.includes(accessor)) {
      return null;
    }

    const isActive = sortColumn === accessor;
    const direction = isActive ? sortDirection : "asc";

    return direction === "asc" ? (
      <FaArrowUp className={`table-sort-icon ${isActive ? "active" : "inactive"}`} />
    ) : (
      <FaArrowDown className={`table-sort-icon ${isActive ? "active" : "inactive"}`} />
    );
  };

  return (
    <div className="table-wrapper">
      {searchable && (
        <div className="table-search-container">
          <div className="table-search-position">
            <input
              type="search"
              className="table-search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Pesquisar registros da tabela"
            />
            <FaSearch className="table-search-icon" />
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  onClick={() => handleHeaderClick(col.accessor)}
                  className={`
                    ${sortable && columnsSortable.includes(col.accessor) ? "sortable" : ""}
                    ${sortColumn === col.accessor ? "sorted" : ""}
                  `}
                >
                  <div className="th-content">
                    <span>{col.header}</span>
                    {getSortIcon(col.accessor)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, i) => (
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
      {pagination && totalPages > 1 && (
        <div className="table-pagination">
          <button
            className="pagination-button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <FaArrowLeft />
          </button>

          <div className="pagination-info">Página {currentPage} de {totalPages}</div>

          <button
            className="pagination-button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <FaArrowRight />
          </button>
        </div>
      )}
    </div>
  );
}

export default Table;

