const maquinarioModel = require('../model/maquinarioModel');

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
            const machine = {
                nome: allMachineData.nome,
                descricao: allMachineData.descricao,
                valor: allMachineData.valor,
            }

            const result = await maquinarioModel.create(machine);

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
                valor: allMachineData.valor,
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
}