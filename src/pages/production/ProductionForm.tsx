import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, User, Calendar, Search } from 'lucide-react';
import { mockProducts, mockUsers } from '../../data/mockData';

export const ProductionForm: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    assignedTo: '',
    notes: '',
    products: [] as { productId: string; productName: string; quantity: number }[],
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter products based on search term
  const filteredProducts = mockProducts.filter(
    (product) => product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const addProduct = (product: typeof mockProducts[0]) => {
    // Check if product already exists in form
    if (formData.products.some(p => p.productId === product.id)) {
      return;
    }
    
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
        },
      ],
    });
    
    setSearchTerm('');
  };
  
  const removeProduct = (productId: string) => {
    setFormData({
      ...formData,
      products: formData.products.filter(p => p.productId !== productId),
    });
  };
  
  const updateProductQuantity = (productId: string, quantity: number) => {
    setFormData({
      ...formData,
      products: formData.products.map(p => 
        p.productId === productId 
          ? { ...p, quantity: Math.max(1, quantity) } 
          : p
      ),
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would be an API call
    console.log('Creating production plan:', formData);
    
    navigate('/production');
  };
  
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
        
        <h1 className="text-xl font-semibold text-gray-900">
          New Production Plan
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Plan Details */}
          <div className="space-y-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Production Date*
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                Assigned To*
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                >
                  <option value="">Select a staff member</option>
                  {mockUsers
                    .filter(user => user.role === 'staff')
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="Any special instructions or notes for this production plan"
              />
            </div>
            
            <div className={`${formData.products.length === 0 ? 'block' : 'hidden'} bg-amber-50 p-4 rounded-md text-center`}>
              <p className="text-sm text-amber-800">
                Add products to your production plan using the search on the right
              </p>
            </div>
            
            {formData.products.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Products in Plan
                </h3>
                <div className="space-y-3">
                  {formData.products.map((product) => (
                    <div key={product.productId} className="bg-gray-50 rounded-md p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => updateProductQuantity(product.productId, product.quantity - 1)}
                            className="text-gray-500 hover:text-gray-700 p-1"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={product.quantity}
                            onChange={(e) => updateProductQuantity(product.productId, parseInt(e.target.value, 10) || 1)}
                            min="1"
                            className="w-16 text-center border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => updateProductQuantity(product.productId, product.quantity + 1)}
                            className="text-gray-500 hover:text-gray-700 p-1"
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeProduct(product.productId)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-amber-800">Total Items:</span>
                    <span className="text-lg font-semibold text-amber-900">
                      {formData.products.reduce((acc, p) => acc + p.quantity, 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Product Search and Selection */}
          <div className="space-y-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search Products
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  placeholder="Type to search products..."
                />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">Available Products</h3>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No products found. Try a different search term.
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => addProduct(product)}
                          disabled={formData.products.some(p => p.productId === product.id)}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                            formData.products.some(p => p.productId === product.id)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'text-white bg-amber-600 hover:bg-amber-700'
                          }`}
                        >
                          {formData.products.some(p => p.productId === product.id) ? (
                            'Added'
                          ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/production')}
            className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={formData.products.length === 0}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Create Production Plan
          </button>
        </div>
      </form>
    </div>
  );
};