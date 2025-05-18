import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Settings, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Load company logo on component mount
  useEffect(() => {
    // In a real app, you would fetch this from an API or localStorage
    const storedLogo = localStorage.getItem('companyLogo');
    if (storedLogo) {
      setCompanyLogo(storedLogo);
    }
  }, []);
  
  const handleCustomizeSystem = () => {
    navigate('/settings/customize');
  };
  
  const handleCreateModule = () => {
    toast.success("This feature will be available in a future update.");
    // In the future, this would navigate to a module creation page
  };
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`md:hidden fixed inset-0 z-40 flex ${sidebarOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-in-out duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`} 
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-amber-700 transform transition ease-in-out duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Sidebar onClose={() => setSidebarOpen(false)} companyLogo={companyLogo} />
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-amber-700">
            <Sidebar companyLogo={companyLogo} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden relative">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6">
          <Outlet />
        </main>
        
        {/* Fixed buttons on the bottom left */}
        <div className="fixed bottom-6 left-6 z-10 flex flex-col space-y-3">
          <button
            title="Create New Module"
            onClick={handleCreateModule}
            className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Create new module"
          >
            <PlusCircle className="h-6 w-6" />
          </button>
          
          <button
            title="Customize System"
            onClick={handleCustomizeSystem}
            className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-lg hover:bg-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            aria-label="Customize system"
          >
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;