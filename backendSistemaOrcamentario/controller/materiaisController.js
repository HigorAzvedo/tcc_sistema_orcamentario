const materiaisModel = require('../model/materiaisModel');

const normalizeFornecedorIds = (value) => {
    const values = Array.isArray(value) ? value : (value ? [value] : []);
    return [...new Set(values.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0))];
};

module.exports = {

    async findAll(req, res) {
        try {
            const materials = await materiaisModel.findAll();
            return res.json(materials);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os materiais." });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const result = await materiaisModel.findById(id);

            if (result === -1) {
                return res.status(404).json({ message: "Material não encontrado" });
            } else {
                return res.json(result);
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar o material." });
        }
    },

    async create(req, res) {
        try {
            const allMaterialsData = req.body;
            const fornecedorIds = normalizeFornecedorIds(allMaterialsData.fornecedorId ?? allMaterialsData.fornecedorIds);

            if (fornecedorIds.length === 0) {
                return res.status(400).json({ message: "Selecione pelo menos um fornecedor para o material." });
            }

            const materials = {
                nome: allMaterialsData.nome,
                descricao: allMaterialsData.descricao,
                unidadeMedida: allMaterialsData.unidadeMedida,
                areaId: allMaterialsData.areaId,
            }

            const result = await materiaisModel.createWithFornecedores(materials, fornecedorIds);

            if (typeof result === 'object') {
                return res.status(201).json({ message: "Material cadastrado com sucesso!" });
            }

            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o material." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o material." });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const allMaterialsData = req.body;

            const materials = {
                id: id,
                nome: allMaterialsData.nome,
                descricao: allMaterialsData.descricao,
                unidadeMedida: allMaterialsData.unidadeMedida,
                areaId: allMaterialsData.areaId,
            }

            const result = await materiaisModel.update(materials);

            if (result === 0) {
                return res.status(404).json({ message: "Material não encontrado!" });
            } else {
                return res.status(200).json({ message: "Material atualizado com sucesso!" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao editar o material." });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await materiaisModel.delete(id);

            if (result === 0) {
                return res.status(404).json({ message: "Material não encontrado!" });
            }

            return res.status(200).json({ message: "Material deletado com sucesso!" });

        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao deletar o material." });
        }
    },

    async addFornecedor(req, res) {
        try {
            const { id } = req.params;
            const { fornecedorId } = req.body;
            const result = await materiaisModel.addFornecedor(id, fornecedorId);

            if (result === "ASSOCIATION_EXISTS") {
                return res.status(400).json({ message: "Fornecedor já associado a este material." });
            }
            return res.status(201).json({ message: "Fornecedor associado ao material com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao associar o fornecedor." });
        }
    },

    async removeFornecedor(req, res) {
        try {
            const { id, fornecedorId } = req.params;
            const result = await materiaisModel.removeFornecedor(id, fornecedorId);
            if (result === 0) {
                return res.status(404).json({ message: "Associação não encontrada." });
            }
            return res.status(200).json({ message: "Fornecedor desassociado do material com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao desassociar o fornecedor." });
        }
    },

    async getFornecedores(req, res) {
        try {
            const { id } = req.params;
            const fornecedores = await materiaisModel.getFornecedores(id);
            return res.json(fornecedores);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os fornecedores." });
        }
    }
}