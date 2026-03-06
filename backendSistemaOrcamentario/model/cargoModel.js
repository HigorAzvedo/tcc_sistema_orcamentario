const db = require('../src/database/connection.js');

module.exports = {

    async findAll() {
        try {
            const cargos = await db('Cargos')
                .select(
                    'Cargos.*',
                    'Areas.nome as areaNome'
                )
                .leftJoin('Areas', 'Cargos.areaId', 'Areas.id');
            return cargos;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },


    async findById(cargosId) {
        try {
            const cargo = await db('Cargos').where({ id: cargosId }).first();
            return cargo ? cargo : -1;
        } catch (error) {
            console.log(error);
            throw error;
        }

    },

    async create(cargo) {
        try {
            const existingCargo = await db('Cargos')
                .where({ nome: cargo.nome })
                .first();

            if (existingCargo) {
                return "CARGO_EXISTS";
            }

            const result = await db('Cargos').insert(cargo);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async update(cargo) {
        try {
            const existingCargo = await db('Cargos')
                .where({ nome: cargo.nome })
                .andWhereNot({ id: cargo.id })
                .first();

            if (existingCargo) {
                return "CARGO_EXISTS";
            }

            const result = await db('Cargos').where({ id: cargo.id }).update(cargo);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async delete(cargoId) {
        try {
            const result = await db('Cargos').where({ id: cargoId }).del();
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}