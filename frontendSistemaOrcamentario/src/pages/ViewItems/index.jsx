import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../service/api';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Form from '../../components/Form';
import Loading from '../../components/Loading';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './style.css';

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

    const columns = [
        { header: "ID", accessor: "id" },
        {
            header: "Projeto",
            accessor: "projeto",
            render: (projeto) => projeto?.label || 'N/A'
        },
        {
            header: "Orçamento",
            accessor: "orcamento",
            render: (orcamento) => orcamento?.label || 'N/A'
        },
        {
            header: "Material",
            accessor: "material",
            render: (material) => material?.label || 'N/A'
        },
        {
            header: "Cargo",
            accessor: "cargo",
            render: (cargo) => cargo?.label || 'N/A'
        },
        {
            header: "Maquinário",
            accessor: "maquinario",
            render: (maquinario) => maquinario?.label || 'N/A'
        },
        {
            header: "Valor Unitário",
            accessor: "valorUnitario",

        },
        {
            header: "Quantidade",
            accessor: "quantidade"
        },
        {
            header: "Valor Total",
            accessor: "valorTotal",
        },
        {
            header: "Ações",
            accessor: "id",
            render: (id, row) => (
                <div className='container-acoes'>
                    <button className="btn-detalhes" onClick={(e) => {
                        e.stopPropagation();
                        editItem(row.id);
                    }}><FaEdit /></button>
                    <button className="btn-excluir" onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(row.id);
                        deleteItem(row.id);
                    }}><FaTrash /></button>
                </div>
            ),
        },
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
        if (window.confirm('Tem certeza que deseja excluir este item de orçamento?')) {
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
            <h2>Ver Itens do Orçamento: <span className="orcamento-nome">{orcamentoNome || 'Selecione um Orçamento'}</span></h2>

            {loading ? <Loading /> : <Table columns={columns} data={itens} />}

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
        </div>
    );
}

export default ViewItems;