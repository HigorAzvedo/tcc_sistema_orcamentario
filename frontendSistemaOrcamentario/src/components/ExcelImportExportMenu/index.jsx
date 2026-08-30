import React, { useEffect, useRef, useState } from 'react';
import { FaFileDownload, FaFileExcel, FaFileUpload, FaChevronDown } from 'react-icons/fa';
import api from '../../service/api';
import { toast } from 'react-toastify';
import './style.css';

const ExcelImportExportMenu = ({
    templateUrl,
    importUrl,
    fileName = 'modelo',
    importPayload = {},
    templateButtonLabel = 'Exportar modelo',
    importButtonLabel = 'Importar planilha',
    extraDownloadOptions = [],
    customExportActions = [],
    onImportSuccess,
    buttonLabel = 'Excel',
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const wrapperRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isMenuOpen) return undefined;

        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') setIsMenuOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isMenuOpen]);

    const toggleMenu = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const menuWidth = 220;
        const margin = 8;
        let left = rect.right - menuWidth;

        if (left < margin) left = rect.left;
        if (left + menuWidth > window.innerWidth - margin) {
            left = window.innerWidth - menuWidth - margin;
        }

        let top = rect.bottom + 6;
        const estimatedMenuHeight = 140 + extraDownloadOptions.length * 44;

        if (top + estimatedMenuHeight > window.innerHeight - margin) {
            top = rect.top - estimatedMenuHeight - 6;
        }

        setMenuPosition({ left, top });
        setIsMenuOpen((prev) => !prev);
    };

    const downloadExcelFile = async (url, downloadFileName, successMessage, errorMessage) => {
        setIsMenuOpen(false);
        setIsExporting(true);

        try {
            const response = await api.get(url, { responseType: 'blob' });
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${downloadFileName}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
            toast.success(successMessage);
        } catch (error) {
            console.error(errorMessage, error);
            toast.error(errorMessage);
        } finally {
            setIsExporting(false);
        }
    };

    const downloadTemplate = () =>
        downloadExcelFile(
            templateUrl,
            fileName,
            'Modelo exportado com sucesso!',
            'Erro ao exportar modelo Excel.'
        );

    const downloadExtraOption = (option) =>
        downloadExcelFile(
            option.url,
            option.fileName,
            option.successMessage || 'Arquivo exportado com sucesso!',
            option.errorMessage || 'Erro ao exportar arquivo Excel.'
        );

    const handleImportClick = () => {
        setIsMenuOpen(false);
        fileInputRef.current?.click();
    };

    const readFileAsBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result;
                const base64 = typeof result === 'string' ? result.split(',')[1] : '';
                resolve(base64);
            };
            reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
            reader.readAsDataURL(file);
        });

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) return;

        const validExtensions = ['.xlsx', '.xls'];
        const fileNameLower = file.name.toLowerCase();
        if (!validExtensions.some((ext) => fileNameLower.endsWith(ext))) {
            toast.error('Selecione um arquivo Excel (.xlsx ou .xls).');
            return;
        }

        setIsImporting(true);

        try {
            const base64File = await readFileAsBase64(file);
            const response = await api.post(importUrl, { file: base64File, ...importPayload });
            const { imported = 0, errors = [] } = response.data || {};

            if (imported > 0) {
                toast.success(response.data?.message || `${imported} item(ns) importado(s) com sucesso!`);
                onImportSuccess?.(response.data);
            } else if (errors.length > 0) {
                toast.warning(response.data?.message || 'Nenhum item foi importado. Verifique o modelo.');
            } else {
                toast.info(response.data?.message || 'Nenhum item encontrado para importar.');
            }

            if (errors.length > 0) {
                const preview = errors
                    .slice(0, 3)
                    .map((item) => `Linha ${item.row}: ${item.message}`)
                    .join(' | ');
                const suffix = errors.length > 3 ? ` (+${errors.length - 3} erro(s))` : '';
                toast.error(`${preview}${suffix}`, { autoClose: 8000 });
            }
        } catch (error) {
            console.error('Erro ao importar:', error);
            const message = error.response?.data?.message || 'Erro ao importar arquivo Excel.';
            toast.error(message);
        } finally {
            setIsImporting(false);
        }
    };

    const isBusy = isExporting || isImporting;

    // Determina se há seção de exportar e/ou importar
    const hasExportSection = !!templateUrl || extraDownloadOptions.length > 0 || customExportActions.length > 0;
    const hasImportSection = !!importUrl;

    return (
        <div className="excel-import-export-menu" ref={wrapperRef}>
            {/* Botão principal */}
            <button
                type="button"
                title="Importar / Exportar"
                className={`btn-excel-menu${isMenuOpen ? ' btn-excel-menu--open' : ''}`}
                onClick={toggleMenu}
                disabled={isBusy}
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
            >
                <FaFileExcel className="btn-excel-icon" />
                <span className="btn-excel-menu-label">
                    {isBusy ? (isImporting ? 'Importando...' : 'Exportando...') : buttonLabel}
                </span>
                <FaChevronDown className={`btn-excel-chevron${isMenuOpen ? ' btn-excel-chevron--open' : ''}`} />
            </button>

            {/* Menu dropdown */}
            {isMenuOpen && (
                <div
                    className="excel-dropdown-menu"
                    style={{ position: 'fixed', left: menuPosition.left, top: menuPosition.top, zIndex: 9999 }}
                    role="menu"
                    aria-label="Opções de importação e exportação"
                >
                    {/* Seção: Exportar */}
                    {hasExportSection && (
                        <div className="excel-dropdown-section">
                            <span className="excel-dropdown-section-label">Exportar</span>

                            {/* Ações customizadas com callback (ex.: PDF) */}
                            {customExportActions.map((action, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className="excel-dropdown-item"
                                    onClick={() => { setIsMenuOpen(false); action.onClick(); }}
                                    disabled={isBusy}
                                    role="menuitem"
                                >
                                    <span className={`excel-dropdown-item-icon ${action.iconClass || 'excel-dropdown-item-icon--custom'}`}>
                                        {action.icon || <FaFileDownload />}
                                    </span>
                                    <span className="excel-dropdown-item-text">
                                        <span className="excel-dropdown-item-title">{action.label}</span>
                                        {action.description && (
                                            <span className="excel-dropdown-item-desc">{action.description}</span>
                                        )}
                                    </span>
                                </button>
                            ))}

                            {/* Download de template padrão */}
                            {templateUrl && (
                                <button
                                    type="button"
                                    className="excel-dropdown-item"
                                    onClick={downloadTemplate}
                                    disabled={isExporting}
                                    role="menuitem"
                                >
                                    <span className="excel-dropdown-item-icon excel-dropdown-item-icon--export">
                                        <FaFileDownload />
                                    </span>
                                    <span className="excel-dropdown-item-text">
                                        <span className="excel-dropdown-item-title">{templateButtonLabel}</span>
                                        <span className="excel-dropdown-item-desc">Baixar planilha modelo vazia</span>
                                    </span>
                                </button>
                            )}

                            {/* Downloads extras */}
                            {extraDownloadOptions.map((option) => (
                                <button
                                    key={option.url}
                                    type="button"
                                    className="excel-dropdown-item"
                                    onClick={() => downloadExtraOption(option)}
                                    disabled={isExporting}
                                    role="menuitem"
                                >
                                    <span className="excel-dropdown-item-icon excel-dropdown-item-icon--export">
                                        <FaFileDownload />
                                    </span>
                                    <span className="excel-dropdown-item-text">
                                        <span className="excel-dropdown-item-title">{option.label}</span>
                                        {option.description && (
                                            <span className="excel-dropdown-item-desc">{option.description}</span>
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Divisor entre seções */}
                    {hasExportSection && hasImportSection && <div className="excel-dropdown-divider" />}

                    {/* Seção: Importar */}
                    {hasImportSection && (
                        <div className="excel-dropdown-section">
                            <span className="excel-dropdown-section-label">Importar</span>

                            <button
                                type="button"
                                className="excel-dropdown-item"
                                onClick={handleImportClick}
                                disabled={isImporting}
                                role="menuitem"
                            >
                                <span className="excel-dropdown-item-icon excel-dropdown-item-icon--import">
                                    <FaFileUpload />
                                </span>
                                <span className="excel-dropdown-item-text">
                                    <span className="excel-dropdown-item-title">{importButtonLabel}</span>
                                    <span className="excel-dropdown-item-desc">Selecionar arquivo .xlsx / .xls</span>
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Input de arquivo oculto */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                className="excel-file-input"
                onChange={handleFileChange}
                tabIndex={-1}
                aria-hidden="true"
            />
        </div>
    );
};

export default ExcelImportExportMenu;
