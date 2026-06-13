const XLSX = require('xlsx');

const buildTemplateBuffer = (columns, exampleRow = null) => {
    const rows = exampleRow ? [exampleRow] : [];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: columns });

    worksheet['!cols'] = columns.map(() => ({ wch: 28 }));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo');

    return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
};

const buildWorkbookBuffer = (rows, columns, sheetName = 'Dados') => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: columns });

    worksheet['!cols'] = columns.map(() => ({ wch: 28 }));

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
};

const parseExcelBuffer = (buffer) => {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
        return [];
    }

    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
};

const sendExcelFile = (res, filename, buffer) => {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
};

const normalizeCell = (value) => String(value ?? '').trim();

const normalizeKey = (value) => normalizeCell(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const buildNameMap = (records) => {
    const map = new Map();

    for (const record of records) {
        map.set(normalizeKey(record.nome), record.id);
    }

    return map;
};

const getCellValue = (row, keys) => {
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
            return normalizeCell(row[key]);
        }
    }

    return '';
};

module.exports = {
    buildTemplateBuffer,
    buildWorkbookBuffer,
    parseExcelBuffer,
    sendExcelFile,
    normalizeCell,
    normalizeKey,
    buildNameMap,
    getCellValue,
};
