const itensOrcamentoModel = require('../model/itensOrcamentoModel');

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
                idProjeto: itemsBudgetData.idProjeto,
                idMaterial: itemsBudgetData.idMaterial,
                idCargo: itemsBudgetData.idCargo,
                idMaquinario: itemsBudgetData.idMaquinario,
                valorUnitario: itemsBudgetData.valorUnitario,
                quantidade: itemsBudgetData.quantidade,
                idOrcamento: itemsBudgetData.idOrcamento,
            }

            const result = await itensOrcamentoModel.create(itemBudget);

            if (result === "PROJECT_NOT_FOUND") {
                return res.status(404).json({ message: "Projeto não encontrado." });
            }

            if (result === "BUDGET_NOT_FOUND") {
                return res.status(404).json({ message: "Orçamento não encontrado." });
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
                id: id,
                idProjeto: itemsBudgetData.idProjeto,
                idMaterial: itemsBudgetData.idMaterial,
                idCargo: itemsBudgetData.idCargo,
                idMaquinario: itemsBudgetData.idMaquinario,
                valorUnitario: itemsBudgetData.valorUnitario,
                quantidade: itemsBudgetData.quantidade,
                idOrcamento: itemsBudgetData.idOrcamento,
            }

            const result = await itensOrcamentoModel.update(itemBudget);

            if (result === "PROJECT_NOT_FOUND") {
                return res.status(404).json({ message: "Projeto não encontrado." });
            }

            if (result === "BUDGET_NOT_FOUND") {
                return res.status(404).json({ message: "Orçamento não encontrado." });
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