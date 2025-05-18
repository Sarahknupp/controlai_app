import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { mockProducts } from '../../data/mockData';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const product = mockProducts.find((p) => p.id === id);
  
  if (!product) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-700">Product not found</h2>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/products/edit/${product.id}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Image */}
            <div className="lg:col-span-1">
              <div className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-200 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-center object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400 text-lg">No image</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 bg-amber-50 rounded-md p-4">
                <h3 className="text-sm font-medium text-amber-800 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Pricing Information
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-1">
                    <div className="text-gray-500">Selling Price</div>
                    <div className="font-semibold text-gray-900">${product.price.toFixed(2)}</div>
                  </div>
                  <div className="col-span-1">
                    <div className="text-gray-500">Cost Price</div>
                    <div className="font-semibold text-gray-900">${product.costPrice.toFixed(2)}</div>
                  </div>
                  <div className="col-span-1">
                    <div className="text-gray-500">Profit</div>
                    <div className="font-semibold text-green-600">${(product.price - product.costPrice).toFixed(2)}</div>
                  </div>
                  <div className="col-span-1">
                    <div className="text-gray-500">Margin</div>
                    <div className="font-semibold text-green-600">
                      {Math.round(((product.price - product.costPrice) / product.price) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                    {product.category}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{product.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-amber-600" />
                  Ingredients
                </h3>
                <div className="mt-3 bg-white border border-gray-200 rounded-md shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ingredient
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Cost
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {product.ingredients.map((ingredient) => (
                        <tr key={ingredient.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {ingredient.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ingredient.quantity} {ingredient.unitType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${ingredient.unitCost.toFixed(2)}/{ingredient.unitType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${(ingredient.quantity * ingredient.unitCost).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                          Total Ingredient Cost
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${product.costPrice.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-md p-4">
                  <h3 className="text-sm font-medium text-green-800">Production Information</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Last produced: 2 days ago</p>
                    <p>Average daily production: 15 units</p>
                    <p>Batch size: 10 units</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-md p-4">
                  <h3 className="text-sm font-medium text-blue-800">Sales Information</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Last week sales: 87 units</p>
                    <p>Revenue this month: $412.53</p>
                    <p>Popularity rank: #2 in {product.category}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};