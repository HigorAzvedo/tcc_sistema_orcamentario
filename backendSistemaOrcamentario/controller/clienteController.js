const clienteModel = require('../model/clienteModel');

module.exports = {

    async findAll(req, res) {
        try {
            const users = await clienteModel.findAll();
            return res.json(users);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os clientes." });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const result = await clienteModel.findById(id);

            if (result === -1) {
                return res.status(404).json({ message: "Usuario não encontrado" });
            } else {
                return res.json(result);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Ocorreu um erro ao buscar o cliente." });
        }
    },

    async create(req, res) {
        try {
            const allUserData = req.body;

            const user = {
                nome: allUserData.nome,
                email: allUserData.email,
                endereco: allUserData.endereco,
                telefone: allUserData.telefone,
                cpfCnpj: allUserData.cpfCnpj,
                tipo: allUserData.tipo,
            }

            const result = await clienteModel.create(user);

            if (result === "EMAIL_EXISTS") {
                return res.status(400).json({ message: "Email já cadastrado!" });
            }

            if (result === "CPF_CNPJ_EXISTS") {
                return res.status(400).json({ message: "CPF/CNPJ já cadastrado!" });
            }

            if (typeof result === 'object') {
                return res.status(201).json({ message: "Cliente cadastrado com sucesso!" });
            }

            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o cliente." });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o cliente." });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const allUserData = req.body;

            const user = {
                id: id,
                nome: allUserData.nome,
                email: allUserData.email,
                endereco: allUserData.endereco,
                telefone: allUserData.telefone,
                cpfCnpj: allUserData.cpfCnpj,
                tipo: allUserData.tipo,
            }

            if (allUserData.photoUri) user.photoUri = allUserData.photoUri;

            const result = await clienteModel.update(user);

            if (result === "EMAIL_EXISTS") {
                return res.status(400).json({ message: "Email já cadastrado!" });
            }

            if (result === "CPF_CNPJ_EXISTS") {
                return res.status(400).json({ message: "CPF/CNPJ já cadastrado!" });
            }

            if (result === 0) {
                return res.status(404).json({ message: "Usuario não encontrado" });
            } else {
                return res.status(200).json({ message: "Cliente atualizado com sucesso!" });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Ocorreu um erro ao atualizar o cliente." });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;

            const result = await clienteModel.delete(id);

            if (result === 0) {
                return res.status(404).json({ message: "Cliente não encontrado." });
            }

            return res.status(200).json({ message: "Cliente deletado com sucesso." });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Ocorreu um erro ao deletar o cliente.", error: error.message });
        }
    },

    async linkUsuario(req, res) {
        try {
            const { id } = req.params;
            const { usuarioId } = req.body;

            if (!usuarioId) {
                return res.status(400).json({ message: "usuarioId é obrigatório." });
            }

            const result = await clienteModel.linkUsuario(id, usuarioId);

            if (result === 0) {
                return res.status(404).json({ message: "Cliente não encontrado." });
            }

            return res.status(200).json({ message: "Usuário vinculado ao cliente com sucesso." });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Ocorreu um erro ao vincular o usuário." });
        }
    },

    async unlinkUsuario(req, res) {
        try {
            const { id } = req.params;

            const result = await clienteModel.unlinkUsuario(id);

            if (result === 0) {
                return res.status(404).json({ message: "Cliente não encontrado." });
            }

            return res.status(200).json({ message: "Usuário desvinculado do cliente com sucesso." });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Ocorreu um erro ao desvincular o usuário." });
        }
    }
}