import React, { useContext, useEffect, useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Form from '../components/Form';
import Loading from '../components/Loading';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './Pages.css';
import HomePage from '../components/HomePage';
import api from '../service/api';
import { toast } from 'react-toastify';
import { formatDate, formatDateForInput } from '../utils/formatters';
import { AuthContext } from '../context/AuthContext';
import useConfirmAction from '../hooks/useConfirmAction';

const Projetos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projetos, setProjetos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { confirmAction, confirmDialog } = useConfirmAction();


  const { user } = useContext(AuthContext);
  const isUserRole = user?.role === 'user';

  const findAllClientes = async () => {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Erro ao buscar clientes.');
    }
  };

  const findAll = async () => {
    setLoading(true);
    try {
      const response = await api.get('/projetos');
      if (!response.data || response.data.length === 0) {
        setProjetos([]);
        toast.info('Nenhum projeto encontrado.');
        return;
      }
      setProjetos(response.data);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      toast.error('Erro ao buscar projetos.');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      const response = await api.post('/projetos/projeto', {
        nome: projectData.nome,
        descricao: projectData.descricao,
        dataInicio: projectData.dataInicio,
        dataFim: projectData.dataFim,
        clienteId: parseInt(projectData.clienteId)
      });
      if (response.status === 201) {
        toast.success('Projeto criado com sucesso!');
        setIsModalOpen(false);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      toast.error('Erro ao criar projeto.');
    }
  };

  const deleteProject = async (id) => {
    const confirmed = await confirmAction({
      title: 'Excluir projeto',
      message: 'Tem certeza que deseja excluir este projeto?',
      confirmText: 'Excluir'
    });

    if (!confirmed) return;

    try {
      const response = await api.delete(`/projetos/projeto/${id}`);
      if (response.status === 204 || response.status === 200) {
        toast.success('Projeto deletado com sucesso!');
        findAll();
      }
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      toast.error('Erro ao deletar projeto.');
    }
  };

  const editProject = async (id) => {
    try {
      const response = await api.get(`/projetos/projeto/${id}`);
      if (response.data) {
        const projectData = {
          ...response.data,
          dataInicio: formatDateForInput(response.data.dataInicio),
          dataFim: formatDateForInput(response.data.dataFim)
        };
        setEditingProject(projectData);
        setIsEditModalOpen(true);
      } else {
        toast.error('Projeto não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar projeto:', error);
      toast.error('Erro ao buscar dados do projeto.');
    }
  };

  const updateProject = async (projectData) => {
    try {
      const response = await api.put(`/projetos/projeto/${editingProject.id}`, {
        nome: projectData.nome,
        descricao: projectData.descricao,
        dataInicio: projectData.dataInicio,
        dataFim: projectData.dataFim,
        clienteId: parseInt(projectData.clienteId)
      });
      if (response.status === 200) {
        toast.success('Projeto atualizado com sucesso!');
        setIsEditModalOpen(false);
        setEditingProject(null);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      toast.error('Erro ao atualizar projeto.');
    }
  };

  const projectFields = [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'descricao', label: 'Descrição', type: 'text', required: true },
    { name: 'dataInicio', label: 'Data Início', type: 'date', required: true },
    { name: 'dataFim', label: 'Data Fim', type: 'date', required: true },
    {
      name: 'clienteId',
      label: 'Cliente',
      type: 'select',
      required: true,
      options: clientes.map(cliente => ({
        value: cliente.id,
        label: cliente.nome
      }))
    }
  ];

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Nome", accessor: "nome" },
    { header: "Descrição", accessor: "descricao" },
    { header: "Cliente", accessor: "nomeCliente" },
    { header: "Data Início", accessor: "dataInicio", render: (value) => formatDate(value) },
    { header: "Data Fim", accessor: "dataFim", render: (value) => formatDate(value) },
    {
      header: "Ações",
      accessor: "id",
      render: (id) => (
        !isUserRole && (
          <div className='container-acoes'>
            <button title='Editar projeto' className="btn-detalhes" onClick={() => editProject(id)}><FaEdit /></button>
            <button title='Excluir projeto' className="btn-excluir" onClick={() => deleteProject(id)}><FaTrash /></button>
          </div>
        )
      ),
    },
  ];

  useEffect(() => {
    findAllClientes();
    findAll();
  }, []);

  return (
    <>
      <HomePage titulo="Projetos" botao="Novo Projeto" onButtonClick={() => setIsModalOpen(true)} />
      {loading ? <Loading /> : <Table columns={columns} data={projetos} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Form fields={projectFields} onSubmit={createProject} submitButtonText="Adicionar" />
      </Modal>

      {editingProject && (
        <Modal isOpen={isEditModalOpen} onClose={() => {
          setIsEditModalOpen(false);
          setEditingProject(null);
        }}>
          <Form
            fields={projectFields}
            initialValues={editingProject}
            onSubmit={updateProject}
            submitButtonText="Atualizar"
          />
        </Modal>
      )}

      {confirmDialog}
    </>
  );
};

export default Projetos;


