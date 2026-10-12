import React, { useState } from 'react';
import LoginSignup from './components/LoginSignup';
import POSBilling from './components/POSBilling';
import ThermalPrintReceipt from './components/ThermalPrintReceipt';

export default function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'pos', 'receipt'
  const [salonInfo, setSalonInfo] = useState(null);
  const [billData, setBillData] = useState(null);

  const handleLoginSuccess = (data) => {
    setSalonInfo(data);
    setCurrentView('pos');
  };

  const handleCompleteCheckout = (data) => {
    setBillData(data);
    setCurrentView('receipt');
  };

  const handleBackToPOS = () => {
    setBillData(null);
    setCurrentView('pos');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500 selection:text-slate-950">
      {currentView === 'login' && (
        <LoginSignup onLoginSuccess={handleLoginSuccess} />
      )}

      {currentView === 'pos' && (
        <POSBilling 
          salonInfo={salonInfo} 
          onCompleteCheckout={handleCompleteCheckout} 
        />
      )}

      {currentView === 'receipt' && (
        <ThermalPrintReceipt 
          salonInfo={salonInfo} 
          billData={billData} 
          onBackToPOS={handleBackToPOS} 
        />
      )}
    </div>
  );
}
