import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clipboard, Calendar, Plus, ChefHat, Cake, Utensils, Clock, AlertTriangle,
  BarChart2, Filter, ArrowRight, Users, FileText, Search, TrendingUp
} from 'lucide-react';
import { 
  mockProductionOrders, 
  mockProductionAreas, 
  mockProductivityReports,
  getTodaysProduction
} from '../../data/mockData';
import { Routes, Route } from 'react-router-dom';
import { lazy } from 'react';

// Lazy load sub-pages
const ProductionDashboard = lazy(() => import('./ProductionDashboard'));
const ProductionOrders = lazy(() => import('./ProductionOrders'));
const NewOrder = lazy(() => import('./NewOrder'));
const OrderDetails = lazy(() => import('./OrderDetails'));
const TechnicalSheets = lazy(() => import('./TechnicalSheets'));
const ProductionPlanning = lazy(() => import('./ProductionPlanning'));

const Production: React.FC = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get today's production
  const todayProduction = getTodaysProduction();
  
  // Filter orders
  const filteredOrders = mockProductionOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.clientName && order.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesArea = filterArea === 'all' || 
                       order.assignedArea === filterArea || 
                       (order.assignedArea === 'multiple' && order.items.some(item => item.area === filterArea));
    const matchesPriority = filterPriority === 'all' || order.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesArea && matchesPriority;
  });
  
  // Calculate area stats
  const areaStats = mockProductionAreas.map(area => {
    const areaOrders = mockProductionOrders.filter(order => 
      order.assignedArea === area.id ||
      (order.assignedArea === 'multiple' && order.items.some(item => item.area === area.id))
    );
    
    const pendingOrders = areaOrders.filter(order => order.status === 'pending').length;
    const inProductionOrders = areaOrders.filter(order => order.status === 'in-production').length;
    
    return {
      ...area,
      pendingOrders,
      inProductionOrders
    };
  });
  
  // Productivity data
  const productivityData = mockProductivityReports[0];
  
  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) {
      return `Atrasado por ${Math.abs(diffInHours)}h`;
    } else if (diffInHours === 0) {
      const diffInMinutes = Math.round((date.getTime() - now.getTime()) / (1000 * 60));
      return diffInMinutes <= 0 ? 'Agora' : `Em ${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `Em ${diffInHours}h`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `Em ${days}d`;
    }
  };
  
  // Get priority class
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Routes>
      <Route index element={<ProductionDashboard />} />
      <Route path="orders" element={<ProductionOrders />} />
      <Route path="orders/new" element={<NewOrder />} />
      <Route path="orders/:id" element={<OrderDetails />} />
      <Route path="technical-sheets/*" element={<TechnicalSheets />} />
      <Route path="planning" element={<ProductionPlanning />} />
    </Routes>
  );
};

export default Production;
