const projetoModel = require('../model/projetoModel');

module.exports = {
    async findAll(req, res) {
        try {
            // Se clienteId está definido (usuário tipo 'user'), filtra por cliente
            // Se clienteId é null (admin/manager), retorna todos
            const projects = req.clienteId 
                ? await projetoModel.findByClienteId(req.clienteId)
                : await projetoModel.findAll();
            return res.json(projects);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os projetos." });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const project = await projetoModel.findById(id);

            if (project === -1) {
                return res.status(404).json("Projeto não encontrado")
            }

            // Verifica se o usuário tem permissão para ver este projeto
            if (req.clienteId && project.clienteId !== req.clienteId) {
                return res.status(403).json({ message: "Acesso negado a este projeto." });
            }

            return res.json(project);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar o projeto." });
        }

    },

    async create(req, res) {
        try {

            const newProject = req.body;

            var projeto = {
                nome: newProject.nome,
                descricao: newProject.descricao,
                dataInicio: newProject.dataInicio,
                dataFim: newProject.dataFim,
                clienteId: newProject.clienteId,
            }

            var result = await projetoModel.create(projeto);

            if (result === "CLIENT_NOT_FOUND"){
                return res.status(404).json({ message: "Cliente não encontrado!" });
            }

            if (result === "PROJECT_EXISTS") {
                return res.status(400).json({ message: "Projeto já cadastrado!" });
            }

            if (typeof result === 'object') {
                return res.status(201).json({ message: "Projeto cadastrado com sucesso!" });
            }

            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o projeto." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o projeto." });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const allProjectData = req.body;

            var project = {
                id: id,
                nome: allProjectData.nome,
                descricao: allProjectData.descricao,
                dataInicio: allProjectData.dataInicio,
                dataFim: allProjectData.dataFim,
                clienteId: allProjectData.clienteId,
            }

            var result = await projetoModel.update(project);

            if (result === "CLIENT_NOT_FOUND"){
                return res.status(404).json({ message: "Cliente não encontrado!" });
            }

            if (result === "PROJECT_EXISTS") {
                return res.status(400).json({ message: "Projeto com este nome já cadastrado!" });
            }

            if (result === 0) {
                return res.status(404).json({ message: "Projeto não encontrado" });
            } else {
                return res.status(200).json({ message: "Projeto atualizado com sucesso!" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao atualizar o projeto." });
        }


    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            var result = await projetoModel.delete(id);

            if (result === 0) {
                return res.status(404).json({ message: "Projeto não encontrado." });
            }

            return res.status(200).json({ message: "Projeto deletado com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao deletar o projeto." });
        }

    }
};