import React from 'react';
import { Modal, Timeline, Tag, Typography, Descriptions, Space, Divider, Tooltip } from 'antd';
import { AuditLog } from '../../types/audit';
import { formatDate } from '../../utils/date';
import { getActionConfig } from '../../utils/audit';
import { DiffOutlined, InfoCircleOutlined } from '@ant-design/icons';

interface AuditLogComparisonProps {
  logs: AuditLog[];
  visible: boolean;
  onClose: () => void;
}

const { Text, Title } = Typography;

export const AuditLogComparison: React.FC<AuditLogComparisonProps> = ({
  logs,
  visible,
  onClose,
}) => {
  if (!logs.length) {
    return (
      <Modal
        title="Comparação de Logs de Auditoria"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={1000}
      >
        <Text>Nenhum log para comparar</Text>
      </Modal>
    );
  }

  const renderLogDetails = (log: AuditLog, previousLog?: AuditLog) => {
    let details: Record<string, unknown>;
    let previousDetails: Record<string, unknown> | undefined;
    try {
      details = JSON.parse(log.details);
      if (previousLog) {
        previousDetails = JSON.parse(previousLog.details);
      }
    } catch {
      return <Text>{log.details}</Text>;
    }

    const renderDiff = (key: string, current: unknown, previous: unknown) => {
      if (JSON.stringify(current) !== JSON.stringify(previous)) {
        return (
          <Tooltip title="Valor alterado">
            <Text type="warning">
              <DiffOutlined /> {key}
            </Text>
          </Tooltip>
        );
      }
      return key;
    };

    return (
      <Descriptions size="small" column={2}>
        {Object.entries(details).map(([key, value]) => (
          <Descriptions.Item 
            key={key} 
            label={
              previousDetails ? renderDiff(key, value, previousDetails[key]) : key
            }
          >
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>Comparação de Logs de Auditoria</Title>
          <Tooltip title="Mostra as alterações entre os logs em ordem cronológica">
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Timeline>
          {logs.map((log, index) => {
            const actionConfig = getActionConfig(log.action);
            const previousLog = index > 0 ? logs[index - 1] : undefined;
            
            return (
              <Timeline.Item key={log.id}>
                <div className="mb-8">
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div className="flex justify-between items-center">
                      <Space align="center" size="small">
                        <Tag color={actionConfig.color}>{actionConfig.label}</Tag>
                        <Text strong>{log.userName}</Text>
                        {previousLog && (
                          <Tooltip title={`Comparando com log de ${formatDate(previousLog.createdAt)}`}>
                            <Text type="secondary">
                              <DiffOutlined /> Comparação
                            </Text>
                          </Tooltip>
                        )}
                      </Space>
                      <Text type="secondary">{formatDate(log.createdAt)}</Text>
                    </div>
                    {renderLogDetails(log, previousLog)}
                    {index < logs.length - 1 && <Divider style={{ margin: '12px 0' }} />}
                  </Space>
                </div>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </Space>
    </Modal>
  );
}; 