import React, { useCallback, useEffect, useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './Pages.css';
import './ItensOrcamentos.css';
import HomePage from '../components/HomePage';
import api from '../service/api';
import { toast } from 'react-toastify';
import useConfirmAction from '../hooks/useConfirmAction';

const itemTabs = [
  { key: 'material', label: 'Material' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'maquinario', label: 'Maquinário' }
];

const createEmptyFormData = () => ({
  idProjeto: '',
  idOrcamento: '',
  idMaterial: '',
  idCargo: '',
  idMaquinario: '',
  valorUnitario: '',
  quantidade: ''
});

const resolveItemType = (item) => {
  if (item?.idMaterial) {
    return 'material';
  }

  if (item?.idCargo) {
    return 'cargo';
  }

  if (item?.idMaquinario) {
    return 'maquinario';
  }

  return 'material';
};

const mapItemToFormData = (item) => ({
  idProjeto: item?.idProjeto ? String(item.idProjeto) : '',
  idOrcamento: item?.idOrcamento ? String(item.idOrcamento) : '',
  idMaterial: item?.idMaterial ? String(item.idMaterial) : '',
  idCargo: item?.idCargo ? String(item.idCargo) : '',
  idMaquinario: item?.idMaquinario ? String(item.idMaquinario) : '',
  valorUnitario: item?.valorUnitario ? String(item.valorUnitario) : '',
  quantidade: item?.quantidade ? String(item.quantidade) : ''
});

const getSelectedTypeDetails = (row) => {
  const typeLabels = [];
  const itemLabels = [];

  if (row.material?.label) {
    typeLabels.push('Material');
    itemLabels.push(row.material.label);
  }

  if (row.cargo?.label) {
    typeLabels.push('Cargo');
    itemLabels.push(row.cargo.label);
  }

  if (row.maquinario?.label) {
    typeLabels.push('Maquinário');
    itemLabels.push(row.maquinario.label);
  }

  return {
    typeLabel: typeLabels.length > 0 ? typeLabels.join(' + ') : 'N/A',
    itemLabel: itemLabels.length > 0 ? itemLabels.join(', ') : 'N/A'
  };
};

const validateItemForm = (formData, activeTab) => {
  if (!formData.idProjeto) {
    return 'Selecione um projeto.';
  }

  if (!formData.idOrcamento) {
    return 'Selecione um orçamento.';
  }

  if (activeTab === 'material' && !formData.idMaterial) {
    return 'Selecione um material.';
  }

  if (activeTab === 'cargo' && !formData.idCargo) {
    return 'Selecione um cargo.';
  }

  if (activeTab === 'maquinario' && !formData.idMaquinario) {
    return 'Selecione um maquinário.';
  }

  if (!formData.quantidade || Number(formData.quantidade) <= 0) {
    return 'Quantidade deve ser maior que zero.';
  }

  if (!formData.valorUnitario || Number(formData.valorUnitario) <= 0) {
    return 'Valor unitário deve ser maior que zero.';
  }

  return null;
};

const buildItemPayload = (formData, activeTab) => ({
  valorUnitario: parseFloat(formData.valorUnitario),
  quantidade: parseFloat(formData.quantidade),
  idProjeto: parseInt(formData.idProjeto, 10),
  idOrcamento: parseInt(formData.idOrcamento, 10),
  idMaterial: activeTab === 'material' && formData.idMaterial ? parseInt(formData.idMaterial, 10) : null,
  idCargo: activeTab === 'cargo' && formData.idCargo ? parseInt(formData.idCargo, 10) : null,
  idMaquinario: activeTab === 'maquinario' && formData.idMaquinario ? parseInt(formData.idMaquinario, 10) : null
});

const getErrorMessage = (error, fallbackMessage) => error.response?.data?.message || fallbackMessage;

const ItemBudgetForm = ({
  title,
  formData,
  activeTab,
  onFieldChange,
  onTabChange,
  onSubmit,
  submitButtonText,
  projetos,
  orcamentos,
  materiais,
  cargos,
  maquinarios
}) => (
  <form className="item-orcamento-form" onSubmit={onSubmit}>
    <h2 className="item-orcamento-title">{title}</h2>

    <div className="item-orcamento-grid">
      <div className="item-orcamento-field">
        <label htmlFor={`${submitButtonText}-projeto`}>Projeto</label>
        <select
          id={`${submitButtonText}-projeto`}
          name="idProjeto"
          value={formData.idProjeto}
          onChange={onFieldChange}
          className="item-orcamento-input"
        >
          <option value="">Selecione um projeto</option>
          {projetos.map((projeto) => (
            <option key={projeto.value} value={projeto.value}>{projeto.label}</option>
          ))}
        </select>
      </div>

      <div className="item-orcamento-field">
        <label htmlFor={`${submitButtonText}-orcamento`}>Orçamento</label>
        <select
          id={`${submitButtonText}-orcamento`}
          name="idOrcamento"
          value={formData.idOrcamento}
          onChange={onFieldChange}
          className="item-orcamento-input"
        >
          <option value="">Selecione um orçamento</option>
          {orcamentos.map((orcamento) => (
            <option key={orcamento.value} value={orcamento.value}>{orcamento.label}</option>
          ))}
        </select>
      </div>
    </div>

    <div className="item-orcamento-tabs">
      {itemTabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`item-orcamento-tab ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>

    <div className="item-orcamento-grid">
      {activeTab === 'material' && (
        <div className="item-orcamento-field item-orcamento-field-full">
          <label htmlFor={`${submitButtonText}-material`}>Material</label>
          <select
            id={`${submitButtonText}-material`}
            name="idMaterial"
            value={formData.idMaterial}
            onChange={onFieldChange}
            className="item-orcamento-input"
          >
            <option value="">Selecione um material</option>
            {materiais.map((material) => (
              <option key={material.value} value={material.value}>{material.label}</option>
            ))}
          </select>
        </div>
      )}

      {activeTab === 'cargo' && (
        <div className="item-orcamento-field item-orcamento-field-full">
          <label htmlFor={`${submitButtonText}-cargo`}>Cargo</label>
          <select
            id={`${submitButtonText}-cargo`}
            name="idCargo"
            value={formData.idCargo}
            onChange={onFieldChange}
            className="item-orcamento-input"
          >
            <option value="">Selecione um cargo</option>
            {cargos.map((cargo) => (
              <option key={cargo.value} value={cargo.value}>{cargo.label}</option>
            ))}
          </select>
        </div>
      )}

      {activeTab === 'maquinario' && (
        <div className="item-orcamento-field item-orcamento-field-full">
          <label htmlFor={`${submitButtonText}-maquinario`}>Maquinário</label>
          <select
            id={`${submitButtonText}-maquinario`}
            name="idMaquinario"
            value={formData.idMaquinario}
            onChange={onFieldChange}
            className="item-orcamento-input"
          >
            <option value="">Selecione um maquinário</option>
            {maquinarios.map((maquinario) => (
              <option key={maquinario.value} value={maquinario.value}>{maquinario.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>

    <div className="item-orcamento-grid">
      <div className="item-orcamento-field">
        <label htmlFor={`${submitButtonText}-quantidade`}>Quantidade</label>
        <input
          id={`${submitButtonText}-quantidade`}
          type="number"
          name="quantidade"
          value={formData.quantidade}
          onChange={onFieldChange}
          className="item-orcamento-input"
          step="0.01"
          min="0"
          placeholder="0"
        />
      </div>

      <div className="item-orcamento-field">
        <label htmlFor={`${submitButtonText}-valor`}>Valor Unitário (R$)</label>
        <input
          id={`${submitButtonText}-valor`}
          type="number"
          name="valorUnitario"
          value={formData.valorUnitario}
          onChange={onFieldChange}
          className="item-orcamento-input"
          step="0.01"
          min="0"
          placeholder="0,00"
        />
      </div>
    </div>

    <div className="item-orcamento-actions">
      <button type="submit" className="btn-success item-orcamento-submit">
        {submitButtonText}
      </button>
    </div>
  </form>
);

const ItensOrcamentos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [itensOrcamentos, setItensOrcamentos] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [maquinarios, setMaquinarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createFormData, setCreateFormData] = useState(createEmptyFormData());
  const [editFormData, setEditFormData] = useState(createEmptyFormData());
  const [createActiveTab, setCreateActiveTab] = useState('material');
  const [editActiveTab, setEditActiveTab] = useState('material');
  const { confirmAction, confirmDialog } = useConfirmAction();

  const loadOptions = useCallback(async () => {
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
  }, []);

  const findAll = useCallback(async () => {
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
  }, []);

  const resetCreateModal = () => {
    setCreateFormData(createEmptyFormData());
    setCreateActiveTab('material');
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
    resetCreateModal();
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItemId(null);
    setEditFormData(createEmptyFormData());
    setEditActiveTab('material');
  };

  const openCreateModal = () => {
    resetCreateModal();
    setIsModalOpen(true);
  };

  const handleFieldChange = (setFormData) => (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleTabChange = (setFormData, setActiveTab) => (tabKey) => {
    setActiveTab(tabKey);
    setFormData((previous) => ({
      ...previous,
      idMaterial: '',
      idCargo: '',
      idMaquinario: ''
    }));
  };

  const createItem = async (event) => {
    event.preventDefault();

    const validationError = validateItemForm(createFormData, createActiveTab);
    if (validationError) {
      toast.warning(validationError);
      return;
    }

    try {
      const response = await api.post('/itensOrcamentos/itensOrcamento', buildItemPayload(createFormData, createActiveTab));

      if (response.status === 201) {
        toast.success('Item de orçamento criado com sucesso!');
        closeCreateModal();
        findAll();
      }
    } catch (error) {
      console.error('Erro ao criar item de orçamento:', error);
      toast.error(getErrorMessage(error, 'Erro ao criar item de orçamento.'));
    }
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
        findAll();
      }
    } catch (error) {
      console.error('Erro ao deletar item de orçamento:', error);
      toast.error('Erro ao deletar item de orçamento.');
    }
  };

  const editItem = async (id) => {
    try {
      const response = await api.get(`/itensOrcamentos/itensOrcamento/${id}`);
      if (response.data) {
        setEditingItemId(response.data.id);
        setEditFormData(mapItemToFormData(response.data));
        setEditActiveTab(resolveItemType(response.data));
        setIsEditModalOpen(true);
      } else {
        toast.error('Item de orçamento não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar item de orçamento:', error);
      toast.error('Erro ao buscar dados do item de orçamento.');
    }
  };

  const updateItem = async (event) => {
    event.preventDefault();

    const validationError = validateItemForm(editFormData, editActiveTab);
    if (validationError) {
      toast.warning(validationError);
      return;
    }

    if (!editingItemId) {
      toast.error('Item de orçamento não identificado.');
      return;
    }

    try {
      const response = await api.put(`/itensOrcamentos/itensOrcamento/${editingItemId}`, buildItemPayload(editFormData, editActiveTab));

      if (response.status === 200) {
        toast.success('Item de orçamento atualizado com sucesso!');
        closeEditModal();
        findAll();
      }
    } catch (error) {
      console.error('Erro ao atualizar item de orçamento:', error);
      toast.error(getErrorMessage(error, 'Erro ao atualizar item de orçamento.'));
    }
  };

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
      header: "Tipo",
      accessor: "id",
      render: (_, row) => getSelectedTypeDetails(row).typeLabel
    },
    {
      header: "Item",
      accessor: "id",
      render: (_, row) => getSelectedTypeDetails(row).itemLabel
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
          }}><FaTrash /></button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadOptions();
    findAll();
  }, [findAll, loadOptions]);

  return (
    <>
      <HomePage titulo="Itens de Orçamentos" botao="Novo Item" onButtonClick={openCreateModal} />
      {loading ? <Loading /> : <Table columns={columns} data={itensOrcamentos} />}

      <Modal isOpen={isModalOpen} onClose={closeCreateModal}>
        <ItemBudgetForm
          title="Novo Item de Orçamento"
          formData={createFormData}
          activeTab={createActiveTab}
          onFieldChange={handleFieldChange(setCreateFormData)}
          onTabChange={handleTabChange(setCreateFormData, setCreateActiveTab)}
          onSubmit={createItem}
          submitButtonText="Adicionar"
          projetos={projetos}
          orcamentos={orcamentos}
          materiais={materiais}
          cargos={cargos}
          maquinarios={maquinarios}
        />
      </Modal>

      {editingItemId && (
        <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
          <ItemBudgetForm
            title="Editar Item de Orçamento"
            formData={editFormData}
            activeTab={editActiveTab}
            onFieldChange={handleFieldChange(setEditFormData)}
            onTabChange={handleTabChange(setEditFormData, setEditActiveTab)}
            onSubmit={updateItem}
            submitButtonText="Atualizar"
            projetos={projetos}
            orcamentos={orcamentos}
            materiais={materiais}
            cargos={cargos}
            maquinarios={maquinarios}
          />
        </Modal>
      )}

      {confirmDialog}
    </>
  );
};

export default ItensOrcamentos;