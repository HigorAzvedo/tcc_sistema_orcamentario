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

const Maquinario = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [maquinarios, setMaquinarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { confirmAction, confirmDialog } = useConfirmAction();
  const [fornecedores, setFornecedores] = useState([]);

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
      const response = await api.get('/maquinarios');
      if (!response.data || response.data.length === 0) {
        setMaquinarios([]);
        toast.info('Nenhum maquinário encontrado.');
        return;
      }
      // fetch fornecedores for each maquinario and attach
      const maquinasComFornecedores = await Promise.all(response.data.map(async (m) => {
        try {
          const resp = await api.get(`/maquinarios/maquinario/${m.id}/fornecedores`);
          const nomes = Array.isArray(resp.data) ? resp.data.map(f => f.nome) : [];
          return { ...m, fornecedores: nomes };
        } catch (err) {
          return { ...m, fornecedores: [] };
        }
      }));

      setMaquinarios(maquinasComFornecedores);
      console.log(maquinasComFornecedores, 'response');
    } catch (error) {
      console.error('Erro ao buscar maquinários:', error);
      toast.error('Erro ao buscar maquinários.');
    } finally {
      setLoading(false);
    }
  };

  const createMachine = async (machineData) => {
    try {
      const response = await api.post('/maquinarios/maquinario', {
        nome: machineData.nome,
        descricao: machineData.descricao,
        fornecedorId: parseInt(machineData.fornecedorId, 10)
      });
      if (response.status === 201) {
        toast.success('Maquinário criado com sucesso!');
        setIsModalOpen(false);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao criar maquinário:', error);
      toast.error('Erro ao criar maquinário.');
    }
  };

  const deleteMachine = async (id) => {
    const confirmed = await confirmAction({
      title: 'Excluir maquinário',
      message: 'Tem certeza que deseja excluir este maquinário?',
      confirmText: 'Excluir'
    });

    if (!confirmed) return;

    try {
      const response = await api.delete(`/maquinarios/maquinario/${id}`);
      if (response.status === 204 || response.status === 200) {
        toast.success('Maquinário deletado com sucesso!');
        findAll();
      }
    } catch (error) {
      console.error('Erro ao deletar maquinário:', error);
      toast.error('Erro ao deletar maquinário.');
    }
  };

  const editMachine = async (id) => {
    try {
      const response = await api.get(`/maquinarios/maquinario/${id}`);
      if (response.data) {
        // Buscar fornecedores vinculados ao maquinário
        const fornecedoresResponse = await api.get(`/maquinarios/maquinario/${id}/fornecedores`);
        const fornecedoresList = Array.isArray(fornecedoresResponse.data) ? fornecedoresResponse.data : [];
        const fornecedorId = fornecedoresList.length > 0 ? fornecedoresList[0].id : null;
        
        setEditingMachine({ ...response.data, fornecedorId });
        setIsEditModalOpen(true);
      } else {
        toast.error('Maquinário não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar maquinário:', error);
      toast.error('Erro ao buscar dados do maquinário.');
    }
  };

  const updateMachine = async (machineData) => {
    try {
      // Extract fornecedorId from machineData
      const fornecedorId = machineData.fornecedorId;
      const oldFornecedorId = editingMachine.fornecedorId;
      
      // Update machine without fornecedorId
      const dataToSend = {
        nome: machineData.nome,
        descricao: machineData.descricao
      };
      
      const response = await api.put(`/maquinarios/maquinario/${editingMachine.id}`, dataToSend);
      if (response.status === 200) {
        // If fornecedor changed, remove old and add new
        if (fornecedorId && fornecedorId !== oldFornecedorId) {
          // Remove old fornecedor
          if (oldFornecedorId) {
            try {
              await api.delete(`/maquinarios/maquinario/${editingMachine.id}/fornecedores/${oldFornecedorId}`);
            } catch {
              // Fornecedor antigo talvez não exista, continuar
            }
          }
          // Add new fornecedor
          try {
            await api.post(`/maquinarios/maquinario/${editingMachine.id}/fornecedores`, { fornecedorId });
          } catch (error) {
            console.error('Erro ao atualizar fornecedor:', error);
          }
        }
        
        toast.success('Maquinário atualizado com sucesso!');
        setIsEditModalOpen(false);
        setEditingMachine(null);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao atualizar maquinário:', error);
      toast.error('Erro ao atualizar maquinário.');
    }
  };

  const machineFields = [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'descricao', label: 'Descrição', type: 'text', required: true },
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

  const machineEditFields = [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'descricao', label: 'Descrição', type: 'text', required: true },
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
    { header: "Nome", accessor: "nome" },
    { header: "Descrição", accessor: "descricao" },
    { header: 'Fornecedores', accessor: 'fornecedores', render: (fornecedores) => (Array.isArray(fornecedores) ? fornecedores.join(', ') : '') },
    {
      header: "Ações",
      accessor: "id",
      render: (id) => (
        <div className='container-acoes'>
          <button title='Editar maquinário' className="btn-detalhes" onClick={() => editMachine(id)}><FaEdit /></button>
          <button title='Excluir maquinário' className="btn-excluir" onClick={() => deleteMachine(id)}><FaTrash /></button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    findAllFornecedores();
    findAll();
  }, []);

  return (
    <>
      <HomePage titulo="Equipamentos" botao="Novo Equipamento" onButtonClick={() => setIsModalOpen(true)} />
      {loading ? <Loading /> : <Table columns={columns} data={maquinarios} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Form fields={machineFields} onSubmit={createMachine} submitButtonText="Adicionar" />
      </Modal>

      {editingMachine && (
        <Modal isOpen={isEditModalOpen} onClose={() => {
          setIsEditModalOpen(false);
          setEditingMachine(null);
        }}>
          <Form
            fields={machineEditFields}
            initialValues={editingMachine}
            onSubmit={updateMachine}
            submitButtonText="Atualizar"
          />
        </Modal>
      )}

      {confirmDialog}
    </>
  );
};

export default Maquinario;


