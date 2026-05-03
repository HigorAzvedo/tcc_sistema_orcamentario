import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Form from '../components/Form';
import Loading from '../components/Loading';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './Pages.css';
import HomePage from '../components/HomePage';
import api from '../service/api';
import { toast } from 'react-toastify';
import useConfirmAction from '../hooks/useConfirmAction';

const Materiais = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const { confirmAction, confirmDialog } = useConfirmAction();

  const [areas, setAreas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

    const findAllAreas = async () => {
    try {
      const response = await api.get('/areas');
      setAreas(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar áreas:', error);
      toast.error('Erro ao buscar áreas.');
    }
  };

  const findAllFornecedores = async () => {
    try {
      const response = await api.get('/fornecedores');
      setFornecedores(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      toast.error('Erro ao buscar fornecedores.');
    }
  };

  

  const findAll = async () => {
    setLoading(true);
    try {
      const response = await api.get('/materiais');
      if (!response.data || response.data.length === 0) {
        setMateriais([]);
        toast.info('Nenhum material encontrado.');
        return;
      }
      const materiaisComFornecedores = await Promise.all(response.data.map(async (m) => {
        try {
          const resp = await api.get(`/materiais/material/${m.id}/fornecedores`);
          const nomes = Array.isArray(resp.data) ? resp.data.map(f => f.nome) : [];
          return { ...m, fornecedores: nomes };
        } catch {
          return { ...m, fornecedores: [] };
        }
      }));

      setMateriais(materiaisComFornecedores);
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
      toast.error('Erro ao buscar materiais.');
    } finally {
      setLoading(false);
    }
  };

  const createMaterial = async (materialData) => {
    try {
      const response = await api.post('/materiais/material', materialData);
      if (response.status === 201) {
        toast.success('Material criado com sucesso!');
        setIsModalOpen(false);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao criar material:', error);
      toast.error('Erro ao criar material.');
    }
  };

  const deleteMaterial = async (id) => {
    const confirmed = await confirmAction({
      title: 'Excluir material',
      message: 'Tem certeza que deseja excluir este material?',
      confirmText: 'Excluir'
    });

    if (!confirmed) return;

    try {
      const response = await api.delete(`/materiais/material/${id}`);
      if (response.status === 204 || response.status === 200) {
        toast.success('Material deletado com sucesso!');
        findAll();
      }
    } catch (error) {
      console.error('Erro ao deletar material:', error);
      toast.error('Erro ao deletar material.');
    }
  };

  const editMaterial = async (id) => {
    try {
      const response = await api.get(`/materiais/material/${id}`);
      if (response.data) {
        // Buscar fornecedores vinculados ao material
        const fornecedoresResponse = await api.get(`/materiais/material/${id}/fornecedores`);
        const fornecedoresList = Array.isArray(fornecedoresResponse.data) ? fornecedoresResponse.data : [];
        const fornecedorId = fornecedoresList.length > 0 ? fornecedoresList[0].id : null;
        
        setEditingMaterial({ ...response.data, fornecedorId });
        setIsEditModalOpen(true);
      } else {
        toast.error('Material não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar material:', error);
      toast.error('Erro ao buscar dados do material.');
    }
  };

  const updateMaterial = async (materialData) => {
    if (!editingMaterial) return;
    try {
      // Extract fornecedorId from materialData
      const fornecedorId = materialData.fornecedorId;
      const oldFornecedorId = editingMaterial.fornecedorId;
      
      // Update material without fornecedorId
      const dataToSend = { ...materialData };
      delete dataToSend.fornecedorId;
      
      const response = await api.put(`/materiais/material/${editingMaterial.id}`, dataToSend);
      if (response.status === 200) {
        // If fornecedor changed, remove old and add new
        if (fornecedorId && fornecedorId !== oldFornecedorId) {
          // Remove old fornecedor
          if (oldFornecedorId) {
            try {
              await api.delete(`/materiais/material/${editingMaterial.id}/fornecedores/${oldFornecedorId}`);
            } catch {
              // Fornecedor antigo talvez não exista, continuar
            }
          }
          // Add new fornecedor
          try {
            await api.post(`/materiais/material/${editingMaterial.id}/fornecedores`, { fornecedorId });
          } catch (error) {
            console.error('Erro ao atualizar fornecedor:', error);
          }
        }
        
        toast.success('Material atualizado com sucesso!');
        setIsEditModalOpen(false);
        setEditingMaterial(null);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao atualizar material:', error);
      toast.error('Erro ao atualizar material.');
    }
  };

  const materialFields = [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'descricao', label: 'Descrição', type: 'text', required: true },
    { name: 'unidadeMedida', label: 'Unidade de Medida', type: 'text', required: true },
    {
      name: 'areaId',
      label: 'Área',
      type: 'select',
      required: true,
      options: areas.map(area => ({
        value: area.id,
        label: area.nome
      }))
    },
    {
      name: 'fornecedorId',
      label: 'Fornecedor',
      type: 'searchSelect',
      required: true,
      options: fornecedores.map(fornecedor => ({
        value: fornecedor.id,
        label: fornecedor.nome
      })),
      placeholder: 'Selecione um fornecedor',
      searchPlaceholder: 'Buscar fornecedor...',
      emptyMessage: 'Nenhum fornecedor encontrado.'
    }
  ];

  const materialEditFields = [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'descricao', label: 'Descrição', type: 'text', required: true },
    { name: 'unidadeMedida', label: 'Unidade de Medida', type: 'text', required: true },
    {
      name: 'areaId',
      label: 'Área',
      type: 'select',
      required: true,
      options: areas.map(area => ({
        value: area.id,
        label: area.nome
      }))
    },
    {
      name: 'fornecedorId',
      label: 'Fornecedor',
      type: 'searchSelect',
      options: fornecedores.map(fornecedor => ({
        value: fornecedor.id,
        label: fornecedor.nome
      })),
      placeholder: 'Selecione um fornecedor',
      searchPlaceholder: 'Buscar fornecedor...',
      emptyMessage: 'Nenhum fornecedor encontrado.'
    }
  ];


  const columns = [
    { header: 'Nome', accessor: 'nome' },
    { header: 'Descrição', accessor: 'descricao' },
    { header: 'Unidade de Medida', accessor: 'unidadeMedida' },
    { header: 'Área', accessor: 'areaNome' },
    { header: 'Fornecedores', accessor: 'fornecedores', render: (fornecedores) => (Array.isArray(fornecedores) ? fornecedores.join(', ') : '') },
    {
      header: 'Ações',
      accessor: 'id',
      render: (id) => (
        <div className="container-acoes">
          <button className="btn-detalhes" onClick={() => editMaterial(id)}><FaEdit /></button>
          <button className="btn-excluir" onClick={() => deleteMaterial(id)}><FaTrash /></button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    findAllAreas();
    findAllFornecedores();
    findAll();
  }, []);

  return (
    <>
      <HomePage titulo="Materiais" botao="Novo Material" onButtonClick={() => setIsModalOpen(true)} />
      {loading ? <Loading /> : <Table columns={columns} data={materiais} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Form fields={materialFields} onSubmit={createMaterial} submitButtonText="Adicionar" />
      </Modal>

      {isEditModalOpen && editingMaterial && (
        <Modal isOpen={isEditModalOpen} onClose={() => {
          setIsEditModalOpen(false);
          setEditingMaterial(null);
        }}>
          <Form
              fields={materialEditFields}
            initialValues={editingMaterial}
            onSubmit={updateMaterial}
            submitButtonText="Atualizar"
          />
        </Modal>
      )}

      {confirmDialog}
    </>
  );
};

export default Materiais;


