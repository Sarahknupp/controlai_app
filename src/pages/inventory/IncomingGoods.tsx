import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Camera, SearchCode as BarcodeScan, Package, Check, AlertTriangle, Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import { mockSuppliers, mockInventory } from '../../data/mockData';
import { IncomingGoodsItem } from '../../types/inventory';
import toast from 'react-hot-toast';
import Quagga from 'quagga';

export const IncomingGoods: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [ocrText, setOcrText] = useState('');
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    invoiceBarcode: '',
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    items: [] as IncomingGoodsItem[],
    notes: '',
  });

  // Clean up Quagga on component unmount
  useEffect(() => {
    return () => {
      if (isScanning) {
        try {
          Quagga.stop();
        } catch (error) {
          console.error('Error stopping Quagga:', error);
        }
      }
    };
  }, [isScanning]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData({
      ...invoiceData,
      [name]: value
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    // Start progress simulation
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      setProcessingProgress(Math.min(progress, 95));
      if (progress >= 95) clearInterval(progressInterval);
    }, 200);

    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real app, this would use Tesseract.js or another OCR library
      // Example result from OCR
      const simulatedOcrText = `NOTA FISCAL ELETRÔNICA - NF-e
Nº: 123456789
Data: ${new Date().toLocaleDateString()}
Fornecedor: Sweet Essentials
CNPJ: 12.345.678/0001-90

PRODUTOS:
1. Chocolate em Barra - 10 kg - R$ 18,00/kg
2. Gotas de Chocolate - 5 kg - R$ 16,80/kg
3. Açúcar Refinado - 25 kg - R$ 3,20/kg

TOTAL: R$ 534,00`;

      setOcrText(simulatedOcrText);
      
      // Parse OCR text to extract data (simplified example)
      const invoiceNumber = simulatedOcrText.match(/Nº: (\d+)/)?.[1] || '';
      const supplier = simulatedOcrText.match(/Fornecedor: ([^\n]+)/)?.[1] || '';
      
      // Extract items (simplified)
      const itemMatches = simulatedOcrText.matchAll(/(\d+)\. ([^-]+) - (\d+) (\w+) - R\$ ([\d,]+)\/(\w+)/g);
      const extractedItems: IncomingGoodsItem[] = Array.from(itemMatches).map((match, index) => {
        const name = match[2].trim();
        const quantity = parseInt(match[3]);
        const unitPrice = parseFloat(match[5].replace(',', '.'));
        
        // Find matching inventory item
        const inventoryItem = mockInventory.find(item => 
          item.name.toLowerCase().includes(name.toLowerCase())
        );
        
        return {
          id: `temp-${index + 1}`,
          productId: inventoryItem?.id || '',
          productName: name,
          internalCode: inventoryItem?.internalCode || '',
          quantity,
          unitPrice,
          total: quantity * unitPrice
        };
      });
      
      setInvoiceData({
        ...invoiceData,
        invoiceNumber,
        supplier,
        items: extractedItems
      });
      
      toast.success('Nota fiscal processada com sucesso!');
    } catch (error) {
      console.error('Error processing OCR:', error);
      toast.error('Erro ao processar a nota fiscal');
    } finally {
      clearInterval(progressInterval);
      setProcessingProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingProgress(0);
      }, 500);
    }
  };

  const startBarcodeScanner = () => {
    setIsScanning(true);
    
    // Initialize barcode scanner
    setTimeout(() => {
      if (document.getElementById('barcode-scanner')) {
        try {
          Quagga.init({
            inputStream: {
              name: "Live",
              type: "LiveStream",
              target: document.getElementById('barcode-scanner')!,
              constraints: {
                width: 480,
                height: 320,
                facingMode: "environment"
              },
            },
            decoder: {
              readers: ["code_128_reader", "ean_reader", "code_39_reader"]
            }
          }, (err) => {
            if (err) {
              console.error('Error initializing barcode scanner:', err);
              setIsScanning(false);
              return;
            }
            
            try {
              Quagga.start();
              
              Quagga.onDetected((result) => {
                const code = result.codeResult.code;
                if (code) {
                  setInvoiceData({
                    ...invoiceData,
                    invoiceBarcode: code
                  });
                  stopBarcodeScanner();
                  toast.success('Código de barras detectado!');
                }
              });
            } catch (error) {
              console.error('Error starting Quagga:', error);
              setIsScanning(false);
            }
          });
        } catch (error) {
          console.error('Error with Quagga initialization:', error);
          setIsScanning(false);
        }
      }
    }, 100);
  };

  const stopBarcodeScanner = () => {
    try {
      if (Quagga) {
        Quagga.stop();
      }
      setIsScanning(false);
    } catch (error) {
      console.error('Error stopping barcode scanner:', error);
      setIsScanning(false);
    }
  };

  const addItem = () => {
    const newItem: IncomingGoodsItem = {
      id: `temp-${Date.now()}`,
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, newItem]
    });
  };

  const updateItem = (index: number, field: keyof IncomingGoodsItem, value: string | number) => {
    const updatedItems = [...invoiceData.items];
    
    if (field === 'productId' && typeof value === 'string') {
      const inventoryItem = mockInventory.find(item => item.id === value);
      if (inventoryItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          productId: value,
          productName: inventoryItem.name,
          internalCode: inventoryItem.internalCode,
          unitPrice: inventoryItem.costPerUnit
        };
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'quantity' || field === 'unitPrice' || field === 'total' 
          ? parseFloat(value as string) 
          : value
      };
    }
    
    // Recalculate total
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = 
        updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setInvoiceData({
      ...invoiceData,
      items: updatedItems
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = [...invoiceData.items];
    updatedItems.splice(index, 1);
    
    setInvoiceData({
      ...invoiceData,
      items: updatedItems
    });
  };

  const calculateTotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!invoiceData.invoiceNumber) {
      toast.error('Número da nota fiscal é obrigatório');
      return;
    }
    
    if (!invoiceData.supplier) {
      toast.error('Fornecedor é obrigatório');
      return;
    }
    
    if (invoiceData.items.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }
    
    // In a real app, this would be an API call
    console.log('Saving incoming goods:', invoiceData);
    
    toast.success('Entrada de mercadoria registrada com sucesso!');
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
        
        <h1 className="text-xl font-semibold text-gray-900 flex items-center">
          <Package className="h-5 w-5 mr-2 text-amber-600" />
          Entrada de Mercadoria
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OCR Scanner Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-blue-50 border-b border-blue-100">
            <h3 className="text-lg leading-6 font-medium text-blue-900">
              Leitura Automática
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-blue-600">
              Faça upload da nota fiscal ou use o leitor de código de barras.
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload de Nota Fiscal
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={isScanning ? stopBarcodeScanner : startBarcodeScanner}
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                    isScanning ? 'text-red-700 bg-red-50 hover:bg-red-100' : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      Parar Scanner
                    </>
                  ) : (
                    <>
                      <BarcodeScan className="h-4 w-4 mr-1" />
                      Ler Código de Barras
                    </>
                  )}
                </button>
              </div>
              
              {isProcessing && (
                <div className="mt-4">
                  <div className="flex items-center">
                    <RefreshCw className="h-5 w-5 text-amber-600 animate-spin mr-2" />
                    <span className="text-sm text-gray-600">Processando nota fiscal...</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-amber-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {ocrText && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto Extraído da Nota Fiscal
                  </label>
                  <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-800 font-mono border border-gray-200 h-64 overflow-y-auto whitespace-pre-wrap">
                    {ocrText}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              {isScanning ? (
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div id="barcode-scanner" className="h-64 bg-black relative">
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <Camera className="h-8 w-8 animate-pulse" />
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 text-center text-sm">
                    Posicione o código de barras na frente da câmera
                  </div>
                </div>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Barras da NFe
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      ref={barcodeInputRef}
                      name="invoiceBarcode"
                      value={invoiceData.invoiceBarcode}
                      onChange={handleInputChange}
                      placeholder="Digite ou escaneie o código de barras"
                      className="block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={startBarcodeScanner}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      <BarcodeScan className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">
                          Número da Nota*
                        </label>
                        <input
                          type="text"
                          id="invoiceNumber"
                          name="invoiceNumber"
                          value={invoiceData.invoiceNumber}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                          Data*
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={invoiceData.date}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
                        Fornecedor*
                      </label>
                      <select
                        id="supplier"
                        name="supplier"
                        value={invoiceData.supplier}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      >
                        <option value="">Selecione um fornecedor</option>
                        {mockSuppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.name}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Items Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Itens da Nota Fiscal
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Item
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Unitário
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoiceData.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      Nenhum item adicionado. Adicione itens manualmente ou através da leitura da nota fiscal.
                    </td>
                  </tr>
                ) : (
                  invoiceData.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        >
                          <option value="">Selecione um produto</option>
                          {mockInventory.map((inventoryItem) => (
                            <option key={inventoryItem.id} value={inventoryItem.id}>
                              {inventoryItem.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.internalCode || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          min="0.01"
                          step="0.01"
                          className="block w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-1">R$</span>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                            min="0.01"
                            step="0.01"
                            className="block w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        R${item.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    Total:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    R${calculateTotal().toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        {/* Notes and Submit */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Observações
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={invoiceData.notes}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              placeholder="Observações adicionais sobre esta nota fiscal"
            ></textarea>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 sm:px-6 flex justify-between items-center">
            <div className="text-sm text-gray-500 flex items-center">
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
              Confira os dados antes de finalizar
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate('/inventory')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <Check className="h-4 w-4 mr-1" />
                Finalizar Entrada
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};