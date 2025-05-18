import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Home, ShoppingBasket, Package, Clipboard, CreditCard, BarChart2, ChefHat, Cake, Utensils, Calculator, FileText, Database, FileBarChart, FileDigit, Building2, Users, ShoppingCart } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

interface SidebarProps {
  onClose?: () => void;
  companyLogo?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, companyLogo }) => {
  const { user } = useAuth();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, allowedRoles: ['admin', 'manager', 'staff', 'cashier', 'accountant'] },
    { name: 'Produtos', href: '/products', icon: ShoppingBasket, allowedRoles: ['admin', 'manager', 'staff'] },
    { name: 'Estoque', href: '/inventory', icon: Package, allowedRoles: ['admin', 'manager', 'staff'] },
    { name: 'Produção', href: '/production', icon: Clipboard, allowedRoles: ['admin', 'manager', 'staff'] },
    // Áreas específicas de produção
    { name: 'Cozinha', href: '/production/kitchen', icon: ChefHat, allowedRoles: ['admin', 'manager', 'staff'] },
    { name: 'Confeitaria', href: '/production/confectionery', icon: Cake, allowedRoles: ['admin', 'manager', 'staff'] },
    { name: 'Panificação', href: '/production/bakery', icon: Utensils, allowedRoles: ['admin', 'manager', 'staff'] },
    { name: 'Caixa/PDV', href: '/pos', icon: CreditCard, allowedRoles: ['admin', 'manager', 'cashier'] },
    { name: 'PDV Avançado', href: '/pdv', icon: ShoppingCart, allowedRoles: ['admin', 'manager', 'cashier'] },
    { name: 'Relatórios', href: '/reports', icon: BarChart2, allowedRoles: ['admin', 'manager'] },
    // Módulo Contábil-Fiscal
    { name: 'Contabilidade', href: '/accounting', icon: Calculator, allowedRoles: ['admin', 'manager', 'accountant'] },
    { name: 'Painel Contador', href: '/accounting/dashboard', icon: FileText, allowedRoles: ['admin', 'manager', 'accountant'] },
    { name: 'Integração Fiscal', href: '/accounting/fiscal', icon: Database, allowedRoles: ['admin', 'manager', 'accountant'] },
    { name: 'SPED', href: '/accounting/sped', icon: FileBarChart, allowedRoles: ['admin', 'manager', 'accountant'] },
    { name: 'Emissão NFe', href: '/accounting/nfe', icon: FileDigit, allowedRoles: ['admin', 'manager', 'accountant', 'cashier'] },
    { name: 'Empresas', href: '/accounting/companies', icon: Building2, allowedRoles: ['admin', 'manager', 'accountant'] },
    { name: 'Cadastros', href: '/accounting/entities', icon: Users, allowedRoles: ['admin', 'manager', 'accountant'] },
  ];
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-5">
        <div className="flex items-center">
          {companyLogo ? (
            <img 
              src={companyLogo} 
              alt="Company Logo" 
              className="h-8 w-auto object-contain"
            />
          ) : (
            <span className="text-white font-bold text-xl">ControlAI - Vendas</span>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            className="h-10 w-10 flex items-center justify-center rounded-md text-white hover:text-amber-100 focus:outline-none"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="mt-5 px-2 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {navigation
            .filter(item => item.allowedRoles.includes(user?.role || ''))
            .map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => 
                  `group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                    isActive 
                      ? 'bg-amber-800 text-white' 
                      : 'text-amber-100 hover:bg-amber-600 hover:text-white'
                  }`
                }
                end={item.href === '/'}
              >
                <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
        </div>
      </nav>
      
      {/* User info */}
      <div className="px-2 border-t border-amber-800 py-4 mb-2">
        <div className="flex items-center px-2">
          <div className="h-8 w-8 rounded-full bg-amber-800 flex items-center justify-center text-white">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="font-medium text-white">{user?.name}</p>
            <p className="text-xs text-amber-200">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;