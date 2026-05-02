const projetoModel = require('../model/projetoModel');

const hasClienteAccess = (req, clienteId) => {
    const clienteIdNumber = Number(clienteId);

    if (Array.isArray(req.clienteIds)) {
        return req.clienteIds.includes(clienteIdNumber);
    }

    if (req.clienteId) {
        return Number(req.clienteId) === clienteIdNumber;
    }

    return true;
};

module.exports = {
    async findAll(req, res) {
        try {
            const projects = Array.isArray(req.clienteIds)
                ? await projetoModel.findByClienteIds(req.clienteIds)
                : req.clienteId
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
            if (!hasClienteAccess(req, project.clienteId)) {
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
            const clienteId = Number(newProject.clienteId);

            if (!hasClienteAccess(req, clienteId)) {
                return res.status(403).json({ message: "Acesso negado para vincular projeto a este cliente." });
            }

            var projeto = {
                nome: newProject.nome,
                descricao: newProject.descricao,
                dataInicio: newProject.dataInicio,
                dataFim: newProject.dataFim,
                clienteId,
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

            const existingProject = await projetoModel.findById(id);

            if (existingProject === -1) {
                return res.status(404).json({ message: "Projeto não encontrado" });
            }

            if (!hasClienteAccess(req, existingProject.clienteId)) {
                return res.status(403).json({ message: "Acesso negado para editar este projeto." });
            }

            if (!hasClienteAccess(req, allProjectData.clienteId)) {
                return res.status(403).json({ message: "Acesso negado para vincular projeto a este cliente." });
            }

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
            const project = await projetoModel.findById(id);

            if (project === -1) {
                return res.status(404).json({ message: "Projeto não encontrado." });
            }

            if (!hasClienteAccess(req, project.clienteId)) {
                return res.status(403).json({ message: "Acesso negado para deletar este projeto." });
            }

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