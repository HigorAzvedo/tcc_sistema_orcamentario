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

const Fornecedores = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { confirmAction, confirmDialog } = useConfirmAction();

  const findAll = async () => {
    setLoading(true);
    try {
      const response = await api.get('/fornecedores');
      if (!response.data || response.data.length === 0) {
        setFornecedores([]);
        toast.info('Nenhum fornecedor encontrado.');
        return;
      }
      setFornecedores(response.data);
    } catch (error) {
      console.error('Erro ao buscar fornecedor:', error);
      toast.error('Erro ao buscar fornecedor.');
    } finally {
      setLoading(false);
    }
  };

  const createFornecedor = async (fornecedorData) => {
    try {
      const response = await api.post('/fornecedores/fornecedor/', fornecedorData);
      if (response.status === 201) {
        toast.success('Fornecedor criado com sucesso!');
        setIsModalOpen(false);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      toast.error('Erro ao criar fornecedor.');
    }
  };

  const deleteFornecedor = async (id) => {
    const confirmed = await confirmAction({
      title: 'Excluir fornecedor',
      message: 'Tem certeza que deseja excluir este fornecedor?',
      confirmText: 'Excluir'
    });

    if (!confirmed) return;

    try {
      const response = await api.delete(`/fornecedores/fornecedor/${id}`);
      if (response.status === 204 || response.status === 200) {
        toast.success('Fornecedor deletado com sucesso!');
        findAll();
      }
    } catch (error) {
      console.error('Erro ao deletar fornecedor:', error);
      toast.error('Erro ao deletar fornecedor.');
    }
  };

  const editFornecedor = async (id) => {
    try {
      const response = await api.get(`/fornecedores/fornecedor/${id}`);
      if (response.data) {
        setEditingFornecedor(response.data);
        setIsEditModalOpen(true);
      } else {
        toast.error('Fornecedor não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar Fornecedor:', error);
      toast.error('Erro ao buscar dados do Fornecedor.');
    }
  };

  const updateFornecedor = async (fornecedorData) => {
    try {
      if (!editingFornecedor || !editingFornecedor.id) {
        toast.error('Nenhum fornecedor selecionado para atualização.');
        return;
      }
      const response = await api.put(`/fornecedores/fornecedor/${editingFornecedor.id}`, fornecedorData);
      if (response.status === 200) {
        toast.success('Fornecedor atualizado com sucesso!');
        setIsEditModalOpen(false);
        setEditingFornecedor(null);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      toast.error('Erro ao atualizar fornecedor.');
    }
  };

  const fornecedorFields = [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'cnpj', label: 'CNPJ', type: 'text', required: true },
    { name: 'telefone', label: 'Telefone', type: 'text', required: true },
    { name: 'endereco', label: 'Endereço', type: 'text', required: true },
  ];

  const columns = [
    { header: "Nome", accessor: "nome" },
    { header: "E-mail", accessor: "email" },
    { header: "Cnpj", accessor: "cnpj" },
    { header: "Telefone", accessor: "telefone" },
    { header: "Endereço", accessor: "endereco" },
    {
      header: "Ações",
      accessor: "id",
      render: (id) => (
        <div className='container-acoes'>
          <button className="btn-detalhes" onClick={() => editFornecedor(id)}><FaEdit /></button>
          <button className="btn-excluir" onClick={() => deleteFornecedor(id)}><FaTrash /></button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    findAll();
  }, []);

  return (
    <>
      <HomePage titulo="Fornecedores" botao="Novo Fornecedor" onButtonClick={() => setIsModalOpen(true)} />
      {loading ? <Loading /> : <Table columns={columns} data={fornecedores} />}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Form fields={fornecedorFields} onSubmit={createFornecedor} submitButtonText="Adicionar" />
        </Modal>
      )}

      {isEditModalOpen && editingFornecedor && (
        <Modal isOpen={isEditModalOpen} onClose={() => {
          setIsEditModalOpen(false);
          setEditingFornecedor(null);
        }}>
          <Form
            fields={fornecedorFields}
            initialValues={editingFornecedor}
            onSubmit={updateFornecedor}
            submitButtonText="Atualizar"
          />
        </Modal>
      )}

      {confirmDialog}
    </>
  );
};

export default Fornecedores;


