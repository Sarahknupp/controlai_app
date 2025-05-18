import React from 'react';
import { Save, FileText, Trash2, Edit, Plus, Settings } from 'lucide-react';
import { ReportType } from '../../types/reports';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';

// Define report types
export const reportTypes: ReportType[] = [
  {
    id: 'sales_summary',
    name: 'Resumo de Vendas',
    category: 'sales',
    description: 'Relatório com resumo das vendas por período',
    formats: ['pdf', 'excel', 'csv'],
    defaultFormat: 'pdf',
    availableFrequencies: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
    permissions: ['reports.view', 'reports.sales'],
    parameters: [
      {
        id: 'date_range',
        type: 'date_range',
        label: 'Período',
        required: true,
        defaultValue: 'last_30_days'
      },
      {
        id: 'include_taxes',
        type: 'boolean',
        label: 'Incluir Impostos',
        required: false,
        defaultValue: true
      },
      {
        id: 'payment_method',
        type: 'select',
        label: 'Método de Pagamento',
        required: false,
        options: [
          { value: 'all', label: 'Todos' },
          { value: 'cash', label: 'Dinheiro' },
          { value: 'credit', label: 'Cartão de Crédito' },
          { value: 'debit', label: 'Cartão de Débito' },
          { value: 'pix', label: 'PIX' }
        ],
        defaultValue: 'all'
      }
    ],
    columns: [
      { id: 'date', name: 'Data', required: true },
      { id: 'sales_count', name: 'Quantidade de Vendas', required: true },
      { id: 'total_amount', name: 'Valor Total', required: true },
      { id: 'tax_amount', name: 'Total de Impostos', required: false },
      { id: 'average_ticket', name: 'Ticket Médio', required: false }
    ],
    charts: [
      { type: 'bar', title: 'Vendas por Dia', dataKey: 'daily_sales' },
      { type: 'pie', title: 'Vendas por Método de Pagamento', dataKey: 'payment_method_breakdown' }
    ]
  },
  {
    id: 'inventory_status',
    name: 'Status do Estoque',
    category: 'inventory',
    description: 'Relatório com situação atual do estoque',
    formats: ['pdf', 'excel', 'csv'],
    defaultFormat: 'excel',
    availableFrequencies: ['daily', 'weekly', 'monthly'],
    permissions: ['reports.view', 'reports.inventory'],
    parameters: [
      {
        id: 'show_below_minimum',
        type: 'boolean',
        label: 'Mostrar Apenas Itens Abaixo do Mínimo',
        required: false,
        defaultValue: false
      },
      {
        id: 'category',
        type: 'select',
        label: 'Categoria',
        required: false,
        options: [
          { value: 'all', label: 'Todas' },
          { value: 'raw_materials', label: 'Matérias-Primas' },
          { value: 'finished_products', label: 'Produtos Acabados' },
          { value: 'packaging', label: 'Embalagens' }
        ],
        defaultValue: 'all'
      }
    ],
    columns: [
      { id: 'code', name: 'Código', required: true },
      { id: 'name', name: 'Produto', required: true },
      { id: 'category', name: 'Categoria', required: true },
      { id: 'current_stock', name: 'Estoque Atual', required: true },
      { id: 'minimum_stock', name: 'Estoque Mínimo', required: true },
      { id: 'reorder_point', name: 'Ponto de Reposição', required: false },
      { id: 'unit_cost', name: 'Custo Unitário', required: false },
      { id: 'total_value', name: 'Valor Total', required: false }
    ],
    charts: [
      { type: 'bar', title: 'Estoque por Categoria', dataKey: 'category_stock' },
      { type: 'pie', title: 'Valor do Estoque por Categoria', dataKey: 'category_value' }
    ]
  },
  {
    id: 'production_efficiency',
    name: 'Eficiência de Produção',
    category: 'production',
    description: 'Análise de eficiência e produtividade da produção',
    formats: ['pdf', 'excel'],
    defaultFormat: 'pdf',
    availableFrequencies: ['daily', 'weekly', 'monthly'],
    permissions: ['reports.view', 'reports.production'],
    parameters: [
      {
        id: 'date_range',
        type: 'date_range',
        label: 'Período',
        required: true,
        defaultValue: 'last_30_days'
      },
      {
        id: 'production_area',
        type: 'select',
        label: 'Área de Produção',
        required: false,
        options: [
          { value: 'all', label: 'Todas' },
          { value: 'bakery', label: 'Panificação' },
          { value: 'confectionery', label: 'Confeitaria' },
          { value: 'kitchen', label: 'Cozinha' }
        ],
        defaultValue: 'all'
      },
      {
        id: 'include_waste',
        type: 'boolean',
        label: 'Incluir Desperdício',
        required: false,
        defaultValue: true
      }
    ],
    columns: [
      { id: 'date', name: 'Data', required: true },
      { id: 'area', name: 'Área', required: true },
      { id: 'planned_production', name: 'Produção Planejada', required: true },
      { id: 'actual_production', name: 'Produção Realizada', required: true },
      { id: 'efficiency_rate', name: 'Taxa de Eficiência', required: true },
      { id: 'waste_percentage', name: 'Percentual de Desperdício', required: false },
      { id: 'production_time', name: 'Tempo de Produção', required: false }
    ],
    charts: [
      { type: 'line', title: 'Eficiência de Produção por Dia', dataKey: 'daily_efficiency' },
      { type: 'bar', title: 'Produção Planejada vs. Realizada', dataKey: 'planned_vs_actual' }
    ]
  },
  {
    id: 'financial_statement',
    name: 'Demonstrativo Financeiro',
    category: 'financial',
    description: 'Relatório financeiro com receitas e despesas',
    formats: ['pdf', 'excel'],
    defaultFormat: 'excel',
    availableFrequencies: ['monthly', 'quarterly', 'yearly'],
    permissions: ['reports.view', 'reports.financial'],
    parameters: [
      {
        id: 'date_range',
        type: 'date_range',
        label: 'Período',
        required: true,
        defaultValue: 'current_month'
      },
      {
        id: 'include_tax_details',
        type: 'boolean',
        label: 'Incluir Detalhes de Impostos',
        required: false,
        defaultValue: false
      },
      {
        id: 'compare_previous_period',
        type: 'boolean',
        label: 'Comparar com Período Anterior',
        required: false,
        defaultValue: true
      }
    ],
    columns: [
      { id: 'category', name: 'Categoria', required: true },
      { id: 'description', name: 'Descrição', required: true },
      { id: 'revenue', name: 'Receita', required: true },
      { id: 'expense', name: 'Despesa', required: true },
      { id: 'balance', name: 'Saldo', required: true },
      { id: 'previous_period', name: 'Período Anterior', required: false },
      { id: 'difference_percentage', name: 'Diferença (%)', required: false }
    ],
    charts: [
      { type: 'bar', title: 'Receitas vs. Despesas por Mês', dataKey: 'monthly_financial' },
      { type: 'pie', title: 'Distribuição de Despesas', dataKey: 'expense_breakdown' }
    ]
  },
  {
    id: 'product_sales_performance',
    name: 'Desempenho de Vendas por Produto',
    category: 'sales',
    description: 'Análise detalhada das vendas por produto',
    formats: ['pdf', 'excel', 'csv'],
    defaultFormat: 'excel',
    availableFrequencies: ['weekly', 'monthly', 'quarterly'],
    permissions: ['reports.view', 'reports.sales'],
    parameters: [
      {
        id: 'date_range',
        type: 'date_range',
        label: 'Período',
        required: true,
        defaultValue: 'last_30_days'
      },
      {
        id: 'product_category',
        type: 'select',
        label: 'Categoria de Produto',
        required: false,
        options: [
          { value: 'all', label: 'Todas' },
          { value: 'bakery', label: 'Panificação' },
          { value: 'confectionery', label: 'Confeitaria' },
          { value: 'retail', label: 'Revenda' }
        ],
        defaultValue: 'all'
      },
      {
        id: 'min_sales',
        type: 'number',
        label: 'Vendas Mínimas',
        required: false,
        defaultValue: 0,
        minValue: 0
      }
    ],
    columns: [
      { id: 'code', name: 'Código', required: true },
      { id: 'product', name: 'Produto', required: true },
      { id: 'category', name: 'Categoria', required: true },
      { id: 'quantity_sold', name: 'Quantidade Vendida', required: true },
      { id: 'revenue', name: 'Receita', required: true },
      { id: 'average_price', name: 'Preço Médio', required: false },
      { id: 'profit_margin', name: 'Margem de Lucro', required: false },
      { id: 'return_rate', name: 'Taxa de Devolução', required: false }
    ],
    charts: [
      { type: 'bar', title: 'Top 10 Produtos Mais Vendidos', dataKey: 'top_products' },
      { type: 'line', title: 'Tendência de Vendas', dataKey: 'sales_trend' }
    ]
  },
  {
    id: 'customer_analysis',
    name: 'Análise de Clientes',
    category: 'sales',
    description: 'Relatório de comportamento e perfil de clientes',
    formats: ['pdf', 'excel'],
    defaultFormat: 'pdf',
    availableFrequencies: ['monthly', 'quarterly', 'yearly'],
    permissions: ['reports.view', 'reports.sales'],
    parameters: [
      {
        id: 'date_range',
        type: 'date_range',
        label: 'Período',
        required: true,
        defaultValue: 'last_90_days'
      },
      {
        id: 'customer_segment',
        type: 'select',
        label: 'Segmento de Clientes',
        required: false,
        options: [
          { value: 'all', label: 'Todos' },
          { value: 'retail', label: 'Varejo' },
          { value: 'wholesale', label: 'Atacado' },
          { value: 'corporate', label: 'Corporativo' }
        ],
        defaultValue: 'all'
      },
      {
        id: 'min_purchase_value',
        type: 'number',
        label: 'Valor Mínimo de Compra',
        required: false,
        defaultValue: 0,
        minValue: 0
      }
    ],
    columns: [
      { id: 'customer_id', name: 'ID do Cliente', required: true },
      { id: 'customer_name', name: 'Nome do Cliente', required: true },
      { id: 'customer_segment', name: 'Segmento', required: true },
      { id: 'purchase_count', name: 'Número de Compras', required: true },
      { id: 'total_spent', name: 'Valor Total Gasto', required: true },
      { id: 'average_ticket', name: 'Ticket Médio', required: true },
      { id: 'last_purchase_date', name: 'Data da Última Compra', required: true },
      { id: 'recency_days', name: 'Dias Desde Última Compra', required: false },
      { id: 'favorite_product', name: 'Produto Favorito', required: false }
    ],
    charts: [
      { type: 'pie', title: 'Distribuição de Clientes por Segmento', dataKey: 'customer_segments' },
      { type: 'scatter', title: 'Frequência vs. Valor', dataKey: 'frequency_value_matrix' }
    ]
  },
  {
    id: 'operational_costs',
    name: 'Custos Operacionais',
    category: 'operations',
    description: 'Análise detalhada de custos operacionais',
    formats: ['pdf', 'excel'],
    defaultFormat: 'excel',
    availableFrequencies: ['monthly', 'quarterly', 'yearly'],
    permissions: ['reports.view', 'reports.financial'],
    parameters: [
      {
        id: 'date_range',
        type: 'date_range',
        label: 'Período',
        required: true,
        defaultValue: 'current_month'
      },
      {
        id: 'cost_category',
        type: 'select',
        label: 'Categoria de Custo',
        required: false,
        options: [
          { value: 'all', label: 'Todas' },
          { value: 'labor', label: 'Mão de Obra' },
          { value: 'raw_materials', label: 'Matérias-Primas' },
          { value: 'utilities', label: 'Serviços Públicos' },
          { value: 'rent', label: 'Aluguel' },
          { value: 'equipment', label: 'Equipamentos' },
          { value: 'other', label: 'Outros' }
        ],
        defaultValue: 'all'
      }
    ],
    columns: [
      { id: 'category', name: 'Categoria', required: true },
      { id: 'subcategory', name: 'Subcategoria', required: false },
      { id: 'description', name: 'Descrição', required: true },
      { id: 'date', name: 'Data', required: true },
      { id: 'amount', name: 'Valor', required: true },
      { id: 'percentage', name: '% do Total', required: false },
      { id: 'previous_period', name: 'Período Anterior', required: false },
      { id: 'variance', name: 'Variação (%)', required: false }
    ],
    charts: [
      { type: 'pie', title: 'Distribuição de Custos por Categoria', dataKey: 'cost_distribution' },
      { type: 'line', title: 'Tendência de Custos', dataKey: 'cost_trend' }
    ]
  },
  {
    id: 'tax_summary',
    name: 'Resumo de Impostos',
    category: 'fiscal',
    description: 'Resumo consolidado de impostos recolhidos',
    formats: ['pdf', 'excel'],
    defaultFormat: 'excel',
    availableFrequencies: ['monthly', 'quarterly', 'yearly'],
    permissions: ['reports.view', 'reports.fiscal'],
    parameters: [
      {
        id: 'date_range',
        type: 'date_range',
        label: 'Período',
        required: true,
        defaultValue: 'current_month'
      },
      {
        id: 'tax_type',
        type: 'select',
        label: 'Tipo de Imposto',
        required: false,
        options: [
          { value: 'all', label: 'Todos' },
          { value: 'icms', label: 'ICMS' },
          { value: 'iss', label: 'ISS' },
          { value: 'pis', label: 'PIS' },
          { value: 'cofins', label: 'COFINS' },
          { value: 'ipi', label: 'IPI' },
          { value: 'simples', label: 'Simples Nacional' }
        ],
        defaultValue: 'all'
      }
    ],
    columns: [
      { id: 'tax_type', name: 'Tipo de Imposto', required: true },
      { id: 'tax_period', name: 'Período de Referência', required: true },
      { id: 'tax_base', name: 'Base de Cálculo', required: true },
      { id: 'tax_rate', name: 'Alíquota (%)', required: true },
      { id: 'tax_amount', name: 'Valor do Imposto', required: true },
      { id: 'due_date', name: 'Data de Vencimento', required: true },
      { id: 'payment_status', name: 'Status de Pagamento', required: false },
      { id: 'payment_date', name: 'Data de Pagamento', required: false }
    ],
    charts: [
      { type: 'bar', title: 'Impostos por Tipo', dataKey: 'tax_by_type' },
      { type: 'line', title: 'Evolução de Impostos no Período', dataKey: 'tax_evolution' }
    ]
  },
  {
    id: 'employee_performance',
    name: 'Desempenho de Funcionários',
    category: 'administrative',
    description: 'Avaliação de desempenho e produtividade dos funcionários',
    formats: ['pdf', 'excel'],
    defaultFormat: 'pdf',
    availableFrequencies: ['monthly', 'quarterly'],
    permissions: ['reports.view', 'reports.hr'],
    parameters: [
      {
        id: 'date_range',
        type: 'date_range',
        label: 'Período',
        required: true,
        defaultValue: 'current_month'
      },
      {
        id: 'department',
        type: 'select',
        label: 'Departamento',
        required: false,
        options: [
          { value: 'all', label: 'Todos' },
          { value: 'production', label: 'Produção' },
          { value: 'sales', label: 'Vendas' },
          { value: 'admin', label: 'Administrativo' }
        ],
        defaultValue: 'all'
      }
    ],
    columns: [
      { id: 'employee_id', name: 'ID do Funcionário', required: true },
      { id: 'name', name: 'Nome', required: true },
      { id: 'department', name: 'Departamento', required: true },
      { id: 'position', name: 'Cargo', required: true },
      { id: 'hours_worked', name: 'Horas Trabalhadas', required: true },
      { id: 'productivity_score', name: 'Pontuação de Produtividade', required: true },
      { id: 'sales_amount', name: 'Valor em Vendas', required: false },
      { id: 'items_produced', name: 'Itens Produzidos', required: false },
      { id: 'customer_satisfaction', name: 'Satisfação de Clientes', required: false }
    ],
    charts: [
      { type: 'bar', title: 'Produtividade por Funcionário', dataKey: 'employee_productivity' },
      { type: 'radar', title: 'Métricas Principais', dataKey: 'key_metrics' }
    ]
  }
];

export const ReportConfig: React.FC = () => {
  const [activeReport, setActiveReport] = React.useState(reportTypes[0]);
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Configurações de Relatórios</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure os relatórios disponíveis, seus parâmetros e modelos.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Left sidebar */}
        <div className="w-full md:w-64 border-r border-gray-200 bg-gray-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Relatórios</h3>
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {reportTypes.map(report => (
                <button
                  key={report.id}
                  className={`w-full text-left px-2 py-2 rounded-md text-sm ${
                    activeReport.id === report.id
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveReport(report)}
                >
                  {report.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{activeReport.name}</h3>
            <div className="space-x-2">
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button size="sm">
                <Save className="h-4 w-4 mr-1" />
                Salvar
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Informações Básicas</h4>
                <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID</label>
                    <div className="mt-1 text-sm text-gray-900 bg-white p-2 border border-gray-300 rounded-md">
                      {activeReport.id}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categoria</label>
                    <div className="mt-1 text-sm text-gray-900 bg-white p-2 border border-gray-300 rounded-md capitalize">
                      {activeReport.category}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <div className="mt-1 text-sm text-gray-900 bg-white p-2 border border-gray-300 rounded-md">
                      {activeReport.description}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Configuração de Saída</h4>
                <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Formatos Disponíveis</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {activeReport.formats.map(format => (
                        <span 
                          key={format} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {format.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Formato Padrão</label>
                    <div className="mt-1 text-sm text-gray-900 bg-white p-2 border border-gray-300 rounded-md uppercase">
                      {activeReport.defaultFormat}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Frequências Disponíveis</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {activeReport.availableFrequencies.map(frequency => (
                        <span 
                          key={frequency} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {frequency === 'daily' ? 'Diária' : 
                           frequency === 'weekly' ? 'Semanal' : 
                           frequency === 'monthly' ? 'Mensal' :
                           frequency === 'quarterly' ? 'Trimestral' :
                           frequency === 'yearly' ? 'Anual' : 'Personalizado'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Parâmetros</h4>
              <div className="bg-gray-50 rounded-md p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rótulo</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Obrigatório</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Padrão</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeReport.parameters.map(param => (
                        <tr key={param.id}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{param.id}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{param.type}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{param.label}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {param.required ? 'Sim' : 'Não'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {typeof param.defaultValue === 'boolean' 
                              ? (param.defaultValue ? 'Verdadeiro' : 'Falso')
                              : param.defaultValue?.toString() || ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Colunas</h4>
              <div className="bg-gray-50 rounded-md p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Obrigatória</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeReport.columns.map(column => (
                        <tr key={column.id}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{column.id}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{column.name}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {column.required ? 'Sim' : 'Não'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {activeReport.charts && activeReport.charts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Gráficos</h4>
                <div className="bg-gray-50 rounded-md p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeReport.charts.map(chart => (
                    <div key={chart.dataKey} className="bg-white p-3 rounded-md border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">{chart.title}</div>
                        <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 uppercase">{chart.type}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Data Key: {chart.dataKey}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <div className="text-sm text-gray-500">
                Permissões Necessárias:
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeReport.permissions.map(permission => (
                    <span 
                      key={permission} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  toast.success('Configurações aplicadas com sucesso!');
                }}
              >
                <Settings className="h-4 w-4 mr-1" />
                Aplicar Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};