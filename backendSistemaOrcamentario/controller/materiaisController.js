const db = require('../src/database/connection.js');
const materiaisModel = require('../model/materiaisModel');
const {
    buildTemplateBuffer,
    buildWorkbookBuffer,
    parseExcelBuffer,
    sendExcelFile,
    buildNameMap,
    getCellValue,
    normalizeKey,
} = require('../utils/excelService');

const MATERIAIS_TEMPLATE_COLUMNS = ['Nome', 'Descrição', 'Unidade de Medida', 'Área', 'Fornecedor'];

const normalizeFornecedorIds = (value) => {
    const values = Array.isArray(value) ? value : (value ? [value] : []);
    return [...new Set(values.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0))];
};

module.exports = {

    async findAll(req, res) {
        try {
            const materials = await materiaisModel.findAll();
            return res.json(materials);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os materiais." });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const result = await materiaisModel.findById(id);

            if (result === -1) {
                return res.status(404).json({ message: "Material não encontrado" });
            } else {
                return res.json(result);
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar o material." });
        }
    },

    async create(req, res) {
        try {
            const allMaterialsData = req.body;
            const fornecedorIds = normalizeFornecedorIds(allMaterialsData.fornecedorId ?? allMaterialsData.fornecedorIds);

            if (fornecedorIds.length === 0) {
                return res.status(400).json({ message: "Selecione pelo menos um fornecedor para o material." });
            }

            const materials = {
                nome: allMaterialsData.nome,
                descricao: allMaterialsData.descricao,
                unidadeMedida: allMaterialsData.unidadeMedida,
                areaId: allMaterialsData.areaId,
            }

            const result = await materiaisModel.createWithFornecedores(materials, fornecedorIds);

            if (result === 'ITEM_EXISTS') {
                return res.status(400).json({ message: 'Já existe um material com este nome para o fornecedor selecionado.' });
            }

            if (typeof result === 'object') {
                return res.status(201).json({ message: "Material cadastrado com sucesso!" });
            }

            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o material." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o material." });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const allMaterialsData = req.body;

            const materials = {
                id: id,
                nome: allMaterialsData.nome,
                descricao: allMaterialsData.descricao,
                unidadeMedida: allMaterialsData.unidadeMedida,
                areaId: allMaterialsData.areaId,
            }

            const result = await materiaisModel.update(materials);

            if (result === 'ITEM_EXISTS') {
                return res.status(400).json({ message: 'Já existe um material com este nome para o fornecedor selecionado.' });
            }

            if (result === 0) {
                return res.status(404).json({ message: "Material não encontrado!" });
            } else {
                return res.status(200).json({ message: "Material atualizado com sucesso!" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao editar o material." });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await materiaisModel.delete(id);

            if (result === 0) {
                return res.status(404).json({ message: "Material não encontrado!" });
            }

            return res.status(200).json({ message: "Material deletado com sucesso!" });

        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao deletar o material." });
        }
    },

    async addFornecedor(req, res) {
        try {
            const { id } = req.params;
            const { fornecedorId } = req.body;
            const result = await materiaisModel.addFornecedor(id, fornecedorId);

            if (result === "ASSOCIATION_EXISTS") {
                return res.status(400).json({ message: "Fornecedor já associado a este material." });
            }

            if (result === 'ITEM_EXISTS') {
                return res.status(400).json({ message: 'Já existe um material com este nome para o fornecedor selecionado.' });
            }

            if (result === 0) {
                return res.status(404).json({ message: "Material não encontrado." });
            }

            return res.status(201).json({ message: "Fornecedor associado ao material com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao associar o fornecedor." });
        }
    },

    async removeFornecedor(req, res) {
        try {
            const { id, fornecedorId } = req.params;
            const result = await materiaisModel.removeFornecedor(id, fornecedorId);
            if (result === 0) {
                return res.status(404).json({ message: "Associação não encontrada." });
            }
            return res.status(200).json({ message: "Fornecedor desassociado do material com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao desassociar o fornecedor." });
        }
    },

    async getFornecedores(req, res) {
        try {
            const { id } = req.params;
            const fornecedores = await materiaisModel.getFornecedores(id);
            return res.json(fornecedores);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os fornecedores." });
        }
    },

    async exportTemplate(req, res) {
        try {
            const buffer = buildTemplateBuffer(MATERIAIS_TEMPLATE_COLUMNS);
            return sendExcelFile(res, 'modelo-materiais.xlsx', buffer);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Erro ao exportar modelo de materiais.' });
        }
    },

    async exportList(req, res) {
        try {
            const materiais = await materiaisModel.findAll();
            const rows = await Promise.all(materiais.map(async (material) => {
                const fornecedores = await materiaisModel.getFornecedores(material.id);

                return {
                    ID: material.id,
                    Nome: material.nome,
                    Descricao: material.descricao,
                    'Unidade de Medida': material.unidadeMedida,
                    Area: material.areaNome || '',
                    Fornecedores: fornecedores.map((fornecedor) => fornecedor.nome).join(', '),
                };
            }));
            const columns = ['ID', 'Nome', 'Descricao', 'Unidade de Medida', 'Area', 'Fornecedores'];
            const buffer = buildWorkbookBuffer(rows, columns, 'Materiais');

            return sendExcelFile(res, 'materiais-cadastrados.xlsx', buffer);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Erro ao exportar lista de materiais.' });
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
                const unidadeMedida = getCellValue(row, ['Unidade de Medida', 'UnidadeMedida', 'unidadeMedida']);
                const area = getCellValue(row, ['Área', 'Area', 'area']);
                const fornecedor = getCellValue(row, ['Fornecedor', 'fornecedor']);

                return nome || descricao || unidadeMedida || area || fornecedor;
            });

            if (rows.length === 0) {
                return res.status(400).json({ message: 'A planilha está vazia ou não possui dados válidos.' });
            }

            const [areas, fornecedores] = await Promise.all([
                db('Areas').select('id', 'nome'),
                db('Fornecedor').select('id', 'nome'),
            ]);

            const areaMap = buildNameMap(areas);
            const fornecedorMap = buildNameMap(fornecedores);

            let imported = 0;
            const errors = [];

            for (let index = 0; index < rows.length; index += 1) {
                const row = rows[index];
                const rowNumber = index + 2;
                const nome = getCellValue(row, ['Nome', 'nome']);
                const descricao = getCellValue(row, ['Descrição', 'Descricao', 'descricao']);
                const unidadeMedida = getCellValue(row, ['Unidade de Medida', 'UnidadeMedida', 'unidadeMedida']);
                const areaNome = getCellValue(row, ['Área', 'Area', 'area']);
                const fornecedorRaw = getCellValue(row, ['Fornecedor', 'fornecedor']);

                if (!nome || !descricao || !unidadeMedida || !areaNome || !fornecedorRaw) {
                    errors.push({
                        row: rowNumber,
                        message: 'Preencha Nome, Descrição, Unidade de Medida, Área e Fornecedor.',
                    });
                    continue;
                }

                const areaId = areaMap.get(normalizeKey(areaNome));

                if (!areaId) {
                    errors.push({ row: rowNumber, message: `Área "${areaNome}" não encontrada.` });
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
                    const result = await materiaisModel.createWithFornecedores(
                        { nome, descricao, unidadeMedida, areaId },
                        fornecedorIds
                    );

                    if (result === 'ITEM_EXISTS') {
                        errors.push({
                            row: rowNumber,
                            message: `Material "${nome}" já cadastrado para o fornecedor informado.`,
                        });
                        continue;
                    }

                    imported += 1;
                } catch (error) {
                    console.log(error);
                    errors.push({ row: rowNumber, message: 'Erro ao cadastrar material.' });
                }
            }

            const message = imported > 0
                ? `Importação concluída: ${imported} material(is) importado(s).`
                : 'Nenhum material foi importado.';

            return res.status(200).json({ message, imported, errors });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Erro ao importar materiais.' });
        }
    },
}
