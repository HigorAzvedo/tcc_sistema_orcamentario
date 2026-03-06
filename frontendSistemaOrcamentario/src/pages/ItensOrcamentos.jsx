import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Form from '../components/Form';
import Loading from '../components/Loading';
import { FaEdit, FaFileInvoiceDollar, FaTrash } from 'react-icons/fa';
import './Pages.css';
import HomePage from '../components/HomePage';
import api from '../service/api';
import { toast } from 'react-toastify';

const ItensOrcamentos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itensOrcamentos, setItensOrcamentos] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [maquinarios, setMaquinarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOptions = async () => {
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
      console.error('Erro ao carregar opções:', error);
      toast.error('Erro ao carregar opções dos formulários.');
    }
  };

  const findAll = async () => {
    setLoading(true);
    try {
      const response = await api.get('/itensOrcamentos');
      if (!response.data || response.data.length === 0) {
        setItensOrcamentos([]);
        toast.info('Nenhum item de orçamento encontrado.');
        return;
      }
      setItensOrcamentos(response.data);
    } catch (error) {
      console.error('Erro ao buscar itens de orçamentos:', error);
      toast.error('Erro ao buscar itens de orçamentos.');
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData) => {
    try {
      const response = await api.post('/itensOrcamentos/itensOrcamento', {
        valorUnitario: parseFloat(itemData.valorUnitario),
        quantidade: parseFloat(itemData.quantidade),
        valorTotal: parseFloat(itemData.valorUnitario) * parseFloat(itemData.quantidade),
        idProjeto: parseInt(itemData.idProjeto),
        idOrcamento: parseInt(itemData.idOrcamento),
        idMaterial: parseInt(itemData.idMaterial),
        idCargo: parseInt(itemData.idCargo),
        idMaquinario: itemData.idMaquinario ? parseInt(itemData.idMaquinario) : null
      });
      if (response.status === 201) {
        toast.success('Item de orçamento criado com sucesso!');
        setIsModalOpen(false);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao criar item de orçamento:', error);
      toast.error('Erro ao criar item de orçamento.');
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este item de orçamento?')) {
      try {
        const response = await api.delete(`/itensOrcamentos/itensOrcamento/${id}`);
        if (response.status === 204 || response.status === 200) {
          toast.success('Item de orçamento deletado com sucesso!');
          findAll();
        }
      } catch (error) {
        console.error('Erro ao deletar item de orçamento:', error);
        toast.error('Erro ao deletar item de orçamento.');
      }
    }
  };

  const editItem = async (id) => {
    try {
      const response = await api.get(`/itensOrcamentos/itensOrcamento/${id}`);
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
        findAll();
      }
    } catch (error) {
      console.error('Erro ao atualizar item de orçamento:', error);
      toast.error('Erro ao atualizar item de orçamento.');
    }
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
          <button title='Editar item de orçamento' className="btn-detalhes" onClick={(e) => {
            e.stopPropagation();
            editItem(row.id);
          }}><FaEdit /></button>
          <button title='Excluir item de orçamento' className="btn-excluir" onClick={(e) => {
            e.stopPropagation();
            deleteItem(row.id);
            deleteItem(row.id);
          }}><FaTrash /></button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadOptions();
    findAll();
  }, []);

  return (
    <>
      <HomePage titulo="Itens de Orçamentos" botao="Novo Item" onButtonClick={() => setIsModalOpen(true)} />
      {loading ? <Loading /> : <Table columns={columns} data={itensOrcamentos} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Form fields={itemFields} onSubmit={createItem} submitButtonText="Adicionar" />
      </Modal>

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
    </>
  );
};

export default ItensOrcamentos;