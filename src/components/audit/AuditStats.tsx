import React, { useEffect, useState, useCallback } from 'react';
import { Card, Row, Col, Spin, Alert, Button } from 'antd';
import { Line, Pie, Bar } from '@ant-design/plots';
import { useNotification } from '../../context/NotificationContext';
import { auditService } from '../../services/audit.service';
import { getActionConfig } from '../../utils/audit.utils';
import { AuditStats as AuditStatsType } from '../../types/audit';
import { ReloadOutlined } from '@ant-design/icons';

interface AuditStatsProps {
  filters?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
    entityType?: string;
  };
}

export const AuditStats: React.FC<AuditStatsProps> = ({ filters }) => {
  const [stats, setStats] = useState<AuditStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useNotification();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await auditService.getStats(filters);
      setStats(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar estatísticas';
      setError(errorMessage);
      showError('Erro ao carregar estatísticas', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, showError]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="p-6">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          type="error"
          message="Erro ao carregar estatísticas"
          description={error}
          action={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchStats}
            >
              Tentar Novamente
            </Button>
          }
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <Alert
          type="info"
          message="Nenhuma estatística disponível"
          action={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchStats}
            >
              Atualizar
            </Button>
          }
        />
      </div>
    );
  }

  const actionData = stats.actionDistribution?.map((item) => ({
    type: getActionConfig(item.action).label,
    value: item.count
  })) || [];

  const entityData = stats.entityDistribution?.map((item) => ({
    type: item.entityType,
    value: item.count
  })) || [];

  const userData = stats.userActivity?.map((item) => ({
    type: item.userName,
    value: item.count
  })) || [];

  const trendData = stats.activityTrend?.map((item) => ({
    date: item.date,
    value: item.count
  })) || [];

  return (
    <div className="p-6">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <h3>Total de Logs</h3>
            <p className="text-2xl font-bold">{stats.totalLogs}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <h3>Usuários Ativos</h3>
            <p className="text-2xl font-bold">{stats.activeUsers}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <h3>Entidades Modificadas</h3>
            <p className="text-2xl font-bold">{stats.modifiedEntities}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <h3>Taxa de Erro</h3>
            <p className="text-2xl font-bold">{stats.errorRate}%</p>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col span={24}>
          <Card 
            title="Tendência de Atividade"
            extra={
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={fetchStats}
              />
            }
          >
            <Line
              data={trendData}
              xField="date"
              yField="value"
              smooth
              point={{
                size: 5,
                shape: 'diamond'
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col span={12}>
          <Card 
            title="Distribuição por Ação"
            extra={
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={fetchStats}
              />
            }
          >
            <Pie
              data={actionData}
              angleField="value"
              colorField="type"
              radius={0.8}
              label={{
                type: 'outer'
              }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title="Distribuição por Entidade"
            extra={
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={fetchStats}
              />
            }
          >
            <Pie
              data={entityData}
              angleField="value"
              colorField="type"
              radius={0.8}
              label={{
                type: 'outer'
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col span={24}>
          <Card 
            title="Atividade por Usuário"
            extra={
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={fetchStats}
              />
            }
          >
            <Bar
              data={userData}
              xField="value"
              yField="type"
              seriesField="type"
              legend={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}; 