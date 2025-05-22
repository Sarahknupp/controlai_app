import React from 'react';
import { Form, Input, Select, Button, Space, InputNumber, Divider } from 'antd';
import type { SelectProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Customer, CustomerType, CustomerStatus, IAddress } from '../../types/customer';
import { requiredRule, emailRule, phoneRule, documentRule } from '../../utils/validation';
import AddressForm from './AddressForm';

interface CustomerFormProps {
  initialValues?: Customer;
  onFinish: (values: Partial<Customer>) => void;
  loading?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialValues,
  onFinish,
  loading = false,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    // Ensure at least one address is marked as default
    const addresses = values.addresses || [];
    if (addresses.length > 0 && !addresses.some((addr: IAddress) => addr.isDefault)) {
      addresses[0].isDefault = true;
    }
    onFinish(values);
  };

  const typeOptions: SelectProps['options'] = [
    { value: 'individual', label: 'Pessoa Física' },
    { value: 'company', label: 'Pessoa Jurídica' },
  ];

  const statusOptions: SelectProps['options'] = [
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        addresses: [{ isDefault: true }],
        ...initialValues,
      }}
      onFinish={handleSubmit}
    >
      <Divider orientation="left">Informações Básicas</Divider>

      <Form.Item
        name="name"
        label="Nome"
        rules={[requiredRule]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="document"
        label="Documento"
        rules={[requiredRule, documentRule]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[requiredRule, emailRule]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Telefone"
        rules={[requiredRule, phoneRule]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="type"
        label="Tipo"
        rules={[requiredRule]}
      >
        <Select options={typeOptions} />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[requiredRule]}
      >
        <Select options={statusOptions} />
      </Form.Item>

      <Divider orientation="left">Endereços</Divider>

      <Form.List
        name="addresses"
        rules={[
          {
            validator: async (_, addresses) => {
              if (!addresses || addresses.length < 1) {
                return Promise.reject(new Error('Adicione pelo menos um endereço'));
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <AddressForm
                key={field.key}
                name={field.name}
                onRemove={() => remove(field.name)}
                canRemove={fields.length > 1}
              />
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Adicionar Endereço
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Divider orientation="left">Informações Adicionais</Divider>

      <Form.Item
        name="creditLimit"
        label="Limite de Crédito"
      >
        <InputNumber
          style={{ width: '100%' }}
          formatter={(value) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value!.replace(/R\$\s?|(,*)/g, '')}
        />
      </Form.Item>

      <Form.Item
        name="paymentTerms"
        label="Prazo de Pagamento (dias)"
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>

      <Form.Item
        name="notes"
        label="Observações"
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? 'Salvar' : 'Criar'}
          </Button>
          <Button onClick={() => form.resetFields()}>
            Limpar
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CustomerForm; 