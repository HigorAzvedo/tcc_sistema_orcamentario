const { normalizeKey } = require('./excelService');

async function findMaterialDuplicate(dbConn, nome, fornecedorId, excludeMaterialId = null) {
    const normalizedNome = normalizeKey(nome);

    let query = dbConn('Materiais as m')
        .join('FornecedorMaterial as fm', 'fm.materialId', 'm.id')
        .where('fm.fornecedorId', fornecedorId)
        .select('m.id', 'm.nome');

    if (excludeMaterialId) {
        query = query.whereNot('m.id', excludeMaterialId);
    }

    const candidates = await query;
    return candidates.find((item) => normalizeKey(item.nome) === normalizedNome) || null;
}

async function findMaquinarioDuplicate(dbConn, nome, fornecedorId, excludeMaquinarioId = null) {
    const normalizedNome = normalizeKey(nome);

    let query = dbConn('Maquinarios as m')
        .join('FornecedorMaquinario as fm', 'fm.maquinarioId', 'm.id')
        .where('fm.fornecedorId', fornecedorId)
        .select('m.id', 'm.nome');

    if (excludeMaquinarioId) {
        query = query.whereNot('m.id', excludeMaquinarioId);
    }

    const candidates = await query;
    return candidates.find((item) => normalizeKey(item.nome) === normalizedNome) || null;
}

async function findDuplicateAmongFornecedores(dbConn, entity, nome, fornecedorIds, excludeId = null) {
    const finder = entity === 'material' ? findMaterialDuplicate : findMaquinarioDuplicate;

    for (const fornecedorId of fornecedorIds) {
        const duplicate = await finder(dbConn, nome, fornecedorId, excludeId);

        if (duplicate) {
            return { fornecedorId, itemId: duplicate.id };
        }
    }

    return null;
}

async function findCargoDuplicate(dbConn, nome, areaId, excludeCargoId = null) {
    const normalizedNome = normalizeKey(nome);

    let query = dbConn('Cargos')
        .where({ areaId })
        .select('id', 'nome');

    if (excludeCargoId) {
        query = query.whereNot('id', excludeCargoId);
    }

    const candidates = await query;
    return candidates.find((item) => normalizeKey(item.nome) === normalizedNome) || null;
}

module.exports = {
    findMaterialDuplicate,
    findMaquinarioDuplicate,
    findDuplicateAmongFornecedores,
    findCargoDuplicate,
};
