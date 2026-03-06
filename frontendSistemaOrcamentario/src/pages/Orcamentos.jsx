import React, { useContext, useEffect, useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Form from '../components/Form';
import Loading from '../components/Loading';
import { FaCartPlus, FaEdit, FaEye, FaFileInvoiceDollar, FaPlusCircle, FaTrash } from 'react-icons/fa';
import './Pages.css';
import HomePage from '../components/HomePage';
import api from '../service/api';
import { toast } from 'react-toastify';
import { formatDate, formatDateForInput } from '../utils/formatters';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Orcamentos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [orcamentos, setOrcamentos] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);


  const { user } = useContext(AuthContext);
  const isUserRole = user?.role === 'user';

  const loadProjetos = async () => {
    try {
      const response = await api.get('/orcamentos/orcamentos/projetos');
      if (response.data) {
        setProjetos(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast.error('Erro ao carregar projetos.');
    }
  };

  const findAll = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orcamentos');
      if (!response.data || response.data.length === 0) {
        setOrcamentos([]);
        toast.info('Nenhum orçamento encontrado.');
        return;
      }
      setOrcamentos(response.data);
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      toast.error('Erro ao buscar orçamentos.');
    } finally {
      setLoading(false);
    }
  };

  const createBudget = async (budgetData) => {
    try {
      const response = await api.post('/orcamentos/orcamento', {
        nome: budgetData.nome,
        dataCriacao: budgetData.dataCriacao,
        status: budgetData.status,
        projetoId: parseInt(budgetData.projetoId)
      });
      if (response.status === 201) {
        toast.success('Orçamento criado com sucesso!');
        setIsModalOpen(false);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      toast.error('Erro ao criar orçamento.');
    }
  };

  const deleteBudget = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        const response = await api.delete(`/orcamentos/orcamento/${id}`);
        if (response.status === 204 || response.status === 200) {
          toast.success('Orçamento deletado com sucesso!');
          findAll();
        }
      } catch (error) {
        console.error('Erro ao deletar orçamento:', error);
        toast.error('Erro ao deletar orçamento.');
      }
    }
  };

  const editBudget = async (id) => {
    try {
      const response = await api.get(`/orcamentos/orcamento/${id}`);
      if (response.data) {
        const budgetData = {
          ...response.data,
          dataCriacao: formatDateForInput(response.data.dataCriacao),
        };
        setEditingBudget(budgetData);
        setIsEditModalOpen(true);
      } else {
        toast.error('Orçamento não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      toast.error('Erro ao buscar dados do orçamento.');
    }
  };

  const updateBudget = async (budgetData) => {
    try {
      const response = await api.put(`/orcamentos/orcamento/${editingBudget.id}`, {
        nome: budgetData.nome,
        dataCriacao: budgetData.dataCriacao,
        status: budgetData.status,
        projetoId: parseInt(budgetData.projetoId)
      });
      if (response.status === 200) {
        toast.success('Orçamento atualizado com sucesso!');
        setIsEditModalOpen(false);
        setEditingBudget(null);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      toast.error('Erro ao atualizar orçamento.');
    }
  };

  const budgetFields = [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'dataCriacao', label: 'Data de Criação', type: 'date', required: true },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'Pendente', label: 'Pendente' },
        { value: 'Aprovado', label: 'Aprovado' },
        { value: 'Rejeitado', label: 'Rejeitado' },
        { value: 'Em Revisão', label: 'Em Revisão' }
      ]
    },
    {
      name: 'projetoId',
      label: 'Projeto',
      type: 'select',
      required: true,
      options: projetos
    }
  ];

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Nome", accessor: "nome" },
    {
      header: "Projeto",
      accessor: "projetoNome",
    },
    {
      header: "Data Criação",
      accessor: "dataCriacao",
      render: (value) => formatDate(value)
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => {
        const statusClass =
          value === "Aprovado"
            ? "status status-aprovado"
            : value === "Pendente"
              ? "status status-pendente"
              : value === "Rejeitado"
                ? "status status-rejeitado"
                : "status status-revisao";
        return <span className={statusClass}>{value}</span>;
      }
    },
    {
      header: "Ações",
      accessor: "id",
      render: (id, row) => (
        !isUserRole && (
          <div className='container-acoes'>
            <button title='Editar orçamento' className="btn-detalhes" onClick={() => editBudget(id)}><FaEdit /></button>
            <button title='Excluir orçamento' className="btn-excluir" onClick={() => deleteBudget(id)}><FaTrash /></button>
            <Link
              to="/adicionar-itens-orcamentos"
              state={{ orcamentoId: id, orcamentoNome: row.nome }}
            >
              <button title='Adicionar Itens ao orçamento' className="btn-addItems"><FaCartPlus /></button>
            </Link>
            <Link
              to="/ver-itens-orcamentos"
              state={{ orcamentoId: id, orcamentoNome: row.nome }}
            >
              <button title='Ver Itens do orçamento' className="btn-showItems"><FaEye /></button>
            </Link>
          </div>

        )
      ),
    },
  ];

  useEffect(() => {
    const init = async () => {
      await loadProjetos();
      await findAll();
    };
    init();
  }, []);

  return (
    <>
      <HomePage titulo="Orçamentos" botao="Novo Orçamento" onButtonClick={() => setIsModalOpen(true)} />
      {loading ? <Loading /> : <Table columns={columns} data={orcamentos} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Form fields={budgetFields} onSubmit={createBudget} submitButtonText="Adicionar" />
      </Modal>

      {editingBudget && (
        <Modal isOpen={isEditModalOpen} onClose={() => {
          setIsEditModalOpen(false);
          setEditingBudget(null);
        }}>
          <Form
            fields={budgetFields}
            initialValues={editingBudget}
            onSubmit={updateBudget}
            submitButtonText="Atualizar"
          />
        </Modal>
      )}
    </>
  );
};

export default Orcamentos;


