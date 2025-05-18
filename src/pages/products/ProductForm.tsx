import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, DollarSign, Clipboard, Save, Link, Package, XCircle } from 'lucide-react';
import { mockProducts, mockProductCategories, mockInventory, mockRecipes } from '../../data/mockData';
import { Ingredient, Recipe } from '../../types/product';
import toast from 'react-hot-toast';
import { validateImage, ImageValidationOptions } from '../../utils/imageValidation';

// Logo validation options
const PRODUCT_IMAGE_VALIDATION_OPTIONS: ImageValidationOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  maxSizeInBytes: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
};

// Helper function to cleanup file input
const cleanupFileInput = (input: HTMLInputElement | null) => {
  if (input) {
    input.value = '';
  }
};

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== undefined && id !== 'new';
  
  const [formData, setFormData] = useState({
    name: '',
    internalCode: '',
    description: '',
    category: '',
    unitOfMeasure: 'un',
    price: 0,
    costPrice: 0,
    image: '',
    isActive: true,
    ingredients: [] as Ingredient[],
    recipeId: '',
    reorderPoint: 0,
    suggestedOrderQuantity: 0
  });

  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [recipeData, setRecipeData] = useState<Recipe>({
    id: '',
    name: '',
    steps: [''],
    preparationTime: 0,
    yield: 0,
    ingredients: []
  });
  
  useEffect(() => {
    if (isEditMode) {
      const product = mockProducts.find((p) => p.id === id);
      if (product) {
        setFormData({
          name: product.name,
          internalCode: product.internalCode || '',
          description: product.description,
          category: product.category,
          unitOfMeasure: product.unitOfMeasure || 'un',
          price: product.price,
          costPrice: product.costPrice,
          image: product.image || '',
          isActive: product.isActive,
          ingredients: [...product.ingredients],
          recipeId: product.recipeId || '',
          reorderPoint: product.reorderPoint || 0,
          suggestedOrderQuantity: product.suggestedOrderQuantity || 0
        });

        if (product.recipeId) {
          const recipe = mockRecipes.find(r => r.id === product.recipeId);
          if (recipe) {
            setRecipeData({
              id: recipe.id,
              name: recipe.name,
              steps: [...recipe.steps],
              preparationTime: recipe.preparationTime,
              yield: recipe.yield,
              ingredients: [...recipe.ingredients]
            });
            setShowRecipeForm(true);
          }
        }
      }
    } else {
      // Generate a new internal code for new products
      const generateCode = () => {
        const category = 'PRO';
        const lastProduct = mockProducts.slice().sort((a, b) => {
          const numA = a.internalCode ? parseInt(a.internalCode.replace(/\D/g, '')) : 0;
          const numB = b.internalCode ? parseInt(b.internalCode.replace(/\D/g, '')) : 0;
          return numB - numA;
        })[0];
        
        const lastNum = lastProduct?.internalCode 
          ? parseInt(lastProduct.internalCode.replace(/\D/g, ''))
          : 0;
        
        return `${category}${String(lastNum + 1).padStart(3, '0')}`;
      };
      
      setFormData(prev => ({
        ...prev,
        internalCode: generateCode()
      }));
    }
  }, [isEditMode, id]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: checked,
    });
  };
  
  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: `temp-${Date.now()}`,
      name: '',
      unitCost: 0,
      unitType: 'kg',
      quantity: 0,
      inventoryId: '',
    };
    
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, newIngredient],
    });
  };
  
  const removeIngredient = (index: number) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients.splice(index, 1);
    
    setFormData({
      ...formData,
      ingredients: updatedIngredients,
    });
  };
  
  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: field === 'quantity' || field === 'unitCost' ? parseFloat(value as string) : value,
    };
    
    // If inventory item selected, update other fields
    if (field === 'inventoryId' && value) {
      const inventoryItem = mockInventory.find(item => item.id === value);
      if (inventoryItem) {
        updatedIngredients[index] = {
          ...updatedIngredients[index],
          name: inventoryItem.name,
          unitCost: inventoryItem.costPerUnit,
          unitType: inventoryItem.unit,
        };
      }
    }
    
    // Recalculate cost price
    const newCostPrice = updatedIngredients.reduce(
      (sum, ing) => sum + (ing.quantity * ing.unitCost), 
      0
    );
    
    setFormData({
      ...formData,
      ingredients: updatedIngredients,
      costPrice: parseFloat(newCostPrice.toFixed(2)),
    });
  };

  // Recipe related handlers
  const handleRecipeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setRecipeData({
      ...recipeData,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleRecipeStepChange = (index: number, value: string) => {
    const updatedSteps = [...recipeData.steps];
    updatedSteps[index] = value;
    
    setRecipeData({
      ...recipeData,
      steps: updatedSteps
    });
  };

  const addRecipeStep = () => {
    setRecipeData({
      ...recipeData,
      steps: [...recipeData.steps, '']
    });
  };

  const removeRecipeStep = (index: number) => {
    const updatedSteps = [...recipeData.steps];
    updatedSteps.splice(index, 1);
    
    setRecipeData({
      ...recipeData,
      steps: updatedSteps
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name) {
      toast.error('Nome do produto é obrigatório');
      return;
    }

    if (!formData.internalCode) {
      toast.error('Código interno é obrigatório');
      return;
    }

    if (!formData.category) {
      toast.error('Categoria é obrigatória');
      return;
    }

    if (!formData.unitOfMeasure) {
      toast.error('Unidade de medida é obrigatória');
      return;
    }

    if (formData.category === 'Produção Própria' && formData.ingredients.length === 0) {
      toast.error('Produtos de produção própria devem ter ingredientes');
      return;
    }

    // In a real app, this would be an API call
    console.log('Saving product:', formData);
    if (showRecipeForm) {
      console.log('Saving recipe:', recipeData);
    }
    
    toast.success(isEditMode ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
    navigate('/products');
  };

  const unitOptions = [
    { value: 'un', label: 'Unidade (un)' },
    { value: 'kg', label: 'Quilograma (kg)' },
    { value: 'g', label: 'Grama (g)' },
    { value: 'l', label: 'Litro (l)' },
    { value: 'ml', label: 'Mililitro (ml)' },
    { value: 'cx', label: 'Caixa (cx)' },
    { value: 'pct', label: 'Pacote (pct)' },
  ];
  
  // Handle image upload with enhanced validation and cleanup
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const validationResult = await validateImage(file, PRODUCT_IMAGE_VALIDATION_OPTIONS);
      
      if (!validationResult.isValid) {
        toast.error(validationResult.error || 'Invalid image file');
        return;
      }

      const loadPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === 'string') {
            resolve(result);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const dataUrl = await loadPromise;
      
      setFormData(prev => ({
        ...prev,
        image: dataUrl
      }));
      toast.success('Image uploaded successfully!');

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error processing image');
    } finally {
      cleanupFileInput(event.target);
    }
  }, []);

  // Enhanced image removal with cleanup
  const handleImageRemoval = useCallback(() => {
    setFormData(prev => ({ ...prev, image: '' }));
    toast.success('Image removed successfully');
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </button>
        
        <h1 className="text-xl font-semibold text-gray-900">
          {isEditMode ? 'Editar Produto' : 'Novo Produto'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
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
                <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-gray-700">
                  Unidade de Medida*
                </label>
                <select
                  id="unitOfMeasure"
                  name="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                >
                  {unitOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome do Produto*
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
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição*
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Categoria*
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              >
                <option value="">Selecione uma categoria</option>
                {mockProductCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-red-500">
                Categoria é obrigatória
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Preço de Venda*
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">R$</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                    className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700">
                  Preço de Custo*
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">R$</span>
                  </div>
                  <input
                    type="number"
                    id="costPrice"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required={formData.category === 'Produção Própria'}
                    className={`block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                      formData.category === 'Produção Própria' ? 'bg-white' : 'bg-gray-100'
                    }`}
                    readOnly={formData.ingredients.length > 0}
                  />
                </div>
                {formData.ingredients.length > 0 ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Calculado a partir dos ingredientes
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Informe o custo de produção
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reorderPoint" className="block text-sm font-medium text-gray-700">
                  Ponto de Reposição
                </label>
                <input
                  type="number"
                  id="reorderPoint"
                  name="reorderPoint"
                  value={formData.reorderPoint}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Quantidade para alertar reposição
                </p>
              </div>
              
              <div>
                <label htmlFor="suggestedOrderQuantity" className="block text-sm font-medium text-gray-700">
                  Quantidade Sugerida
                </label>
                <input
                  type="number"
                  id="suggestedOrderQuantity"
                  name="suggestedOrderQuantity"
                  value={formData.suggestedOrderQuantity}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Quantidade sugerida para compra
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Produto ativo (disponível para venda)
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Product Image
              </label>
              <div className="mt-2 flex items-center space-x-4">
                {formData.image ? (
                  <div className="relative">
                    <img 
                      src={formData.image} 
                      alt="Product preview" 
                      className="h-32 w-32 object-cover rounded-md"
                      onError={(e) => {
                        toast.error('Error loading image');
                        handleImageRemoval();
                      }}
                    />
                    <button 
                      onClick={handleImageRemoval}
                      className="absolute -top-2 -right-2 bg-red-100 rounded-full text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <Package className="h-8 w-8 text-gray-400 mx-auto" />
                      <span className="mt-1 text-sm text-gray-500">No image</span>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col space-y-2">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500">
                    <span className="p-2 border border-amber-300 rounded-md">Select image</span>
                    <input 
                      type="file" 
                      className="sr-only" 
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="text-xs text-gray-500">
                    PNG, JPG or WebP (max 5MB). Recommended size 1200x1200px.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Ingredients and Recipe */}
          <div className="space-y-6">
            {formData.category === 'Produção Própria' && (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-amber-600" />
                    Ingredientes
                  </h3>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Ingrediente
                  </button>
                </div>
                
                {formData.ingredients.length === 0 ? (
                  <div className="bg-gray-50 rounded-md p-6 text-center">
                    <p className="text-sm text-gray-500">Nenhum ingrediente adicionado ainda</p>
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Primeiro Ingrediente
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="w-full space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Item do Inventário
                              </label>
                              <select
                                value={ingredient.inventoryId}
                                onChange={(e) => handleIngredientChange(index, 'inventoryId', e.target.value)}
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                              >
                                <option value="">Selecione um item</option>
                                {mockInventory.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name} ({item.quantity} {item.unit} disponível)
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Quantidade
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                  <input
                                    type="number"
                                    value={ingredient.quantity}
                                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                                    step="0.01"
                                    min="0"
                                    className="block w-full py-2 px-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                  />
                                  <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm rounded-r-md">
                                    {ingredient.unitType}
                                  </span>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Custo Unitário
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">R$</span>
                                  </div>
                                  <input
                                    type="number"
                                    value={ingredient.unitCost}
                                    onChange={(e) => handleIngredientChange(index, 'unitCost', e.target.value)}
                                    step="0.01"
                                    min="0"
                                    className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">{ingredient.unitType}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              Custo Total: R${(ingredient.quantity * ingredient.unitCost).toFixed(2)}
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="ml-2 p-1 rounded-full text-red-600 hover:text-red-800 focus:outline-none"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {formData.ingredients.length > 0 && (
                  <div className="bg-amber-50 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-amber-700">Preço de Custo Total:</span>
                      <span className="text-lg font-semibold text-amber-900">R${formData.costPrice.toFixed(2)}</span>
                    </div>
                    {formData.price > 0 && (
                      <>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-medium text-amber-700">Margem de Lucro:</span>
                          <span className="text-lg font-semibold text-amber-900">
                            {formData.costPrice > 0 
                              ? Math.round(((formData.price - formData.costPrice) / formData.price) * 100)
                              : 100}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-medium text-amber-700">Lucro por Unidade:</span>
                          <span className="text-lg font-semibold text-amber-900">
                            R${(formData.price - formData.costPrice).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Recipe/Technical Sheet Section */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Clipboard className="h-5 w-5 mr-2 text-amber-600" />
                      Ficha Técnica / Receita
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowRecipeForm(!showRecipeForm)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      {showRecipeForm ? (
                        <>
                          <Link className="h-4 w-4 mr-1" />
                          Ocultar Ficha Técnica
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar Ficha Técnica
                        </>
                      )}
                    </button>
                  </div>

                  {showRecipeForm ? (
                    <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm space-y-4">
                      <div>
                        <label htmlFor="recipeName" className="block text-sm font-medium text-gray-700">
                          Nome da Receita*
                        </label>
                        <input
                          type="text"
                          id="recipeName"
                          name="name"
                          value={recipeData.name}
                          onChange={handleRecipeInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-700">
                            Tempo de Preparo (minutos)*
                          </label>
                          <input
                            type="number"
                            id="preparationTime"
                            name="preparationTime"
                            value={recipeData.preparationTime}
                            onChange={handleRecipeInputChange}
                            min="1"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="yield" className="block text-sm font-medium text-gray-700">
                            Rendimento (unidades)*
                          </label>
                          <input
                            type="number"
                            id="yield"
                            name="yield"
                            value={recipeData.yield}
                            onChange={handleRecipeInputChange}
                            min="1"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Modo de Preparo*
                          </label>
                          <button
                            type="button"
                            onClick={addRecipeStep}
                            className="inline-flex items-center px-2 py-1 text-xs border border-transparent rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar Passo
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {recipeData.steps.map((step, index) => (
                            <div key={index} className="flex items-start">
                              <div className="flex-shrink-0 flex items-center h-10 mr-2">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-grow">
                                <input
                                  type="text"
                                  value={step}
                                  onChange={(e) => handleRecipeStepChange(index, e.target.value)}
                                  placeholder={`Passo ${index + 1}`}
                                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                />
                              </div>
                              {recipeData.steps.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeRecipeStep(index)}
                                  className="ml-2 p-1 rounded-full text-red-600 hover:text-red-800 focus:outline-none"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-md p-6 text-center">
                      <p className="text-sm text-gray-500">
                        Adicione uma ficha técnica para este produto de produção própria
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            {isEditMode ? 'Atualizar Produto' : 'Criar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
};