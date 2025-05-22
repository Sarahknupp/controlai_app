import React, { useState } from 'react';
import { Card, Form, Input, Button, Space, message, Tabs } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import { validationRules } from '../utils/validation';

const { TabPane } = Tabs;

const Profile: React.FC = () => {
  const { user, updateProfile, updateSettings } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [settingsForm] = Form.useForm();

  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
      });
      settingsForm.setFieldsValue(user.settings);
    }
  }, [user, form, settingsForm]);

  const handleProfileUpdate = async (values: any) => {
    try {
      setLoading(true);
      await updateProfile(values);
      showSuccess('Perfil atualizado com sucesso');
    } catch (error) {
      showError('Erro ao atualizar perfil', 'Não foi possível atualizar o perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (values: any) => {
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
      <Card title="Perfil">
        <Tabs defaultActiveKey="profile">
          <TabPane tab="Informações Pessoais" key="profile">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleProfileUpdate}
              className="max-w-md"
            >
              <Form.Item
                name="name"
                label="Nome"
                rules={[
                  validationRules.required(),
                  validationRules.minLength(3, 'Nome deve ter no mínimo 3 caracteres')
                ]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="email"
                label="E-mail"
                rules={[
                  validationRules.required(),
                  validationRules.email()
                ]}
              >
                <Input prefix={<MailOutlined />} type="email" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Salvar Alterações
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Configurações" key="settings">
            <Form
              form={settingsForm}
              layout="vertical"
              onFinish={handleSettingsUpdate}
              className="max-w-md"
            >
              <Form.Item
                name="theme"
                label="Tema"
                rules={[validationRules.required()]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="language"
                label="Idioma"
                rules={[validationRules.required()]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="timezone"
                label="Fuso Horário"
                rules={[validationRules.required()]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="dateFormat"
                label="Formato de Data"
                rules={[validationRules.required()]}
              >
                <Input />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile; 