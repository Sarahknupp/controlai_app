import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { mockInventory, mockSuppliers } from '../../data/mockData';
import toast from 'react-hot-toast';

export const InventoryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== undefined && id !== 'new';
  
  const [formData, setFormData] = useState({
    name: '',
    internalCode: '',
    quantity: 0,
    unit: 'kg',
    minimumLevel: 0,
    reorderPoint: 0,
    suggestedOrderQuantity: 0,
    expiryDate: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    costPerUnit: 0,
    supplierId: '',
    location: '',
  });
  
  useEffect(() => {
    if (isEditMode) {
      const item = mockInventory.find((item) => item.id === id);
      if (item) {
        setFormData({
          name: item.name,
          internalCode: item.internalCode || '',
          quantity: item.quantity,
          unit: item.unit,
          minimumLevel: item.minimumLevel,
          reorderPoint: item.reorderPoint || item.minimumLevel + 2,
          suggestedOrderQuantity: item.suggestedOrderQuantity || item.minimumLevel * 2,
          expiryDate: item.expiryDate ? item.expiryDate.toISOString().split('T')[0] : '',
          purchaseDate: item.purchaseDate.toISOString().split('T')[0],
          costPerUnit: item.costPerUnit,
          supplierId: item.supplierId,
          location: item.location,
        });
      }
    } else {
      // Generate a new internal code for new inventory items
      const generateCode = () => {
        const category = 'MP';
        const lastItem = mockInventory.slice().sort((a, b) => {
          const numA = a.internalCode ? parseInt(a.internalCode.replace(/\D/g, '')) : 0;
          const numB = b.internalCode ? parseInt(b.internalCode.replace(/\D/g, '')) : 0;
          return numB - numA;
        })[0];
        
        const lastNum = lastItem?.internalCode 
          ? parseInt(lastItem.internalCode.replace(/\D/g, ''))
          : 0;
        
        return `${category}${String(lastNum + 1).padStart(3, '0')}`;
      };
      
      setFormData(prev => ({
        ...prev,
        internalCode: generateCode()
      }));
    }
  }, [isEditMode, id]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value,
    });

    // Update reorderPoint and suggestedOrderQuantity when minimumLevel changes
    if (name === 'minimumLevel') {
      const minLevel = parseFloat(value);
      setFormData(prev => ({
        ...prev,
        minimumLevel: minLevel,
        reorderPoint: prev.reorderPoint || minLevel + 2,
        suggestedOrderQuantity: prev.suggestedOrderQuantity || minLevel * 2
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name) {
      toast.error('Nome do item é obrigatório');
      return;
    }

    if (!formData.internalCode) {
      toast.error('Código interno é obrigatório');
      return;
    }
    
    // In a real app, this would be an API call
    console.log('Saving inventory item:', formData);
    
    toast.success(isEditMode ? 'Item atualizado com sucesso!' : 'Item adicionado com sucesso!');
    navigate('/inventory');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/inventory')}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </button>
        
        <h1 className="text-xl font-semibold text-gray-900">
          {isEditMode ? 'Editar Item de Estoque' : 'Adicionar Item de Estoque'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="internalCode" className="block text-sm font-medium text-gray-700">
              Código Interno*
            </label>
            <input
              type="text"
              id="internalCode"
              name="internalCode"
              value={formData.internalCode}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome do Item*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantidade*
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                Unidade*
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              >
                <option value="kg">Quilogramas (kg)</option>
                <option value="g">Gramas (g)</option>
                <option value="liter">Litros</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="unit">Unidades</option>
                <option value="dozen">Dúzia</option>
                <option value="box">Caixa</option>
                <option value="package">Pacote</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="minimumLevel" className="block text-sm font-medium text-gray-700">
              Nível Mínimo*
            </label>
            <input
              type="number"
              id="minimumLevel"
              name="minimumLevel"
              value={formData.minimumLevel}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Sistema alertará quando quantidade cair abaixo deste nível
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="reorderPoint" className="block text-sm font-medium text-gray-700">
                Ponto de Reposição*
              </label>
              <input
                type="number"
                id="reorderPoint"
                name="reorderPoint"
                value={formData.reorderPoint}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Quantidade para entrar na lista de compras
              </p>
            </div>

            <div>
              <label htmlFor="suggestedOrderQuantity" className="block text-sm font-medium text-gray-700">
                Quantidade Sugerida*
              </label>
              <input
                type="number"
                id="suggestedOrderQuantity"
                name="suggestedOrderQuantity"
                value={formData.suggestedOrderQuantity}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Quantidade sugerida para pedido
              </p>
            </div>
          </div>
          
          <div>
            <label htmlFor="costPerUnit" className="block text-sm font-medium text-gray-700">
              Custo por Unidade*
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">R$</span>
              </div>
              <input
                type="number"
                id="costPerUnit"
                name="costPerUnit"
                value={formData.costPerUnit}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                className="mt-1 block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 sm:text-sm">por {formData.unit}</span>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
              Data de Compra*
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
              Data de Validade
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Deixe em branco para itens não perecíveis
            </p>
          </div>
          
          <div>
            <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700">
              Fornecedor
            </label>
            <select
              id="supplierId"
              name="supplierId"
              value={formData.supplierId}
              onChange={handleInputChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            >
              <option value="">Selecione um fornecedor</option>
              {mockSuppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Local de Armazenamento
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              placeholder="ex: Refrigerador 1, Armazém Seco B3"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            {isEditMode ? 'Atualizar Item' : 'Adicionar Item'}
          </button>
        </div>
      </form>
    </div>
  );
};