import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Desculpe, a página que você está procurando não existe."
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          Voltar para o início
        </Button>
      }
    />
  );
};

export default NotFound; 