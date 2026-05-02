const orcamentistaModel = require('../model/orcamentistaModel');

module.exports = {

    async findAll(req, res) {
        try {
            const budgetist = await orcamentistaModel.findAll();
            return res.json(budgetist);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os orçamentistas." });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const result = await orcamentistaModel.findById(id);

            if (result === -1) {
                return res.status(404).json({ message: "Orçamentista não encontrado" });
            } else {
                return res.json(result);
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar o orçamentista." });
        }
    },

    async create(req, res) {
        try {
            const allBudgetistData = req.body;

            if (!allBudgetistData.nome || !allBudgetistData.email || !allBudgetistData.matricula) {
                return res.status(400).json({ message: "Nome, email e matrícula são obrigatórios!" });
            }

            if (allBudgetistData.senha) {
                if (allBudgetistData.senha.length < 6) {
                    return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres!" });
                }

                const result = await orcamentistaModel.createWithUser({
                    nome: allBudgetistData.nome,
                    email: allBudgetistData.email,
                    matricula: allBudgetistData.matricula,
                    senha: allBudgetistData.senha
                });

                if (result === "EMAIL_EXISTS") {
                    return res.status(400).json({ message: "Email já cadastrado!" });
                }

                if (result === "MATRICULA_EXISTS") {
                    return res.status(400).json({ message: "Matrícula já cadastrada!" });
                }

                if (result.usuarioId && result.orcamentistaId) {
                    return res.status(201).json({ 
                        message: "Orçamentista e usuário cadastrados com sucesso!",
                        data: {
                            usuarioId: result.usuarioId,
                            orcamentistaId: result.orcamentistaId
                        }
                    });
                }

                return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o orçamentista." });
            } else {
                // Modo legado: criar apenas orçamentista (requer usuarioId)
                const budgetist = {
                    nome: allBudgetistData.nome,
                    email: allBudgetistData.email,
                    matricula: allBudgetistData.matricula,
                    usuarioId: allBudgetistData.usuarioId
                }

                if (!budgetist.usuarioId) {
                    return res.status(400).json({ 
                        message: "Para criar orçamentista sem senha, é necessário informar o usuarioId!" 
                    });
                }

                const result = await orcamentistaModel.create(budgetist);

                if (result === "EMAIL_EXISTS") {
                    return res.status(400).json({ message: "Email já cadastrado!" });
                }

                if (result === "MATRICULA_EXISTS") {
                    return res.status(400).json({ message: "Matrícula já cadastrada!" });
                }

                if (typeof result === 'object') {
                    return res.status(201).json({ message: "Orçamentista cadastrado com sucesso!" });
                }

                return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o orçamentista." });
            }
        } catch (error) {
            console.error('Erro ao cadastrar orçamentista:', error);
            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o orçamentista." });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const allOrcamentistaData = req.body;

            const budgetist = {
                id: id,
                nome: allOrcamentistaData.nome,
                email: allOrcamentistaData.email,
                matricula: allOrcamentistaData.matricula,
            }

            const result = await orcamentistaModel.update(budgetist);

            if (result === "EMAIL_EXISTS") {
                return res.status(400).json({ message: "Email já cadastrado!" });
            }

            if (result === "MATRICULA_EXISTS") {
                return res.status(400).json({ message: "Matrícula já cadastrada!" });
            }

            if (result === 0) {
                return res.status(404).json({ message: "Orçamentista não encontrado!" });
            } else {
                return res.status(200).json({ message: "Orçamentista atualizado com sucesso!" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao editar o orçamentista." });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await orcamentistaModel.delete(id);

            if (result === 0) {
                return res.status(404).json({ message: "Orçamentista não encontrado!" });
            }

            return res.status(200).json({ message: "Orçamentista deletado com sucesso!" });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao deletar o orçamentista." });
        }
    },

    // Métodos para gerenciar vínculos com clientes
    async vincularCliente(req, res) {
        try {
            const { orcamentistaId, clienteId } = req.body;

            if (!orcamentistaId || !clienteId) {
                return res.status(400).json({ 
                    message: "Orçamentista e cliente são obrigatórios!" 
                });
            }

            const result = await orcamentistaModel.vincularCliente(orcamentistaId, clienteId);

            if (result === "VINCULO_EXISTS") {
                return res.status(400).json({ 
                    message: "Este cliente já está vinculado ao orçamentista!" 
                });
            }

            return res.status(201).json({ 
                message: "Cliente vinculado ao orçamentista com sucesso!" 
            });
        } catch (error) {
            return res.status(500).json({ 
                message: "Ocorreu um erro ao vincular o cliente." 
            });
        }
    },

    async desvincularCliente(req, res) {
        try {
            const { orcamentistaId, clienteId } = req.params;

            const result = await orcamentistaModel.desvincularCliente(orcamentistaId, clienteId);

            if (result === 0) {
                return res.status(404).json({ 
                    message: "Vínculo não encontrado!" 
                });
            }

            return res.status(200).json({ 
                message: "Cliente desvinculado com sucesso!" 
            });
        } catch (error) {
            return res.status(500).json({ 
                message: "Ocorreu um erro ao desvincular o cliente." 
            });
        }
    },

    async getClientesVinculados(req, res) {
        try {
            const { id } = req.params;

            const clientes = await orcamentistaModel.getClientesVinculados(id);
            return res.json(clientes);
        } catch (error) {
            return res.status(500).json({ 
                message: "Ocorreu um erro ao buscar os clientes vinculados." 
            });
        }
    },

    async getMeusDados(req, res) {
        try {
            const usuarioId = req.user.id; // Vem do middleware de autenticação

            const orcamentista = await orcamentistaModel.findByUsuarioId(usuarioId);

            if (!orcamentista) {
                return res.status(404).json({ 
                    message: "Orçamentista não encontrado para este usuário!" 
                });
            }

            // Buscar clientes vinculados
            const clientes = await orcamentistaModel.getClientesVinculados(orcamentista.id);

            return res.json({
                orcamentista,
                clientes
            });
        } catch (error) {
            return res.status(500).json({ 
                message: "Ocorreu um erro ao buscar os dados do orçamentista." 
            });
        }
    },

    async getMeusClientes(req, res) {
        try {
            const usuarioId = req.user.id;

            const orcamentista = await orcamentistaModel.findByUsuarioId(usuarioId);

            if (!orcamentista) {
                return res.status(404).json({ 
                    message: "Orçamentista não encontrado para este usuário!" 
                });
            }

            const clientes = await orcamentistaModel.getClientesVinculados(orcamentista.id);
            const clientesFormatados = clientes.map(cliente => ({
                value: cliente.id,
                label: cliente.nome
            }));
            return res.json(clientesFormatados);
        } catch (error) {
            return res.status(500).json({ 
                message: "Ocorreu um erro ao buscar os clientes." 
            });
        }
    },

    async getMeusProjetos(req, res) {
        try {
            const usuarioId = req.user.id;

            const orcamentista = await orcamentistaModel.findByUsuarioId(usuarioId);

            if (!orcamentista) {
                return res.status(404).json({ 
                    message: "Orçamentista não encontrado para este usuário!" 
                });
            }

            const projetos = await orcamentistaModel.getProjetosDoCliente(orcamentista.id);
            return res.json(projetos);
        } catch (error) {
            return res.status(500).json({ 
                message: "Ocorreu um erro ao buscar os projetos." 
            });
        }
    },

    async getMeusOrcamentos(req, res) {
        try {
            const usuarioId = req.user.id;

            const orcamentista = await orcamentistaModel.findByUsuarioId(usuarioId);

            if (!orcamentista) {
                return res.status(404).json({ 
                    message: "Orçamentista não encontrado para este usuário!" 
                });
            }

            const orcamentos = await orcamentistaModel.getOrcamentosDoCliente(orcamentista.id);
            return res.json(orcamentos);
        } catch (error) {
            return res.status(500).json({ 
                message: "Ocorreu um erro ao buscar os orçamentos." 
            });
        }
    },

    // Método para orçamentista se auto-vincular a um cliente
    async autoVincularCliente(req, res) {
        try {
            const usuarioId = req.user.id;
            const { clienteId } = req.body;

            if (!clienteId) {
                return res.status(400).json({ 
                    message: "Cliente é obrigatório!" 
                });
            }

            const orcamentista = await orcamentistaModel.findByUsuarioId(usuarioId);

            if (!orcamentista) {
                return res.status(404).json({ 
                    message: "Orçamentista não encontrado para este usuário!" 
                });
            }

            const result = await orcamentistaModel.vincularCliente(orcamentista.id, clienteId);

            if (result === "VINCULO_EXISTS") {
                return res.status(400).json({ 
                    message: "Você já está vinculado a este cliente!" 
                });
            }

            return res.status(201).json({ 
                message: "Você foi vinculado ao cliente com sucesso!" 
            });
        } catch (error) {
            return res.status(500).json({ 
                message: "Ocorreu um erro ao vincular ao cliente." 
            });
        }
    },

    // Método para orçamentista se auto-desvincular de um cliente
    async autoDesvincularCliente(req, res) {
        try {
            const usuarioId = req.user.id;
            const { clienteId } = req.params;

            // Buscar orçamentista pelo usuarioId
            const orcamentista = await orcamentistaModel.findByUsuarioId(usuarioId);

            if (!orcamentista) {
                return res.status(404).json({ 
                    message: "Orçamentista não encontrado para este usuário!" 
                });
            }

            const result = await orcamentistaModel.desvincularCliente(orcamentista.id, clienteId);

            if (result === 0) {
                return res.status(404).json({ 
                    message: "Vínculo não encontrado!" 
                });
            }

            return res.status(200).json({ 
                message: "Desvinculado do cliente com sucesso!" 
            });
        } catch (error) {
            return res.status(500).json({ 
                message: "Ocorreu um erro ao desvincular do cliente." 
            });
        }
    }
}
