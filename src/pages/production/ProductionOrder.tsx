import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Users, 
  CheckSquare, 
  ShoppingCart,
  Link as LinkIcon,
  Edit,
  Plus,
  Trash2,
  Save,
  X,
  ChefHat,
  Cake,
  Utensils,
  Check,
  Search
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockProductionOrders, mockUsers, mockProducts, mockSales, mockTechnicalSheets } from '../../data/mockData';
import { ProductionOrderItem } from '../../types/production';
import toast from 'react-hot-toast';

const ProductionOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNewOrder = id === 'new';
  
  const [formData, setFormData] = useState({
    orderNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    clientName: '',
    clientId: '',
    status: 'pending',
    priority: 'medium',
    items: [] as ProductionOrderItem[],
    notes: '',
    saleId: '',
    assignedArea: '',
  });
  
  const [editMode, setEditMode] = useState(isNewOrder);
  const [isSelectingProduct, setIsSelectingProduct] = useState(false);
  const [isLinkingSale, setIsLinkingSale] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(mockProducts.filter(p => p.category === 'Produção Própria'));
  const [filteredSales, setFilteredSales] = useState(mockSales);
  
  // If editing existing order, load the order data
  useEffect(() => {
    if (!isNewOrder) {
      const order = mockProductionOrders.find(o => o.id === id);
      if (order) {
        setFormData({
          orderNumber: order.orderNumber,
          date: new Date(order.date).toISOString().split('T')[0],
          dueDate: new Date(order.dueDate).toISOString().split('T')[0],
          dueTime: new Date(order.dueDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          clientName: order.clientName || '',
          clientId: order.clientId || '',
          status: order.status,
          priority: order.priority,
          items: [...order.items],
          notes: order.notes || '',
          saleId: order.saleId || '',
          assignedArea: order.assignedArea,
        });
      }
    } else {
      // Generate a new order number for new orders
      const lastOrder = mockProductionOrders.sort((a, b) => {
        const numA = parseInt(a.orderNumber.split('-')[2]);
        const numB = parseInt(b.orderNumber.split('-')[2]);
        return numB - numA;
      })[0];
      
      const newOrderNumber = `OP-${new Date().getFullYear()}-${String(
        parseInt(lastOrder?.orderNumber.split('-')[2] || '0') + 1
      ).padStart(3, '0')}`;
      
      setFormData(prev => ({
        ...prev,
        orderNumber: newOrderNumber,
        // Set due date to tomorrow by default
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
      }));
    }
  }, [id, isNewOrder]);
  
  // Filter products when search term changes
  useEffect(() => {
    if (isSelectingProduct) {
      setFilteredProducts(
        mockProducts.filter(p => 
          p.category === 'Produção Própria' && 
          (searchTerm === '' || 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
  }, [searchTerm, isSelectingProduct]);
  
  // Filter sales when search term changes
  useEffect(() => {
    if (isLinkingSale) {
      setFilteredSales(
        mockSales.filter(s => 
          searchTerm === '' || 
          s.id.includes(searchTerm) || 
          (s.customerDetails?.name && s.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
  }, [searchTerm, isLinkingSale]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddProduct = (product: any) => {
    const techSheet = mockTechnicalSheets.find(t => t.productId === product.id);
    
    const newItem: ProductionOrderItem = {
      id: `new-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity: 1,
      status: 'pending',
      area: techSheet?.area || 'bakery', // Default to bakery if no tech sheet
      technicalSheetId: techSheet?.id || '',
      estimatedTime: techSheet?.preparationSteps.reduce((sum, step) => sum + step.estimatedTime, 0) || 60,
    };
    
    setFormData(prev => {
      const newItems = [...prev.items, newItem];
      // Automatically determine assigned area based on items
      const areas = [...new Set(newItems.map(item => item.area))];
      const assignedArea = areas.length === 1 ? areas[0] : 'multiple';
      
      return {
        ...prev,
        items: newItems,
        assignedArea,
      };
    });
    
    setIsSelectingProduct(false);
    setSearchTerm('');
  };
  
  const handleRemoveProduct = (itemId: string) => {
    setFormData(prev => {
      const newItems = prev.items.filter(item => item.id !== itemId);
      // Recalculate assigned area
      const areas = [...new Set(newItems.map(item => item.area))];
      const assignedArea = newItems.length === 0 ? '' : (areas.length === 1 ? areas[0] : 'multiple');
      
      return {
        ...prev,
        items: newItems,
        assignedArea,
      };
    });
  };
  
  const handleUpdateItemQuantity = (itemId: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    }));
  };
  
  const handleLinkSale = (sale: any) => {
    // Extract relevant information from sale
    const clientName = sale.customerDetails?.name || 'Cliente Não Identificado';
    const clientId = sale.id;
    // Translate sale items to production items
    const productionItems = sale.items
      .map(saleItem => {
        const product = mockProducts.find(p => p.id === saleItem.productId && p.category === 'Produção Própria');
        if (!product) return null;
        
        const techSheet = mockTechnicalSheets.find(t => t.productId === product.id);
        
        return {
          id: `new-${Date.now()}-${saleItem.productId}`,
          productId: saleItem.productId,
          productName: saleItem.productName,
          quantity: saleItem.quantity,
          status: 'pending',
          area: techSheet?.area || 'bakery',
          technicalSheetId: techSheet?.id || '',
          estimatedTime: techSheet?.preparationSteps.reduce((sum, step) => sum + step.estimatedTime, 0) || 60,
        } as ProductionOrderItem;
      })
      .filter(item => item !== null) as ProductionOrderItem[];
    
    // Only proceed if there are valid production items
    if (productionItems.length > 0) {
      const areas = [...new Set(productionItems.map(item => item.area))];
      const assignedArea = areas.length === 1 ? areas[0] : 'multiple';
      
      setFormData(prev => ({
        ...prev,
        clientName,
        clientId,
        saleId: sale.id,
        items: [...prev.items, ...productionItems],
        assignedArea,
      }));
      
      setIsLinkingSale(false);
      setSearchTerm('');
      
      toast.success(`Vinculado à venda #${sale.id}`);
    } else {
      toast.error('Nenhum produto de produção própria encontrado na venda');
    }
  };
  
  const handleUnlinkSale = () => {
    setFormData(prev => ({
      ...prev,
      clientName: '',
      clientId: '',
      saleId: '',
    }));
    
    toast.success('Vínculo com venda removido');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (formData.items.length === 0) {
      toast.error('Adicione pelo menos um item à ordem de produção');
      return;
    }
    
    // Combine date and time for due date
    const combinedDueDate = new Date(`${formData.dueDate}T${formData.dueTime}`);
    
    // Prepare data for submission
    const submissionData = {
      ...formData,
      dueDate: combinedDueDate,
      // Calculate total estimated time based on items
      totalEstimatedTime: formData.items.reduce((sum, item) => sum + item.estimatedTime, 0),
      // Set created by to current user
      createdBy: user?.id || '',
      // Add initial tracking event
      trackingEvents: [{
        id: `event-${Date.now()}`,
        timestamp: new Date(),
        description: isNewOrder ? 'Ordem de produção criada' : 'Ordem de produção atualizada',
        userId: user?.id || '',
        userName: user?.name || '',
        status: formData.status,
      }]
    };
    
    // In a real application, this would be an API call
    console.log('Submitting order:', submissionData);
    
    toast.success(isNewOrder ? 'Ordem de produção criada com sucesso!' : 'Ordem de produção atualizada com sucesso!');
    navigate('/production');
  };
  
  // Get the name of the assigned area
  const getAreaName = (area: string): string => {
    switch (area) {
      case 'kitchen': return 'Cozinha';
      case 'confectionery': return 'Confeitaria';
      case 'bakery': return 'Panificação';
      case 'multiple': return 'Múltiplas Áreas';
      default: return 'Não definido';
    }
  };
  
  // Get icon for assigned area
  const getAreaIcon = (area: string) => {
    switch (area) {
      case 'kitchen': return <ChefHat className="h-5 w-5 text-red-600" />;
      case 'confectionery': return <Cake className="h-5 w-5 text-purple-600" />;
      case 'bakery': return <Utensils className="h-5 w-5 text-amber-600" />;
      default: return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/production')}
            className="mr-3 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <h1 className="text-2xl font-semibold text-gray-900">
            {isNewOrder ? 'Nova Ordem de Produção' : `Ordem de Produção: ${formData.orderNumber}`}
          </h1>
        </div>
        
        {!isNewOrder && !editMode && (
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </button>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Information - Left Column */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700">
                      Número da Ordem
                    </label>
                    <input
                      type="text"
                      id="orderNumber"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Data de Criação
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between">
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                      Cliente
                    </label>
                    {formData.saleId && (
                      <div className="flex items-center text-xs text-blue-600">
                        <LinkIcon className="h-3 w-3 mr-1" />
                        Vinculado à Venda #{formData.saleId}
                        {editMode && (
                          <button
                            type="button"
                            onClick={handleUnlinkSale}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {editMode ? (
                    <div className="mt-1 flex">
                      <input
                        type="text"
                        id="clientName"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleInputChange}
                        placeholder="Nome do cliente (opcional)"
                        className="block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsLinkingSale(true);
                          setIsSelectingProduct(false);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md hover:bg-gray-100"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md py-2 px-3">
                      {formData.clientName || 'Não especificado'}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                      Prazo - Data
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700">
                      Prazo - Hora
                    </label>
                    <input
                      type="time"
                      id="dueTime"
                      name="dueTime"
                      value={formData.dueTime}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="pending">Pendente</option>
                      <option value="in-production">Em Produção</option>
                      <option value="completed">Concluído</option>
                      <option value="delivered">Entregue</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                      Prioridade
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Observações
                  </label>
                  {editMode ? (
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Observações sobre esta ordem de produção"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                  ) : (
                    <div className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md py-2 px-3 min-h-[80px]">
                      {formData.notes || 'Sem observações'}
                    </div>
                  )}
                </div>
                
                {formData.assignedArea && (
                  <div className="bg-gray-50 rounded-md p-4">
                    <div className="flex items-center mb-2">
                      {getAreaIcon(formData.assignedArea)}
                      <h3 className="text-sm font-medium text-gray-700 ml-2">
                        Área Responsável: {getAreaName(formData.assignedArea)}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500">
                      Esta área será notificada sobre esta ordem de produção e será responsável por sua execução.
                      {formData.assignedArea === 'multiple' && " Múltiplas áreas estão envolvidas nesta ordem."}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Production Items - Right Column */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Itens para Produção</h2>
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSelectingProduct(true);
                        setIsLinkingSale(false);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Item
                    </button>
                  )}
                </div>
                
                {formData.items.length === 0 ? (
                  <div className="bg-gray-50 rounded-md py-8 px-4 text-center">
                    <ShoppingCart className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum item adicionado</h3>
                    {editMode && (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSelectingProduct(true);
                            setIsLinkingSale(false);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar Item
                        </button>
                        <p className="mt-2 text-xs text-gray-500">ou</p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsLinkingSale(true);
                            setIsSelectingProduct(false);
                          }}
                          className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                          <LinkIcon className="h-4 w-4 mr-1" />
                          Vincular à Venda
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {formData.items.map(item => {
                        let areaColorClass = '';
                        let areaIcon = null;
                        
                        switch(item.area) {
                          case 'kitchen':
                            areaColorClass = 'border-l-4 border-red-500';
                            areaIcon = <ChefHat className="h-4 w-4 text-red-600 mr-1" />;
                            break;
                          case 'confectionery':
                            areaColorClass = 'border-l-4 border-purple-500';
                            areaIcon = <Cake className="h-4 w-4 text-purple-600 mr-1" />;
                            break;
                          case 'bakery':
                            areaColorClass = 'border-l-4 border-amber-500';
                            areaIcon = <Utensils className="h-4 w-4 text-amber-600 mr-1" />;
                            break;
                        }
                        
                        return (
                          <li key={item.id} className={`p-4 ${areaColorClass}`}>
                            <div className="flex justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-900">{item.productName}</span>
                                  {areaIcon && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      {areaIcon}
                                      {item.area === 'kitchen' ? 'Cozinha' : 
                                       item.area === 'confectionery' ? 'Confeitaria' : 
                                       'Panificação'}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                  Tempo estimado: {item.estimatedTime} min
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                {editMode ? (
                                  <div className="flex items-center">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                                      className="p-1 text-gray-500 hover:text-gray-700"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => handleUpdateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                      min="1"
                                      className="mx-1 w-12 text-center border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                                      className="p-1 text-gray-500 hover:text-gray-700"
                                    >
                                      +
                                    </button>
                                    
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProduct(item.id)}
                                      className="ml-2 text-red-600 hover:text-red-800"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-lg font-medium">
                                    {item.quantity}
                                  </span>
                                )}
                                
                                {!editMode && item.status !== 'pending' && (
                                  <div className="ml-4 flex items-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      item.status === 'completed' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {item.status === 'completed' 
                                        ? 'Concluído' 
                                        : 'Em Produção'}
                                    </span>
                                    
                                    {item.startTime && (
                                      <span className="ml-2 text-xs text-gray-500">
                                        Iniciado: {new Date(item.startTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                    )}
                                    
                                    {item.endTime && (
                                      <span className="ml-2 text-xs text-gray-500">
                                        Finalizado: {new Date(item.endTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                
                {/* Total Estimated Time */}
                {formData.items.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-md flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Tempo Total Estimado:</h3>
                      <div className="mt-1 text-lg font-semibold text-amber-600">
                        {formData.items.reduce((sum, item) => sum + (item.estimatedTime * item.quantity), 0)} minutos
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Quantidade Total:</h3>
                      <div className="mt-1 text-lg font-semibold text-amber-600 text-center">
                        {formData.items.reduce((sum, item) => sum + item.quantity, 0)} itens
                      </div>
                    </div>
                  </div>
                )}
                
                {isNewOrder && !formData.saleId && !isLinkingSale && !isSelectingProduct && (
                  <div className="border border-dashed border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-amber-600">
                        <LinkIcon className="h-5 w-5 mr-2" />
                        <span className="font-medium">Vincular à Venda</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLinkingSale(true);
                          setIsSelectingProduct(false);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Escolher Venda
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Vinculando a uma venda, os produtos e informações do cliente serão automaticamente preenchidos.
                    </p>
                  </div>
                )}
                
                {/* Tracking Events */}
                {!isNewOrder && !editMode && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Histórico de Rastreabilidade
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {mockProductionOrders.find(o => o.id === id)?.trackingEvents.map(event => (
                          <li key={event.id} className="p-3">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <span className="inline-flex h-8 w-8 rounded-full bg-amber-100 items-center justify-center">
                                  <Check className="h-5 w-5 text-amber-600" />
                                </span>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{event.description}</p>
                                <div className="mt-1 flex items-center text-xs text-gray-500">
                                  <span>{new Date(event.timestamp).toLocaleString('pt-BR')}</span>
                                  <span className="mx-1">•</span>
                                  <span>{event.userName}</span>
                                  {event.notes && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <span>{event.notes}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Selection Modal */}
        {isSelectingProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Selecionar Produto</h2>
                <button
                  type="button"
                  onClick={() => setIsSelectingProduct(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    placeholder="Pesquisar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {filteredProducts.map(product => (
                    <li key={product.id} className="py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-amber-100 flex items-center justify-center text-amber-600">
                            {product.category === 'Produção Própria' && (
                              <Utensils className="h-6 w-6" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddProduct(product)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                          Adicionar
                        </button>
                      </div>
                    </li>
                  ))}
                  {filteredProducts.length === 0 && (
                    <li className="py-4 text-center text-gray-500">
                      Nenhum produto encontrado
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Link Sales Modal */}
        {isLinkingSale && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Vincular à Venda</h2>
                <button
                  type="button"
                  onClick={() => setIsLinkingSale(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    placeholder="Pesquisar por ID ou cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {filteredSales.map(sale => (
                    <li key={sale.id} className="py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                            <ShoppingCart className="h-6 w-6" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Venda #{sale.id}
                              <span className="ml-2 text-xs text-gray-500">
                                {new Date(sale.date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {sale.customerDetails?.name || 'Cliente Não Identificado'} • 
                              {sale.items.length} itens • 
                              R${sale.total.toFixed(2)}
                            </div>
                            <div className="mt-1 text-xs text-gray-500 flex flex-wrap">
                              {sale.items.slice(0, 3).map(item => (
                                <span key={item.productId} className="mr-2">
                                  {item.productName} ({item.quantity})
                                </span>
                              ))}
                              {sale.items.length > 3 && <span>+{sale.items.length - 3} mais</span>}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleLinkSale(sale)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                          Vincular
                        </button>
                      </div>
                    </li>
                  ))}
                  {filteredSales.length === 0 && (
                    <li className="py-4 text-center text-gray-500">
                      Nenhuma venda encontrada
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          {editMode && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (isNewOrder) {
                    navigate('/production');
                  } else {
                    setEditMode(false);
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <Save className="h-4 w-4 mr-1" />
                {isNewOrder ? 'Criar Ordem' : 'Salvar Alterações'}
              </button>
            </>
          )}
          
          {!isNewOrder && !editMode && (
            <>
              <button
                type="button"
                onClick={() => navigate(`/production/${
                  formData.assignedArea === 'kitchen' ? 'kitchen' : 
                  formData.assignedArea === 'confectionery' ? 'confectionery' : 
                  'bakery'
                }`)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckSquare className="h-4 w-4 mr-1" />
                Atualizar Progresso
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};
export default ProductionOrder;
