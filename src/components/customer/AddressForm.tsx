import React, { useState } from 'react';
import { Form, Input, Switch, Button, Space, Row, Col, message, Spin } from 'antd';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { IAddress } from '../../types/customer';
import { requiredRule, zipCodeRule } from '../../utils/validation';
import { formatZipCode, formatState, validateState } from '../../utils/address';
import { cepService } from '../../services/cep.service';

interface AddressFormProps {
  name: number;
  onRemove: () => void;
  canRemove: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ name, onRemove, canRemove }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatZipCode(e.target.value);
    e.target.value = formatted;
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatState(e.target.value);
    e.target.value = formatted;
  };

  const validateStateField = (_: any, value: string) => {
    if (!value) {
      return Promise.reject('Estado é obrigatório');
    }
    if (!validateState(value)) {
      return Promise.reject('Estado inválido');
    }
    return Promise.resolve();
  };

  const handleCepSearch = async () => {
    const cep = form.getFieldValue(['addresses', name, 'zipCode']);
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      message.warning('Digite um CEP válido');
      return;
    }

    try {
      setLoading(true);
      const data = await cepService.lookupCep(cep.replace(/\D/g, ''));
      
      form.setFieldsValue({
        addresses: {
          [name]: {
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
            zipCode: data.cep,
          }
        }
      });

      // Focus on the number field after successful lookup
      const numberInput = document.querySelector(`input[name="addresses[${name}].number"]`) as HTMLInputElement;
      if (numberInput) {
        numberInput.focus();
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Erro ao consultar CEP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium">Endereço {name + 1}</h4>
        {canRemove && (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={onRemove}
          >
            Remover
          </Button>
        )}
      </div>

      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            name={[name, 'street']}
            label="Rua"
            rules={[requiredRule]}
          >
            <Input placeholder="Nome da rua" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={[name, 'number']}
            label="Número"
            rules={[requiredRule]}
          >
            <Input placeholder="Número" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name={[name, 'complement']}
        label="Complemento"
      >
        <Input placeholder="Apartamento, bloco, etc." />
      </Form.Item>

      <Form.Item
        name={[name, 'neighborhood']}
        label="Bairro"
        rules={[requiredRule]}
      >
        <Input placeholder="Nome do bairro" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={[name, 'city']}
            label="Cidade"
            rules={[requiredRule]}
          >
            <Input placeholder="Nome da cidade" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name={[name, 'state']}
            label="Estado"
            rules={[
              requiredRule,
              { validator: validateStateField }
            ]}
          >
            <Input
              placeholder="UF"
              maxLength={2}
              onChange={handleStateChange}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name={[name, 'zipCode']}
            label="CEP"
            rules={[requiredRule, zipCodeRule]}
          >
            <Input
              placeholder="00000-000"
              maxLength={9}
              onChange={handleZipCodeChange}
              suffix={
                <Button
                  type="text"
                  icon={<SearchOutlined />}
                  onClick={handleCepSearch}
                  loading={loading}
                  style={{ marginRight: -8 }}
                />
              }
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name={[name, 'isDefault']}
        label="Endereço Principal"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
    </div>
  );
};

export default AddressForm; 