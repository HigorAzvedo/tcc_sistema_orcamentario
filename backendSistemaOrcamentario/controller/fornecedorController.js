const fornecedorModel = require('../model/fornecedorModel');

module.exports = {

    async findAll(req, res) {
        try {
            const supplier = await fornecedorModel.findAll();
            return res.json(supplier);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os fornecedores." });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const result = await fornecedorModel.findById(id);

            if (result === -1) {
                return res.status(404).json({ message: "Fornecedor não encontrado" });
            } else {
                return res.json(result);
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar o fornecedor." });
        }
    },

    async create(req, res) {
        try {
            const allSupplierData = req.body;

            const supplier = {
                nome: allSupplierData.nome,
                email: allSupplierData.email,
                cnpj: allSupplierData.cnpj,
                telefone: allSupplierData.telefone,
                endereco: allSupplierData.endereco,
            }

            const result = await fornecedorModel.create(supplier);

            if (result === "NOME_EXISTS") {
                return res.status(400).json({ message: "Nome já cadastrado!" });
            }

            if (result === "EMAIL_EXISTS") {
                return res.status(400).json({ message: "Email já cadastrado!" });
            }

            if (result === "CNPJ_EXISTS") {
                return res.status(400).json({ message: "CNPJ já cadastrado!" });
            }

            if (result === "TELEFONE_EXISTS") {
                return res.status(400).json({ message: "Telefone já cadastrado!" });
            }

            if (typeof result === 'object') {
                return res.status(201).json({ message: "Fornecedor cadastrado com sucesso!" });
            }

            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o fornecedor." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o fornecedor." });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const allSupplierData = req.body;

            const supplier = {
                id: id,
                nome: allSupplierData.nome,
                email: allSupplierData.email,
                cnpj: allSupplierData.cnpj,
                telefone: allSupplierData.telefone,
                endereco: allSupplierData.endereco,
            }

            const result = await fornecedorModel.update(supplier);

            if (result === "NOME_EXISTS") {
                return res.status(400).json({ message: "Nome já cadastrado!" });
            }
            if (result === "EMAIL_EXISTS") {
                return res.status(400).json({ message: "Email já cadastrado!" });
            }
            if (result === "CNPJ_EXISTS") {
                return res.status(400).json({ message: "CNPJ já cadastrado!" });
            }
            if (result === "TELEFONE_EXISTS") {
                return res.status(400).json({ message: "Telefone já cadastrado!" });
            }

            if (result === 0) {
                return res.status(404).json({ message: "Fornecedor não encontrado" });
            } else {
                return res.status(200).json({ message: "Fornecedor atualizado com sucesso!" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao atualizar o fornecedor." });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await fornecedorModel.delete(id);

            if (result === 0) {
                return res.status(404).json({ message: "Fornecedor não encontrado." });
            }

            return res.status(200).json({ message: "Fornecedor deletado com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao deletar o fornecedor." });
        }
    },

    async addMaterial(req, res) {
        try {
            const { id } = req.params;
            const { materialId } = req.body;
            const result = await fornecedorModel.addMaterial(id, materialId);

            if (result === "ASSOCIATION_EXISTS") {
                return res.status(400).json({ message: "Associação já existe." });
            }
            return res.status(201).json({ message: "Material associado ao fornecedor com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao associar o material." });
        }
    },

    async removeMaterial(req, res) {
        try {
            const { id, materialId } = req.params;
            const result = await fornecedorModel.removeMaterial(id, materialId);
            if (result === 0) {
                return res.status(404).json({ message: "Associação não encontrada." });
            }
            return res.status(200).json({ message: "Material desassociado do fornecedor com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao desassociar o material." });
        }
    },

    async addMaquinario(req, res) {
        try {
            const { id } = req.params;
            const { maquinarioId } = req.body;
            const result = await fornecedorModel.addMaquinario(id, maquinarioId);

            if (result === "ASSOCIATION_EXISTS") {
                return res.status(400).json({ message: "Associação já existe." });
            }
            return res.status(201).json({ message: "Maquinário associado ao fornecedor com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao associar o maquinário." });
        }
    },

    async removeMaquinario(req, res) {
        try {
            const { id, maquinarioId } = req.params;
            const result = await fornecedorModel.removeMaquinario(id, maquinarioId);
            if (result === 0) {
                return res.status(404).json({ message: "Associação não encontrada." });
            }
            return res.status(200).json({ message: "Maquinário desassociado do fornecedor com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao desassociar o maquinário." });
        }
    }
}