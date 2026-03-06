const orcamentistaModel = require('../model/orcamentistaModel');

module.exports = {

    async findAll(req, res) {
        try {
            const budgetist = await orcamentistaModel.findAll();
            return res.json(budgetist);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os orçamentistas." });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const result = await orcamentistaModel.findById(id);

            if (result === -1) {
                return res.status(404).json({ message: "Orçamentista não encontrado" });
            } else {
                return res.json(result);
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar o orçamentista." });
        }
    },

    async create(req, res) {
        try {
            const allBudgetistData = req.body;

            const budgetist = {
                nome: allBudgetistData.nome,
                email: allBudgetistData.email,
                matricula: allBudgetistData.matricula,
            }
            const result = await orcamentistaModel.create(budgetist);

            if (result === "EMAIL_EXISTS") {
                return res.status(400).json({ message: "Email já cadastrado!" });
            }

            if (result === "MATRICULA_EXISTS") {
                return res.status(400).json({ message: "Matrícula já cadastrada!" });
            }

            if (typeof result === 'object') {
                return res.status(201).json({ message: "Orçamentista cadastrado com sucesso!" });
            }

            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o orçamentista." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o orçamentista." });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const allOrcamentistaData = req.body;

            const budgetist = {
                id: id,
                nome: allOrcamentistaData.nome,
                email: allOrcamentistaData.email,
                matricula: allOrcamentistaData.matricula,
            }

            const result = await orcamentistaModel.update(budgetist);

            if (result === "EMAIL_EXISTS") {
                return res.status(400).json({ message: "Email já cadastrado!" });
            }

            if (result === "MATRICULA_EXISTS") {
                return res.status(400).json({ message: "Matrícula já cadastrada!" });
            }

            if (result === 0) {
                return res.status(404).json({ message: "Orçamentista não encontrado!" });
            } else {
                return res.status(200).json({ message: "Orçamentista atualizado com sucesso!" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao editar o orçamentista." });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await orcamentistaModel.delete(id);

            if (result === 0) {
                return res.status(404).json({ message: "Orçamentista não encontrado!" });
            }

            return res.status(200).json({ message: "Orçamentista deletado com sucesso!" });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao deletar o orçamentista." });
        }
    }
}
