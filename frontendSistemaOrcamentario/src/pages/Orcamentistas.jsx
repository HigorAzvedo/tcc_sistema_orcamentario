import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Form from '../components/Form';
import Loading from '../components/Loading';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Pages.css';
import HomePage from '../components/HomePage';
import api from '../service/api';
import { toast } from 'react-toastify';

const Orcamentistas = () => {
  const navigate = useNavigate();
  const [orcamentistas, setOrcamentistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrcamentista, setEditingOrcamentista] = useState(null);

  const findAll = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orcamentistas');
      if (!response.data || response.data.length === 0) {
        setOrcamentistas([]);
        toast.info('Nenhum orçamentista encontrado.');
        return;
      }
      setOrcamentistas(response.data);
      toast.success('Orçamentistas carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao buscar orçamentistas:', error);
      toast.error('Erro ao buscar orçamentistas.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrcamentista = async (orcamentistaData) => {
    try {
      const response = await api.put(`/orcamentistas/orcamentista/${orcamentistaData.id}`, orcamentistaData); 
      if (response.status === 200) {
        toast.success('Orçamentista atualizado com sucesso!');
        setIsEditModalOpen(false);
        setEditingOrcamentista(null);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao atualizar orçamentista:', error);
      toast.error('Erro ao atualizar orçamentista.');
    }
  };

  const deleteOrcamentista = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamentista?')) {
      try {
        const response = await api.delete(`/orcamentistas/orcamentista/${id}`);
        if (response.status === 204 || response.status === 200) {
          toast.success('Orçamentista deletado com sucesso!');
          findAll();
        }
      } catch (error) {
        console.error('Erro ao deletar orçamentista:', error);
        toast.error('Erro ao deletar orçamentista.');
      }
    }
  };

  const createOrcamentista = async (orcamentistaData) => {
    try {
      if (orcamentistaData.senha !== orcamentistaData.confirmarSenha) {
        toast.error('As senhas não coincidem!');
        return;
      }

      if (orcamentistaData.senha.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres!');
        return;
      }

      const { confirmarSenha, ...dataToSend } = orcamentistaData;

      const response = await api.post('/orcamentistas/orcamentista', dataToSend); 
      if (response.status === 201) {
        toast.success('Orçamentista e usuário criados com sucesso!');
        setIsModalOpen(false);
        findAll();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erro ao criar orçamentista.';
      toast.error(errorMsg);
    }
  };

    const editOrcamentista = async (id) => {
      try {
        const response = await api.get(`/orcamentistas/orcamentista/${id}`);
        if (response.data) {
          setEditingOrcamentista(response.data);
          setIsEditModalOpen(true);
        } else {
          toast.error('Orçamentista não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao buscar orçamentista:', error);
        toast.error('Erro ao buscar orçamentista.');
      }
    };
  

  const orcamentistaFields = [
    { name: 'nome', label: 'Nome Completo', type: 'text', required: true },
    { name: 'email', label: 'Email (usado para login)', type: 'email', required: true },
    { name: 'matricula', label: 'Matrícula', type: 'text', required: true },
    { name: 'senha', label: 'Senha', type: 'password', required: true, minLength: 6, placeholder: 'Mínimo 6 caracteres' },
    { name: 'confirmarSenha', label: 'Confirmar Senha', type: 'password', required: true, minLength: 6, placeholder: 'Digite a senha novamente' },
  ]

  const orcamentistaFieldsEdit = [
    { name: 'nome', label: 'Nome Completo', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'matricula', label: 'Matrícula', type: 'text', required: true },
  ]

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Nome", accessor: "nome" },
    { header: "Email", accessor: "email" },
    { header: "Matricula", accessor: "matricula" },
    {
      header: "Ações",
      accessor: "id",
      render: (id) => (
        <div className='container-acoes'>
          <button className="btn-detalhes" onClick={() => navigate(`/orcamentistas/${id}`)} title="Ver Detalhes e Vínculos"><FaEye /></button>
          <button className="btn-detalhes" onClick={() => editOrcamentista(id)} title="Editar"><FaEdit /></button>
          <button className="btn-excluir" onClick={() => deleteOrcamentista(id)} title="Excluir"><FaTrash /></button>
        </div>
      ),
    },
  ]

  useEffect(() => {
    findAll();
  }, []);
  return (
    <>
      <HomePage titulo="Orçamentistas" botao="Novo Orçamentista" onButtonClick={() => setIsModalOpen(true)} />
      {loading ? <Loading /> : <Table columns={columns} data={orcamentistas} />}
    
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Form fields={orcamentistaFields} onSubmit={createOrcamentista} submitButtonText="Adicionar" />
      </Modal>
    
      {editingOrcamentista && (
        <Modal isOpen={isEditModalOpen} onClose={() => {
          setIsEditModalOpen(false);
          setEditingOrcamentista(null);
        }}>
          <Form
            fields={orcamentistaFieldsEdit}
            initialValues={editingOrcamentista}
            onSubmit={updateOrcamentista}
            submitButtonText="Atualizar"
          />
        </Modal>
      )}
    
    </>
  )
}
  
export default Orcamentistas;


