import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, DollarSign, Package, Users, File, Plus, Minus, Trash2, Search, CreditCard, Bone as Money, Clock, FileText, BarChart2, FileDigit, Utensils, Table, ShoppingBag, Receipt, Truck, CheckCircle, Settings } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { mockProducts, mockSales } from '../../data/mockData';
import { Product } from '../../types/product';
import { SaleItem } from '../../types/sale';
import toast from 'react-hot-toast';

const POS: React.FC = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isNFCeModalOpen, setIsNFCeModalOpen] = useState(false);
  const [isNFeModalOpen, setIsNFeModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
  });
  const [cashReceived, setCashReceived] = useState<string>('');
  const [paymentStep, setPaymentStep] = useState<number>(1);
  const [activeTables, setActiveTables] = useState<number[]>([1, 3, 5]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  
  // Get unique categories from products
  const productCategories = [...new Set(mockProducts.map(product => product.category))];
  
  // Filter products based on search term and category
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !activeCategory || product.category === activeCategory;
    return matchesSearch && matchesCategory && product.isActive;
  });
  
  // Focus on search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    
    // Setup key bindings
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleNewSale();
      } else if (e.key === 'F8' && cart.length > 0) {
        e.preventDefault();
        setIsPaymentModalOpen(true);
      } else if (e.key === 'F9') {
        e.preventDefault();
        setIsNFCeModalOpen(true);
      } else if (e.key === 'F10') {
        e.preventDefault();
        setIsNFeModalOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);
  
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCart(
        cart.map(item => 
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
          total: product.price
        }
      ]);
    }
    
    toast.success(`${product.name} adicionado`);
  };
  
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
      return;
    }
    
    setCart(
      cart.map(item =>
        item.productId === productId
          ? { ...item, quantity, total: quantity * item.unitPrice }
          : item
      )
    );
  };
  
  const removeItem = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };
  
  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };
  
  const getTax = () => {
    // Simplified tax calculation - 9% of subtotal
    return getSubtotal() * 0.09;
  };
  
  const getTotal = () => {
    return getSubtotal() + getTax();
  };
  
  const handleNewSale = () => {
    setCart([]);
    setSearchTerm('');
    setCustomerInfo({
      name: '',
      document: '',
      email: '',
      phone: '',
    });
    setCashReceived('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      toast.error('Selecione um método de pagamento');
      return;
    }
    
    if (selectedPaymentMethod === 'cash' && !cashReceived) {
      toast.error('Informe o valor recebido');
      return;
    }
    
    // In a real app, this would be an API call
    const saleData = {
      id: `SAL-${new Date().getTime()}`,
      date: new Date(),
      items: cart,
      subtotal: getSubtotal(),
      tax: getTax(),
      total: getTotal(),
      paymentMethod: selectedPaymentMethod,
      status: 'completed',
      cashierId: '1', // Mock user ID
      customerDetails: customerInfo.name ? {
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email,
      } : undefined,
    };
    
    console.log('Sale completed:', saleData);
    
    toast.success('Venda realizada com sucesso!');
    setIsPaymentModalOpen(false);
    
    // Show change dialog if cash payment
    if (selectedPaymentMethod === 'cash') {
      const change = parseFloat(cashReceived) - getTotal();
      if (change > 0) {
        toast.success(`Troco: R$ ${change.toFixed(2)}`, { duration: 5000 });
      }
    }
    
    // Reset state
    handleNewSale();
  };
  
  const handleNFCeEmission = () => {
    // In a real app, this would trigger NFCe emission
    toast.success('NFCe emitida com sucesso!');
    setIsNFCeModalOpen(false);
  };
  
  const handleNFeEmission = () => {
    // In a real app, this would trigger NFe emission
    toast.success('NFe emitida com sucesso!');
    setIsNFeModalOpen(false);
  };
  
  const handleTableSelection = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    // In a real app, this would load the table's existing order
    setIsTableModalOpen(false);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', 
      currency: 'BRL'
    }).format(value);
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Top Bar with Quick Actions */}
      <div className="bg-gray-100 p-4 border-b border-gray-200 grid grid-cols-2 md:grid-cols-5 gap-4">
        <Button 
          className="flex items-center justify-center bg-amber-600 hover:bg-amber-700 h-16 text-white font-medium"
          onClick={() => setIsNFCeModalOpen(true)}
        >
          <Receipt className="mr-2 h-5 w-5" />
          <div className="flex flex-col items-start">
            <span className="text-sm">Emitir NFCe</span>
            <span className="text-xs opacity-75">F9</span>
          </div>
        </Button>
        
        <Button 
          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 h-16 text-white font-medium"
          onClick={() => setIsNFeModalOpen(true)}
        >
          <FileDigit className="mr-2 h-5 w-5" />
          <div className="flex flex-col items-start">
            <span className="text-sm">Emitir NFe</span>
            <span className="text-xs opacity-75">F10</span>
          </div>
        </Button>
        
        <Button 
          className="flex items-center justify-center bg-green-600 hover:bg-green-700 h-16 text-white font-medium"
          onClick={() => setIsOrderModalOpen(true)}
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          <div className="flex flex-col items-start">
            <span className="text-sm">Pedidos</span>
            <span className="text-xs opacity-75">F11</span>
          </div>
        </Button>
        
        <Button 
          className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 h-16 text-white font-medium"
          onClick={() => setIsTableModalOpen(true)}
        >
          <Table className="mr-2 h-5 w-5" />
          <div className="flex flex-col items-start">
            <span className="text-sm">Mesas</span>
            <span className="text-xs opacity-75">F12</span>
          </div>
        </Button>
        
        <Button 
          className="flex items-center justify-center bg-gray-700 hover:bg-gray-800 h-16 text-white font-medium"
          onClick={() => navigate('/dashboard')}
        >
          <Settings className="mr-2 h-5 w-5" />
          <div className="flex flex-col items-start">
            <span className="text-sm">Configurações</span>
          </div>
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row bg-gray-50 overflow-hidden">
        {/* Left Side - Products */}
        <div className="md:w-8/12 flex flex-col overflow-hidden">
          {/* Search and Categories */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg"
                placeholder="Pesquisar produtos (F2)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex overflow-x-auto pb-2 space-x-2">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  !activeCategory
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveCategory(null)}
              >
                Todos
              </button>
              {productCategories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                    activeCategory === category
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="flex-1 overflow-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-md transition-shadow"
                onClick={() => addToCart(product)}
              >
                <div className="w-full h-28 mb-3 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="w-full text-center">
                  <h3 className="text-md font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-lg font-semibold text-amber-600">{formatCurrency(product.price)}</p>
                </div>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full flex items-center justify-center h-40 text-gray-500">
                Nenhum produto encontrado
              </div>
            )}
          </div>
        </div>
        
        {/* Right Side - Cart and Checkout */}
        <div className="md:w-4/12 border-l border-gray-200 flex flex-col bg-white overflow-hidden">
          {/* Cart Header */}
          <div className="p-4 bg-amber-600 text-white flex justify-between items-center">
            <div className="flex items-center">
              <ShoppingCart className="h-6 w-6 mr-2" />
              <h2 className="text-lg font-semibold">Carrinho</h2>
            </div>
            <Button
              variant="outline"
              className="bg-amber-700 border-amber-100 text-white hover:bg-amber-800"
              onClick={handleNewSale}
            >
              Nova Venda (F4)
            </Button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <ShoppingCart className="h-12 w-12 mb-2" />
                <p>Seu carrinho está vazio</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="bg-gray-50 rounded-md p-3">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h3 className="text-md font-medium text-gray-900">{item.productName}</h3>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.unitPrice)} x {item.quantity} = {formatCurrency(item.total)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <span className="text-gray-700 w-8 text-center">{item.quantity}</span>
                        
                        <button
                          className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        
                        <button
                          className="p-1 rounded-full text-red-500 hover:bg-red-100"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Cart Summary */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(getSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Impostos (9%):</span>
                <span className="font-medium">{formatCurrency(getTax())}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-semibold text-amber-600">{formatCurrency(getTotal())}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="h-14 bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={() => {
                  setCustomerInfo({
                    name: 'Cliente Teste',
                    document: '123.456.789-00',
                    email: 'cliente@teste.com',
                    phone: '(11) 98765-4321',
                  });
                  toast.success('Cliente adicionado');
                }}
              >
                <Users className="h-5 w-5 mr-2" />
                Cliente
              </Button>
              
              <Button
                className="h-14 bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={() => navigate('/products')}
              >
                <Package className="h-5 w-5 mr-2" />
                Produtos
              </Button>
              
              <Button
                className="col-span-2 h-16 bg-green-600 hover:bg-green-700 text-white text-lg"
                disabled={cart.length === 0}
                onClick={() => {
                  setSelectedPaymentMethod('');
                  setCashReceived('');
                  setPaymentStep(1);
                  setIsPaymentModalOpen(true);
                }}
              >
                <CreditCard className="h-6 w-6 mr-2" />
                Finalizar Venda (F8)
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Venda - {formatCurrency(getTotal())}</DialogTitle>
          </DialogHeader>
          
          {paymentStep === 1 && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button
                className="h-20 flex flex-col items-center justify-center bg-green-100 text-green-800 hover:bg-green-200 border-2 border-green-300"
                onClick={() => {
                  setSelectedPaymentMethod('cash');
                  setPaymentStep(2);
                }}
              >
                <Money className="h-8 w-8 mb-2" />
                <span>Dinheiro</span>
              </Button>
              
              <Button
                className="h-20 flex flex-col items-center justify-center bg-blue-100 text-blue-800 hover:bg-blue-200 border-2 border-blue-300"
                onClick={() => {
                  setSelectedPaymentMethod('credit');
                  setPaymentStep(3);
                }}
              >
                <CreditCard className="h-8 w-8 mb-2" />
                <span>Cartão de Crédito</span>
              </Button>
              
              <Button
                className="h-20 flex flex-col items-center justify-center bg-purple-100 text-purple-800 hover:bg-purple-200 border-2 border-purple-300"
                onClick={() => {
                  setSelectedPaymentMethod('debit');
                  setPaymentStep(3);
                }}
              >
                <CreditCard className="h-8 w-8 mb-2" />
                <span>Cartão de Débito</span>
              </Button>
              
              <Button
                className="h-20 flex flex-col items-center justify-center bg-amber-100 text-amber-800 hover:bg-amber-200 border-2 border-amber-300"
                onClick={() => {
                  setSelectedPaymentMethod('pix');
                  setPaymentStep(3);
                }}
              >
                <File className="h-8 w-8 mb-2" />
                <span>PIX</span>
              </Button>
            </div>
          )}
          
          {paymentStep === 2 && (
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="cashReceived" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Recebido
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">R$</span>
                  </div>
                  <input
                    type="number"
                    id="cashReceived"
                    className="focus:ring-amber-500 focus:border-amber-500 block w-full pl-8 pr-12 sm:text-sm border-gray-300 rounded-md py-3 text-lg"
                    placeholder="0.00"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              
              {cashReceived && parseFloat(cashReceived) >= getTotal() && (
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="flex justify-between items-center text-green-800">
                    <span className="font-medium">Troco:</span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(parseFloat(cashReceived) - getTotal())}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPaymentStep(1)}
                >
                  Voltar
                </Button>
                
                <Button
                  onClick={handlePayment}
                  disabled={!cashReceived || parseFloat(cashReceived) < getTotal()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Finalizar Pagamento
                </Button>
              </div>
            </div>
          )}
          
          {paymentStep === 3 && (
            <div className="space-y-4 py-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="text-blue-800 font-medium mb-2">
                  {selectedPaymentMethod === 'credit' && 'Pagamento com Cartão de Crédito'}
                  {selectedPaymentMethod === 'debit' && 'Pagamento com Cartão de Débito'}
                  {selectedPaymentMethod === 'pix' && 'Pagamento com PIX'}
                </h3>
                <p className="text-blue-600 text-sm">
                  Valor a pagar: {formatCurrency(getTotal())}
                </p>
                {selectedPaymentMethod === 'pix' && (
                  <div className="mt-3 bg-white p-3 rounded-md border border-blue-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto bg-gray-200 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">QR Code PIX</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPaymentStep(1)}
                >
                  Voltar
                </Button>
                
                <Button
                  onClick={handlePayment}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Confirmar Pagamento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* NFCe Modal */}
      <Dialog open={isNFCeModalOpen} onOpenChange={setIsNFCeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Emitir Nota Fiscal de Consumidor Eletrônica</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <h3 className="text-amber-800 font-medium flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                Emissão de NFCe
              </h3>
              <p className="mt-2 text-sm text-amber-600">
                A NFCe será emitida para a venda atual. Certifique-se de que os produtos e quantidades estão corretos.
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="customerDocument" className="block text-sm font-medium text-gray-700">
                  CPF/CNPJ do Cliente (Opcional)
                </label>
                <Input
                  id="customerDocument"
                  value={customerInfo.document}
                  onChange={(e) => setCustomerInfo({...customerInfo, document: e.target.value})}
                  placeholder="Ex: 123.456.789-00"
                />
              </div>
              
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                  Nome do Cliente (Opcional)
                </label>
                <Input
                  id="customerName"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  placeholder="Ex: João da Silva"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNFCeModalOpen(false)}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleNFCeEmission}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Emitir NFCe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* NFe Modal */}
      <Dialog open={isNFeModalOpen} onOpenChange={setIsNFeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Emitir Nota Fiscal Eletrônica</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="text-blue-800 font-medium flex items-center">
                <FileDigit className="h-5 w-5 mr-2" />
                Emissão de NFe
              </h3>
              <p className="mt-2 text-sm text-blue-600">
                A NFe será emitida para a venda atual. Preencha os dados do cliente para continuar.
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="nfeCnpj" className="block text-sm font-medium text-gray-700 required">
                  CNPJ do Cliente*
                </label>
                <Input
                  id="nfeCnpj"
                  value={customerInfo.document}
                  onChange={(e) => setCustomerInfo({...customerInfo, document: e.target.value})}
                  placeholder="Ex: 12.345.678/0001-90"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="nfeName" className="block text-sm font-medium text-gray-700 required">
                  Razão Social*
                </label>
                <Input
                  id="nfeName"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  placeholder="Ex: Empresa LTDA"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="nfeEmail" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="nfeEmail"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  placeholder="Ex: email@empresa.com"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNFeModalOpen(false)}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleNFeEmission}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!customerInfo.document || !customerInfo.name}
            >
              Emitir NFe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Orders Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciamento de Pedidos</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <h3 className="text-green-800 font-medium flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Pedidos Ativos
              </h3>
              <p className="mt-2 text-sm text-green-600">
                Gerencia e acompanha os pedidos em andamento.
              </p>
            </div>
            
            <div className="border rounded-md divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {mockSales.slice(0, 3).map((sale, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-gray-900">Pedido #{sale.id.slice(-4)}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                          index === 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : index === 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {index === 0 
                            ? 'Em Preparo' 
                            : index === 1
                              ? 'Pronto para Entrega'
                              : 'Entregue'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {new Date().toLocaleString()} • {formatCurrency(sale.total)}
                      </div>
                      
                      <div className="mt-1 text-sm text-gray-700">
                        {sale.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center">
                            <span className="text-xs text-gray-500 mr-1">{item.quantity}x</span>
                            <span className="truncate">{item.productName}</span>
                          </div>
                        ))}
                        {sale.items.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{sale.items.length - 2} mais itens
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-amber-700 border-amber-200 bg-amber-50"
                      >
                        <Truck className="h-3 w-3 mr-1" />
                        {index === 0 ? 'Preparar' : index === 1 ? 'Entregar' : 'Ver Detalhes'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {mockSales.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhum pedido encontrado
                </div>
              )}
            </div>
            
            <Button
              className="w-full mt-4 bg-green-600 hover:bg-green-700"
              onClick={() => {
                setIsOrderModalOpen(false);
                toast.success('Novo pedido criado!');
              }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Tables Modal */}
      <Dialog open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Gerenciamento de Mesas</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {Array.from({ length: 15 }).map((_, index) => {
                const tableNumber = index + 1;
                const isActive = activeTables.includes(tableNumber);
                
                return (
                  <button
                    key={tableNumber}
                    className={`h-24 rounded-lg flex flex-col items-center justify-center border-2 ${
                      isActive
                        ? 'bg-purple-50 border-purple-300 text-purple-800'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                    onClick={() => handleTableSelection(tableNumber)}
                  >
                    <span className={`text-xl font-semibold ${isActive ? 'text-purple-800' : 'text-gray-900'}`}>
                      Mesa {tableNumber}
                    </span>
                    {isActive && (
                      <>
                        <div className="text-xs mt-1">2 clientes</div>
                        <div className="text-sm font-medium text-purple-700 mt-1">R$ 87,50</div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Status Panel */}
      <div className="bg-gray-800 text-white p-3 flex justify-between items-center text-sm">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
            <span>Sistema Online</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-blue-400 mr-1" />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 text-amber-400 mr-1" />
            <span>Operador: Admin</span>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <div className="flex items-center">
            <BarChart2 className="h-4 w-4 text-purple-400 mr-1" />
            <span>Vendas hoje: {mockSales.length}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-green-400 mr-1" />
            <span>Total: R$ 1.234,56</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default POS;
