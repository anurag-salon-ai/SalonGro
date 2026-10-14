import React, { useState } from 'react';
import POSBilling from './components/POSBilling';
import SmartCRM from './components/SmartCRM';
import InventoryManager from './components/InventoryManager';
import SettingsManager from './components/SettingsManager';
import SuperAdmin from './components/SuperAdmin';
import LoginSignup from './components/LoginSignup';
import AppointmentsCalendar from './components/AppointmentsCalendar';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSalon, setCurrentSalon] = useState(null);
  
  // Catalog State for Settings & POS synchronization
  const [catalogList, setCatalogList] = useState([
    { id: 1, name: 'HAIR CUT', price: 250, type: 'SERVICE' },
    { id: 2, name: 'FACIAL', price: 800, type: 'SERVICE' }
  ]);

  const isSuperAdminRoute = window.location.search.includes('admin=true') || window.location.hash === '#superadmin';

  if (isSuperAdminRoute) {
    return <SuperAdmin />;
  }

  if (!isLoggedIn) {
    return <LoginSignup onLoginSuccess={(salonData) => {
      setCurrentSalon(salonData);
      setIsLoggedIn(true);
    }} />;
  }

  const handleSaveSettings = (updatedInfo) => {
    setCurrentSalon(updatedInfo);
    alert('Settings Saved Successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center font-black text-slate-950 shadow-lg shadow-amber-500/20">
              SG
            </div>
            <div>
              <h1 className="font-bold text-base text-amber-500 tracking-wide">{currentSalon?.salon_name || 'SalonGro'}</h1>
              <p className="text-[10px] text-slate-400">PWA SaaS POS Platform</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'pos' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              ✂️ POS & Checkout
            </button>
            <button
              onClick={() => setActiveTab('crm')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'crm' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              👥 Smart CRM
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'inventory' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              📦 Inventory Manager
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'appointments' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              📅 Appointments Calendar
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              ⚙️ Salon Settings
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition"
          >
            🚪 Logout System
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8">
        {activeTab === 'pos' && <POSBilling salonData={currentSalon} catalogList={catalogList} />}
        {activeTab === 'crm' && <SmartCRM salonData={currentSalon} />}
        {activeTab === 'inventory' && <InventoryManager salonData={currentSalon} />}
        {activeTab === 'appointments' && <AppointmentsCalendar salonData={currentSalon} />}
        {activeTab === 'settings' && (
          <SettingsManager 
            salonData={currentSalon} 
            onSaveSettings={handleSaveSettings} 
            catalogList={catalogList} 
            onUpdateCatalog={setCatalogList} 
          />
        )}
      </main>
    </div>
  );
      }
