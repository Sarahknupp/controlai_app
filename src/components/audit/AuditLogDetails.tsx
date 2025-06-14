import React from 'react';
import { Modal, Descriptions, Tag, Typography, Space, Divider, Spin, Alert } from 'antd';
import type { AuditLog } from '../../types/audit';
import { formatDate } from '../../utils/date';
import { getActionConfig, getEntityTypeLabel, parseAuditDetails } from '../../utils/audit';

const { Text } = Typography;

interface AuditLogDetailsProps {
  log: AuditLog | null;
  visible: boolean;
  onClose: () => void;
  loading?: boolean;
  error?: string;
}

const AuditLogDetails: React.FC<AuditLogDetailsProps> = ({ 
  log, 
  visible, 
  onClose,
  loading = false,
  error
}) => {
  if (!log) return null;

  const details = parseAuditDetails(log.details);
  const actionConfig = getActionConfig(log.action);

  const renderChanges = () => {
    if (!details['changes']) return null;

    return (
      <>
        <Divider orientation="left">Alterações</Divider>
        <Descriptions column={1} size="small">
          {Object.entries(details['changes']).map(([key, value]) => (
            <Descriptions.Item key={key} label={key}>
              <Text code>{JSON.stringify(value)}</Text>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </>
    );
  };

  const renderMetadata = () => {
    if (!details['metadata']) return null;

    return (
      <>
        <Divider orientation="left">Metadados</Divider>
        <Descriptions column={1} size="small">
          {Object.entries(details['metadata']).map(([key, value]) => (
            <Descriptions.Item key={key} label={key}>
              <Text code>{JSON.stringify(value)}</Text>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Spin size="large" />
          <div style={{ marginTop: '1rem' }}>Carregando detalhes...</div>
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          type="error"
          message="Erro ao carregar detalhes"
          description={error}
          showIcon
        />
      );
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Data/Hora">
            {formatDate(log.createdAt, 'dd/MM/yyyy HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="Usuário">
            {log.userName}
          </Descriptions.Item>
          <Descriptions.Item label="Ação">
            <Tag color={actionConfig.color}>{actionConfig.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Entidade">
            {getEntityTypeLabel(log.entityType)}
          </Descriptions.Item>
          <Descriptions.Item label="ID da Entidade">
            {log.entityId}
          </Descriptions.Item>
          <Descriptions.Item label="Endereço IP">
            {log.ipAddress}
          </Descriptions.Item>
        </Descriptions>

        {details['message'] && (
          <>
            <Divider orientation="left">Mensagem</Divider>
            <Text>{details['message']}</Text>
          </>
        )}

        {details['reason'] && (
          <>
            <Divider orientation="left">Motivo</Divider>
            <Text>{details['reason']}</Text>
          </>
        )}

        {renderChanges()}
        {renderMetadata()}

        {details['raw'] && (
          <>
            <Divider orientation="left">Detalhes Brutos</Divider>
            <Text code>
              {typeof details['raw'] === 'string' 
                ? details['raw'] 
                : JSON.stringify(details['raw'], null, 2)}
            </Text>
          </>
        )}
      </Space>
    );
  };

  return (
    <Modal
      title="Detalhes do Log de Auditoria"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      aria-label="Detalhes do Log de Auditoria"
    >
      {renderContent()}
    </Modal>
  );
};

export default AuditLogDetails; 