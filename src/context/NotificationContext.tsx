import React, { createContext, useContext, useCallback } from 'react';
import { notification } from 'antd';
import { NotificationInstance } from 'antd/es/notification/interface';

interface NotificationContextType {
  showSuccess: (message: string, description?: string) => void;
  showError: (message: string, description?: string) => void;
  showInfo: (message: string, description?: string) => void;
  showWarning: (message: string, description?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [api, contextHolder] = notification.useNotification();

  const showSuccess = useCallback((message: string, description?: string) => {
    api.success({
      message,
      description,
      placement: 'topRight',
      duration: 4.5
    });
  }, [api]);

  const showError = useCallback((message: string, description?: string) => {
    api.error({
      message,
      description,
      placement: 'topRight',
      duration: 6
    });
  }, [api]);

  const showInfo = useCallback((message: string, description?: string) => {
    api.info({
      message,
      description,
      placement: 'topRight',
      duration: 4.5
    });
  }, [api]);

  const showWarning = useCallback((message: string, description?: string) => {
    api.warning({
      message,
      description,
      placement: 'topRight',
      duration: 4.5
    });
  }, [api]);

  return (
    <NotificationContext.Provider
      value={{
        showSuccess,
        showError,
        showInfo,
        showWarning
      }}
    >
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 