const db = require('../src/database/connection.js');

module.exports = {

    async findAll() {
        try {
            const orcamentos = await db('Orcamentos')
                .join('Projetos', 'Orcamentos.projetoId', '=', 'Projetos.id')
                .join('Cliente', 'Projetos.clienteId', '=', 'Cliente.id')
                .select(
                    'Orcamentos.*',
                    'Projetos.nome as nomeProjeto',
                    'Projetos.clienteId',
                    'Cliente.nome as nomeCliente'
                );

            const result = orcamentos.map(orcamento => {
                return {
                    id: orcamento.id,
                    nome: orcamento.nome,
                    dataCriacao: orcamento.dataCriacao,
                    status: orcamento.status,
                    valorTotalItens: orcamento.valorTotalItens,
                    projetoId: orcamento.projetoId,
                    created_at: orcamento.created_at,
                    updated_at: orcamento.updated_at,
                    projetoNome: orcamento.nomeProjeto,
                    clienteId: orcamento.clienteId,
                    clienteNome: orcamento.nomeCliente,
                    projeto: {
                        id: orcamento.projetoId,
                        nome: orcamento.nomeProjeto
                    },
                    cliente: {
                        id: orcamento.clienteId,
                        nome: orcamento.nomeCliente
                    }
                };
            });

            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async getAllProjetos() {
        try {
            const projetos = await db('Projetos')
                .select('id', 'nome');

            return projetos.map(projeto => ({
                value: projeto.id,
                label: projeto.nome
            }));
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async getProjetosByOrcamentoId(orcamentoId) {
        try {
            const orcamento = await db('Orcamentos')
                .join('Projetos', 'Orcamentos.projetoId', '=', 'Projetos.id')
                .where('Orcamentos.id', orcamentoId)
                .select('Projetos.id', 'Projetos.nome')
                .first();
            
            if (!orcamento) {
                return "ORCAMENTO_NOT_FOUND";
            }

            return [{
                value: orcamento.id,
                label: orcamento.nome
            }];
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async findById(budgetId) {
        try {
            const orcamento = await db('Orcamentos').where({ id: budgetId }).first();
            if (orcamento) {
                return orcamento;
            } else {
                return -1;
            }
        } catch (error) {
            console.log(error);
            throw error;
        }

    },

    async findByClienteId(clienteId) {
        try {
            const orcamentos = await db('Orcamentos')
                .join('Projetos', 'Orcamentos.projetoId', '=', 'Projetos.id')
                .join('Cliente', 'Projetos.clienteId', '=', 'Cliente.id')
                .where('Projetos.clienteId', clienteId)
                .select(
                    'Orcamentos.*',
                    'Projetos.nome as nomeProjeto',
                    'Projetos.clienteId',
                    'Cliente.nome as nomeCliente'
                );

            const result = orcamentos.map(orcamento => {
                return {
                    id: orcamento.id,
                    nome: orcamento.nome,
                    dataCriacao: orcamento.dataCriacao,
                    status: orcamento.status,
                    valorTotalItens: orcamento.valorTotalItens,
                    projetoId: orcamento.projetoId,
                    created_at: orcamento.created_at,
                    updated_at: orcamento.updated_at,
                    projetoNome: orcamento.nomeProjeto,
                    clienteId: orcamento.clienteId,
                    clienteNome: orcamento.nomeCliente,
                    projeto: {
                        id: orcamento.projetoId,
                        nome: orcamento.nomeProjeto
                    },
                    cliente: {
                        id: orcamento.clienteId,
                        nome: orcamento.nomeCliente
                    }
                };
            });

            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async create(orcamento) {
        try {
            const existingOrcamento = await db('Orcamentos')
                .where({ nome: orcamento.nome })
                .first();

            if (existingOrcamento) {
                return "NOME_EXISTS";
            }

            const result = await db('Orcamentos').insert(orcamento);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async updateValorTotalItens(orcamentoId) {
        try {
            const { total } = await db('ItensOrcamento')
                .where({ idOrcamento: orcamentoId })
                .sum('valorTotal as total')
                .first();

            const valorTotalItens = total || 0;

            await db('Orcamentos')
                .where({ id: orcamentoId })
                .update({ valorTotalItens });

            return valorTotalItens;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async update(orcamento) {
        try {
            const existingOrcamento = await db('Orcamentos')
                .where({ nome: orcamento.nome })
                .andWhereNot({ id: orcamento.id })
                .first();

            if (existingOrcamento) {
                return "NOME_EXISTS";
            }

            const result = await db('Orcamentos').where({ id: orcamento.id }).update(orcamento);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async delete(budgetId) {
        try {
            const result = await db('Orcamentos').where({ id: budgetId }).del();
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}