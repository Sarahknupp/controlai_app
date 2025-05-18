import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles?: string[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/sales', label: 'Vendas', icon: '💰', roles: ['admin', 'manager', 'cashier'] },
  { path: '/inventory', label: 'Estoque', icon: '📦', roles: ['admin', 'manager', 'staff'] },
  { path: '/production', label: 'Produção', icon: '🏭', roles: ['admin', 'manager', 'staff'] },
  { path: '/reports', label: 'Relatórios', icon: '📈', roles: ['admin', 'manager'] },
  { path: '/reports/productivity', label: 'Produtividade', icon: '📊', roles: ['admin', 'manager'] },
  { path: '/settings', label: 'Configurações', icon: '⚙️', roles: ['admin'] },
];

/**
 * Barra lateral de navegação
 * @component
 * @returns {JSX.Element} Menu lateral com links de navegação
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">PDV Padaria</h1>
        <button
          type="button"
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          onClick={onClose}
        >
          <span className="sr-only">Fechar menu</span>
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 p-2 rounded transition-colors duration-200 ${
                    isActive 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
                onClick={() => {
                  // Close sidebar on mobile when clicking a link
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 