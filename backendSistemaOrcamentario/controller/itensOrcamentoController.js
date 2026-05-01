const itensOrcamentoModel = require('../model/itensOrcamentoModel');
const db = require('../src/database/connection.js');

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
};