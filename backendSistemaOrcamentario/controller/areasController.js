const areaModel = require('../model/areaModel');

module.exports = {

    async findAll(req, res) {
        try {
            const areas = await areaModel.findAll();
            return res.json(areas);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar as áreas." });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const result = await areaModel.findById(id);

            if (result === -1) {
                return res.status(404).json({ message: "Área não encontrada" });
            } else {
                return res.json(result);
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar a área." });
        }
    },

    async create(req, res) {
        try {
            const allAreaData = req.body;
            const area = {
                nome: allAreaData.nome,
            }
            const result = await areaModel.create(area);

            if (result === "AREA_EXISTS") {
                return res.status(400).json({ message: "Área com este nome já cadastrada!" });
            }

            if (typeof result === 'object') {
                return res.status(201).json({ message: "Área cadastrada com sucesso!" });
            }

            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar a área." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar a área." });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const allAreaData = req.body;

            const area = {
                id: id,
                nome: allAreaData.nome,
            }

            const result = await areaModel.update(area);

            if (result === "AREA_EXISTS") {
                return res.status(400).json({ message: "Área com este nome já cadastrada!" });
            }

            if (result === 0) {
                return res.status(404).json({ message: "Área não encontrada!" });
            } else {
                return res.status(200).json({ message: "Área atualizada com sucesso!" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao editar a área." });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await areaModel.delete(id);

            if (result === 0) {
                return res.status(404).json({ message: "Área não encontrada!" });
            }

            return res.status(200).json({ message: "Área deletada com sucesso!" });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao deletar a área." });
        }
    }
}
