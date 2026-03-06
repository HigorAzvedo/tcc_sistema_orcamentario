const orcamentoModel = require('../model/orcamentoModel');
const db = require('../src/database/connection.js');

module.exports = {

    async findAll(req, res) {
        try {
            const budgets = req.clienteId 
                ? await orcamentoModel.findByClienteId(req.clienteId)
                : await orcamentoModel.findAll();
            return res.json(budgets);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os orçamentos." });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const result = await orcamentoModel.findById(id);

            if (result === -1) {
                return res.status(404).json({ message: "Orçamento não encontrado" });
            }

            // Verifica se o usuário tem permissão para ver este orçamento
            if (req.clienteId) {
                const projeto = await db('Projetos').where({ id: result.projetoId }).first();
                if (projeto && projeto.clienteId !== req.clienteId) {
                    return res.status(403).json({ message: "Acesso negado a este orçamento." });
                }
            }

            return res.json(result);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar o orçamento." });
        }
    },

    async create(req, res) {
        var allBudgetData = req.body;

        var budget = {
            nome: allBudgetData.nome,
            dataCriacao: allBudgetData.dataCriacao,
            status: allBudgetData.status,
            projetoId: allBudgetData.projetoId,
        }

        var result = await orcamentoModel.create(budget);

        if (result === "NOME_EXISTS") {
            return res.status(400).json({ message: "Orcamento já cadastrado!" });
        }

        if (typeof result === 'object') {
            return res.status(201).json({ message: "Cliente cadastrado com sucesso!" });
        }
    },

    async update(req, res) {
        const { id } = req.params;
        var allBudgetData = req.body;

        var budget = {
            id: id,
            nome: allBudgetData.nome,
            dataCriacao: allBudgetData.dataCriacao,
            status: allBudgetData.status,
            projetoId: allBudgetData.projetoId,
        }

        if (allBudgetData.photoUri) budget.photoUri = allBudgetData.photoUri;

        var result = await orcamentoModel.update(budget);

        if (result === 0) {
            return res.status(404).json({ message: "Usuario não encontrado" });
        } else {
            return res.status(200).json({ message: "Cliente atualizado com sucesso!" });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            if (!id) throw new Error("Orcamento id não encontrado!");

            await orcamentoModel.delete(id);

            return res.status(200).json("Deletado com sucesso!");

        } catch (error) {
            console.log(error.toString());
            if (error.toString().includes("Orcamento não encontrado")) {
                return res.status(201).json("Orcamento já deletado!");
            }
            return res.status(401).json(JSON.stringify(error));
        }

    },

    async testUpdateValorTotal(req, res) {
        try {
            const { id } = req.params;
            const valorTotal = await orcamentoModel.updateValorTotalItens(id);
            return res.json({ 
                message: "Valor total atualizado com sucesso!", 
                valorTotalItens: valorTotal 
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Erro ao atualizar valor total", error: error.message });
        }
    },

    async getAllProjetos(req, res) {
        try {
            const projetos = await orcamentoModel.getAllProjetos();
            return res.status(200).json(projetos);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Erro ao buscar projetos" });
        }
    },

    async getProjetosByOrcamentoId(req, res) {
        try {
            const { id } = req.params;
            const projetos = await orcamentoModel.getProjetosByOrcamentoId(id);
            
            if (projetos === "ORCAMENTO_NOT_FOUND") {
                return res.status(404).json({ message: "Orçamento não encontrado" });
            }
            
            return res.status(200).json(projetos);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Erro ao buscar projetos do orçamento" });
        }
    },
}