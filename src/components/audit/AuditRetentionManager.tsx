import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Button,
  Space,
  Alert,
  Statistic,
  Row,
  Col,
  Select,
  DatePicker,
  Spin
} from 'antd';
import { useNotification } from '../../context/NotificationContext';
import { auditService } from '../../services/audit.service';
import { RetentionStats, ArchiveStatus } from '../../types/audit';
import { useAudit } from '../../hooks/useAudit';
import dayjs from 'dayjs';

const { Option } = Select;

const AuditRetentionManager: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { logAuditAction } = useAudit();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<RetentionStats | null>(null);
  const [archiveStatus, setArchiveStatus] = useState<ArchiveStatus | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await auditService.getRetentionStats();
      setStats(data);
    } catch (error) {
      showError('Erro ao carregar estatísticas', 'Não foi possível carregar as estatísticas de retenção');
    } finally {
      setLoading(false);
    }
  };

  const fetchArchiveStatus = async () => {
    try {
      const data = await auditService.getArchiveStatus();
      setArchiveStatus(data);
    } catch (error) {
      showError('Erro ao carregar status do arquivo', 'Não foi possível carregar o status do arquivo');
    }
  };

  useEffect(() => {
    fetchStats();
    fetchArchiveStatus();
  }, []);

  const handleSubmit = async (values: {
    retentionPeriod: number;
    archivePeriod: number;
    maxSize: number;
    compressionEnabled: boolean;
  }) => {
    try {
      setLoading(true);
      await auditService.applyRetentionPolicy(values);
      await logAuditAction('update', {
        type: 'retention_policy',
        ...values
      });
      showSuccess('Política de retenção aplicada com sucesso');
      fetchStats();
      fetchArchiveStatus();
    } catch (error) {
      showError('Erro ao aplicar política', 'Não foi possível aplicar a política de retenção');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      setLoading(true);
      await auditService.archiveLogs();
      await logAuditAction('export', {
        type: 'archive',
        timestamp: new Date().toISOString()
      });
      showSuccess('Logs arquivados com sucesso');
      fetchStats();
      fetchArchiveStatus();
    } catch (error) {
      showError('Erro ao arquivar logs', 'Não foi possível arquivar os logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Estatísticas de Retenção">
            <Spin spinning={loading}>
              {stats && (
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="Total de Logs"
                      value={stats.totalLogs}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Logs para Exclusão"
                      value={stats.logsToDelete}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Tamanho Total"
                      value={stats.totalSize}
                      suffix="MB"
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Tamanho para Exclusão"
                      value={stats.sizeToDelete}
                      suffix="MB"
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                </Row>
              )}
            </Spin>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Política de Retenção">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                retentionPeriod: 90,
                archivePeriod: 365,
                maxSize: 1000,
                compressionEnabled: true
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="retentionPeriod"
                    label="Período de Retenção (dias)"
                    rules={[{ required: true, message: 'Por favor, informe o período de retenção' }]}
                  >
                    <InputNumber min={1} max={3650} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="archivePeriod"
                    label="Período de Arquivamento (dias)"
                    rules={[{ required: true, message: 'Por favor, informe o período de arquivamento' }]}
                  >
                    <InputNumber min={1} max={3650} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="maxSize"
                    label="Tamanho Máximo (MB)"
                    rules={[{ required: true, message: 'Por favor, informe o tamanho máximo' }]}
                  >
                    <InputNumber min={100} max={10000} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="compressionEnabled"
                    label="Compressão"
                    valuePropName="checked"
                  >
                    <Select>
                      <Option value={true}>Ativada</Option>
                      <Option value={false}>Desativada</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Aplicar Política
                  </Button>
                  <Button onClick={handleArchive} loading={loading}>
                    Arquivar Logs
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {archiveStatus && (
          <Col span={24}>
            <Card title="Status do Arquivo">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Último Arquivamento"
                    value={dayjs(archiveStatus.lastArchiveDate).format('DD/MM/YYYY HH:mm')}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Tamanho do Arquivo"
                    value={archiveStatus.archiveSize}
                    suffix="MB"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Localização"
                    value={archiveStatus.archiveLocation}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default AuditRetentionManager; 