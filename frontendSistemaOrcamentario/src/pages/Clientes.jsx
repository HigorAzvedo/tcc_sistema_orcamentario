import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Form from '../components/Form';
import Loading from '../components/Loading';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import './Pages.css';
import HomePage from '../components/HomePage';
import api from '../service/api';
import { toast } from 'react-toastify';


const Clientes = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClientForUser, setSelectedClientForUser] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const findAll = async () => {
    setLoading(true);
    try {
      const response = await api.get('/clientes');
      if (!response.data || response.data.length === 0) {
        setClientes([]);
        toast.info('Nenhum cliente encontrado.');
        return;
      }
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao buscar clientes.');
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData) => {
    try {
      const response = await api.post('/clientes/cliente', clientData);
      if (response.status === 201) {
        toast.success('Cliente criado com sucesso!');
        setIsModalOpen(false);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      toast.error('Erro ao criar cliente.');
    }
  };

  const deleteClient = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const response = await api.delete(`/clientes/cliente/${id}`);
        if (response.status === 204 || response.status === 200) {
          toast.success('Cliente deletado com sucesso!');
          findAll();
        }
      } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        toast.error('Erro ao deletar cliente.');
      }
    }
  };

  const editClient = async (id) => {
    try {
      const response = await api.get(`/clientes/cliente/${id}`);
      if (response.data) {
        setEditingClient(response.data);
        setIsEditModalOpen(true);
      } else {
        toast.error('Cliente não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      toast.error('Erro ao buscar dados do cliente.');
    }
  };

  const updateClient = async (clientData) => {
    try {
      const response = await api.put(`/clientes/cliente/${editingClient.id}`, clientData);
      if (response.status === 200) {
        toast.success('Cliente atualizado com sucesso!');
        setIsEditModalOpen(false);
        setEditingClient(null);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao atualizar cliente.');
    }
  };

  const openCreateUserModal = (cliente) => {
    setSelectedClientForUser(cliente);
    setIsUserModalOpen(true);
  };

  const createUserForClient = async (userData) => {
    try {
      const userResponse = await api.post('/auth/register', {
        nome: userData.nome,
        email: userData.email,
        senha: userData.senha,
        role: 'user'
      });

      if (userResponse.status === 201) {
        const userId = userResponse.data.userId;

        const linkResponse = await api.post(`/clientes/cliente/${selectedClientForUser.id}/vincular-usuario`, {
          usuarioId: userId
        });

        if (linkResponse.status === 200) {
          toast.success('Usuário criado e vinculado ao cliente com sucesso!');
          setIsUserModalOpen(false);
          setSelectedClientForUser(null);
          findAll();
        }
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Erro ao criar usuário para o cliente.');
      }
    }
  };

  const clientFields = [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'cpfCnpj', label: 'CPF/CNPJ', type: 'text', required: true },
    { name: 'telefone', label: 'Telefone', type: 'text', required: true },
    { name: 'endereco', label: 'Endereço', type: 'text', required: true },
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select',
      required: true,
      options: [
        { value: 'empresa', label: 'Empresa' },
        { value: 'pessoa', label: 'Pessoa' }
      ]
    }
  ];

  const userFields = [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true, disabled: true },
    { name: 'senha', label: 'Senha', type: 'password', required: true }
  ];

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Nome", accessor: "nome" },
    { header: "E-mail", accessor: "email" },
    { header: "Cpf/Cnpj", accessor: "cpfCnpj" },
    { header: "Telefone", accessor: "telefone" },
    { header: "Endereço", accessor: "endereco" },
    { header: "Tipo", accessor: "tipo" },
    {
      header: "Ações",
      accessor: "id",
      render: (id, row) => (

        <div className='container-acoes'>
          <button title='Criar usuário para este cliente' className="btn-success" onClick={() => openCreateUserModal(row)}><FaUserPlus /></button>
          <button title='Editar cliente' className="btn-detalhes" onClick={() => editClient(id)}><FaEdit /></button>
          <button title='Excluir cliente' className="btn-excluir" onClick={() => deleteClient(id)}><FaTrash /></button>
        </div>

      ),
    },
  ];


  useEffect(() => {
    findAll();
  }, []);
  return (
    <>
      <HomePage titulo="Clientes" botao="Novo Cliente" onButtonClick={() => setIsModalOpen(true)} />
      {loading ? <Loading /> : <Table columns={columns} data={clientes} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Form fields={clientFields} onSubmit={createClient} submitButtonText="Adicionar" />
      </Modal>

      {editingClient && (
        <Modal isOpen={isEditModalOpen} onClose={() => {
          setIsEditModalOpen(false);
          setEditingClient(null);
        }}>
          <Form
            fields={clientFields}
            initialValues={editingClient}
            onSubmit={updateClient}
            submitButtonText="Atualizar"
          />
        </Modal>
      )}

      {selectedClientForUser && (
        <Modal isOpen={isUserModalOpen} onClose={() => {
          setIsUserModalOpen(false);
          setSelectedClientForUser(null);
        }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Criar Usuário para: {selectedClientForUser.nome}</h2>
          <Form
            fields={userFields}
            initialValues={{ nome: selectedClientForUser.nome, email: selectedClientForUser.email }}
            onSubmit={createUserForClient}
            submitButtonText="Criar Usuário"
          />
        </Modal>
      )}
    </>
  );
};

export default Clientes;
