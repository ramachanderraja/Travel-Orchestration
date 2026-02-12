import React from 'react';
import { View } from '../types';
import { LayoutDashboard, Plane, UserCheck, Receipt, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: View.TRAVEL_REQUEST, label: 'Travel Requests', icon: Plane },
    { id: View.SUPPLIER_REGISTRATION, label: 'My Supplier Profile', icon: UserCheck },
    { id: View.EXPENSE_CLAIM, label: 'Expense Claims', icon: Receipt },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-20 shadow-xl transition-all duration-300">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
          TravelOrchestrator
        </h1>
        <p className="text-xs text-slate-400 mt-1">Enterprise T&E Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
              activeView === item.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
          <Settings size={18} /> Settings
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors mt-2">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
