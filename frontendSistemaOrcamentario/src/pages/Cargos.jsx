import React, { useCallback, useEffect, useState } from 'react';
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

const Cargos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState(null);
  const [cargos, setCargos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { confirmAction, confirmDialog } = useConfirmAction();

  const loadAreas = useCallback(async () => {
    try {
      const response = await api.get('/areas');
      if (!response.data || response.data.length === 0) {
        setAreas([]);
        return;
      }

      setAreas(
        response.data.map((area) => ({
          value: area.id,
          label: area.nome,
        }))
      );
    } catch (error) {
      console.error('Erro ao buscar áreas:', error);
      toast.error('Erro ao carregar áreas disponíveis.');
    }
  }, []);

  const findAll = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/cargos');
      if (!response.data || response.data.length === 0) {
        setCargos([]);
        toast.info('Nenhum cargo encontrado.');
        return;
      }
      setCargos(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Erro ao buscar Cargo:', error);
      toast.error('Erro ao buscar Cargo.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCargo = async (cargoData) => {
    try {
      const payload = {
        ...cargoData,
        areaId: parseInt(cargoData.areaId, 10),
      };

      const response = await api.post('/cargos/cargo/', payload);
      if (response.status === 201) {
        toast.success('Cargo criado com sucesso!');
        setIsModalOpen(false);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao criar cargo:', error);
      toast.error('Erro ao criar cargo.');
    }
  };

  const deleteCargo = async (id) => {
    const confirmed = await confirmAction({
      title: 'Excluir cargo',
      message: 'Tem certeza que deseja excluir este cargo?',
      confirmText: 'Excluir'
    });

    if (!confirmed) return;

    try {
      const response = await api.delete(`/cargos/cargo/${id}`);
      if (response.status === 204 || response.status === 200) {
        toast.success('Cargo deletado com sucesso!');
        findAll();
      }
    } catch (error) {
      console.error('Erro ao deletar cargo:', error);
      toast.error('Erro ao deletar cargo.');
    }
  };

  const editCargo = async (id) => {
    try {
      const response = await api.get(`/cargos/cargo/${id}`);
      if (response.data) {
        setEditingCargo(response.data);
        setIsEditModalOpen(true);
      } else {
        toast.error('Cargo não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar Cargo:', error);
      toast.error('Erro ao buscar dados do Cargo.');
    }
  };

  const updateCargo = async (cargoData) => {
    try {
      if (!editingCargo || !editingCargo.id) {
        toast.error('Nenhum cargo selecionado para atualização.');
        return;
      }

      const payload = {
        ...cargoData,
        areaId: parseInt(cargoData.areaId, 10),
      };

      const response = await api.put(`/cargos/cargo/${editingCargo.id}`, payload);
      if (response.status === 200) {
        toast.success('Cargo atualizado com sucesso!');
        setIsEditModalOpen(false);
        setEditingCargo(null);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao atualizar Cargo:', error);
      toast.error('Erro ao atualizar Cargo.');
    }
  };

  const cargoFields = [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'salario', label: 'Salario', type: 'text', required: true },
    { name: 'areaId', label: 'Área', type: 'select', required: true, options: areas },

  ];

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Nome", accessor: "nome" },
    { header: "Salário", accessor: "salario" },
    { header: "Área", accessor: "areaNome" },
    {
      header: "Ações",
      accessor: "id",
      render: (id) => (
        <div className='container-acoes'>
          <button className="btn-detalhes" onClick={() => editCargo(id)}><FaEdit /></button>
          <button className="btn-excluir" onClick={() => deleteCargo(id)}><FaTrash /></button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadAreas();
    findAll();
  }, [findAll, loadAreas]);

  return (
    <>
      <HomePage titulo="Cargos" botao="Novo Cargo" onButtonClick={() => setIsModalOpen(true)} />
      {loading ? <Loading /> : <Table columns={columns} data={cargos} />}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Form fields={cargoFields} onSubmit={createCargo} submitButtonText="Adicionar" />
        </Modal>
      )}

      {isEditModalOpen && editingCargo && (
        <Modal isOpen={isEditModalOpen} onClose={() => {
          setIsEditModalOpen(false);
          setEditingCargo(null);
        }}>
          <Form
            fields={cargoFields}
            initialValues={editingCargo}
            onSubmit={updateCargo}
            submitButtonText="Atualizar"
          />
        </Modal>
      )}

      {confirmDialog}
    </>
  );
};

export default Cargos;


