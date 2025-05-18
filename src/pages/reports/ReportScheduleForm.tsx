import React, { useState, useEffect } from 'react';
import { reportTypes } from './ReportsConfig';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { ReportParameters } from '../../types/reports';

interface ReportScheduleFormProps {
  reportId: string;
  existingSchedule?: any;
  onSubmit: (params: ReportParameters) => void;
  onCancel: () => void;
}

export const ReportScheduleForm: React.FC<ReportScheduleFormProps> = ({
  reportId,
  existingSchedule,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: existingSchedule?.name || '',
    frequency: existingSchedule?.frequency || 'daily',
    dayOfWeek: existingSchedule?.dayOfWeek || 1,
    dayOfMonth: existingSchedule?.dayOfMonth || 1,
    time: existingSchedule?.time || '08:00',
    format: existingSchedule?.format || 'pdf',
    recipients: existingSchedule?.recipients?.join(', ') || '',
    parameters: {} as Record<string, any>
  });
  
  const report = reportTypes.find(r => r.id === reportId);
  
  // Initialize parameters with default values
  useEffect(() => {
    if (report) {
      const initialParams: Record<string, any> = {};
      report.parameters.forEach(param => {
        initialParams[param.id] = existingSchedule?.parameters?.[param.id] !== undefined
          ? existingSchedule.parameters[param.id]
          : param.defaultValue;
      });
      
      setFormData(prev => ({
        ...prev,
        parameters: initialParams,
        format: report.defaultFormat || 'pdf'
      }));
    }
  }, [report, existingSchedule]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleParamChange = (paramId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [paramId]: value
      }
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name.startsWith('param_')) {
      // This is a parameter checkbox
      const paramId = name.replace('param_', '');
      handleParamChange(paramId, checked);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recipientsArray = formData.recipients
      .split(',')
      .map(email => email.trim())
      .filter(Boolean);
    
    const scheduleData = {
      name: formData.name,
      frequency: formData.frequency,
      dayOfWeek: formData.frequency === 'weekly' ? Number(formData.dayOfWeek) : undefined,
      dayOfMonth: formData.frequency === 'monthly' ? Number(formData.dayOfMonth) : undefined,
      time: formData.time,
      format: formData.format,
      recipients: recipientsArray,
      parameters: formData.parameters
    };
    
    onSubmit(scheduleData);
  };
  
  if (!report) {
    return <div>Relatório não encontrado.</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Nome do Agendamento</Label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Ex: Resumo de Vendas Diário"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          required
        />
        <p className="mt-1 text-xs text-gray-500">Um nome descritivo para identificar este agendamento.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="frequency">Frequência</Label>
          <select
            id="frequency"
            name="frequency"
            value={formData.frequency}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          >
            {report.availableFrequencies.map(freq => (
              <option key={freq} value={freq}>
                {freq === 'daily' ? 'Diário' : 
                 freq === 'weekly' ? 'Semanal' : 
                 freq === 'monthly' ? 'Mensal' :
                 freq === 'quarterly' ? 'Trimestral' : 'Personalizado'}
              </option>
            ))}
          </select>
        </div>
        
        {formData.frequency === 'weekly' && (
          <div>
            <Label htmlFor="dayOfWeek">Dia da Semana</Label>
            <select
              id="dayOfWeek"
              name="dayOfWeek"
              value={formData.dayOfWeek}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            >
              <option value="1">Segunda-feira</option>
              <option value="2">Terça-feira</option>
              <option value="3">Quarta-feira</option>
              <option value="4">Quinta-feira</option>
              <option value="5">Sexta-feira</option>
              <option value="6">Sábado</option>
              <option value="0">Domingo</option>
            </select>
          </div>
        )}
        
        {formData.frequency === 'monthly' && (
          <div>
            <Label htmlFor="dayOfMonth">Dia do Mês</Label>
            <select
              id="dayOfMonth"
              name="dayOfMonth"
              value={formData.dayOfMonth}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        )}
        
        <div>
          <Label htmlFor="time">Horário</Label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="format">Formato</Label>
          <select
            id="format"
            name="format"
            value={formData.format}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          >
            {report.formats.map(format => (
              <option key={format} value={format}>{format.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="recipients">Destinatários</Label>
        <textarea
          id="recipients"
          name="recipients"
          value={formData.recipients}
          onChange={handleInputChange}
          rows={2}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          placeholder="email1@exemplo.com, email2@exemplo.com"
        />
        <p className="mt-1 text-xs text-gray-500">Informe um ou mais endereços de e-mail separados por vírgula.</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Parâmetros do Relatório</h3>
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-4">
          {report.parameters.map(param => (
            <div key={param.id}>
              {param.type === 'boolean' && (
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={`param_${param.id}`}
                      name={`param_${param.id}`}
                      type="checkbox"
                      checked={!!formData.parameters[param.id]}
                      onChange={handleCheckboxChange}
                      className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor={`param_${param.id}`} className="font-medium text-gray-700">{param.label}</label>
                  </div>
                </div>
              )}
              
              {param.type === 'select' && (
                <div>
                  <label htmlFor={`param_${param.id}`} className="block text-sm font-medium text-gray-700">
                    {param.label} {param.required && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    id={`param_${param.id}`}
                    name={`param_${param.id}`}
                    value={formData.parameters[param.id] || ''}
                    onChange={(e) => handleParamChange(param.id, e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    required={param.required}
                  >
                    {param.options?.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {param.type === 'number' && (
                <div>
                  <label htmlFor={`param_${param.id}`} className="block text-sm font-medium text-gray-700">
                    {param.label} {param.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="number"
                    id={`param_${param.id}`}
                    name={`param_${param.id}`}
                    value={formData.parameters[param.id] || 0}
                    onChange={(e) => handleParamChange(param.id, Number(e.target.value))}
                    min={param.minValue}
                    max={param.maxValue}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    required={param.required}
                  />
                </div>
              )}
              
              {param.type === 'date_range' && (
                <div>
                  <label htmlFor={`param_${param.id}`} className="block text-sm font-medium text-gray-700">
                    {param.label} {param.required && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    id={`param_${param.id}`}
                    name={`param_${param.id}`}
                    value={formData.parameters[param.id] || 'last_30_days'}
                    onChange={(e) => handleParamChange(param.id, e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    required={param.required}
                  >
                    <option value="today">Hoje</option>
                    <option value="yesterday">Ontem</option>
                    <option value="last_7_days">Últimos 7 dias</option>
                    <option value="last_30_days">Últimos 30 dias</option>
                    <option value="last_90_days">Últimos 90 dias</option>
                    <option value="current_month">Mês Atual</option>
                    <option value="previous_month">Mês Anterior</option>
                    <option value="current_quarter">Trimestre Atual</option>
                    <option value="previous_quarter">Trimestre Anterior</option>
                    <option value="current_year">Ano Atual</option>
                    <option value="previous_year">Ano Anterior</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {existingSchedule ? 'Atualizar' : 'Criar'} Agendamento
        </Button>
      </div>
    </form>
  );
};

// Helper component for searching
function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

// Helper component for cogs
function Cog(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
    >
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M12 2v2" />
      <path d="M12 22v-2" />
      <path d="m17 20.66-1-1.73" />
      <path d="M11 10.27 7 3.34" />
      <path d="m20.66 17-1.73-1" />
      <path d="m3.34 7 1.73 1" />
      <path d="M14 12h8" />
      <path d="M2 12h2" />
      <path d="m20.66 7-1.73 1" />
      <path d="m3.34 17 1.73-1" />
      <path d="m17 3.34-1 1.73" />
      <path d="m7 20.66-1-1.73" />
    </svg>
  );
}