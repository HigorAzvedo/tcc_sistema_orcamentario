import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../service/api';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import { FaUserTie, FaBuilding, FaTrash, FaArrowLeft, FaPlus } from 'react-icons/fa';
import './Pages.css';
import './OrcamentistaStyles.css';

const OrcamentistaDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orcamentista, setOrcamentista] = useState(null);
  const [clientesVinculados, setClientesVinculados] = useState([]);
  const [todosClientes, setTodosClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // Buscar dados do orçamentista
      const orcamentistaResponse = await api.get(`/orcamentistas/orcamentista/${id}`);
      setOrcamentista(orcamentistaResponse.data);

      // Buscar clientes vinculados
      const clientesResponse = await api.get(`/orcamentistas/clientes-vinculados/${id}`);
      setClientesVinculados(clientesResponse.data);

      // Buscar todos os clientes para o modal de vínculo
      const todosClientesResponse = await api.get('/clientes');
      setTodosClientes(todosClientesResponse.data);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do orçamentista.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVincularCliente = async () => {
    if (!selectedClienteId) {
      toast.warning('Selecione um cliente!');
      return;
    }

    try {
      await api.post('/orcamentistas/vincular-cliente', {
        orcamentistaId: parseInt(id),
        clienteId: parseInt(selectedClienteId)
      });

      toast.success('Cliente vinculado com sucesso!');
      setIsModalOpen(false);
      setSelectedClienteId('');
      loadData();
    } catch (error) {
      console.error('Erro ao vincular cliente:', error);
      const errorMsg = error.response?.data?.message || 'Erro ao vincular cliente.';
      toast.error(errorMsg);
    }
  };

  const handleDesvincularCliente = async (clienteId) => {
    if (window.confirm('Tem certeza que deseja desvincular este cliente?')) {
      try {
        await api.delete(`/orcamentistas/desvincular-cliente/${id}/${clienteId}`);
        toast.success('Cliente desvinculado com sucesso!');
        loadData();
      } catch (error) {
        console.error('Erro ao desvincular cliente:', error);
        toast.error('Erro ao desvincular cliente.');
      }
    }
  };

  // Filtrar clientes que ainda não estão vinculados
  const clientesDisponiveis = todosClientes.filter(
    cliente => !clientesVinculados.some(vinculado => vinculado.id === cliente.id)
  );

  if (loading) return <Loading />;

  if (!orcamentista) {
    return (
      <div className="container-page">
        <p>Orçamentista não encontrado.</p>
        <button onClick={() => navigate('/orcamentistas')} className="btn-primary">
          <FaArrowLeft /> Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="container-page">
      <div className="page-header">
        <button onClick={() => navigate('/orcamentistas')} className="btn-secondary">
          <FaArrowLeft /> Voltar
        </button>
        <h1><FaUserTie /> Detalhes do Orçamentista</h1>
      </div>

      <div className="details-card">
        <h2>Informações do Orçamentista</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>Nome:</strong> {orcamentista.nome}
          </div>
          <div className="info-item">
            <strong>Email:</strong> {orcamentista.email}
          </div>
          <div className="info-item">
            <strong>Matrícula:</strong> {orcamentista.matricula}
          </div>
        </div>
      </div>

      <div className="clientes-section">
        <div className="section-header">
          <h2><FaBuilding /> Clientes Vinculados ({clientesVinculados.length})</h2>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <FaPlus /> Vincular Cliente
          </button>
        </div>

        {clientesVinculados.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum cliente vinculado a este orçamentista.</p>
          </div>
        ) : (
          <div className="clientes-grid">
            {clientesVinculados.map(cliente => (
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
                  title="Desvincular cliente"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setSelectedClienteId('');
      }}>
        <div className="modal-content">
          <h2>Vincular Cliente</h2>
          
          {clientesDisponiveis.length === 0 ? (
            <p>Não há clientes disponíveis para vincular.</p>
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
                  Vincular
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
    </div>
  );
};

export default OrcamentistaDetalhes;
