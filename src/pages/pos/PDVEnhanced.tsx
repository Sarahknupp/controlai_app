import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  // Icons for main actions
  ShoppingCart, DollarSign, Package, Users, File, Plus, Minus, 
  Trash2, Search, CreditCard, Clock, FileText, FileDigit,
  
  // Icons for advanced features
  Settings, Printer, CreditCard as CardIcon, 
  DollarSign as Cash, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  ArrowUpCircle, ArrowDownCircle, Activity,
  
  // Icons for categories and navigation
  Coffee, Cake, ShoppingBag,
  
  // Interface elements
  LogOut, Menu, X, User, Eye, Building, Phone, Mail
} from 'lucide-react';

// UI Components
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

// Mock data
import { mockProducts, mockCustomers, mockSales } from '../../data/mockData';
import toast from 'react-hot-toast';

// Type definitions
import { Product } from '../../types/product';
import { SaleItem, Sale } from '../../types/sale';
import { validateImage, ImageValidationOptions } from '../../utils/imageValidation';

/**
 * Interface representing a customer in the system
 * @interface Customer
 */
interface Customer {
  /** Unique identifier for the customer */
  id: string;
  /** Full name of the customer */
  name: string;
  /** Customer's phone number (optional) */
  phone?: string;
  /** Customer's email address (optional) */
  email?: string;
  /** Customer's physical address (optional) */
  address?: string;
  /** Type of customer ('individual' or 'business') */
  type: string;
  /** Contact person name for business customers (optional) */
  contact?: string;
  /** Date when the customer was created */
  createdAt: string | Date;
}

/**
 * Interface for customer search and filter options
 * @interface CustomerFilter
 */
interface CustomerFilter {
  /** Search term to filter customers by name, email, or phone */
  searchTerm: string;
  /** Filter by customer type */
  type: 'all' | 'individual' | 'business';
  /** Field to sort customers by */
  sortBy: 'name' | 'createdAt';
  /** Sort direction */
  sortDirection: 'asc' | 'desc';
}

/**
 * Discount and promotion types
 * @type DiscountType
 */
type DiscountType = 'percentage' | 'fixed' | 'promotion';

/**
 * Interface for a discount
 * @interface Discount
 */
interface Discount {
  type: DiscountType;
  value: number;
  description: string;
  appliedTo: 'total' | 'item';
  itemId?: string;
}

/**
 * Interface for a promotion
 * @interface Promotion
 */
interface Promotion {
  id: string;
  name: string;
  type: 'buyXgetY' | 'bundle' | 'quantity';
  conditions: {
    minQuantity?: number;
    targetProducts?: string[];
    bundleProducts?: string[];
  };
  benefit: {
    discountPercentage?: number;
    discountValue?: number;
    freeItems?: string[];
    quantity?: number;
  };
}

/**
 * Enhanced Point of Sale (PDV) component with advanced features
 * 
 * Features:
 * - Product search and filtering
 * - Customer management with search and filtering
 * - Cart operations
 * - Payment processing
 * - Fiscal document emission (NFCe/NFe)
 * - Cashier operations (open/close, withdrawals, deposits)
 * - TEF integration
 * - Keyboard shortcuts
 * 
 * Keyboard Shortcuts:
 * - F2: Focus product search
 * - F3: Open product search modal
 * - F4: Start new sale
 * - F6: Open customer search
 * - Shift+F6: Remove selected customer
 * - F8: Open payment modal (when cart has items)
 * - F9: Open NFCe emission modal
 * 
 * @component
 */
const PDVEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cashierStatus, setCashierStatus] = useState<'open' | 'closed'>('open');
  const [cashierBalance, setCashierBalance] = useState(500.00); // Initial balance
  const [activeSidePanel, setActiveSidePanel] = useState<'cart' | 'customer' | 'products'>('cart');
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Dialogs state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isNFCeModalOpen, setIsNFCeModalOpen] = useState(false);
  const [isNFeModalOpen, setIsNFeModalOpen] = useState(false);
  const [isCashierModalOpen, setIsCashierModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTEFModalOpen, setIsTEFModalOpen] = useState(false);
  const [isProductSearchModalOpen, setIsProductSearchModalOpen] = useState(false);
  
  // Payment processing state
  const PAYMENT_METHODS = {
    CASH: 'cash',
    CREDIT: 'credit',
    DEBIT: 'debit',
    PIX: 'pix',
    TRANSFER: 'transfer'
  } as const;

  type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];
  type CardType = typeof CARD_TYPES[keyof typeof CARD_TYPES];

  const CARD_TYPES = {
    CREDIT: 'credit',
    DEBIT: 'debit'
  } as const;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | ''>('');
  const [cardType, setCardType] = useState<CardType | null>(null);
  const [paymentStep, setPaymentStep] = useState<number>(1);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [installments, setInstallments] = useState(1);
  
  // Cash operations 
  const [operationAmount, setOperationAmount] = useState('');
  const [operationReason, setOperationReason] = useState('');
  
  // Settings
  const [settingsTab, setSettingsTab] = useState<'general' | 'fiscal' | 'interface' | 'users'>('general');
  
  // TEF settings
  const [tefProvider, setTefProvider] = useState('stone');
  const [tefStatus, setTefStatus] = useState<'connected' | 'disconnected' | 'processing'>('connected');
  
  // Corporate logo
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('ControlAI');
  
  // Logo validation options
  const LOGO_VALIDATION_OPTIONS: ImageValidationOptions = {
    maxWidth: 200,
    maxHeight: 60,
    maxSizeInBytes: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/png', 'image/jpeg', 'image/jpg']
  };
  
  // Customer search state
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>({
    searchTerm: '',
    type: 'all',
    sortBy: 'name',
    sortDirection: 'asc'
  });

  // Selected customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const customerListRef = useRef<HTMLDivElement>(null);

  // Add maximum quantity constant
  const MAX_QUANTITY_PER_ITEM = 999;

  // Memoize cart calculations
  const cartTotals = useMemo(() => {
    return cart.reduce((acc, item) => ({
      subtotal: acc.subtotal + item.total,
      itemCount: acc.itemCount + item.quantity
    }), { subtotal: 0, itemCount: 0 });
  }, [cart]);

  /**
   * Validates if a quantity is within acceptable limits
   * @param {number} quantity - Quantity to validate
   * @returns {boolean} Whether the quantity is valid
   */
  const isValidQuantity = (quantity: number): boolean => {
    return quantity > 0 && quantity <= MAX_QUANTITY_PER_ITEM && Number.isInteger(quantity);
  };

  // Load company logo on component mount
  useEffect(() => {
    // In a real app, you would fetch this from an API or localStorage
    const storedLogo = localStorage.getItem('companyLogo');
    if (storedLogo) {
      setCompanyLogo(storedLogo);
    }
    
    // Focus on search input when component mounts
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
      } else if (e.key === 'F3') {
        e.preventDefault();
        setIsProductSearchModalOpen(true);
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleNewSale();
      } else if (e.key === 'F6') {
        e.preventDefault();
        if (e.shiftKey && selectedCustomer) {
          setSelectedCustomer(null);
          setSelectedCustomerId(null);
          toast.success('Cliente removido');
        } else {
          setShowCustomerSearch(true);
        }
      } else if (e.key === 'F8' && cart.length > 0) {
        e.preventDefault();
        setIsPaymentModalOpen(true);
      } else if (e.key === 'F9') {
        e.preventDefault();
        setIsNFCeModalOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, selectedCustomer]);
  
  // Get unique categories from products
  const productCategories = [...new Set(mockProducts.map(product => product.category))];
  
  // Filter products based on search term and category
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !activeCategory || product.category === activeCategory;
    return matchesSearch && matchesCategory && product.isActive;
  });
  
  /**
   * Generates a unique ID for cart items
   * @returns {string} A unique identifier
   */
  const generateCartItemId = () => {
    return `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  /**
   * Handles adding a product to the cart
   * @param {Product} product - The product to add
   */
  const addToCart = (product: Product) => {
    // Validate product data
    if (!product.id || !product.name || typeof product.price !== 'number') {
      toast.error('Dados do produto inválidos');
      return;
    }

    // Check if product is active
    if (!product.isActive) {
      toast.error('Produto não está disponível para venda');
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      
      // Check if new quantity would exceed maximum
      if (!isValidQuantity(newQuantity)) {
        toast.error(`Quantidade máxima permitida: ${MAX_QUANTITY_PER_ITEM}`);
        return;
      }

      setCart(
        cart.map(item => 
          item.productId === product.id
            ? { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: generateCartItemId(),
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
          total: product.price
        }
      ]);
    }
    
    toast.success(`${product.name} adicionado ao carrinho`);
  };
  
  /**
   * Updates the quantity of a product in the cart
   * @param {string} productId - ID of the product to update
   * @param {number} quantity - New quantity (removes item if <= 0)
   */
  const updateQuantity = (productId: string, quantity: number) => {
    // Validate quantity
    if (!isValidQuantity(quantity)) {
      toast.error(`Quantidade inválida. Máximo permitido: ${MAX_QUANTITY_PER_ITEM}`);
      return;
    }

    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setCart(
      cart.map(item =>
        item.productId === productId
          ? { ...item, quantity, total: quantity * item.unitPrice }
          : item
      )
    );

    const updatedItem = cart.find(item => item.productId === productId);
    if (updatedItem) {
      toast.success(`Quantidade de ${updatedItem.productName} atualizada para ${quantity}`);
    }
  };
  
  /**
   * Removes a product from the cart
   * @param {string} productId - ID of the product to remove
   */
  const removeItem = (productId: string) => {
    const itemToRemove = cart.find(item => item.productId === productId);
    if (itemToRemove) {
      setCart(cart.filter(item => item.productId !== productId));
      toast.success(`${itemToRemove.productName} removido do carrinho`);
    }
  };
  
  /**
   * Calculates the subtotal of items in the cart
   * @returns {number} The cart subtotal
   */
  const getSubtotal = () => {
    return cartTotals.subtotal;
  };
  
  /**
   * Calculates the tax amount for the current cart
   * @returns {number} The tax amount (9% of subtotal)
   */
  const getTax = () => {
    // Simplified tax calculation - 9% of subtotal
    return getSubtotal() * 0.09;
  };
  
  /**
   * Calculates the total amount including tax
   * @returns {number} The total amount
   */
  const getTotal = () => {
    return getSubtotal() + getTax();
  };
  
  const handleNewSale = () => {
    setCart([]);
    setSearchTerm('');
    setSelectedCustomer(null);
    setCashReceived('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    return mockCustomers
      .filter(customer => {
        const matchesSearch = customerFilter.searchTerm === '' ||
          customer.name.toLowerCase().includes(customerFilter.searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(customerFilter.searchTerm.toLowerCase()) ||
          customer.phone?.includes(customerFilter.searchTerm);

        const matchesType = customerFilter.type === 'all' ||
          customer.type === customerFilter.type;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (customerFilter.sortBy === 'name') {
          return customerFilter.sortDirection === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else {
          return customerFilter.sortDirection === 'asc'
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [customerFilter]);

  // Handle customer filter changes
  const handleCustomerFilterChange = useCallback((changes: Partial<CustomerFilter>) => {
    setCustomerFilter(prev => ({ ...prev, ...changes }));
  }, []);

  // Handle customer selection
  const handleSelectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setSelectedCustomer(customer);
    setShowCustomerSearch(false);
    toast.success(`Cliente ${customer.name} selecionado`);
  }, []);

  // Handle keyboard navigation
  const handleCustomerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showCustomerSearch) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCustomers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredCustomers.length) {
          handleSelectCustomer(filteredCustomers[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowCustomerSearch(false);
        break;
    }
  }, [showCustomerSearch, filteredCustomers, highlightedIndex, handleSelectCustomer]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && customerListRef.current) {
      const highlightedElement = customerListRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  // Reset highlight when filter changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [customerFilter]);
  
  // Payment processing constants
  const MAX_INSTALLMENTS = 12;
  const MIN_INSTALLMENT_VALUE = 10;

  /**
   * Validates payment amount
   * @param {number} amount - Amount to validate
   * @returns {boolean} Whether the amount is valid
   */
  const isValidPaymentAmount = (amount: number): boolean => {
    return amount > 0 && amount >= getTotal() && !isNaN(amount);
  };

  /**
   * Validates installment configuration
   * @param {number} total - Total amount
   * @param {number} installments - Number of installments
   * @returns {boolean} Whether the installment configuration is valid
   */
  const isValidInstallment = (total: number, installments: number): boolean => {
    if (installments <= 0 || installments > MAX_INSTALLMENTS) return false;
    const installmentValue = total / installments;
    return installmentValue >= MIN_INSTALLMENT_VALUE;
  };

  /**
   * Handles payment processing
   */
  const handlePayment = () => {
    try {
      // Validate cart
      if (cart.length === 0) {
        toast.error('Carrinho vazio');
        return;
      }

      // Validate payment method
      if (!selectedPaymentMethod) {
        toast.error('Selecione um método de pagamento');
        return;
      }

      // Validate cash payment
      if (selectedPaymentMethod === PAYMENT_METHODS.CASH) {
        const cashAmount = parseFloat(cashReceived);
        if (!isValidPaymentAmount(cashAmount)) {
          toast.error('Valor em dinheiro inválido');
          return;
        }
      }

      // Validate card payment
      if (selectedPaymentMethod === PAYMENT_METHODS.CREDIT || selectedPaymentMethod === PAYMENT_METHODS.DEBIT) {
        if (!cardType) {
          toast.error('Selecione o tipo de cartão');
          return;
        }

        // Validate credit card installments
        if (selectedPaymentMethod === PAYMENT_METHODS.CREDIT && installments > 1) {
          if (!isValidInstallment(getTotal(), installments)) {
            toast.error(`Parcelamento inválido. Valor mínimo por parcela: R$ ${MIN_INSTALLMENT_VALUE}`);
            return;
          }
        }
      }

      // Create sale data
      const saleData = {
        id: generateCartItemId(), // Reusing the ID generator
        date: new Date(),
        items: cart,
        subtotal: getSubtotal(),
        tax: getTax(),
        total: getTotal(),
        paymentMethod: selectedPaymentMethod,
        status: 'completed' as const,
        cashierId: '1', // Mock user ID
        customerDetails: selectedCustomer ? {
          name: selectedCustomer.name,
          phone: selectedCustomer.phone || '',
          email: selectedCustomer.email || '',
        } : undefined,
        payments: [{
          method: selectedPaymentMethod,
          amount: getTotal(),
          reference: Date.now().toString(),
          change: selectedPaymentMethod === PAYMENT_METHODS.CASH 
            ? parseFloat(cashReceived) - getTotal() 
            : 0
        }]
      };

      // Process payment
      console.log('Processing sale:', saleData);
      
      // Update cashier balance for cash payments
      if (selectedPaymentMethod === PAYMENT_METHODS.CASH) {
        setCashierBalance(prev => prev + getTotal());
      }

      // Show success message
      toast.success('Venda realizada com sucesso!');
      setIsPaymentModalOpen(false);

      // Show change if cash payment
      if (selectedPaymentMethod === PAYMENT_METHODS.CASH) {
        const change = parseFloat(cashReceived) - getTotal();
        if (change > 0) {
          toast.success(`Troco: R$ ${change.toFixed(2)}`, { duration: 5000 });
        }
      }

      // Reset state
      handleNewSale();
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    }
  };

  /**
   * Handles fiscal document emission
   * @param {'nfce' | 'nfe'} type - Type of fiscal document
   */
  const handleFiscalDocument = async (type: 'nfce' | 'nfe') => {
    try {
      // Validate cart
      if (cart.length === 0) {
        toast.error('Carrinho vazio');
        return;
      }

      // Validate customer for NFe
      if (type === 'nfe' && !selectedCustomer) {
        toast.error('Selecione um cliente para emitir NFe');
        return;
      }

      // Prepare fiscal document data
      const fiscalData = {
        type,
        items: cart,
        customer: selectedCustomer,
        total: getTotal(),
        tax: getTax(),
        date: new Date(),
        paymentMethod: selectedPaymentMethod
      };

      console.log(`Emitindo ${type.toUpperCase()}:`, fiscalData);

      // Simulate document emission
      toast.loading(`Emitindo ${type.toUpperCase()}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Close modals
      if (type === 'nfce') {
        setIsNFCeModalOpen(false);
      } else {
        setIsNFeModalOpen(false);
      }

      // Show success message
      toast.success(`${type.toUpperCase()} emitida com sucesso!`);
    } catch (error) {
      console.error(`Erro ao emitir ${type.toUpperCase()}:`, error);
      toast.error(`Erro ao emitir ${type.toUpperCase()}. Tente novamente.`);
    }
  };
  
  // Handle cashier operations
  const handleOpenCashier = () => {
    setCashierStatus('open');
    toast.success('Caixa aberto com sucesso!');
    setIsCashierModalOpen(false);
  };
  
  const handleCloseCashier = () => {
    setCashierStatus('closed');
    toast.success('Caixa fechado com sucesso!');
    setIsCashierModalOpen(false);
  };
  
  const handleCashWithdrawal = () => {
    const amount = parseFloat(operationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    
    if (amount > cashierBalance) {
      toast.error('Saldo insuficiente para esta operação');
      return;
    }
    
    if (!operationReason) {
      toast.error('Informe o motivo da retirada');
      return;
    }
    
    // In a real app, this would be an API call
    setCashierBalance(prev => prev - amount);
    toast.success(`Retirada de R$ ${amount.toFixed(2)} realizada com sucesso`);
    setIsWithdrawalModalOpen(false);
    setOperationAmount('');
    setOperationReason('');
  };
  
  const handleCashDeposit = () => {
    const amount = parseFloat(operationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    
    if (!operationReason) {
      toast.error('Informe o motivo do suprimento');
      return;
    }
    
    // In a real app, this would be an API call
    setCashierBalance(prev => prev + amount);
    toast.success(`Suprimento de R$ ${amount.toFixed(2)} realizado com sucesso`);
    setIsDepositModalOpen(false);
    setOperationAmount('');
    setOperationReason('');
  };
  
  // TEF operations
  const handleTestTEF = () => {
    setTefStatus('processing');
    
    // Simulate processing
    setTimeout(() => {
      setTefStatus('connected');
      toast.success('Comunicação com TEF testada com sucesso!');
    }, 2000);
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', 
      currency: 'BRL'
    }).format(value);
  };
  
  // Function to handle cashier closing
  const handleCashierOperation = (operation: 'open' | 'close') => {
    setIsCashierModalOpen(true);
    // Additional logic would be implemented here
  };
  
  // Function to handle logo upload
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const validationResult = await validateImage(file, LOGO_VALIDATION_OPTIONS);
      
      if (!validationResult.isValid) {
        toast.error(validationResult.error || 'Erro ao validar logo');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCompanyLogo(result);
        localStorage.setItem('companyLogo', result);
        toast.success('Logo atualizado com sucesso!');
      };
      reader.onerror = () => {
        toast.error('Erro ao ler arquivo. Tente novamente.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Erro ao processar imagem. Tente novamente.');
    } finally {
      // Clear the input value to allow selecting the same file again
      if (event.target) {
        event.target.value = '';
      }
    }
  };
  
  // Create product category buttons with icons
  const categoryIcons: Record<string, React.ReactNode> = {
    'Produção Própria': <Cake className="h-5 w-5" />,
    'Matéria Prima': <Coffee className="h-5 w-5" />,
    'Produtos de Revenda': <ShoppingBag className="h-5 w-5" />
  };

  // Handle logout
  const handleLogout = useCallback(() => {
    // In a real app, this would clear the session/token
    navigate('/login');
  }, [navigate]);

  // Keyboard shortcut constants
  const SHORTCUTS = {
    SEARCH_FOCUS: 'F2',
    PRODUCT_SEARCH: 'F3',
    NEW_SALE: 'F4',
    CUSTOMER_SEARCH: 'F6',
    REMOVE_CUSTOMER: 'Shift+F6',
    PAYMENT: 'F8',
    NFCE: 'F9',
    NFE: 'F10',
    CANCEL_SALE: 'Shift+Delete',
    QUICK_QUANTITY: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const,
    INCREASE_QUANTITY: '+',
    DECREASE_QUANTITY: '-',
    REMOVE_ITEM: 'Delete',
    CLOSE_MODAL: 'Escape'
  } as const;

  // Selected item state for keyboard navigation
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(-1);

  /**
   * Handles keyboard shortcuts for the PDV
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Handle modal escape
    if (e.key === SHORTCUTS.CLOSE_MODAL) {
      if (isPaymentModalOpen) setIsPaymentModalOpen(false);
      if (isNFCeModalOpen) setIsNFCeModalOpen(false);
      if (isNFeModalOpen) setIsNFeModalOpen(false);
      if (isProductSearchModalOpen) setIsProductSearchModalOpen(false);
      if (showCustomerSearch) setShowCustomerSearch(false);
      return;
    }

    // Handle function key shortcuts
    switch (e.key) {
      case SHORTCUTS.SEARCH_FOCUS:
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
        break;

      case SHORTCUTS.PRODUCT_SEARCH:
        e.preventDefault();
        setIsProductSearchModalOpen(true);
        break;

      case SHORTCUTS.NEW_SALE:
        e.preventDefault();
        if (cart.length > 0) {
          // Show confirmation dialog for non-empty cart
          if (window.confirm('Iniciar nova venda? O carrinho atual será perdido.')) {
            handleNewSale();
          }
        } else {
          handleNewSale();
        }
        break;

      case SHORTCUTS.CUSTOMER_SEARCH:
        e.preventDefault();
        if (e.shiftKey && selectedCustomer) {
          setSelectedCustomer(null);
          setSelectedCustomerId(null);
          toast.success('Cliente removido');
        } else {
          setShowCustomerSearch(true);
        }
        break;

      case SHORTCUTS.PAYMENT:
        e.preventDefault();
        if (cart.length > 0) {
          setIsPaymentModalOpen(true);
        } else {
          toast.error('Adicione itens ao carrinho primeiro');
        }
        break;

      case SHORTCUTS.NFCE:
        e.preventDefault();
        if (cart.length > 0) {
          setIsNFCeModalOpen(true);
        } else {
          toast.error('Adicione itens ao carrinho primeiro');
        }
        break;

      case SHORTCUTS.NFE:
        e.preventDefault();
        if (cart.length > 0 && selectedCustomer) {
          setIsNFeModalOpen(true);
        } else {
          toast.error('Selecione um cliente e adicione itens ao carrinho');
        }
        break;
    }

    // Handle cart item navigation and manipulation
    if (cart.length > 0) {
      // Quick quantity updates for selected item
      const numKey = parseInt(e.key);
      if (!isNaN(numKey) && numKey >= 1 && numKey <= 9 && selectedItemIndex >= 0) {
        e.preventDefault();
        const item = cart[selectedItemIndex];
        if (item) {
          updateQuantity(item.productId, numKey);
        }
      }

      // Increase/decrease quantity of selected item
      if (e.key === SHORTCUTS.INCREASE_QUANTITY && selectedItemIndex >= 0) {
        e.preventDefault();
        const item = cart[selectedItemIndex];
        if (item) {
          updateQuantity(item.productId, item.quantity + 1);
        }
      }

      if (e.key === SHORTCUTS.DECREASE_QUANTITY && selectedItemIndex >= 0) {
        e.preventDefault();
        const item = cart[selectedItemIndex];
        if (item) {
          updateQuantity(item.productId, item.quantity - 1);
        }
      }

      // Remove selected item
      if (e.key === SHORTCUTS.REMOVE_ITEM && selectedItemIndex >= 0) {
        e.preventDefault();
        const item = cart[selectedItemIndex];
        if (item) {
          removeItem(item.productId);
          setSelectedItemIndex(Math.min(selectedItemIndex, cart.length - 2));
        }
      }

      // Cart navigation
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedItemIndex(prev => Math.max(0, prev - 1));
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedItemIndex(prev => Math.min(cart.length - 1, prev + 1));
      }
    }

    // Cancel sale shortcut
    if (e.key === 'Delete' && e.shiftKey && cart.length > 0) {
      e.preventDefault();
      if (window.confirm('Cancelar venda atual?')) {
        handleNewSale();
        toast.success('Venda cancelada');
      }
    }
  }, [cart, selectedItemIndex, selectedCustomer, isPaymentModalOpen, isNFCeModalOpen, isNFeModalOpen, isProductSearchModalOpen, showCustomerSearch]);

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [handleKeyboardShortcuts]);

  // Reset selected item index when cart changes
  useEffect(() => {
    if (cart.length === 0) {
      setSelectedItemIndex(-1);
    } else {
      setSelectedItemIndex(prev => Math.min(prev, cart.length - 1));
    }
  }, [cart.length]);

  /**
   * Gets ARIA label for cart item
   * @param {SaleItem} item - Cart item
   * @param {number} index - Item index
   * @returns {string} ARIA label
   */
  const getCartItemAriaLabel = (item: SaleItem, index: number): string => {
    return `Item ${index + 1} de ${cart.length}: ${item.quantity} ${item.quantity > 1 ? 'unidades' : 'unidade'} de ${item.productName} a ${formatCurrency(item.unitPrice)} cada, total ${formatCurrency(item.total)}`;
  };

  // Quick action buttons configuration
  const QUICK_ACTIONS = [
    { icon: <Package className="h-5 w-5" />, label: 'Consultar Preço', shortcut: 'Alt+P', action: () => setIsProductSearchModalOpen(true) },
    { icon: <Users className="h-5 w-5" />, label: 'Buscar Cliente', shortcut: 'F6', action: () => setShowCustomerSearch(true) },
    { icon: <FileText className="h-5 w-5" />, label: 'Emitir NFCe', shortcut: 'F9', action: () => setIsNFCeModalOpen(true) },
    { icon: <FileDigit className="h-5 w-5" />, label: 'Emitir NFe', shortcut: 'F10', action: () => setIsNFeModalOpen(true) },
    { icon: <RefreshCw className="h-5 w-5" />, label: 'Nova Venda', shortcut: 'F4', action: handleNewSale }
  ] as const;

  // Product suggestion state
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /**
   * Updates product suggestions based on cart contents
   */
  const updateProductSuggestions = useCallback(() => {
    if (cart.length === 0) {
      setSuggestedProducts([]);
      return;
    }

    // Get categories of items in cart
    const cartCategories = new Set(
      cart.map(item => {
        const product = mockProducts.find(p => p.id === item.productId);
        return product?.category;
      })
    );

    // Find products in same categories that aren't in cart
    const suggestions = mockProducts
      .filter(product => 
        product.isActive &&
        cartCategories.has(product.category) &&
        !cart.some(item => item.productId === product.id)
      )
      .slice(0, 5); // Limit to 5 suggestions

    setSuggestedProducts(suggestions);
  }, [cart]);

  /**
   * Loads recent sales
   */
  const loadRecentSales = useCallback(() => {
    // In a real app, this would be an API call
    setRecentSales(mockSales.slice(0, 5));
  }, []);

  // Update suggestions when cart changes
  useEffect(() => {
    updateProductSuggestions();
  }, [cart, updateProductSuggestions]);

  // Load recent sales on mount
  useEffect(() => {
    loadRecentSales();
  }, [loadRecentSales]);

  /**
   * Renders a quick action button
   * @param {Object} action - Quick action configuration
   * @returns {JSX.Element} Quick action button
   */
  const QuickActionButton = ({ icon, label, shortcut, action }: typeof QUICK_ACTIONS[number]) => (
    <button
      onClick={action}
      className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      title={`${label} (${shortcut})`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  /**
   * Renders a product suggestion card
   * @param {Product} product - Product to suggest
   * @returns {JSX.Element} Product suggestion card
   */
  const ProductSuggestionCard = ({ product }: { product: Product }) => (
    <button
      onClick={() => addToCart(product)}
      className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      title="Adicionar ao carrinho"
    >
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="w-12 h-12 object-cover rounded"
        />
      )}
      <div className="ml-4">
        <h4 className="font-medium text-gray-900">{product.name}</h4>
        <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
      </div>
    </button>
  );

  /**
   * Renders a recent sale card
   * @param {Sale} sale - Sale to display
   * @returns {JSX.Element} Recent sale card
   */
  const RecentSaleCard = ({ sale }: { sale: Sale }) => (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">
            Venda #{sale.orderNumber}
          </h4>
          <p className="text-sm text-gray-500">
            {new Date(sale.date).toLocaleString()}
          </p>
        </div>
        <span className="text-lg font-semibold text-gray-900">
          {formatCurrency(sale.total)}
        </span>
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-600">
          {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}
        </p>
        {sale.customerDetails && (
          <p className="text-sm text-gray-600">
            Cliente: {sale.customerDetails.name}
          </p>
        )}
      </div>
    </div>
  );

  // Cart management state
  const [activeDiscounts, setActiveDiscounts] = useState<Discount[]>([]);
  const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>([]);
  const [appliedPromotions, setAppliedPromotions] = useState<string[]>([]);
  const [holdCarts, setHoldCarts] = useState<Array<{ id: string; items: SaleItem[]; customer?: Customer }>>([]);
  const [cartNotes, setCartNotes] = useState<string>('');

  /**
   * Calculates the final price after discounts
   * @param {number} price - Original price
   * @param {Discount[]} discounts - Applied discounts
   * @returns {number} Final price
   */
  const calculateFinalPrice = (price: number, discounts: Discount[]): number => {
    let finalPrice = price;
    
    discounts.forEach(discount => {
      if (discount.type === 'percentage') {
        finalPrice -= (finalPrice * (discount.value / 100));
      } else if (discount.type === 'fixed') {
        finalPrice -= discount.value;
      }
    });

    return Math.max(0, finalPrice);
  };

  /**
   * Checks if promotions can be applied to current cart
   * @returns {Promotion[]} Applicable promotions
   */
  const getApplicablePromotions = useCallback((): Promotion[] => {
    if (cart.length === 0) return [];

    return availablePromotions.filter(promotion => {
      switch (promotion.type) {
        case 'buyXgetY':
          const targetProduct = cart.find(item => 
            promotion.conditions.targetProducts?.includes(item.productId)
          );
          return targetProduct && targetProduct.quantity >= (promotion.conditions.minQuantity || 0);

        case 'bundle':
          const hasAllProducts = promotion.conditions.bundleProducts?.every(productId =>
            cart.some(item => item.productId === productId)
          );
          return hasAllProducts;

        case 'quantity':
          const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
          return totalQuantity >= (promotion.conditions.minQuantity || 0);

        default:
          return false;
      }
    });
  }, [cart, availablePromotions]);

  /**
   * Applies a discount to the cart
   * @param {Discount} discount - Discount to apply
   */
  const applyDiscount = (discount: Discount) => {
    if (cart.length === 0) {
      toast.error('Adicione itens ao carrinho primeiro');
      return;
    }

    // Validate discount
    if (discount.type === 'percentage' && (discount.value <= 0 || discount.value > 100)) {
      toast.error('Percentual de desconto inválido');
      return;
    }

    if (discount.type === 'fixed' && discount.value <= 0) {
      toast.error('Valor de desconto inválido');
      return;
    }

    setActiveDiscounts(prev => [...prev, discount]);
    toast.success('Desconto aplicado com sucesso');
  };

  /**
   * Holds the current cart for later
   */
  const holdCurrentCart = () => {
    if (cart.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }

    const heldCart = {
      id: generateCartItemId(),
      items: [...cart],
      customer: selectedCustomer || undefined,
      notes: cartNotes
    };

    setHoldCarts(prev => [...prev, heldCart]);
    handleNewSale();
    toast.success('Carrinho guardado com sucesso');
  };

  /**
   * Recovers a held cart
   * @param {string} cartId - ID of the held cart
   */
  const recoverHeldCart = (cartId: string) => {
    const heldCart = holdCarts.find(cart => cart.id === cartId);
    if (!heldCart) return;

    // Confirm if current cart is not empty
    if (cart.length > 0) {
      if (!window.confirm('Substituir carrinho atual?')) {
        return;
      }
    }

    setCart(heldCart.items);
    if (heldCart.customer) {
      setSelectedCustomer(heldCart.customer);
    }
    setHoldCarts(prev => prev.filter(cart => cart.id !== cartId));
    toast.success('Carrinho recuperado com sucesso');
  };

  /**
   * Gets the total discount amount
   * @returns {number} Total discount
   */
  const getTotalDiscount = (): number => {
    const itemDiscounts = cart.reduce((total, item) => {
      const itemDiscounts = activeDiscounts.filter(d => 
        d.appliedTo === 'item' && d.itemId === item.productId
      );
      const originalPrice = item.quantity * item.unitPrice;
      const discountedPrice = calculateFinalPrice(originalPrice, itemDiscounts);
      return total + (originalPrice - discountedPrice);
    }, 0);

    const totalDiscounts = activeDiscounts.filter(d => d.appliedTo === 'total');
    const subtotal = getSubtotal();
    const finalTotal = calculateFinalPrice(subtotal, totalDiscounts);

    return itemDiscounts + (subtotal - finalTotal);
  };

  // Printer and fiscal document types
  interface PrinterConfig {
    name: string;
    type: 'thermal' | 'laser' | 'fiscal';
    model?: string;
    connection: 'usb' | 'network' | 'serial';
    address?: string;
    port?: number;
    isDefault?: boolean;
  }

  interface FiscalConfig {
    certificateSerial: string;
    certificateExpiry: Date;
    company: {
      cnpj: string;
      stateRegistration: string;
      municipalRegistration?: string;
      name: string;
      tradeName: string;
    };
    environment: 'production' | 'homologation';
    sequence: {
      nfce: number;
      nfe: number;
      sat: number;
    };
  }

  interface PrintJob {
    id: string;
    type: 'receipt' | 'nfce' | 'nfe' | 'report';
    content: string;
    printer: string;
    status: 'pending' | 'printing' | 'completed' | 'failed';
    error?: string;
    createdAt: Date;
  }

  // Printer and fiscal state
  const [printers, setPrinters] = useState<PrinterConfig[]>([]);
  const [defaultPrinter, setDefaultPrinter] = useState<string>('');
  const [printQueue, setPrintQueue] = useState<PrintJob[]>([]);
  const [fiscalConfig, setFiscalConfig] = useState<FiscalConfig | null>(null);
  const [isFiscalPrinterOnline, setIsFiscalPrinterOnline] = useState(false);
  const [isTEFOnline, setIsTEFOnline] = useState(false);

  /**
   * Formats a receipt for printing
   * @param {Sale} sale - Sale data
   * @returns {string} Formatted receipt
   */
  const formatReceipt = (sale: Sale): string => {
    const header = [
      companyName,
      fiscalConfig?.company.cnpj ? `CNPJ: ${fiscalConfig.company.cnpj}` : '',
      new Date().toLocaleString(),
      '----------------------------------------',
      'CUPOM NÃO FISCAL',
      '----------------------------------------',
    ].join('\n');

    const items = sale.items.map(item => [
      item.productName,
      `${item.quantity}x ${formatCurrency(item.unitPrice)}`,
      `${formatCurrency(item.total)}`,
      item.discount ? `Desconto: ${formatCurrency(item.discount.value)}` : '',
    ].filter(Boolean).join('\n')).join('\n');

    const footer = [
      '----------------------------------------',
      `Subtotal: ${formatCurrency(sale.subtotal)}`,
      `Desconto: ${formatCurrency(getTotalDiscount())}`,
      `Total: ${formatCurrency(sale.total)}`,
      '----------------------------------------',
      sale.customerDetails ? `Cliente: ${sale.customerDetails.name}` : '',
      `Forma de Pagamento: ${sale.payments[0].method}`,
      sale.payments[0].change ? `Troco: ${formatCurrency(sale.payments[0].change)}` : '',
      '\n\n\n',  // Paper feed
    ].filter(Boolean).join('\n');

    return `${header}\n${items}\n${footer}`;
  };

  /**
   * Adds a print job to the queue
   * @param {PrintJob} job - Print job to add
   */
  const queuePrintJob = (job: PrintJob) => {
    setPrintQueue(prev => [...prev, { ...job, createdAt: new Date() }]);
    processPrintQueue();
  };

  /**
   * Processes the print queue
   */
  const processPrintQueue = async () => {
    const pendingJob = printQueue.find(job => job.status === 'pending');
    if (!pendingJob) return;

    try {
      // Update job status
      setPrintQueue(prev => prev.map(job =>
        job.id === pendingJob.id ? { ...job, status: 'printing' } : job
      ));

      // Simulate printing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark as completed
      setPrintQueue(prev => prev.map(job =>
        job.id === pendingJob.id ? { ...job, status: 'completed' } : job
      ));

      toast.success('Impressão concluída com sucesso');
    } catch (error) {
      console.error('Erro na impressão:', error);
      setPrintQueue(prev => prev.map(job =>
        job.id === pendingJob.id ? { ...job, status: 'failed', error: String(error) } : job
      ));
      toast.error('Erro na impressão. Verifique a impressora.');
    }
  };

  /**
   * Checks fiscal printer status
   */
  const checkFiscalPrinter = async () => {
    try {
      // Simulate printer check
      setIsFiscalPrinterOnline(false);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsFiscalPrinterOnline(true);
      toast.success('Impressora fiscal conectada');
    } catch (error) {
      console.error('Erro ao verificar impressora fiscal:', error);
      setIsFiscalPrinterOnline(false);
      toast.error('Erro ao conectar com impressora fiscal');
    }
  };

  /**
   * Checks TEF status
   */
  const checkTEF = async () => {
    try {
      // Simulate TEF check
      setIsTEFOnline(false);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTEFOnline(true);
      toast.success('TEF conectado');
    } catch (error) {
      console.error('Erro ao verificar TEF:', error);
      setIsTEFOnline(false);
      toast.error('Erro ao conectar com TEF');
    }
  };

  /**
   * Prints a sale receipt
   * @param {Sale} sale - Sale data
   */
  const printReceipt = (sale: Sale) => {
    const receiptContent = formatReceipt(sale);
    const printJob: PrintJob = {
      id: generateCartItemId(),
      type: 'receipt',
      content: receiptContent,
      printer: defaultPrinter,
      status: 'pending',
      createdAt: new Date()
    };

    queuePrintJob(printJob);
  };

  // Initialize fiscal devices
  useEffect(() => {
    checkFiscalPrinter();
    checkTEF();
  }, []);

  // Process print queue when it changes
  useEffect(() => {
    const pendingJobs = printQueue.filter(job => job.status === 'pending');
    if (pendingJobs.length > 0) {
      processPrintQueue();
    }
  }, [printQueue]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-4 text-2xl font-bold text-gray-900">PDV</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Customer selection button */}
              <button
                onClick={() => setShowCustomerSearch(true)}
                className={`
                  inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium
                  ${selectedCustomer
                    ? 'border-green-500 text-green-700 bg-green-50 hover:bg-green-100'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                `}
                title={selectedCustomer ? 'F6: Trocar Cliente | Shift+F6: Remover Cliente' : 'F6: Selecionar Cliente'}
              >
                <User className={`h-5 w-5 mr-2 ${selectedCustomer ? 'text-green-500' : 'text-gray-400'}`} />
                {selectedCustomer ? `Cliente: ${selectedCustomer.name}` : 'Selecionar Cliente'}
              </button>

              {/* Existing buttons */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Rest of the component */}
        <div className="flex-1 flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white p-4 space-y-6">
            {/* Quick Actions Section */}
            <div className="bg-gray-100 p-4">
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {QUICK_ACTIONS.map((action, index) => (
                  <QuickActionButton key={index} {...action} />
                ))}
              </div>
            </div>

            {/* Product Suggestions */}
            {showSuggestions && suggestedProducts.length > 0 && (
              <div className="bg-gray-50 p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Sugestões de Produtos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestedProducts.map(product => (
                    <ProductSuggestionCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Sales */}
            <div className="bg-gray-50 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Vendas Recentes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentSales.map(sale => (
                  <RecentSaleCard key={sale.id} sale={sale} />
                ))}
              </div>
            </div>
          </aside>

          {/* Main content area */}
          <div className="flex-1 p-8 space-y-6">
            {/* Quick Actions Section */}
            <div className="bg-gray-100 p-4">
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {QUICK_ACTIONS.map((action, index) => (
                  <QuickActionButton key={index} {...action} />
                ))}
              </div>
            </div>

            {/* Product Suggestions */}
            {showSuggestions && suggestedProducts.length > 0 && (
              <div className="bg-gray-50 p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Sugestões de Produtos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestedProducts.map(product => (
                    <ProductSuggestionCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Sales */}
            <div className="bg-gray-50 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Vendas Recentes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentSales.map(sale => (
                  <RecentSaleCard key={sale.id} sale={sale} />
                ))}
              </div>
            </div>

            {/* Discount and Promotions Section */}
            {activeDiscounts.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Descontos Aplicados</h4>
                <div className="mt-2 space-y-2">
                  {activeDiscounts.map((discount, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{discount.description}</span>
                      <span className="text-green-600">
                        -{discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-right text-sm font-medium">
                  Total de Descontos: {formatCurrency(getTotalDiscount())}
                </div>
              </div>
            )}

            {/* Held Carts Section */}
            {holdCarts.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Carrinhos em Espera</h4>
                <div className="mt-2 space-y-2">
                  {holdCarts.map(heldCart => (
                    <button
                      key={heldCart.id}
                      onClick={() => recoverHeldCart(heldCart.id)}
                      className="w-full flex justify-between items-center p-2 bg-white rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <span className="font-medium">{heldCart.items.length} itens</span>
                        {heldCart.customer && (
                          <span className="ml-2 text-gray-500">
                            Cliente: {heldCart.customer.name}
                          </span>
                        )}
                      </div>
                      <span className="text-blue-600">Recuperar</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Printer Status Section */}
            <div className="fixed bottom-4 right-4 flex space-x-2">
              <div className={`flex items-center px-3 py-2 rounded-lg ${
                isFiscalPrinterOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <Printer className="h-5 w-5 mr-2" />
                <span>Impressora Fiscal</span>
              </div>
              <div className={`flex items-center px-3 py-2 rounded-lg ${
                isTEFOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <CreditCard className="h-5 w-5 mr-2" />
                <span>TEF</span>
              </div>
            </div>

            {/* Print Queue */}
            {printQueue.length > 0 && (
              <div className="fixed bottom-20 right-4 w-80 bg-white rounded-lg shadow-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Fila de Impressão
                </h4>
                <div className="space-y-2">
                  {printQueue.map(job => (
                    <div
                      key={job.id}
                      className={`flex items-center justify-between text-sm ${
                        job.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                      }`}
                    >
                      <span>{job.type === 'receipt' ? 'Cupom' : job.type.toUpperCase()}</span>
                      <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
                      <span>
                        {job.status === 'pending' && <Clock className="h-4 w-4" />}
                        {job.status === 'printing' && <RefreshCw className="h-4 w-4 animate-spin" />}
                        {job.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {job.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Change the export statement at the end of the file
export default PDVEnhanced;