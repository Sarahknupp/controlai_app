import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Space, Spin, Select } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { customerService } from '../services/customer.service';
import { ICustomer } from '../types/customer';
import { useNotification } from '../context/NotificationContext';
import { auditService } from '../services/audit.service';
import { validationRules, formatPhone, formatCPF, formatCNPJ, validateCPF, validateCNPJ } from '../utils/validation';

const { Option } = Select;

const CustomerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useNotification();
  const [customerType, setCustomerType] = useState<'individual' | 'company'>('individual');

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const customer = await customerService.getCustomer(id!);
      form.setFieldsValue(customer);
      setCustomerType(customer.type);
    } catch (error) {
      showError('Erro ao carregar cliente', 'Não foi possível carregar os dados do cliente');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: ICustomer) => {
    try {
      setSaving(true);
      if (id) {
        await customerService.updateCustomer(id, values);
        await auditService.logAction('update', `Cliente atualizado: ${values.name}`);
        showSuccess('Cliente atualizado com sucesso');
      } else {
        await customerService.createCustomer(values);
        await auditService.logAction('create', `Novo cliente criado: ${values.name}`);
        showSuccess('Cliente criado com sucesso');
      }
      navigate('/customers');
    } catch (error) {
      showError(
        'Erro ao salvar cliente',
        'Não foi possível salvar os dados do cliente. Por favor, tente novamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    form.setFieldValue('phone', formatted);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = customerType === 'individual' ? formatCPF(value) : formatCNPJ(value);
    form.setFieldValue('document', formatted);
  };

  const handleTypeChange = (value: 'individual' | 'company') => {
    setCustomerType(value);
    form.setFieldValue('document', '');
  };

  const validateDocument = (_: any, value: string) => {
    if (!value) return Promise.reject('Por favor, informe o documento');
    
    const isValid = customerType === 'individual' 
      ? validateCPF(value)
      : validateCNPJ(value);

    if (!isValid) {
      return Promise.reject(
        customerType === 'individual' 
          ? 'CPF inválido'
          : 'CNPJ inválido'
      );
    }

    return Promise.resolve();
  };

  return (
    <div className="p-6">
      <Card
        title={id ? 'Editar Cliente' : 'Novo Cliente'}
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/customers')}
          >
            Voltar
          </Button>
        }
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ type: 'individual', active: true }}
          >
            <Form.Item
              name="type"
              label="Tipo"
              rules={[validationRules.required()]}
            >
              <Select onChange={handleTypeChange}>
                <Option value="individual">Pessoa Física</Option>
                <Option value="company">Pessoa Jurídica</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="name"
              label="Nome"
              rules={[
                validationRules.required(),
                validationRules.minLength(3, 'Nome deve ter no mínimo 3 caracteres')
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="E-mail"
              rules={[
                validationRules.required(),
                validationRules.email()
              ]}
            >
              <Input type="email" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Telefone"
              rules={[
                validationRules.required(),
                validationRules.phone()
              ]}
            >
              <Input onChange={handlePhoneChange} />
            </Form.Item>

            <Form.Item
              name="document"
              label={customerType === 'individual' ? 'CPF' : 'CNPJ'}
              rules={[
                validationRules.required(),
                { validator: validateDocument }
              ]}
            >
              <Input onChange={handleDocumentChange} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                >
                  Salvar
                </Button>
                <Button onClick={() => navigate('/customers')}>
                  Cancelar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default CustomerForm; 