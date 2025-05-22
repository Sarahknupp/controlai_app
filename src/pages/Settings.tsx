import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, Switch, Space, Divider } from 'antd';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../hooks/useAuth';
import { validationRules } from '../utils/validation';

const { Option } = Select;

const Settings: React.FC = () => {
  const { user, updateSettings } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (user?.settings) {
      form.setFieldsValue(user.settings);
    }
  }, [user, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await updateSettings(values);
      showSuccess('Configurações atualizadas com sucesso');
    } catch (error) {
      showError('Erro ao atualizar configurações', 'Não foi possível atualizar as configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card title="Configurações do Sistema">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="max-w-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Aparência</h3>
              <Form.Item
                name="theme"
                label="Tema"
                rules={[validationRules.required()]}
              >
                <Select>
                  <Option value="light">Claro</Option>
                  <Option value="dark">Escuro</Option>
                  <Option value="system">Sistema</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="language"
                label="Idioma"
                rules={[validationRules.required()]}
              >
                <Select>
                  <Option value="pt-BR">Português (Brasil)</Option>
                  <Option value="en-US">English (US)</Option>
                </Select>
              </Form.Item>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Notificações</h3>
              <Form.Item
                name="notifications"
                label="Notificações do Sistema"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="emailNotifications"
                label="Notificações por E-mail"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Localização</h3>
              <Form.Item
                name="timezone"
                label="Fuso Horário"
                rules={[validationRules.required()]}
              >
                <Select>
                  <Option value="America/Sao_Paulo">Brasília (GMT-3)</Option>
                  <Option value="America/New_York">New York (GMT-4)</Option>
                  <Option value="Europe/London">London (GMT+1)</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="dateFormat"
                label="Formato de Data"
                rules={[validationRules.required()]}
              >
                <Select>
                  <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                  <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                  <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          <Divider />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Salvar Configurações
              </Button>
              <Button onClick={() => form.resetFields()}>
                Restaurar Padrões
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings; 