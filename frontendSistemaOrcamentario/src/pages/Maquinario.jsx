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

  const findAll = async () => {
    setLoading(true);
    try {
      const response = await api.get('/maquinarios');
      if (!response.data || response.data.length === 0) {
        setMaquinarios([]);
        toast.info('Nenhum maquinário encontrado.');
        return;
      }
      setMaquinarios(response.data);
      console.log(response.data, 'response');
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
        valor: parseFloat(machineData.valor)
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
        setEditingMachine(response.data);
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
      const response = await api.put(`/maquinarios/maquinario/${editingMachine.id}`, {
        nome: machineData.nome,
        descricao: machineData.descricao,
        valor: parseFloat(machineData.valor)
      });
      if (response.status === 200) {
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
    { name: 'valor', label: 'Valor', type: 'number', required: true, step: '0.01' }
  ];

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Nome", accessor: "nome" },
    { header: "Descrição", accessor: "descricao" },
    {
      header: "Valor",
      accessor: "valor"
    },
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
    findAll();
  }, []);

  return (
    <>
      <HomePage titulo="Maquinários" botao="Novo Maquinário" onButtonClick={() => setIsModalOpen(true)} />
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
            fields={machineFields}
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


