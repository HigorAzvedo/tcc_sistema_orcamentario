const db = require('../src/database/connection.js');

module.exports = {
    async findAll() {
        try {
            const projects = await db("Projetos")
            .leftJoin("Cliente", "Projetos.clienteId", "=", "Cliente.id")
            .select(
                "Projetos.*", 
                "Cliente.nome as nomeCliente"
            );
            return projects;
        } catch (error) {
            console.log(error);
        }
    },

    async findById(projectId) {
        try {
            const projectExixts = await db("Projetos").where({ id: projectId }).first();
            if (!projectExixts) {
                return -1;
            } else {
                return projectExixts;
            }

        } catch (error) {
            console.log(error);
        }
    },

    async findByClienteId(clienteId) {
        try {
            const projects = await db("Projetos")
                .leftJoin("Cliente", "Projetos.clienteId", "=", "Cliente.id")
                .where("Projetos.clienteId", clienteId)
                .select(
                    "Projetos.*", 
                    "Cliente.nome as nomeCliente"
                );
            return projects;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    async create(project) {
        try {
            const existingClient = await db("Cliente").where({id: project.clienteId}).first();

            if (!existingClient) {
                return "CLIENT_NOT_FOUND";
            }

            const existingProject = await db("Projetos").where({ nome: project.nome }).first();

            if (existingProject) {
                if (existingProject.nome === project.nome) {
                    return "PROJECT_EXISTS";
                }
            }

            const result = await db("Projetos").insert(project);
            
            return result;
        } catch (error) {
            console.log(error);
        }
    },

    async update(project) {
        try {
            const existingClient = await db("Cliente").where({id: project.clienteId}).first();
            if (!existingClient) {
                return "CLIENT_NOT_FOUND";
            }

            const existingProject = await db("Projetos")
                .where({ nome: project.nome })
                .andWhereNot({ id: project.id })
                .first();

            if (existingProject) {
                return "PROJECT_EXISTS";
            }

            const result = await db("Projetos").where({ id: project.id }).update(project);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async delete(projectId) {
        try {
            const result = await db("Projetos").where({ id: projectId }).del();
            return result;
        } catch (error) {
            return false;
        }
    }
}