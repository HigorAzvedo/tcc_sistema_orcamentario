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

const Materiais = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);

  const [areas, setAreas] = useState([]);

    const findAllAreas = async () => {
    try {
      const response = await api.get('/areas');
      setAreas(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar áreas:', error);
      toast.error('Erro ao buscar áreas.');
    }
  };

  

  const findAll = async () => {
    setLoading(true);
    try {
      const response = await api.get('/materiais');
      if (!response.data || response.data.length === 0) {
        setMateriais([]);
        toast.info('Nenhum material encontrado.');
        return;
      }
      setMateriais(response.data);
      toast.success('Materiais carregados com sucesso!');
      console.log(response.data);
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
      toast.error('Erro ao buscar materiais.');
    } finally {
      setLoading(false);
    }
  };

  const createMaterial = async (materialData) => {
    try {
      const response = await api.post('/materiais/material', materialData);
      if (response.status === 201) {
        toast.success('Material criado com sucesso!');
        setIsModalOpen(false);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao criar material:', error);
      toast.error('Erro ao criar material.');
    }
  };

  const deleteMaterial = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este material?')) {
      try {
        const response = await api.delete(`/materiais/material/${id}`);
        if (response.status === 204 || response.status === 200) {
          toast.success('Material deletado com sucesso!');
          findAll();
        }
      } catch (error) {
        console.error('Erro ao deletar material:', error);
        toast.error('Erro ao deletar material.');
      }
    }
  };

  const editMaterial = async (id) => {
    try {
      const response = await api.get(`/materiais/material/${id}`);
      if (response.data) {
        setEditingMaterial(response.data);
        setIsEditModalOpen(true);
      } else {
        toast.error('Material não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar material:', error);
      toast.error('Erro ao buscar dados do material.');
    }
  };

  const updateMaterial = async (materialData) => {
    if (!editingMaterial) return;
    try {
      const response = await api.put(`/materiais/material/${editingMaterial.id}`, materialData);
      if (response.status === 200) {
        toast.success('Material atualizado com sucesso!');
        setIsEditModalOpen(false);
        setEditingMaterial(null);
        findAll();
      }
    } catch (error) {
      console.error('Erro ao atualizar material:', error);
      toast.error('Erro ao atualizar material.');
    }
  };

  const materialFields = [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'descricao', label: 'Descrição', type: 'text', required: true },
    { name: 'unidadeMedida', label: 'Unidade de Medida', type: 'text', required: true },
    {
      name: 'areaId',
      label: 'Área',
      type: 'select',
      required: true,
      options: areas.map(area => ({
        value: area.id,
        label: area.nome
      }))
    }
  ];


  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nome', accessor: 'nome' },
    { header: 'Descrição', accessor: 'descricao' },
    { header: 'Unidade de Medida', accessor: 'unidadeMedida' },
    { header: 'Área', accessor: 'areaNome' },
    {
      header: 'Ações',
      accessor: 'id',
      render: (id) => (
        <div className="container-acoes">
          <button className="btn-detalhes" onClick={() => editMaterial(id)}><FaEdit /></button>
          <button className="btn-excluir" onClick={() => deleteMaterial(id)}><FaTrash /></button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    findAllAreas();
    findAll();
  }, []);

  return (
    <>
      <HomePage titulo="Materiais" botao="Novo Material" onButtonClick={() => setIsModalOpen(true)} />
      {loading ? <Loading /> : <Table columns={columns} data={materiais} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Form fields={materialFields} onSubmit={createMaterial} submitButtonText="Adicionar" />
      </Modal>

      {isEditModalOpen && editingMaterial && (
        <Modal isOpen={isEditModalOpen} onClose={() => {
          setIsEditModalOpen(false);
          setEditingMaterial(null);
        }}>
          <Form
            fields={materialFields}
            initialValues={editingMaterial}
            onSubmit={updateMaterial}
            submitButtonText="Atualizar"
          />
        </Modal>
      )}
    </>
  );
};

export default Materiais;


