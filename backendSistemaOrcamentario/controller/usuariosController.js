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
    },

    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { nome, email, senhaAtual, novaSenha } = req.body;

            const usuario = await usuariosModel.findById(userId);

            if (usuario === -1) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            if (novaSenha && !senhaAtual) {
                return res.status(400).json({ error: 'Senha atual é obrigatória para alterar a senha' });
            }

            if (senhaAtual && novaSenha) {
                const usuarioCompleto = await usuariosModel.findByEmail(usuario.email);
                const bcrypt = require('bcrypt');
                const senhaValida = await bcrypt.compare(senhaAtual, usuarioCompleto.senha);
                
                if (!senhaValida) {
                    return res.status(401).json({ error: 'Senha atual incorreta' });
                }

                if (novaSenha.length < 6) {
                    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
                }
            }

            const updateData = {
                id: userId,
                nome: nome || usuario.nome,
                email: email || usuario.email,
                role: usuario.role,
                ativo: usuario.ativo
            };

            if (novaSenha) {
                updateData.senha = novaSenha;
            }

            const result = await usuariosModel.update(updateData);

            if (result === "EMAIL_EXISTS") {
                return res.status(409).json({ error: 'Email já cadastrado' });
            }

            const usuarioAtualizado = await usuariosModel.findById(userId);

            res.json({ 
                message: 'Perfil atualizado com sucesso',
                user: usuarioAtualizado
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Erro ao atualizar perfil' });
        }
    }
};
