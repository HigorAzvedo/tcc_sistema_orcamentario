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



const Areas = () => {
  const[area, setArea] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const { confirmAction, confirmDialog } = useConfirmAction();
  

  const findAll = async () => {
    setLoading(true);
    try {
      const response = await api.get('/areas');
      if(!response.data || response.data.length === 0){
        setArea([]);
        toast.info('Nenhuma área encontrada.');
        return;
      }
      setArea(response.data);
      toast.success('Áreas carregadas com sucesso!');
    } catch (error) {
      console.error('Erro ao buscar áreas:', error);
      toast.error('Erro ao buscar áreas.');
    } finally {
      setLoading(false);
    }
  };

  const deleteArea = async (id) => {
    const confirmed = await confirmAction({
      title: 'Excluir área',
      message: 'Tem certeza que deseja excluir esta área?',
      confirmText: 'Excluir'
    });

    if (!confirmed) return;

    try {
      const response = await api.delete(`/areas/area/${id}`);
      if (response.status === 204 || response.status === 200) {
        toast.success('Área deletada com sucesso!');
        findAll();
      }
    } catch (error) {
      console.error('Erro ao deletar área:', error);
      toast.error('Erro ao deletar área.');
    }
  };

  const createArea = async (areaData) => {
    try{
      const response = await api.post('areas/area',areaData);
      if (response.status === 201){
        toast.success('Área criada com sucesso!');
        setIsModalOpen(false);
        findAll();
      }
    } catch (error){
      console.error('Erro ao criar área:', error);
      toast.error('Erro ao criar área.');
    }
  };
 
  const editArea = async (id) => {
    try {
      const response = await api.get(`/areas/area/${id}`);
      if (response.data) {
        setEditingArea(response.data);
        setIsEditModalOpen(true);
      } else {
        toast.error('Area não encontrada.');
      }
    } catch (error) {
      console.error('Erro ao buscar Area:', error);
      toast.error('Erro ao buscar dados do Area.');
    }
  };

  const updateArea = async (areaData) => {
    try {
      const response = await api.put(`/areas/area/${editingArea.id}`, areaData);
      if (response.status === 200) {
        toast.success('Area atualizada com sucesso!');
        setIsEditModalOpen(false);
        setEditingArea(null);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao atualizar Area:', error);
      toast.error('Erro ao atualizar Area.');
    }
  };

  const areaFields = [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
  ];

  const columns = [
    { header: "Nome", accessor: "nome" },
     {
          header: "Ações",
          accessor: "id",
          render: (id) => (
            <div className='container-acoes'>
              <button className="btn-detalhes" onClick={() => editArea(id)}><FaEdit /></button>
              <button className="btn-excluir" onClick={() => deleteArea(id)}><FaTrash /></button>
            </div>
          ),
        },
  ]
  

  useEffect(() => {
    findAll();
  }, []);
  return (

     <>
      <HomePage titulo="Áreas" botao="Nova área" onButtonClick={() => setIsModalOpen(true)} />
      {loading ? <Loading /> : <Table columns={columns} data={area} />}
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Form fields={areaFields} onSubmit={createArea} submitButtonText="Adicionar" />
      </Modal>
    
      {editingArea && (
        <Modal isOpen={isEditModalOpen} onClose={() => {
          setIsEditModalOpen(false);
          setEditingArea(null);
        }}>
          <Form
            fields={areaFields}
            initialValues={editingArea}
            onSubmit={updateArea}
            submitButtonText="Atualizar"
          />
        </Modal>
      )}

      {confirmDialog}
    
    </>
     
  );
};

export default Areas;


