const maquinarioModel = require('../model/maquinarioModel');

const normalizeFornecedorIds = (value) => {
    const values = Array.isArray(value) ? value : (value ? [value] : []);
    return [...new Set(values.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0))];
};

module.exports = {
    async findAll(req, res) {
        try {
            var machine = await maquinarioModel.findAll();
            return res.json(machine);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os maquinários." });
        }

    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            var machine = await maquinarioModel.findById(id);

            if (machine === -1) {
                return res.status(404).json({message: "Maquinário não encontrado" })
            } else {
                return res.json(machine);
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os maquinários." });
        }

    },

    async create(req, res) {
        try {
            const allMachineData = req.body;
            const fornecedorIds = normalizeFornecedorIds(allMachineData.fornecedorId ?? allMachineData.fornecedorIds);

            if (fornecedorIds.length === 0) {
                return res.status(400).json({ message: "Selecione pelo menos um fornecedor para o maquinário." });
            }

            const machine = {
                nome: allMachineData.nome,
                descricao: allMachineData.descricao,
            }

            const result = await maquinarioModel.createWithFornecedores(machine, fornecedorIds);

            if (typeof result === 'object') {
                return res.status(201).json({ message: "Maquinário cadastrado com sucesso!" });
            }

            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o maquinario." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o maquinario." });
        }

    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const allMachineData = req.body;
            const machine = {
                id: id,
                nome: allMachineData.nome,
                descricao: allMachineData.descricao,
            }
            const result = await maquinarioModel.update(machine);

            if (result === 0) {
                return res.status(404).json({ message: "Maquinário não encontrado" });
            } else {
                return res.status(200).json({ message: "Maquinário atualizado com sucesso!" });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Ocorreu um erro ao editar o maquinário." });
        }


    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await maquinarioModel.delete(id);

            if (result === 0) {
                return res.status(404).json({ message: "Maquinário não encontrado!" });
            } else {
                return res.status(200).json({ message: "Maquinário deletado com sucesso." });
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao deletar o maquinário." });
        }

    }
    ,

    async getFornecedores(req, res) {
        try {
            const { id } = req.params;
            const fornecedores = await maquinarioModel.getFornecedores(id);
            return res.json(fornecedores);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os fornecedores." });
        }
    },

    async addFornecedor(req, res) {
        try {
            const { id } = req.params;
            const { fornecedorId } = req.body;
            const result = await maquinarioModel.addFornecedor(id, fornecedorId);

            if (result === "ASSOCIATION_EXISTS") {
                return res.status(400).json({ message: "Fornecedor já associado a este maquinário." });
            }
            return res.status(201).json({ message: "Fornecedor associado ao maquinário com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao associar o fornecedor." });
        }
    },

    async removeFornecedor(req, res) {
        try {
            const { id, fornecedorId } = req.params;
            const result = await maquinarioModel.removeFornecedor(id, fornecedorId);
            if (result === 0) {
                return res.status(404).json({ message: "Associação não encontrada." });
            }
            return res.status(200).json({ message: "Fornecedor desassociado do maquinário com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao desassociar o fornecedor." });
        }
    }
}