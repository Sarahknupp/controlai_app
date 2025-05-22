import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  DatePicker,
  Space,
  Input,
  Select,
  Button,
  Tag,
  Alert,
  Dropdown,
  Menu,
  Tabs,
  Spin,
  Tooltip,
  Checkbox
} from 'antd';
import { SearchOutlined, ReloadOutlined, DownloadOutlined, BarChartOutlined, DiffOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { auditService } from '../services/audit.service';
import { formatDate } from '../utils/date';
import { AuditLog, AuditFilters, EntityType } from '../types/audit';
import { useNotification } from '../context/NotificationContext';
import AuditRetentionManager from '../components/audit/AuditRetentionManager';
import { AuditStats } from '../components/audit/AuditStats';
import AuditLogDetails from '../components/audit/AuditLogDetails';
import { AuditLogComparison } from '../components/audit/AuditLogComparison';
import {
  formatAuditLog,
  getAuditLogDescription,
  getAuditLogTooltip,
  getActionConfig,
  getEntityTypeLabel,
  getEntityTypeOptions
} from '../utils/audit';
import dayjs from 'dayjs';
import type { MenuProps } from 'antd';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const AuditLogs: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [selectedLogs, setSelectedLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState<AuditFilters>({
    page: 1,
    pageSize: 10,
    search: '',
    startDate: '',
    endDate: '',
    entityType: undefined
  });
  const { hasPermission } = usePermissions();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await auditService.getLogs(filters);
      setLogs(response.logs);
      setTotal(response.total);
    } catch (error) {
      setError('Erro ao carregar logs de auditoria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPermission('audit:view')) {
      fetchLogs();
    }
  }, [filters]);

  const handleFilterChange = (key: keyof AuditFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await auditService.exportLogs(filters);
      showSuccess('Exportação concluída com sucesso');
    } catch (error) {
      showError('Erro ao exportar logs', 'Não foi possível exportar os logs de auditoria');
    } finally {
      setExporting(false);
    }
  };

  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'export',
      label: 'Exportar Logs',
      onClick: handleExport
    }
  ];

  const handleRowSelection = (selectedRowKeys: React.Key[], selectedRows: AuditLog[]) => {
    setSelectedLogs(selectedRows);
  };

  const rowSelection = {
    selectedRowKeys: selectedLogs.map(log => log.id),
    onChange: handleRowSelection,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  const columns = [
    {
      title: 'Data/Hora',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date, 'dd/MM/yyyy HH:mm:ss'),
    },
    {
      title: 'Usuário',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Ação',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => {
        const config = getActionConfig(action);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Entidade',
      dataIndex: 'entityType',
      key: 'entityType',
      render: (type: EntityType) => getEntityTypeLabel(type),
    },
    {
      title: 'ID da Entidade',
      dataIndex: 'entityId',
      key: 'entityId',
    },
    {
      title: 'Detalhes',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (details: string, record: AuditLog) => (
        <Tooltip title={getAuditLogTooltip(record)}>
          <span className="cursor-pointer" onClick={() => setSelectedLog(record)}>
            {getAuditLogDescription(record)}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
  ];

  if (!hasPermission('audit:view')) {
    return (
      <Alert
        message="Acesso Negado"
        description="Você não tem permissão para visualizar os logs de auditoria."
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="p-6">
      <Tabs defaultActiveKey="logs">
        <TabPane tab="Logs de Auditoria" key="logs">
          <Card
            title="Logs de Auditoria"
            extra={
              <Space>
                {selectedLogs.length >= 2 && (
                  <Button
                    icon={<DiffOutlined />}
                    onClick={() => setSelectedLogs(selectedLogs)}
                  >
                    Comparar Selecionados
                  </Button>
                )}
                <Dropdown menu={{ items: exportMenuItems }} disabled={exporting}>
                  <Button icon={<DownloadOutlined />} loading={exporting}>
                    Exportar
                  </Button>
                </Dropdown>
                <Button icon={<ReloadOutlined />} onClick={fetchLogs} loading={loading}>
                  Atualizar
                </Button>
              </Space>
            }
          >
            <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
              <Space wrap>
                <Input
                  placeholder="Buscar..."
                  prefix={<SearchOutlined />}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  style={{ width: 200 }}
                />
                <RangePicker
                  value={[
                    filters.startDate ? dayjs(filters.startDate) : null,
                    filters.endDate ? dayjs(filters.endDate) : null
                  ]}
                  onChange={(dates) => {
                    if (dates) {
                      handleFilterChange('startDate', dates[0]?.toISOString());
                      handleFilterChange('endDate', dates[1]?.toISOString());
                    } else {
                      handleFilterChange('startDate', undefined);
                      handleFilterChange('endDate', undefined);
                    }
                  }}
                />
                <Select
                  placeholder="Tipo de Entidade"
                  allowClear
                  style={{ width: 200 }}
                  value={filters.entityType}
                  onChange={(value) => handleFilterChange('entityType', value)}
                >
                  {getEntityTypeOptions().map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Space>

            {error && (
              <Alert
                message="Erro"
                description={error}
                type="error"
                showIcon
                className="mb-4"
              />
            )}

            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={logs}
                rowKey="id"
                rowSelection={rowSelection}
                pagination={{
                  current: filters.page,
                  pageSize: filters.pageSize,
                  total,
                  showSizeChanger: true,
                  showTotal: (total) => `Total: ${total} registros`,
                  onChange: (page, pageSize) => {
                    handleFilterChange('page', page);
                    handleFilterChange('pageSize', pageSize);
                  }
                }}
              />
            </Spin>
          </Card>
        </TabPane>
        {hasPermission('audit:view') && (
          <TabPane tab={<span><BarChartOutlined /> Estatísticas</span>} key="stats">
            <AuditStats />
          </TabPane>
        )}
        {hasPermission('audit:manage') && (
          <TabPane tab="Gerenciamento de Retenção" key="retention">
            <AuditRetentionManager />
          </TabPane>
        )}
      </Tabs>

      <AuditLogDetails
        log={selectedLog}
        visible={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />

      <AuditLogComparison
        logs={selectedLogs}
        visible={selectedLogs.length >= 2}
        onClose={() => setSelectedLogs([])}
      />
    </div>
  );
};

export default AuditLogs; 