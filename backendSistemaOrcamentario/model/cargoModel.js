const db = require('../src/database/connection.js');
const { findCargoDuplicate } = require('../utils/itemDuplicateService');

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
            const duplicate = await findCargoDuplicate(db, cargo.nome, cargo.areaId);

            if (duplicate) {
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
            const duplicate = await findCargoDuplicate(db, cargo.nome, cargo.areaId, cargo.id);

            if (duplicate) {
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