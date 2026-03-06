const db = require("../src/database/connection")
const orcamentoModel = require('./orcamentoModel');

module.exports = {

    async findAll() {
        try {
            const itemsBudget = await db("ItensOrcamento")
                .leftJoin("Orcamentos", "ItensOrcamento.idOrcamento", "=", "Orcamentos.id")
                .leftJoin("Projetos", "Orcamentos.projetoId", "=", "Projetos.id")
                .leftJoin("Materiais", "ItensOrcamento.idMaterial", "=", "Materiais.id")
                .leftJoin("Cliente", "Projetos.clienteId", "=", "Cliente.id")
                .leftJoin("Cargos", "ItensOrcamento.idCargo", "=", "Cargos.id")
                .leftJoin("Maquinarios", "ItensOrcamento.idMaquinario", "=", "Maquinarios.id")
                .select(
                    "ItensOrcamento.*",
                    "Orcamentos.id as orcamento_id",
                    "Orcamentos.nome as nomeOrcamento",
                    "Projetos.id as projeto_id",
                    "Projetos.nome as nomeProjeto",
                    "Materiais.id as material_id",
                    "Materiais.nome as nomeMaterial",
                    "Cliente.nome as nomeCliente",
                    "Cargos.id as cargo_id",
                    "Cargos.nome as nomeCargo",
                    "Maquinarios.id as maquinario_id",
                    "Maquinarios.nome as nomeMaquinario"
                );

            return itemsBudget.map(item => ({
                id: item.id,
                valorUnitario: item.valorUnitario,
                quantidade: item.quantidade,
                valorTotal: item.valorTotal,
                idProjeto: item.idProjeto,
                idOrcamento: item.idOrcamento,
                idMaterial: item.idMaterial,
                idCargo: item.idCargo,
                idMaquinario: item.idMaquinario,
                created_at: item.created_at,
                updated_at: item.updated_at,
                projeto: item.projeto_id ? {
                    value: item.projeto_id,
                    label: item.nomeProjeto
                } : null,
                orcamento: item.orcamento_id ? {
                    value: item.orcamento_id,
                    label: item.nomeOrcamento
                } : null,
                material: item.material_id ? {
                    value: item.material_id,
                    label: item.nomeMaterial
                } : null,
                cargo: item.cargo_id ? {
                    value: item.cargo_id,
                    label: item.nomeCargo
                } : null,
                maquinario: item.maquinario_id ? {
                    value: item.maquinario_id,
                    label: item.nomeMaquinario
                } : null,
                nomeCliente: item.nomeCliente
            }));
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async getAllOptions() {
        try {
            const [projetos, orcamentos, materiais, cargos, maquinarios] = await Promise.all([
                db("Projetos").select("id", "nome"),
                db("Orcamentos").select("id", "nome"),
                db("Materiais").select("id", "nome"),
                db("Cargos").select("id", "nome"),
                db("Maquinarios").select("id", "nome")
            ]);

            return {
                projetos: projetos.map(p => ({ value: p.id, label: p.nome })),
                orcamentos: orcamentos.map(o => ({ value: o.id, label: o.nome })),
                materiais: materiais.map(m => ({ value: m.id, label: m.nome })),
                cargos: cargos.map(c => ({ value: c.id, label: c.nome })),
                maquinarios: maquinarios.map(maq => ({ value: maq.id, label: maq.nome }))
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async findById(itemId) {
        try {
            const item = await db("ItensOrcamento").where({ id: itemId }).first();
            return item ? item : -1;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async findAllByOrcamentoId(orcamentoId) {
        try {
            const orcamentoExists = await db("Orcamentos").where({ id: orcamentoId }).first();
            if (!orcamentoExists) {
                return "BUDGET_NOT_FOUND";
            }

            const itemsBudget = await db("ItensOrcamento")
                .leftJoin("Orcamentos", "ItensOrcamento.idOrcamento", "=", "Orcamentos.id")
                .leftJoin("Projetos", "Orcamentos.projetoId", "=", "Projetos.id")
                .leftJoin("Materiais", "ItensOrcamento.idMaterial", "=", "Materiais.id")
                .leftJoin("Cliente", "Projetos.clienteId", "=", "Cliente.id")
                .leftJoin("Cargos", "ItensOrcamento.idCargo", "=", "Cargos.id")
                .leftJoin("Maquinarios", "ItensOrcamento.idMaquinario", "=", "Maquinarios.id")
                .where("ItensOrcamento.idOrcamento", orcamentoId)
                .select(
                    "ItensOrcamento.*",
                    "Orcamentos.id as orcamento_id",
                    "Orcamentos.nome as nomeOrcamento",
                    "Projetos.id as projeto_id",
                    "Projetos.nome as nomeProjeto",
                    "Materiais.id as material_id",
                    "Materiais.nome as nomeMaterial",
                    "Cliente.nome as nomeCliente",
                    "Cargos.id as cargo_id",
                    "Cargos.nome as nomeCargo",
                    "Maquinarios.id as maquinario_id",
                    "Maquinarios.nome as nomeMaquinario"
                );
            
            return itemsBudget.map(item => ({
                id: item.id,
                valorUnitario: item.valorUnitario,
                quantidade: item.quantidade,
                valorTotal: item.valorTotal,
                idProjeto: item.idProjeto,
                idOrcamento: item.idOrcamento,
                idMaterial: item.idMaterial,
                idCargo: item.idCargo,
                idMaquinario: item.idMaquinario,
                created_at: item.created_at,
                updated_at: item.updated_at,
                projeto: item.projeto_id ? {
                    value: item.projeto_id,
                    label: item.nomeProjeto
                } : null,
                orcamento: item.orcamento_id ? {
                    value: item.orcamento_id,
                    label: item.nomeOrcamento
                } : null,
                material: item.material_id ? {
                    value: item.material_id,
                    label: item.nomeMaterial
                } : null,
                cargo: item.cargo_id ? {
                    value: item.cargo_id,
                    label: item.nomeCargo
                } : null,
                maquinario: item.maquinario_id ? {
                    value: item.maquinario_id,
                    label: item.nomeMaquinario
                } : null,
                nomeCliente: item.nomeCliente
            }));
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async create(itemBudget) {
        try {
            const projetoExists = await db("Projetos").where({ id: itemBudget.idProjeto }).first();
            if (!projetoExists) {
                return "PROJECT_NOT_FOUND";
            }

            const orcamentoExists = await db("Orcamentos").where({ id: itemBudget.idOrcamento }).first();
            if (!orcamentoExists) {
                return "BUDGET_NOT_FOUND";
            }

            itemBudget.valorTotal = itemBudget.valorUnitario * itemBudget.quantidade;

            const result = await db("ItensOrcamento").insert(itemBudget);

            await orcamentoModel.updateValorTotalItens(itemBudget.idOrcamento);

            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async update(itemBudget) {
        try {
            const projetoExists = await db("Projetos").where({ id: itemBudget.idProjeto }).first();
            if (!projetoExists) {
                return "PROJECT_NOT_FOUND";
            }

            const orcamentoExists = await db("Orcamentos").where({ id: itemBudget.idOrcamento }).first();
            if (!orcamentoExists) {
                return "BUDGET_NOT_FOUND";
            }

            if (itemBudget.valorUnitario && itemBudget.quantidade) {
                itemBudget.valorTotal = itemBudget.valorUnitario * itemBudget.quantidade;
            }

            const result = await db('ItensOrcamento').where({ id: itemBudget.id }).update(itemBudget);

            if (result > 0) {
                await orcamentoModel.updateValorTotalItens(itemBudget.idOrcamento);
            }

            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async delete(itemId) {
        try {
            const item = await this.findById(itemId);
            if (item === -1) {
                return 0;
            }

            const result = await db('ItensOrcamento').where({ id: itemId }).del();

            if (result > 0) {
                await orcamentoModel.updateValorTotalItens(item.idOrcamento);
            }

            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}