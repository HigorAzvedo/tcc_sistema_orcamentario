const cargoModel = require('../model/cargoModel');

module.exports = {

    async findAll(req, res) {
        try {
            const occupation = await cargoModel.findAll();
            return res.json(occupation);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os cargos." });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const result = await cargoModel.findById(id);

            if (result === -1) {
                return res.status(404).json({ message: "Cargo não encontrado" });
            } else {
                return res.json(result);
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar o cargo." });
        }
    },

    async create(req, res) {
        try {
            const allOccupationData = req.body;

            const occupation = {
                nome: allOccupationData.nome,
                areaId: allOccupationData.areaId,
            }
            const result = await cargoModel.create(occupation);

            if (result === "CARGO_EXISTS") {
                return res.status(400).json({ message: "Cargo com este nome já cadastrado!" });
            }

            if (typeof result === 'object') {
                return res.status(201).json({ message: "Cargo cadastrado com sucesso!" });
            }

            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o cargo." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o cargo." });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const allOccupationData = req.body;

            const occupation = {
                id: id,
                nome: allOccupationData.nome,
                areaId: allOccupationData.areaId,
            }

            const result = await cargoModel.update(occupation);

            if (result === "CARGO_EXISTS") {
                return res.status(400).json({ message: "Cargo com este nome já cadastrado!" });
            }

            if (result === 0) {
                return res.status(404).json({ message: "Cargo não encontrado!" });
            } else {
                return res.status(200).json({ message: "Cargo atualizado com sucesso!" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao editar o cargo." });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await cargoModel.delete(id);

            if (result === 0) {
                return res.status(404).json({ message: "Cargo não encontrado!" });
            }

            return res.status(200).json({ message: "Cargo deletado com sucesso!" });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao deletar o cargo." });
        }
    },
}