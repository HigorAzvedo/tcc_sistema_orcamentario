const itensOrcamentoModel = require('../model/itensOrcamentoModel');
const db = require('../src/database/connection.js');
const orcamentoModel = require('../model/orcamentoModel');
const XLSX = require('xlsx');

const toNullableInt = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const hasExactlyOneSelectedType = (itemBudget) => {
    const selectedTypes = [itemBudget.idMaterial, itemBudget.idCargo, itemBudget.idMaquinario]
        .filter(value => value !== null);

    return selectedTypes.length === 1;
};

const hasClienteAccess = (req, clienteId) => {
    const clienteIdNumber = Number(clienteId);

    if (Array.isArray(req.clienteIds)) {
        return req.clienteIds.includes(clienteIdNumber);
    }

    if (req.clienteId) {
        return Number(req.clienteId) === clienteIdNumber;
    }

    return true;
};

const getOrcamentoComProjeto = async (orcamentoId) => {
    return db('Orcamentos')
        .join('Projetos', 'Orcamentos.projetoId', '=', 'Projetos.id')
        .where('Orcamentos.id', orcamentoId)
        .select(
            'Orcamentos.id as orcamentoId',
            'Orcamentos.projetoId as orcamentoProjetoId',
            'Projetos.clienteId as clienteId'
        )
        .first();
};

module.exports = {
    async findAll(req, res) {
        try {
            const itemsBudget = await itensOrcamentoModel.findAll();
            return res.json(itemsBudget);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os itens do orçamento." });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const itemsBudget = await itensOrcamentoModel.findById(id);

            if (itemsBudget === -1) {
                return res.status(404).json({ message: "Item do orçamento não encontrado" });
            } else {
                return res.json(itemsBudget);
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar o item do orçamento." });
        }
    },

    async getAllOptions(req, res) {
        try {
            const options = await itensOrcamentoModel.getAllOptions();
            res.status(200).json(options);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Erro ao buscar opções" });
        }
    },

    async create(req, res) {
        try {
            const itemsBudgetData = req.body;

            const itemBudget = {
                idProjeto: toNullableInt(itemsBudgetData.idProjeto),
                idMaterial: toNullableInt(itemsBudgetData.idMaterial),
                idCargo: toNullableInt(itemsBudgetData.idCargo),
                idMaquinario: toNullableInt(itemsBudgetData.idMaquinario),
                valorUnitario: toNumber(itemsBudgetData.valorUnitario),
                quantidade: toNumber(itemsBudgetData.quantidade),
                idOrcamento: toNullableInt(itemsBudgetData.idOrcamento),
            };

            if (!itemBudget.idProjeto || !itemBudget.idOrcamento) {
                return res.status(400).json({ message: "Projeto e orçamento são obrigatórios." });
            }

            if (!itemBudget.valorUnitario || itemBudget.valorUnitario <= 0 || !itemBudget.quantidade || itemBudget.quantidade <= 0) {
                return res.status(400).json({ message: "Valor unitário e quantidade devem ser maiores que zero." });
            }

            if (!hasExactlyOneSelectedType(itemBudget)) {
                return res.status(400).json({ message: "Selecione exatamente um tipo de item: material, cargo ou maquinário." });
            }

            const orcamentoComProjeto = await getOrcamentoComProjeto(itemBudget.idOrcamento);

            if (!orcamentoComProjeto) {
                return res.status(404).json({ message: "Orçamento não encontrado." });
            }

            if (Number(itemBudget.idProjeto) !== Number(orcamentoComProjeto.orcamentoProjetoId)) {
                return res.status(400).json({ message: "Projeto informado não pertence ao orçamento selecionado." });
            }

            if (!hasClienteAccess(req, orcamentoComProjeto.clienteId)) {
                return res.status(403).json({ message: "Acesso negado para adicionar itens neste orçamento." });
            }

            const result = await itensOrcamentoModel.create(itemBudget);

            if (result === "PROJECT_NOT_FOUND") {
                return res.status(404).json({ message: "Projeto não encontrado." });
            }

            if (result === "BUDGET_NOT_FOUND") {
                return res.status(404).json({ message: "Orçamento não encontrado." });
            }

            if (result === "NO_ITEM_SELECTED") {
                return res.status(400).json({ message: "Selecione exatamente um tipo de item: material, cargo ou maquinário." });
            }

            if (typeof result === 'object') {
                return res.status(201).json({ message: "Item cadastrado com sucesso!" });
            }

            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o item." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o item." });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const itemsBudgetData = req.body;

            const itemBudget = {
                id: toNullableInt(id),
                idProjeto: toNullableInt(itemsBudgetData.idProjeto),
                idMaterial: toNullableInt(itemsBudgetData.idMaterial),
                idCargo: toNullableInt(itemsBudgetData.idCargo),
                idMaquinario: toNullableInt(itemsBudgetData.idMaquinario),
                valorUnitario: toNumber(itemsBudgetData.valorUnitario),
                quantidade: toNumber(itemsBudgetData.quantidade),
                idOrcamento: toNullableInt(itemsBudgetData.idOrcamento),
            };

            if (!itemBudget.id) {
                return res.status(400).json({ message: "ID do item inválido." });
            }

            if (!itemBudget.idProjeto || !itemBudget.idOrcamento) {
                return res.status(400).json({ message: "Projeto e orçamento são obrigatórios." });
            }

            if (!itemBudget.valorUnitario || itemBudget.valorUnitario <= 0 || !itemBudget.quantidade || itemBudget.quantidade <= 0) {
                return res.status(400).json({ message: "Valor unitário e quantidade devem ser maiores que zero." });
            }

            if (!hasExactlyOneSelectedType(itemBudget)) {
                return res.status(400).json({ message: "Selecione exatamente um tipo de item: material, cargo ou maquinário." });
            }

            const existingItem = await itensOrcamentoModel.findById(itemBudget.id);
            if (existingItem === -1) {
                return res.status(404).json({ message: "Item do orçamento não encontrado" });
            }

            const orcamentoComProjetoAtual = await getOrcamentoComProjeto(existingItem.idOrcamento);
            if (!orcamentoComProjetoAtual || !hasClienteAccess(req, orcamentoComProjetoAtual.clienteId)) {
                return res.status(403).json({ message: "Acesso negado para editar este item de orçamento." });
            }

            const orcamentoComProjetoDestino = await getOrcamentoComProjeto(itemBudget.idOrcamento);
            if (!orcamentoComProjetoDestino) {
                return res.status(404).json({ message: "Orçamento não encontrado." });
            }

            if (Number(itemBudget.idProjeto) !== Number(orcamentoComProjetoDestino.orcamentoProjetoId)) {
                return res.status(400).json({ message: "Projeto informado não pertence ao orçamento selecionado." });
            }

            if (!hasClienteAccess(req, orcamentoComProjetoDestino.clienteId)) {
                return res.status(403).json({ message: "Acesso negado para atualizar item neste orçamento." });
            }

            const result = await itensOrcamentoModel.update(itemBudget);

            if (result === "PROJECT_NOT_FOUND") {
                return res.status(404).json({ message: "Projeto não encontrado." });
            }

            if (result === "BUDGET_NOT_FOUND") {
                return res.status(404).json({ message: "Orçamento não encontrado." });
            }

            if (result === "NO_ITEM_SELECTED") {
                return res.status(400).json({ message: "Selecione exatamente um tipo de item: material, cargo ou maquinário." });
            }

            if (result === 0) {
                return res.status(404).json({ message: "Item do orçamento não encontrado" });
            } else {
                return res.status(200).json({ message: "Item do orçamento atualizado com sucesso!" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao atualizar o item do orçamento." });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await itensOrcamentoModel.delete(id);
            if (result === 0) {
                return res.status(404).json({ message: "Item do orçamento não encontrado" });
            }
            return res.status(200).json({ message: "Item do orçamento deletado com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao deletar o item do orçamento." });
        }
    },

    async findAllByOrcamentoId(req, res) {
        try {
            const { orcamentoId } = req.params;
            const items = await itensOrcamentoModel.findAllByOrcamentoId(orcamentoId);

            if (items === "BUDGET_NOT_FOUND") {
                return res.status(404).json({ message: "Orçamento não encontrado." });
            }

            if (!items || items.length === 0) {
                return res.status(200).json([]);
            }

            return res.status(200).json(items);
        } catch (error) {
            return res.status(500).json({ message: "Erro ao buscar itens do orçamento.", error: error.message });
        }
    }

        ,

        async importFile(req, res) {
            try {
                if (!req.file || !req.file.buffer) {
                    return res.status(400).json({ message: 'Arquivo não enviado.' });
                }

                const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                if (!sheetName) {
                    return res.status(400).json({ message: 'Planilha inválida.' });
                }

                const worksheet = workbook.Sheets[sheetName];
                const allRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                const headerRowArr = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0, defval: '' })[0] || [];

                // normalize helper
                const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

                const availableHeaders = (headerRowArr || []).map(h => norm(h));

                const requiredHeaderSets = [
                    ['projeto'],
                    ['orcamento'],
                    ['material','material '],
                    ['cargo'],
                    ['maquinario','maquinário','maquinario '],
                    ['quantidade'],
                    ['valor unitario','valor unitário','valorunitario']
                ];

                const missingHeaders = [];
                for (const set of requiredHeaderSets) {
                    const found = set.some(h => availableHeaders.includes(h));
                    if (!found) missingHeaders.push(set[0]);
                }

                if (missingHeaders.length) {
                    return res.status(400).json({ inserted: 0, errors: [{ row: 0, message: `Cabeçalho inválido. Faltando colunas: ${missingHeaders.join(', ')}` }] });
                }

                const rows = allRows;

                if (!rows.length) {
                    return res.status(400).json({ message: 'Planilha vazia.' });
                }

                const errors = [];
                const itemsToInsert = [];

                for (let i = 0; i < rows.length; i++) {
                    const rowNum = i + 2;
                    const row = rows[i];

                    const get = (names) => {
                        for (const n of names) {
                            const key = Object.keys(row).find(k => String(k).toLowerCase().trim() === n.toLowerCase().trim());
                            if (key) return row[key];
                        }
                        return '';
                    };

                    const projetoRaw = get(['projeto', 'projeto ']);
                    const orcamentoRaw = get(['orcamento']);
                    const materialRaw = get(['material']);
                    const cargoRaw = get(['cargo']);
                    const maquinarioRaw = get(['maquinário', 'maquinario']);
                    const quantidadeRaw = get(['quantidade']);
                    const valorUnitarioRaw = get(['valor unitário', 'valor unitario', 'valorunitario']);

                    const quantidade = Number(String(quantidadeRaw).replace(/\./g, '').replace(',', '.'));
                    const valorUnitario = Number(String(valorUnitarioRaw).replace(/\./g, '').replace(',', '.'));

                    if (!Number.isFinite(quantidade) || quantidade <= 0) {
                        errors.push({ row: rowNum, message: 'Quantidade inválida ou menor que zero.' });
                        continue;
                    }

                    if (!Number.isFinite(valorUnitario) || valorUnitario <= 0) {
                        errors.push({ row: rowNum, message: 'Valor unitário inválido ou menor que zero.' });
                        continue;
                    }

                    // Resolve types
                    const selectedTypes = [materialRaw, cargoRaw, maquinarioRaw].filter(v => String(v).trim() !== '');
                    if (selectedTypes.length !== 1) {
                        errors.push({ row: rowNum, message: 'Preencha exatamente uma coluna entre Material, Cargo ou Maquinário.' });
                        continue;
                    }

                    // Resolve projeto
                    let projeto = null;
                    if (String(projetoRaw).trim() !== '') {
                        const asId = parseInt(String(projetoRaw).trim(), 10);
                        if (!Number.isNaN(asId)) {
                            projeto = await db('Projetos').where({ id: asId }).first();
                        }
                        if (!projeto) {
                            const nome = String(projetoRaw).trim().toLowerCase();
                            projeto = await db('Projetos').whereRaw('lower(nome) = ?', [nome]).first();
                        }
                    }

                    if (!projeto) {
                        errors.push({ row: rowNum, message: 'Projeto não encontrado.' });
                        continue;
                    }

                    // Resolve orcamento - optional, but must match current orcamento in screen
                    const orcamentoIdScreen = req.body?.orcamentoId || req.query?.orcamentoId || null;
                    let orcamento = null;
                    if (String(orcamentoRaw).trim() !== '') {
                        const asId = parseInt(String(orcamentoRaw).trim(), 10);
                        if (!Number.isNaN(asId)) {
                            orcamento = await db('Orcamentos').where({ id: asId }).first();
                        }
                        if (!orcamento) {
                            const nome = String(orcamentoRaw).trim().toLowerCase();
                            orcamento = await db('Orcamentos').whereRaw('lower(nome) = ?', [nome]).first();
                        }
                    } else if (orcamentoIdScreen) {
                        orcamento = await db('Orcamentos').where({ id: parseInt(orcamentoIdScreen, 10) }).first();
                    }

                    if (!orcamento) {
                        errors.push({ row: rowNum, message: 'Orçamento não identificado ou inválido.' });
                        continue;
                    }

                    // Check projeto belongs to orcamento
                    const orcamentoComProjeto = await getOrcamentoComProjeto(orcamento.id);
                    if (!orcamentoComProjeto) {
                        errors.push({ row: rowNum, message: 'Orçamento não encontrado.' });
                        continue;
                    }

                    if (Number(projeto.id) !== Number(orcamentoComProjeto.orcamentoProjetoId)) {
                        errors.push({ row: rowNum, message: 'Projeto informado não pertence ao orçamento.' });
                        continue;
                    }

                    if (!hasClienteAccess(req, orcamentoComProjeto.clienteId)) {
                        errors.push({ row: rowNum, message: 'Acesso negado para adicionar itens neste orçamento.' });
                        continue;
                    }

                    // Resolve selected item id
                    let idMaterial = null, idCargo = null, idMaquinario = null, itemLabel = '';

                    if (String(materialRaw).trim() !== '') {
                        const asId = parseInt(String(materialRaw).trim(), 10);
                        let mat = null;
                        if (!Number.isNaN(asId)) mat = await db('Materiais').where({ id: asId }).first();
                        if (!mat) mat = await db('Materiais').whereRaw('lower(nome) = ?', [String(materialRaw).trim().toLowerCase()]).first();
                        if (!mat) { errors.push({ row: rowNum, message: 'Material não encontrado.' }); continue; }
                        idMaterial = mat.id; itemLabel = mat.nome;
                    }

                    if (String(cargoRaw).trim() !== '') {
                        const asId = parseInt(String(cargoRaw).trim(), 10);
                        let c = null;
                        if (!Number.isNaN(asId)) c = await db('Cargos').where({ id: asId }).first();
                        if (!c) c = await db('Cargos').whereRaw('lower(nome) = ?', [String(cargoRaw).trim().toLowerCase()]).first();
                        if (!c) { errors.push({ row: rowNum, message: 'Cargo não encontrado.' }); continue; }
                        idCargo = c.id; itemLabel = c.nome;
                    }

                    if (String(maquinarioRaw).trim() !== '') {
                        const asId = parseInt(String(maquinarioRaw).trim(), 10);
                        let m = null;
                        if (!Number.isNaN(asId)) m = await db('Maquinarios').where({ id: asId }).first();
                        if (!m) m = await db('Maquinarios').whereRaw('lower(nome) = ?', [String(maquinarioRaw).trim().toLowerCase()]).first();
                        if (!m) { errors.push({ row: rowNum, message: 'Maquinário não encontrado.' }); continue; }
                        idMaquinario = m.id; itemLabel = m.nome;
                    }

                    const itemRecord = {
                        idProjeto: projeto.id,
                        idOrcamento: orcamento.id,
                        idMaterial: idMaterial || null,
                        idCargo: idCargo || null,
                        idMaquinario: idMaquinario || null,
                        quantidade: quantidade,
                        valorUnitario: valorUnitario,
                        valorTotal: quantidade * valorUnitario
                    };

                    itemsToInsert.push(itemRecord);
                }

                if (errors.length) {
                    return res.status(400).json({ inserted: 0, errors });
                }

                const affectedOrcamentoIds = [...new Set(itemsToInsert.map(i => i.idOrcamento))];

                // Insert in transaction
                const insertedIds = [];
                await db.transaction(async (trx) => {
                    // Replace mode: each import keeps only the rows present in the uploaded file.
                    if (affectedOrcamentoIds.length) {
                        await trx('ItensOrcamento').whereIn('idOrcamento', affectedOrcamentoIds).del();
                    }

                    for (const it of itemsToInsert) {
                        const [id] = await trx('ItensOrcamento').insert(it).returning('id');
                        // knex returns id differently across DBs; normalize
                        insertedIds.push(typeof id === 'object' ? id[0] : id);
                    }
                });

                // Update totals for affected orcamentos (single or multiple)
                for (const oid of affectedOrcamentoIds) {
                    try { await orcamentoModel.updateValorTotalItens(oid); } catch (e) { /* ignore */ }
                }

                return res.status(201).json({ inserted: insertedIds.length, errors: [] });
            } catch (error) {
                console.error('Erro ao importar arquivo:', error);
                return res.status(500).json({ message: 'Erro ao processar importação.' });
            }
        }
};