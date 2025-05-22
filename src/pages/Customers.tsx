import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Spin,
  Alert,
  Select,
  Tooltip,
  Typography,
  Card,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { Customer, CustomerType, CustomerStatus } from '../types/customer';
import { customerService } from '../services/customer.service';
import { ApiError } from '../utils/errorHandler';
import CustomerForm from '../components/customer/CustomerForm';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/permissions';
import { useAudit } from '../hooks/useAudit';
import { auditService } from '../services/audit.service';
import { usePermissions } from '../hooks/usePermissions';
import { formatPhone, formatCPF, formatCNPJ } from '../utils/validation';

const { Option } = Select;
const { Text } = Typography;

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();
  const { logAction } = useAudit();
  const { hasPermission: usePermissionsPermission } = usePermissions();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerService.getCustomers({ search: searchText });
      setCustomers(response.data);
      await logAction({
        action: 'view',
        resource: 'customers',
        details: { searchText }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        showError('Erro ao carregar clientes', error.message);
      } else {
        setError('Ocorreu um erro inesperado');
        showError('Erro ao carregar clientes', 'Ocorreu um erro inesperado');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchText]);

  const handleModalOk = async (values: Partial<Customer>) => {
    try {
      setFormLoading(true);
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer._id, values);
        await logAction({
          action: 'update',
          resource: 'customer',
          resourceId: editingCustomer._id,
          details: { changes: values }
        });
        showSuccess('Cliente atualizado com sucesso');
      } else {
        const newCustomer = await customerService.createCustomer(values);
        await logAction({
          action: 'create',
          resource: 'customer',
          resourceId: newCustomer._id,
          details: { data: values }
        });
        showSuccess('Cliente criado com sucesso');
      }
      setModalVisible(false);
      fetchCustomers();
    } catch (error) {
      if (error instanceof ApiError) {
        showError('Erro ao salvar cliente', error.message);
      } else {
        showError('Erro ao salvar cliente', 'Ocorreu um erro inesperado');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await customerService.deleteCustomer(id);
      await auditService.logAction('delete', `Cliente excluído: ${id}`);
      showSuccess('Cliente excluído com sucesso');
      fetchCustomers();
    } catch (error) {
      showError('Erro ao excluir cliente', 'Não foi possível excluir o cliente');
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleTypeChange = (value: CustomerType | undefined) => {
    // Implement the logic to change the customer type filter
  };

  const handleStatusChange = (value: boolean | undefined) => {
    // Implement the logic to change the customer status filter
  };

  const columns: ColumnsType<Customer> = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Documento',
      dataIndex: 'document',
      key: 'document',
      render: (document: string, record: Customer) => (
        <Tooltip title={record.type === 'individual' ? 'CPF' : 'CNPJ'}>
          <Text>{record.type === 'individual' ? formatCPF(document) : formatCNPJ(document)}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Telefone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => formatPhone(phone),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: CustomerType) => (
        <Tag color={type === 'individual' ? 'blue' : 'green'}>
          {type === 'individual' ? 'Pessoa Física' : 'Pessoa Jurídica'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: CustomerStatus) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Compras',
      dataIndex: 'totalPurchases',
      key: 'totalPurchases',
      render: (total: number, record: Customer) => (
        <Tooltip title={record.lastPurchase ? `Última compra: ${new Date(record.lastPurchase).toLocaleDateString()}` : 'Sem compras'}>
          <Text>{total}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Customer) => (
        <Space>
          {usePermissionsPermission('customers.edit') && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingCustomer(record);
                setModalVisible(true);
              }}
            >
              Editar
            </Button>
          )}
          {usePermissionsPermission('customers.delete') && (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Confirmar exclusão',
                  content: 'Tem certeza que deseja excluir este cliente?',
                  okText: 'Sim',
                  okType: 'danger',
                  cancelText: 'Não',
                  onOk: () => handleDelete(record._id),
                });
              }}
            >
              Excluir
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchText.toLowerCase()) ||
    customer.document.includes(searchText)
  );

  return (
    <div className="p-6">
      <Card
        title="Clientes"
        extra={
          <Space>
            <Input
              placeholder="Buscar clientes..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
            />
            {usePermissionsPermission('customers.create') && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingCustomer(null);
                  setModalVisible(true);
                }}
              >
                Novo Cliente
              </Button>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchCustomers}
              loading={loading}
            >
              Atualizar
            </Button>
          </Space>
        }
      >
        {error && (
          <Alert
            message="Erro"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredCustomers}
            rowKey="_id"
            pagination={{
              total: filteredCustomers.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total de ${total} clientes`,
            }}
          />
        </Spin>

        <Modal
          title={editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingCustomer(null);
          }}
          footer={null}
          width={800}
        >
          <CustomerForm
            initialValues={editingCustomer || undefined}
            onFinish={handleModalOk}
            loading={formLoading}
          />
        </Modal>
      </Card>
    </div>
  );
};

export default Customers; 