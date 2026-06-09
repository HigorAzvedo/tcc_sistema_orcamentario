const db = require('../src/database/connection.js');
const maquinarioModel = require('../model/maquinarioModel');
const {
    buildTemplateBuffer,
    buildWorkbookBuffer,
    parseExcelBuffer,
    sendExcelFile,
    buildNameMap,
    getCellValue,
    normalizeKey,
} = require('../utils/excelService');

const MAQUINARIO_TEMPLATE_COLUMNS = ['Nome', 'Descrição', 'Fornecedor'];

const normalizeFornecedorIds = (value) => {
    const values = Array.isArray(value) ? value : (value ? [value] : []);
    return [...new Set(values.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0))];
};

module.exports = {
    async findAll(req, res) {
        try {
            var machine = await maquinarioModel.findAll();
            return res.json(machine);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os maquinários." });
        }

    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            var machine = await maquinarioModel.findById(id);

            if (machine === -1) {
                return res.status(404).json({message: "Maquinário não encontrado" })
            } else {
                return res.json(machine);
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os maquinários." });
        }

    },

    async create(req, res) {
        try {
            const allMachineData = req.body;
            const fornecedorIds = normalizeFornecedorIds(allMachineData.fornecedorId ?? allMachineData.fornecedorIds);

            if (fornecedorIds.length === 0) {
                return res.status(400).json({ message: "Selecione pelo menos um fornecedor para o maquinário." });
            }

            const machine = {
                nome: allMachineData.nome,
                descricao: allMachineData.descricao,
            }

            const result = await maquinarioModel.createWithFornecedores(machine, fornecedorIds);

            if (result === 'ITEM_EXISTS') {
                return res.status(400).json({ message: 'Já existe um equipamento com este nome para o fornecedor selecionado.' });
            }

            if (typeof result === 'object') {
                return res.status(201).json({ message: "Maquinário cadastrado com sucesso!" });
            }

            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o maquinario." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o maquinario." });
        }

    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const allMachineData = req.body;
            const machine = {
                id: id,
                nome: allMachineData.nome,
                descricao: allMachineData.descricao,
            }
            const result = await maquinarioModel.update(machine);

            if (result === 'ITEM_EXISTS') {
                return res.status(400).json({ message: 'Já existe um equipamento com este nome para o fornecedor selecionado.' });
            }

            if (result === 0) {
                return res.status(404).json({ message: "Maquinário não encontrado" });
            } else {
                return res.status(200).json({ message: "Maquinário atualizado com sucesso!" });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Ocorreu um erro ao editar o maquinário." });
        }


    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await maquinarioModel.delete(id);

            if (result === 0) {
                return res.status(404).json({ message: "Maquinário não encontrado!" });
            } else {
                return res.status(200).json({ message: "Maquinário deletado com sucesso." });
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao deletar o maquinário." });
        }

    }
    ,

    async getFornecedores(req, res) {
        try {
            const { id } = req.params;
            const fornecedores = await maquinarioModel.getFornecedores(id);
            return res.json(fornecedores);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os fornecedores." });
        }
    },

    async addFornecedor(req, res) {
        try {
            const { id } = req.params;
            const { fornecedorId } = req.body;
            const result = await maquinarioModel.addFornecedor(id, fornecedorId);

            if (result === "ASSOCIATION_EXISTS") {
                return res.status(400).json({ message: "Fornecedor já associado a este maquinário." });
            }

            if (result === 'ITEM_EXISTS') {
                return res.status(400).json({ message: 'Já existe um equipamento com este nome para o fornecedor selecionado.' });
            }

            if (result === 0) {
                return res.status(404).json({ message: "Maquinário não encontrado." });
            }

            return res.status(201).json({ message: "Fornecedor associado ao maquinário com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao associar o fornecedor." });
        }
    },

    async removeFornecedor(req, res) {
        try {
            const { id, fornecedorId } = req.params;
            const result = await maquinarioModel.removeFornecedor(id, fornecedorId);
            if (result === 0) {
                return res.status(404).json({ message: "Associação não encontrada." });
            }
            return res.status(200).json({ message: "Fornecedor desassociado do maquinário com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao desassociar o fornecedor." });
        }
    },

    async exportTemplate(req, res) {
        try {
            const buffer = buildTemplateBuffer(MAQUINARIO_TEMPLATE_COLUMNS);
            return sendExcelFile(res, 'modelo-maquinarios.xlsx', buffer);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Erro ao exportar modelo de maquinários.' });
        }
    },

    async exportList(req, res) {
        try {
            const maquinarios = await maquinarioModel.findAll();
            const rows = await Promise.all(maquinarios.map(async (maquinario) => {
                const fornecedores = await maquinarioModel.getFornecedores(maquinario.id);

                return {
                    ID: maquinario.id,
                    Nome: maquinario.nome,
                    Descricao: maquinario.descricao,
                    Fornecedores: fornecedores.map((fornecedor) => fornecedor.nome).join(', '),
                };
            }));
            const columns = ['ID', 'Nome', 'Descricao', 'Fornecedores'];
            const buffer = buildWorkbookBuffer(rows, columns, 'Maquinarios');

            return sendExcelFile(res, 'maquinarios-cadastrados.xlsx', buffer);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Erro ao exportar lista de maquinarios.' });
        }
    },

    async importExcel(req, res) {
        try {
            const { file } = req.body;

            if (!file) {
                return res.status(400).json({ message: 'Arquivo Excel não enviado.' });
            }

            const buffer = Buffer.from(file, 'base64');
            const rows = parseExcelBuffer(buffer).filter((row) => {
                const nome = getCellValue(row, ['Nome', 'nome']);
                const descricao = getCellValue(row, ['Descrição', 'Descricao', 'descricao']);
                const fornecedor = getCellValue(row, ['Fornecedor', 'fornecedor']);

                return nome || descricao || fornecedor;
            });

            if (rows.length === 0) {
                return res.status(400).json({ message: 'A planilha está vazia ou não possui dados válidos.' });
            }

            const fornecedores = await db('Fornecedor').select('id', 'nome');
            const fornecedorMap = buildNameMap(fornecedores);

            let imported = 0;
            const errors = [];

            for (let index = 0; index < rows.length; index += 1) {
                const row = rows[index];
                const rowNumber = index + 2;
                const nome = getCellValue(row, ['Nome', 'nome']);
                const descricao = getCellValue(row, ['Descrição', 'Descricao', 'descricao']);
                const fornecedorRaw = getCellValue(row, ['Fornecedor', 'fornecedor']);

                if (!nome || !descricao || !fornecedorRaw) {
                    errors.push({
                        row: rowNumber,
                        message: 'Preencha Nome, Descrição e Fornecedor.',
                    });
                    continue;
                }

                const fornecedorNomes = fornecedorRaw
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean);

                const fornecedorIds = [];
                let fornecedorInvalido = false;

                for (const fornecedorNome of fornecedorNomes) {
                    const fornecedorId = fornecedorMap.get(normalizeKey(fornecedorNome));

                    if (!fornecedorId) {
                        errors.push({ row: rowNumber, message: `Fornecedor "${fornecedorNome}" não encontrado.` });
                        fornecedorInvalido = true;
                        break;
                    }

                    fornecedorIds.push(fornecedorId);
                }

                if (fornecedorInvalido || fornecedorIds.length === 0) {
                    continue;
                }

                try {
                    const result = await maquinarioModel.createWithFornecedores({ nome, descricao }, fornecedorIds);

                    if (result === 'ITEM_EXISTS') {
                        errors.push({
                            row: rowNumber,
                            message: `Equipamento "${nome}" já cadastrado para o fornecedor informado.`,
                        });
                        continue;
                    }

                    imported += 1;
                } catch (error) {
                    console.log(error);
                    errors.push({ row: rowNumber, message: 'Erro ao cadastrar maquinário.' });
                }
            }

            const message = imported > 0
                ? `Importação concluída: ${imported} maquinário(s) importado(s).`
                : 'Nenhum maquinário foi importado.';

            return res.status(200).json({ message, imported, errors });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Erro ao importar maquinários.' });
        }
    },
}
