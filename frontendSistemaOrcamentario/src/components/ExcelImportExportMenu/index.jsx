import React, { useEffect, useRef, useState } from 'react';
import { FaFileDownload, FaFileExcel, FaFileUpload } from 'react-icons/fa';
import api from '../../service/api';
import { toast } from 'react-toastify';
import '../../pages/Pages.css';
import './style.css';

const ExcelImportExportMenu = ({
    templateUrl,
    importUrl,
    fileName = 'modelo',
    importPayload = {},
    templateButtonLabel = 'Exportar modelo',
    importButtonLabel = 'Importar modelo',
    extraDownloadOptions = [],
    onImportSuccess,
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
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
            }
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
        const menuWidth = 200;
        const margin = 8;
        let left = rect.right - menuWidth;

        if (left < margin) left = rect.left;
        if (left + menuWidth > window.innerWidth - margin) {
            left = window.innerWidth - menuWidth - margin;
        }

        let top = rect.bottom + 6;
        const estimatedMenuHeight = 96 + (extraDownloadOptions.length * 44);

        if (top + estimatedMenuHeight > window.innerHeight - margin) {
            top = rect.top - estimatedMenuHeight - 6;
        }

        setMenuPosition({ left, top });
        setIsMenuOpen((current) => !current);
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

    const downloadTemplate = () => {
        downloadExcelFile(
            templateUrl,
            fileName,
            'Modelo exportado com sucesso!',
            'Erro ao exportar modelo Excel.'
        );
    };

    const downloadExtraOption = (option) => {
        downloadExcelFile(
            option.url,
            option.fileName,
            option.successMessage || 'Arquivo exportado com sucesso!',
            option.errorMessage || 'Erro ao exportar arquivo Excel.'
        );
    };

    const handleImportClick = () => {
        setIsMenuOpen(false);
        fileInputRef.current?.click();
    };

    const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
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
        const isValidExtension = validExtensions.some((ext) => fileNameLower.endsWith(ext));

        if (!isValidExtension) {
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
            console.error('Erro ao importar modelo:', error);
            const message = error.response?.data?.message || 'Erro ao importar arquivo Excel.';
            toast.error(message);
        } finally {
            setIsImporting(false);
        }
    };

    const isBusy = isExporting || isImporting;

    return (
        <div className="export-menu-wrapper excel-import-export-menu" ref={wrapperRef}>
            <button
                type="button"
                title="Importar / Exportar Excel"
                className="btn-excel-menu"
                onClick={toggleMenu}
                disabled={isBusy}
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
            >
                <FaFileExcel />
                <span className="btn-excel-menu-label">Excel</span>
            </button>

            {isMenuOpen && (
                <div
                    className="export-tooltip-menu"
                    style={{ position: 'fixed', left: menuPosition.left, top: menuPosition.top, zIndex: 9999 }}
                    role="menu"
                >
                    <button
                        type="button"
                        className="export-option"
                        onClick={downloadTemplate}
                        disabled={isExporting}
                        role="menuitem"
                    >
                        <FaFileDownload /> {templateButtonLabel}
                    </button>
                    <button
                        type="button"
                        className="export-option"
                        onClick={handleImportClick}
                        disabled={isImporting}
                        role="menuitem"
                    >
                        <FaFileUpload /> {importButtonLabel}
                    </button>
                    {extraDownloadOptions.map((option) => (
                        <button
                            key={option.url}
                            type="button"
                            className="export-option"
                            onClick={() => downloadExtraOption(option)}
                            disabled={isExporting}
                            role="menuitem"
                        >
                            <FaFileDownload /> {option.label}
                        </button>
                    ))}
                </div>
            )}

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
