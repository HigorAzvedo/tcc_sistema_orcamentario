import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Form from '../components/Form';
import Loading from '../components/Loading';
import PasswordInput from '../components/PasswordInput';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Pages.css';
import HomePage from '../components/HomePage';
import api from '../service/api';
import { toast } from 'react-toastify';
import useConfirmAction from '../hooks/useConfirmAction';

const Orcamentistas = () => {
  const navigate = useNavigate();
  const [orcamentistas, setOrcamentistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrcamentista, setEditingOrcamentista] = useState(null);
  const [orcamentistaFormData, setOrcamentistaFormData] = useState({
    nome: '',
    email: '',
    matricula: '',
    senha: '',
    confirmarSenha: ''
  });
  const { confirmAction, confirmDialog } = useConfirmAction();

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
    const confirmed = await confirmAction({
      title: 'Excluir orçamentista',
      message: 'Tem certeza que deseja excluir este orçamentista?',
      confirmText: 'Excluir'
    });

    if (!confirmed) return;

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
  };

  const createOrcamentista = async (e) => {
    e.preventDefault();

    try {
      if (orcamentistaFormData.senha !== orcamentistaFormData.confirmarSenha) {
        toast.error('As senhas não coincidem!');
        return;
      }

      if (orcamentistaFormData.senha.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres!');
        return;
      }

      const { confirmarSenha, ...dataToSend } = orcamentistaFormData;

      const response = await api.post('/orcamentistas/orcamentista', dataToSend); 
      if (response.status === 201) {
        toast.success('Orçamentista e usuário criados com sucesso!');
        setIsModalOpen(false);
        setOrcamentistaFormData({
          nome: '',
          email: '',
          matricula: '',
          senha: '',
          confirmarSenha: ''
        });
        findAll();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erro ao criar orçamentista.';
      toast.error(errorMsg);
    }
  };

  const handleOrcamentistaFormChange = (e) => {
    const { name, value } = e.target;
    setOrcamentistaFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
  

  const orcamentistaFieldsEdit = [
    { name: 'nome', label: 'Nome Completo', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'matricula', label: 'Matrícula', type: 'text', required: true },
  ]

  const columns = [
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
    
      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setOrcamentistaFormData({
          nome: '',
          email: '',
          matricula: '',
          senha: '',
          confirmarSenha: ''
        });
      }}>
        <h2>Novo Orçamentista</h2>
        <form onSubmit={createOrcamentista}>
          <div className="form-group">
            <label htmlFor="nome">Nome Completo *</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={orcamentistaFormData.nome}
              onChange={handleOrcamentistaFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email (usado para login) *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={orcamentistaFormData.email}
              onChange={handleOrcamentistaFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="matricula">Matrícula *</label>
            <input
              type="text"
              id="matricula"
              name="matricula"
              value={orcamentistaFormData.matricula}
              onChange={handleOrcamentistaFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha *</label>
            <PasswordInput
              id="senha"
              name="senha"
              value={orcamentistaFormData.senha}
              onChange={handleOrcamentistaFormChange}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              autoComplete="new-password"
            />
            <small>Mínimo de 6 caracteres</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Senha *</label>
            <PasswordInput
              id="confirmarSenha"
              name="confirmarSenha"
              value={orcamentistaFormData.confirmarSenha}
              onChange={handleOrcamentistaFormChange}
              placeholder="Digite a senha novamente"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Adicionar
            </button>
          </div>
        </form>
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

      {confirmDialog}
    
    </>
  )
}
  
export default Orcamentistas;


