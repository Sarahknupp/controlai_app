import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, X, Clock, User, Edit, Calendar, Trash2 } from 'lucide-react';
import { mockProductionPlans, mockUsers } from '../../data/mockData';

export const ProductionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const plan = mockProductionPlans.find((p) => p.id === id);
  const [editMode, setEditMode] = useState(false);
  const [updatedProducts, setUpdatedProducts] = useState(plan?.products || []);
  
  if (!plan) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-700">Production plan not found</h2>
        <button
          onClick={() => navigate('/production')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Production
        </button>
      </div>
    );
  }
  
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleProductUpdate = (productId: string, field: 'completed' | 'wasted', value: number) => {
    setUpdatedProducts(prev => 
      prev.map(product => 
        product.productId === productId 
          ? { ...product, [field]: value } 
          : product
      )
    );
  };
  
  const handleSaveProgress = () => {
    // In a real app, this would be an API call
    console.log('Saving production progress:', updatedProducts);
    setEditMode(false);
  };
  
  const assignedUser = mockUsers.find(user => user.id === plan.assignedTo);
  
  // Calculate completion percentage
  const totalItems = plan.products.reduce((acc, p) => acc + p.quantity, 0);
  const completedItems = plan.products.reduce((acc, p) => acc + p.completed, 0);
  const completionPercentage = Math.round((completedItems / totalItems) * 100);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/production')}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        
        <div className="flex space-x-3">
          {plan.status === 'in-progress' && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <Edit className="h-4 w-4 mr-1" />
              Update Progress
            </button>
          )}
          {editMode && (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProgress}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Check className="h-4 w-4 mr-1" />
                Save Progress
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Production Plan #{plan.id.slice(-4)}
            </h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
              {plan.status === 'planned' ? 'Planned' : plan.status === 'in-progress' ? 'In Progress' : 'Completed'}
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Created for {formatDate(plan.date)}
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Production Summary */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-amber-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-amber-800 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Production Details
                </h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-gray-700">Date: </span>
                    <span className="ml-2 font-medium">{formatDate(plan.date)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-gray-700">Assigned to: </span>
                    <span className="ml-2 font-medium">{assignedUser?.name || `Staff #${plan.assignedTo}`}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-gray-700">Completion: </span>
                    <span className="ml-2 font-medium">{completionPercentage}%</span>
                  </div>
                </div>
                {plan.notes && (
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <h4 className="text-xs font-medium text-amber-800">Notes:</h4>
                    <p className="mt-1 text-sm text-amber-900">{plan.notes}</p>
                  </div>
                )}
              </div>
              
              {plan.status !== 'planned' && (
                <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
                  <h3 className="text-sm font-medium text-gray-700">Production Statistics</h3>
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Completion Rate:</span>
                        <span className="font-medium text-gray-900">{completionPercentage}%</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Waste Rate:</span>
                        <span className="font-medium text-gray-900">
                          {Math.round((plan.products.reduce((acc, p) => acc + p.wasted, 0) / totalItems) * 100)}%
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.round((plan.products.reduce((acc, p) => acc + p.wasted, 0) / totalItems) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-xs text-gray-500">Total Items</div>
                          <div className="mt-1 text-lg font-semibold text-gray-900">{totalItems}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Completed</div>
                          <div className="mt-1 text-lg font-semibold text-green-600">{completedItems}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">In Progress</div>
                          <div className="mt-1 text-lg font-semibold text-amber-600">
                            {plan.status === 'in-progress' ? totalItems - completedItems : 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Wasted</div>
                          <div className="mt-1 text-lg font-semibold text-red-600">
                            {plan.products.reduce((acc, p) => acc + p.wasted, 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Plan
                </button>
                <button
                  type="button"
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
            
            {/* Product List */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Production Items</h3>
              
              <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target
                      </th>
                      {plan.status !== 'planned' && (
                        <>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Completed
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Wasted
                          </th>
                        </>
                      )}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(editMode ? updatedProducts : plan.products).map((product) => (
                      <tr key={product.productId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.quantity}</div>
                        </td>
                        {plan.status !== 'planned' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editMode ? (
                                <input
                                  type="number"
                                  value={product.completed}
                                  onChange={(e) => handleProductUpdate(
                                    product.productId, 
                                    'completed', 
                                    Math.min(product.quantity, parseInt(e.target.value, 10) || 0)
                                  )}
                                  min="0"
                                  max={product.quantity}
                                  className="block w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                />
                              ) : (
                                <div className="text-sm text-green-600 font-medium">
                                  {product.completed}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editMode ? (
                                <input
                                  type="number"
                                  value={product.wasted}
                                  onChange={(e) => handleProductUpdate(
                                    product.productId, 
                                    'wasted', 
                                    Math.min(product.quantity, parseInt(e.target.value, 10) || 0)
                                  )}
                                  min="0"
                                  max={product.quantity}
                                  className="block w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                />
                              ) : (
                                <div className="text-sm text-red-600 font-medium">
                                  {product.wasted}
                                </div>
                              )}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {plan.status !== 'planned' ? (
                            <div>
                              <div className="text-xs text-gray-500">
                                {Math.round((product.completed / product.quantity) * 100)}%
                              </div>
                              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${Math.round((product.completed / product.quantity) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-yellow-600">Not started</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};