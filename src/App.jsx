Import React, { useState } from 'react';
import { LayoutDashboard, Scissors, Users, Package, Calendar, LogOut } from 'lucide-react';
import LoginSignup from './components/LoginSignup';
import POSBilling from './components/POSBilling';
import SmartCRM from './components/SmartCRM';
import InventoryManager from './components/InventoryManager';
import AppointmentsCalendar from './components/AppointmentsCalendar';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('pos');

  // Agar user logged-in nahi hai toh Login/Signup screen dikhayenge
  if (!isLoggedIn) {
    return <LoginSignup onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center font-black text-slate-950 shadow-lg shadow-amber-500/20">
              SG
            </div>
            <div>
              <h1 className="font-black text-base text-amber-500 tracking-wide">SalonGro</h1>
              <p className="text-[10px] text-slate-400">PWA SaaS POS Platform</p>
            </div>
          </div>

          {/* Nav Menu Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'pos'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Scissors size={16} /> POS & Checkout
            </button>
            <button
              onClick={() => setActiveTab('crm')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'crm'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users size={16} /> Smart CRM
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'inventory'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Package size={16} /> Inventory Manager
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'appointments'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calendar size={16} /> Appointments Calendar
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut size={16} /> Logout System
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        {activeTab === 'pos' && <POSBilling />}
        {activeTab === 'crm' && <SmartCRM />}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'appointments' && <AppointmentsCalendar />}
      </main>
    </div>
  );
              
