import React, { useEffect, useState } from 'react';
import api from '../service/api';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import { FaUserTie, FaBuilding, FaProjectDiagram, FaFileInvoiceDollar, FaPlus, FaTrash } from 'react-icons/fa';
import './Pages.css';
import './OrcamentistaStyles.css';
import useConfirmAction from '../hooks/useConfirmAction';

const DashboardOrcamentista = () => {
  const [loading, setLoading] = useState(true);
  const [dadosOrcamentista, setDadosOrcamentista] = useState(null);
  const [projetos, setProjetos] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todosClientes, setTodosClientes] = useState([]);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const { confirmAction, confirmDialog } = useConfirmAction();

  useEffect(() => {
    loadDashboardData();
    loadTodosClientes();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Buscar dados do orçamentista e clientes vinculados
      const dadosResponse = await api.get('/orcamentistas/meus-dados');
      setDadosOrcamentista(dadosResponse.data);

      // Buscar projetos
      const projetosResponse = await api.get('/orcamentistas/meus-projetos');
      setProjetos(projetosResponse.data);

      // Buscar orçamentos
      const orcamentosResponse = await api.get('/orcamentistas/meus-orcamentos');
      setOrcamentos(orcamentosResponse.data);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const loadTodosClientes = async () => {
    try {
      const response = await api.get('/clientes');
      setTodosClientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar todos os clientes:', error);
    }
  };

  const handleVincularCliente = async () => {
    if (!selectedClienteId) {
      toast.warning('Selecione um cliente!');
      return;
    }

    try {
      await api.post('/orcamentistas/auto-vincular-cliente', {
        clienteId: parseInt(selectedClienteId)
      });

      toast.success('Vinculado ao cliente com sucesso!');
      setIsModalOpen(false);
      setSelectedClienteId('');
      loadDashboardData();
      loadTodosClientes();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erro ao vincular ao cliente.';
      toast.error(errorMsg);
    }
  };

  const handleDesvincularCliente = async (clienteId) => {
    const confirmed = await confirmAction({
      title: 'Desvincular cliente',
      message: 'Tem certeza que deseja se desvincular deste cliente?',
      confirmText: 'Desvincular',
      confirmVariant: 'primary'
    });

    if (!confirmed) return;

    try {
      await api.delete(`/orcamentistas/auto-desvincular-cliente/${clienteId}`);
      toast.success('Desvinculado do cliente com sucesso!');
      loadDashboardData();
      loadTodosClientes();
    } catch (error) {
      console.error('Erro ao desvincular:', error);
      toast.error('Erro ao desvincular do cliente.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) return <Loading />;

  if (!dadosOrcamentista) {
    return (
      <div className="container-page">
        <div className="alert alert-warning">
          <h3>Perfil de Orçamentista não configurado</h3>
          <p>Entre em contato com o administrador do sistema para configurar seu perfil de orçamentista.</p>
        </div>
      </div>
    );
  }

  const totalOrcamentos = orcamentos.reduce((sum, orc) => sum + parseFloat(orc.valorTotalItens || 0), 0);

  // Filtrar clientes disponíveis para vincular
  const clientesDisponiveis = todosClientes.filter(
    cliente => !dadosOrcamentista.clientes.some(vinculado => vinculado.id === cliente.id)
  );

  return (
    <div className="container-page dashboard-orcamentista">
      <div className="page-header">
        <h1><FaUserTie /> Meu Painel - Orçamentista</h1>
      </div>

      {/* Informações do Orçamentista */}
      <div className="details-card">
        <h2>Minhas Informações</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>Nome:</strong> {dadosOrcamentista.orcamentista.nome}
          </div>
          <div className="info-item">
            <strong>Email:</strong> {dadosOrcamentista.orcamentista.email}
          </div>
          <div className="info-item">
            <strong>Matrícula:</strong> {dadosOrcamentista.orcamentista.matricula}
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaBuilding />
          </div>
          <div className="stat-info">
            <h3>{dadosOrcamentista.clientes.length}</h3>
            <p>Clientes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaProjectDiagram />
          </div>
          <div className="stat-info">
            <h3>{projetos.length}</h3>
            <p>Projetos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaFileInvoiceDollar />
          </div>
          <div className="stat-info">
            <h3>{orcamentos.length}</h3>
            <p>Orçamentos</p>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">
            <FaFileInvoiceDollar />
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(totalOrcamentos)}</h3>
            <p>Valor Total</p>
          </div>
        </div>
      </div>

      {/* Clientes Vinculados */}
      <div className="section">
        <div className="section-header">
          <h2><FaBuilding /> Meus Clientes</h2>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <FaPlus /> Vincular Cliente
          </button>
        </div>
        
        {dadosOrcamentista.clientes.length === 0 ? (
          <div className="empty-state">
            <p>Você não possui clientes vinculados.</p>
            <p className="info-text">Clique em "Vincular Cliente" para se vincular a um cliente.</p>
          </div>
        ) : (
          <div className="clientes-grid">
            {dadosOrcamentista.clientes.map(cliente => (
              <div key={cliente.id} className="cliente-card">
                <div className="cliente-info">
                  <h3>{cliente.nome}</h3>
                  <p><strong>Email:</strong> {cliente.email}</p>
                  <p><strong>CPF/CNPJ:</strong> {cliente.cpfCnpj}</p>
                  {cliente.telefone && <p><strong>Telefone:</strong> {cliente.telefone}</p>}
                </div>
                <button
                  onClick={() => handleDesvincularCliente(cliente.id)}
                  className="btn-excluir"
                  title="Desvincular-me deste cliente"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projetos Recentes */}
      <div className="section">
        <h2><FaProjectDiagram /> Projetos Recentes</h2>
        {projetos.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum projeto disponível.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th>Cliente</th>
                  <th>Data Início</th>
                  <th>Data Fim</th>
                </tr>
              </thead>
              <tbody>
                {projetos.slice(0, 5).map(projeto => (
                  <tr key={projeto.id}>
                    <td>{projeto.nome}</td>
                    <td>{projeto.clienteNome}</td>
                    <td>{formatDate(projeto.dataInicio)}</td>
                    <td>{formatDate(projeto.dataFim)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orçamentos Recentes */}
      <div className="section">
        <h2><FaFileInvoiceDollar /> Orçamentos Recentes</h2>
        {orcamentos.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum orçamento disponível.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Orçamento</th>
                  <th>Cliente</th>
                  <th>Projeto</th>
                  <th>Status</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {orcamentos.slice(0, 5).map(orcamento => (
                  <tr key={orcamento.id}>
                    <td>{orcamento.nome}</td>
                    <td>{orcamento.clienteNome}</td>
                    <td>{orcamento.projetoNome}</td>
                    <td>
                      <span className={`badge badge-${orcamento.status?.toLowerCase()}`}>
                        {orcamento.status || 'Pendente'}
                      </span>
                    </td>
                    <td className="text-right">{formatCurrency(orcamento.valorTotalItens)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Vincular Cliente */}
      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setSelectedClienteId('');
      }}>
        <div className="modal-content">
          <h2>Vincular-me a um Cliente</h2>
          
          {clientesDisponiveis.length === 0 ? (
            <p>Você já está vinculado a todos os clientes cadastrados no sistema.</p>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="clienteSelect">Selecione um Cliente:</label>
                <select
                  id="clienteSelect"
                  value={selectedClienteId}
                  onChange={(e) => setSelectedClienteId(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Selecione --</option>
                  {clientesDisponiveis.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome} - {cliente.cpfCnpj}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button onClick={handleVincularCliente} className="btn-primary">
                  Vincular-me
                </button>
                <button onClick={() => {
                  setIsModalOpen(false);
                  setSelectedClienteId('');
                }} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {confirmDialog}
    </div>
  );
};

export default DashboardOrcamentista;
