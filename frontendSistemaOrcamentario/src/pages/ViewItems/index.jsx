import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../service/api';
import Modal from '../../components/Modal';
import Form from '../../components/Form';
import Loading from '../../components/Loading';
import { FaEdit, FaTrash, FaFileUpload, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import './style.css';
import '../Pages.css';
import useConfirmAction from '../../hooks/useConfirmAction';

// import { Container } from './styles';

function ViewItems() {
    const navigate = useNavigate();
    const location = useLocation();
    const orcamentoId = location.state?.orcamentoId;
    const orcamentoNome = location.state?.orcamentoNome;

    const [itens, setItens] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [projetos, setProjetos] = useState([]);
    const [orcamentos, setOrcamentos] = useState([]);
    const [materiais, setMateriais] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [maquinarios, setMaquinarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const { confirmAction, confirmDialog } = useConfirmAction();

    const formatCurrency = (value) => {
        const numberValue = Number(value || 0);
        return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const resolveItemType = (item) => {
        if (item?.material?.label || item?.idMaterial) {
            return 'material';
        }

        if (item?.maquinario?.label || item?.idMaquinario) {
            return 'maquinario';
        }

        if (item?.cargo?.label || item?.idCargo) {
            return 'cargo';
        }

        return 'material';
    };

    const getItemNameByType = (item, type) => {
        if (type === 'material') {
            return item.material?.label || 'Material não identificado';
        }

        if (type === 'cargo') {
            return item.cargo?.label || 'Cargo não identificado';
        }

        if (type === 'maquinario') {
            return item.maquinario?.label || 'Maquinário não identificado';
        }

        return 'Item não identificado';
    };

    const typeSectionMeta = {
        material: {
            title: 'Materiais',
            description: 'Itens de material usados no orçamento.'
        },
        maquinario: {
            title: 'Maquinários',
            description: 'Equipamentos e maquinários associados ao orçamento.'
        },
        cargo: {
            title: 'Cargos',
            description: 'Mão de obra e funções previstas no orçamento.'
        }
    };

    const groupedItems = useMemo(() => {
        return itens.reduce((accumulator, item) => {
            const type = resolveItemType(item);
            if (!accumulator[type]) {
                accumulator[type] = [];
            }
            accumulator[type].push(item);
            return accumulator;
        }, {
            material: [],
            maquinario: [],
            cargo: []
        });
    }, [itens]);

    const totalBudgetValue = useMemo(() => {
        return itens.reduce((sum, item) => sum + Number(item.valorTotal || 0), 0);
    }, [itens]);

    const loadOptions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/itensOrcamentos/itensOrcamento/options');
            if (response.data) {
                setProjetos(response.data.projetos || []);
                setOrcamentos(response.data.orcamentos || []);
                setMateriais(response.data.materiais || []);
                setCargos(response.data.cargos || []);
                setMaquinarios(response.data.maquinarios || []);
            }
        } catch (error) {
            setLoading(false);
            console.error('Erro ao carregar opções:', error);
            toast.error('Erro ao carregar opções dos formulários.');
        }
        setLoading(false);
    };

    const itemFields = [
        {
            name: 'idProjeto',
            label: 'Projeto',
            type: 'select',
            required: true,
            options: projetos
        },
        {
            name: 'idOrcamento',
            label: 'Orçamento',
            type: 'select',
            required: true,
            options: orcamentos
        },
        {
            name: 'idMaterial',
            label: 'Material',
            type: 'select',
            required: true,
            options: materiais
        },
        {
            name: 'idCargo',
            label: 'Cargo',
            type: 'select',
            required: true,
            options: cargos
        },
        {
            name: 'idMaquinario',
            label: 'Maquinário',
            type: 'select',
            required: false,
            options: [
                { value: '', label: 'Nenhum' },
                ...maquinarios
            ]
        },
        { name: 'valorUnitario', label: 'Valor Unitário', type: 'number', required: true, step: '0.01' },
        { name: 'quantidade', label: 'Quantidade', type: 'number', required: true, step: '0.01' }
    ];

    const loadItensDoOrcamento = async (orcamentoId) => {
        setLoading(true);
        try {
            const response = await api.get(`/itensOrcamentos/orcamento/${orcamentoId}`);
            if (response.data) {
                setItens(response.data || []);
            }
        } catch (error) {
            setLoading(false);
            console.error('Erro ao carregar itens do orçamento:', error);
            toast.error('Erro ao carregar itens do orçamento.');
            setItens([]);
        }
        setLoading(false);
    };

    const deleteItem = async (id) => {
        const confirmed = await confirmAction({
            title: 'Excluir item',
            message: 'Tem certeza que deseja excluir este item de orçamento?',
            confirmText: 'Excluir'
        });

        if (!confirmed) return;

        try {
            const response = await api.delete(`/itensOrcamentos/itensOrcamento/${id}`);
            if (response.status === 204 || response.status === 200) {
                toast.success('Item de orçamento deletado com sucesso!');
                loadItensDoOrcamento(orcamentoId);
            }
        } catch (error) {
            console.error('Erro ao deletar item de orçamento:', error);
            toast.error('Erro ao deletar item de orçamento.');
        }
    };

    const editItem = async (id) => {
        try {
            const url = `/itensOrcamentos/itensOrcamento/${id}`;
            const response = await api.get(url);
            if (response.data) {
                setEditingItem(response.data);
                setIsEditModalOpen(true);
            } else {
                toast.error('Item de orçamento não encontrado.');
            }
        } catch (error) {
            console.error('Erro ao buscar item de orçamento:', error);
            toast.error('Erro ao buscar dados do item de orçamento.');
        }
    };

    const updateItem = async (itemData) => {
        try {
            const response = await api.put(`/itensOrcamentos/itensOrcamento/${editingItem.id}`, {
                valorUnitario: parseFloat(itemData.valorUnitario),
                quantidade: parseFloat(itemData.quantidade),
                valorTotal: parseFloat(itemData.valorUnitario) * parseFloat(itemData.quantidade),
                idProjeto: parseInt(itemData.idProjeto),
                idOrcamento: parseInt(itemData.idOrcamento),
                idMaterial: parseInt(itemData.idMaterial),
                idCargo: parseInt(itemData.idCargo),
                idMaquinario: itemData.idMaquinario ? parseInt(itemData.idMaquinario) : null
            });
            if (response.status === 200) {
                toast.success('Item de orçamento atualizado com sucesso!');
                setIsEditModalOpen(false);
                setEditingItem(null);
                loadItensDoOrcamento(orcamentoId);
            }
        } catch (error) {
            console.error('Erro ao atualizar item de orçamento:', error);
            toast.error('Erro ao atualizar item de orçamento.');
        }
    };

    const getFileExtension = (format) => (format === 'pdf' ? 'pdf' : 'xlsx');

    const downloadBudgetItems = async (format) => {
        if (!orcamentoId) {
            toast.error('Orçamento não identificado para exportação.');
            return;
        }

        try {
            const response = await api.get(`/orcamentos/orcamento/${orcamentoId}/export/${format}`, {
                responseType: 'blob'
            });

            const extension = getFileExtension(format);
            const safeName = (orcamentoNome || `orcamento-${orcamentoId}`)
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9-_]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .toLowerCase();

            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `itens-orcamento-${safeName || orcamentoId}.${extension}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);

            toast.success(`Download do arquivo ${format.toUpperCase()} iniciado!`);
            setIsExportMenuOpen(false);
        } catch (error) {
            console.error(`Erro ao exportar itens do orçamento em ${format}:`, error);
            toast.error(`Erro ao exportar itens em ${format.toUpperCase()}.`);
        }
    };

    useEffect(() => {
        if (!orcamentoId) {
            toast.error('Orçamento não identificado. Retornando...');
            navigate('/orcamentos');
            return;
        }
        loadItensDoOrcamento(orcamentoId);
        loadOptions();
    }, [orcamentoId, navigate]);
    return (
        <div className="show-items-header">
            <div className="show-items-title-row">
                <h2>Ver Itens do Orçamento: <span className="orcamento-nome">{orcamentoNome || 'Selecione um Orçamento'}</span></h2>

                <div className="export-menu-wrapper">
                    <div className='export-button-container'>

                        <button
                            title="Exportar itens do orçamento"
                            className="btn-export"
                            onClick={() => setIsExportMenuOpen((prev) => !prev)}
                        >
                            <FaFileUpload />
                        </button>
                        <span>Exportar Itens</span>
                    </div>

                    {isExportMenuOpen && (
                        <div className="export-tooltip-menu">
                            <button
                                className="export-option"
                                onClick={() => downloadBudgetItems('pdf')}
                            >
                                <FaFilePdf /> PDF
                            </button>
                            <button
                                className="export-option"
                                onClick={() => downloadBudgetItems('excel')}
                            >
                                <FaFileExcel /> Excel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <Loading />
            ) : (
                <div className="itens-orcamento-view">
                    <div className="itens-orcamento-summary-grid">
                        <div className="itens-orcamento-summary-card">
                            <span>Total de Itens</span>
                            <strong>{itens.length}</strong>
                        </div>
                        <div className="itens-orcamento-summary-card">
                            <span>Valor Total do Orçamento</span>
                            <strong>{formatCurrency(totalBudgetValue)}</strong>
                        </div>
                        <div className="itens-orcamento-summary-card">
                            <span>Materiais</span>
                            <strong>{groupedItems.material.length}</strong>
                        </div>
                        <div className="itens-orcamento-summary-card">
                            <span>Maquinários</span>
                            <strong>{groupedItems.maquinario.length}</strong>
                        </div>
                        <div className="itens-orcamento-summary-card">
                            <span>Cargos</span>
                            <strong>{groupedItems.cargo.length}</strong>
                        </div>
                    </div>

                    <div className="itens-orcamento-sections">
                        {['material', 'maquinario', 'cargo'].map((type) => {
                            const sectionItems = groupedItems[type];
                            const sectionTotal = sectionItems.reduce((sum, item) => sum + Number(item.valorTotal || 0), 0);

                            return (
                                <section key={type} className="itens-orcamento-section">
                                    <div className="itens-orcamento-section-header">
                                        <div>
                                            <h2>{typeSectionMeta[type].title}</h2>
                                            <p>{typeSectionMeta[type].description}</p>
                                        </div>
                                        <div className="itens-orcamento-section-stats">
                                            <span>{sectionItems.length} itens</span>
                                            <strong>{formatCurrency(sectionTotal)}</strong>
                                        </div>
                                    </div>

                                    {sectionItems.length === 0 ? (
                                        <div className="itens-orcamento-empty-state">
                                            Nenhum item cadastrado nesta categoria.
                                        </div>
                                    ) : (
                                        <div className="itens-orcamento-list-wrapper">
                                            <div className="itens-orcamento-list itens-orcamento-list-header">
                                                <span>Item</span>
                                                <span>Projeto</span>
                                                <span>Orçamento</span>
                                                <span>Quantidade</span>
                                                <span>Valor Unitário</span>
                                                <span>Valor Total</span>
                                                <span>Ações</span>
                                            </div>

                                            {sectionItems.map((item) => (
                                                <div key={item.id} className="itens-orcamento-list itens-orcamento-list-row">
                                                    <span className="itens-orcamento-item-main">
                                                        {getItemNameByType(item, type)}
                                                        {/* <small>ID #{item.id}</small> */}
                                                    </span>
                                                    <span>{item.projeto?.label || 'N/A'}</span>
                                                    <span>{item.orcamento?.label || 'N/A'}</span>
                                                    <span>{Number(item.quantidade || 0).toLocaleString('pt-BR')}</span>
                                                    <span>{formatCurrency(item.valorUnitario)}</span>
                                                    <span>{formatCurrency(item.valorTotal)}</span>
                                                    <div className="container-acoes itens-orcamento-list-actions">
                                                        <button
                                                            title="Editar item de orçamento"
                                                            className="btn-detalhes"
                                                            onClick={() => editItem(item.id)}
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            title="Excluir item de orçamento"
                                                            className="btn-excluir"
                                                            onClick={() => deleteItem(item.id)}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                </div>
            )}

            {editingItem && (
                <Modal isOpen={isEditModalOpen} onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                }}>
                    <Form
                        fields={itemFields}
                        initialValues={editingItem}
                        onSubmit={updateItem}
                        submitButtonText="Atualizar"
                    />
                </Modal>
            )}

            {confirmDialog}
        </div>
    );
}

export default ViewItems;