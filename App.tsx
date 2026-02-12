import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TravelRequest from './components/TravelRequest';
import SupplierRegistration from './components/SupplierRegistration';
import ExpenseClaim from './components/ExpenseClaim';
import { View } from './types';
import { Menu, Bell } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case View.DASHBOARD:
        return <Dashboard />;
      case View.TRAVEL_REQUEST:
        return <TravelRequest />;
      case View.SUPPLIER_REGISTRATION:
        return <SupplierRegistration />;
      case View.EXPENSE_CLAIM:
        return <ExpenseClaim />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: Fixed, Mobile: Absolute/Transform */}
      <div className={`fixed lg:static inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-20`}>
        <Sidebar activeView={activeView} onViewChange={(v) => { setActiveView(v); setIsMobileMenuOpen(false); }} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <button 
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              AJ
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>

      </div>
    </div>
  );
};

export default App;
