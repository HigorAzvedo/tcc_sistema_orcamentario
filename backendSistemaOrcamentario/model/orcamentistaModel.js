const db = require('../src/database/connection.js');
const bcrypt = require('bcrypt');

module.exports = {

    async findAll() {
        try {
            const orcamentistas = await db('Orcamentistas').select('*');
            return orcamentistas;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async findById(orcamentistaId) {
        try {
            const orcamentista = await db('Orcamentistas').where({ id: orcamentistaId }).first();
            return orcamentista ? orcamentista : -1;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async create(orcamentista) {
        try {
            const existingOrcamentista = await db('Orcamentistas')
                .where({ email: orcamentista.email })
                .orWhere({ matricula: orcamentista.matricula })
                .first();

            if (existingOrcamentista) {
                if (existingOrcamentista.email === orcamentista.email) {
                    return "EMAIL_EXISTS";
                }
                if (existingOrcamentista.matricula === orcamentista.matricula) {
                    return "MATRICULA_EXISTS";
                }
            }

            const result = await db('Orcamentistas').insert(orcamentista);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async createWithUser(orcamentistaData) {
        const trx = await db.transaction();
        
        try {
            const existingUser = await trx('Usuarios').where({ email: orcamentistaData.email }).first();
            if (existingUser) {
                await trx.rollback();
                return "EMAIL_EXISTS";
            }

            const existingOrcamentista = await trx('Orcamentistas')
                .where({ email: orcamentistaData.email })
                .orWhere({ matricula: orcamentistaData.matricula })
                .first();

            if (existingOrcamentista) {
                await trx.rollback();
                if (existingOrcamentista.email === orcamentistaData.email) {
                    return "EMAIL_EXISTS";
                }
                if (existingOrcamentista.matricula === orcamentistaData.matricula) {
                    return "MATRICULA_EXISTS";
                }
            }

            const hashedPassword = await bcrypt.hash(orcamentistaData.senha, 10);
            const [usuarioId] = await trx('Usuarios').insert({
                nome: orcamentistaData.nome,
                email: orcamentistaData.email,
                senha: hashedPassword,
                role: 'orcamentista',
                ativo: true
            });

            const [orcamentistaId] = await trx('Orcamentistas').insert({
                nome: orcamentistaData.nome,
                email: orcamentistaData.email,
                matricula: orcamentistaData.matricula,
                usuarioId: usuarioId
            });

            await trx.commit();
            return { usuarioId, orcamentistaId };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    },

    async update(orcamentista) {
        try {
            const existingOrcamentista = await db('Orcamentistas')
                .where(function() {
                    this.where({ email: orcamentista.email })
                        .orWhere({ matricula: orcamentista.matricula });
                })
                .andWhereNot({ id: orcamentista.id })
                .first();

            if (existingOrcamentista) {
                if (existingOrcamentista.email === orcamentista.email) {
                    return "EMAIL_EXISTS";
                }
                if (existingOrcamentista.matricula === orcamentista.matricula) {
                    return "MATRICULA_EXISTS";
                }
            }

            const result = await db('Orcamentistas').where({ id: orcamentista.id }).update(orcamentista);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async delete(orcamentistaId) {
        try {
            const result = await db('Orcamentistas').where({ id: orcamentistaId }).del();
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    // Métodos para gerenciar vínculos com clientes
    async findByUsuarioId(usuarioId) {
        try {
            const orcamentista = await db('Orcamentistas')
                .where({ usuarioId })
                .first();
            return orcamentista;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async vincularCliente(orcamentistaId, clienteId) {
        try {
            // Verificar se já existe o vínculo
            const vinculoExistente = await db('OrcamentistaCliente')
                .where({ orcamentistaId, clienteId })
                .first();

            if (vinculoExistente) {
                return "VINCULO_EXISTS";
            }

            const result = await db('OrcamentistaCliente').insert({
                orcamentistaId,
                clienteId
            });
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async desvincularCliente(orcamentistaId, clienteId) {
        try {
            const result = await db('OrcamentistaCliente')
                .where({ orcamentistaId, clienteId })
                .del();
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async getClientesVinculados(orcamentistaId) {
        try {
            const clientes = await db('Cliente')
                .join('OrcamentistaCliente', 'Cliente.id', 'OrcamentistaCliente.clienteId')
                .where('OrcamentistaCliente.orcamentistaId', orcamentistaId)
                .select('Cliente.*');
            return clientes;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async getProjetosDoCliente(orcamentistaId) {
        try {
            const projetos = await db('Projetos')
                .join('Cliente', 'Projetos.clienteId', 'Cliente.id')
                .join('OrcamentistaCliente', 'Cliente.id', 'OrcamentistaCliente.clienteId')
                .where('OrcamentistaCliente.orcamentistaId', orcamentistaId)
                .select('Projetos.*', 'Cliente.nome as clienteNome')
                .orderBy('Projetos.created_at', 'desc');
            return projetos;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async getOrcamentosDoCliente(orcamentistaId) {
        try {
            const orcamentos = await db('Orcamentos')
                .join('Projetos', 'Orcamentos.projetoId', 'Projetos.id')
                .join('Cliente', 'Projetos.clienteId', 'Cliente.id')
                .join('OrcamentistaCliente', 'Cliente.id', 'OrcamentistaCliente.clienteId')
                .where('OrcamentistaCliente.orcamentistaId', orcamentistaId)
                .select(
                    'Orcamentos.*', 
                    'Projetos.nome as projetoNome',
                    'Cliente.nome as clienteNome'
                )
                .orderBy('Orcamentos.created_at', 'desc');
            return orcamentos;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}