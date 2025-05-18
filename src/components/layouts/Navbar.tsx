import React from 'react';
import { Menu, Bell, User, Settings } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  
  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-4 py-3 md:px-6">
        <div className="flex items-center">
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="ml-4 flex items-center md:ml-0">
            <h1 className="text-lg font-semibold text-amber-800">Sistema de Gestão de Vendas</h1>
          </div>
        </div>
        
        <div className="flex items-center">
          <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none">
            <Bell className="h-5 w-5" />
          </button>
          
          <button
            className="p-2 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={() => navigate('/settings/users')}
          >
            <Settings className="h-5 w-5" />
          </button>
          
          <div className="ml-3 relative">
            <div>
              <button
                type="button"
                className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-amber-600 flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
                </div>
                <span className="ml-2 text-gray-700">{user?.name}</span>
              </button>
            </div>
            
            {dropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-gray-500">{user?.email}</p>
                    <p className="text-xs text-amber-600 mt-1">{user?.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/settings/users');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Settings
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;