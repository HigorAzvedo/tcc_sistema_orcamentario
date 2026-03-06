const usuariosModel = require('../model/usuariosModel');

module.exports = {
    async index(req, res) {
        try {
            const usuarios = await usuariosModel.findAll();
            res.json(usuarios);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Erro ao buscar usuários' });
        }
    },

    async show(req, res) {
        try {
            const { id } = req.params;
            const usuario = await usuariosModel.findById(id);

            if (usuario === -1) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            res.json(usuario);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Erro ao buscar usuário' });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { nome, email, senha, role, ativo } = req.body;

            const usuario = await usuariosModel.findById(id);

            if (usuario === -1) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            const updateData = {
                id,
                nome: nome || usuario.nome,
                email: email || usuario.email,
                role: role || usuario.role,
                ativo: ativo !== undefined ? ativo : usuario.ativo
            };

            if (senha) {
                updateData.senha = senha;
            }

            const result = await usuariosModel.update(updateData);

            if (result === "EMAIL_EXISTS") {
                return res.status(409).json({ error: 'Email já cadastrado' });
            }

            res.json({ message: 'Usuário atualizado com sucesso' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;

            const usuario = await usuariosModel.findById(id);

            if (usuario === -1) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            await usuariosModel.delete(id);
            res.json({ message: 'Usuário deletado com sucesso' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Erro ao deletar usuário' });
        }
    }
};
