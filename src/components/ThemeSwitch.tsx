import React from 'react';
import { Switch } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';

const ThemeSwitch: React.FC = () => {
  const { user, updateSettings } = useAuth();
  const { showSuccess, showError } = useNotification();

  const handleThemeChange = async (checked: boolean) => {
    try {
      await updateSettings({
        theme: checked ? 'dark' : 'light',
      });
      showSuccess('Tema atualizado com sucesso');
    } catch (error) {
      showError('Erro ao atualizar tema', 'Não foi possível alterar o tema');
    }
  };

  return (
    <Switch
      checked={user?.settings.theme === 'dark'}
      onChange={handleThemeChange}
      checkedChildren="🌙"
      unCheckedChildren="☀️"
    />
  );
};

export default ThemeSwitch; 