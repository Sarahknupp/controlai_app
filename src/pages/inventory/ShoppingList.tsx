import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, MailIcon, Printer, ShoppingCart, Truck, Trash2, Edit, Plus, Save } from 'lucide-react';
import { getShoppingList } from '../../data/mockData';
import toast from 'react-hot-toast';

export const ShoppingList: React.FC = () => {
  const navigate = useNavigate();
  const shoppingListItems = getShoppingList();
  const [editMode, setEditMode] = useState(false);
  const [items, setItems] = useState(shoppingListItems);
  
  const handleQuantityChange = (id: string, value: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, suggestedOrderQuantity: value } : item
    ));
  };
  
  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };
  
  const handleSave = () => {
    // In a real app, this would be an API call
    console.log('Saving shopping list:', items);
    toast.success('Lista de compras salva com sucesso!');
    setEditMode(false);
  };
  
  const handleExport = (format: 'pdf' | 'excel' | 'email') => {
    // In a real app, this would trigger the appropriate export action
    console.log(`Exporting shopping list as ${format}`);
    toast.success(`Lista exportada em formato ${format.toUpperCase()}`);
  };
  
  const handleCreateOrder = () => {
    // In a real app, this would create a purchase order
    console.log('Creating purchase order');
    toast.success('Ordem de compra criada com sucesso!');
    navigate('/inventory');
  };
  
  // Calculate totals
  const totalItems = items.length;
  const estimatedTotal = items.reduce((sum, item) => 
    sum + (item.lastPurchasePrice || 0) * item.suggestedOrderQuantity, 0);
  
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
        
        <h1 className="text-xl font-semibold text-gray-900 flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2 text-amber-600" />
          Lista de Compras
        </h1>
        
        <div className="flex space-x-2">
          {editMode ? (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <Save className="h-4 w-4 mr-1" />
                Salvar Alterações
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar Lista
            </button>
          )}
        </div>
      </div>
      
      {/* Summary Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-amber-50 px-4 py-5 border-b border-amber-100 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-amber-900">
            Resumo da Lista de Compras
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-amber-600">
            Itens que precisam ser repostos no estoque.
          </p>
        </div>
        
        <div className="bg-white px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-md p-4">
              <dl>
                <dt className="text-sm font-medium text-blue-700 truncate">
                  Total de Itens
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-900">
                  {totalItems}
                </dd>
              </dl>
            </div>
            
            <div className="bg-blue-50 rounded-md p-4">
              <dl>
                <dt className="text-sm font-medium text-blue-700 truncate">
                  Valor Estimado
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-900">
                  R${estimatedTotal.toFixed(2)}
                </dd>
              </dl>
            </div>
            
            <div className="bg-blue-50 rounded-md p-4">
              <dl>
                <dt className="text-sm font-medium text-blue-700 truncate">
                  Fornecedores
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-900">
                  {new Set(items.map(item => item.supplierName)).size}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50 flex justify-between items-center flex-wrap gap-2">
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <Download className="h-4 w-4 mr-1" />
              Excel
            </button>
            <button
              onClick={() => handleExport('email')}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <MailIcon className="h-4 w-4 mr-1" />
              Email
            </button>
            <button
              onClick={() => {}}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <Printer className="h-4 w-4 mr-1" />
              Imprimir
            </button>
          </div>
          
          <button
            onClick={handleCreateOrder}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Truck className="h-4 w-4 mr-1" />
            Criar Ordem de Compra
          </button>
        </div>
      </div>
      
      {/* Shopping List Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estoque Atual
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mínimo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade a Comprar
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço Estimado
                </th>
                {editMode && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    Nenhum item adicionado. Adicione itens manualmente ou através da leitura da nota fiscal.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.internalCode || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.supplierName || 'Não definido'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600 font-medium">{item.currentQuantity} {item.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.minimumQuantity} {item.unit}</div>
                      <div className="text-xs text-gray-500">Reordenar em: {item.reorderPoint} {item.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editMode ? (
                        <input
                          type="number"
                          value={item.suggestedOrderQuantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          min="1"
                          className="block w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        />
                      ) : (
                        <div className="text-sm font-medium text-blue-600">{item.suggestedOrderQuantity} {item.unit}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.lastPurchasePrice 
                          ? `R$${(item.lastPurchasePrice * item.suggestedOrderQuantity).toFixed(2)}`
                          : '-'
                        }
                      </div>
                      {item.lastPurchasePrice && (
                        <div className="text-xs text-gray-500">
                          R${item.lastPurchasePrice.toFixed(2)}/{item.unit}
                        </div>
                      )}
                    </td>
                    {editMode && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {items.length === 0 && (
          <div className="text-center py-10">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Lista de compras vazia</h3>
            <p className="mt-1 text-sm text-gray-500">
              Não há itens que precisem ser repostos no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};