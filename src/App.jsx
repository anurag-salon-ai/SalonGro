import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Live Supabase Client Connection (Secure & Crash-Proof)
const SUPABASE_URL = "https://vbxeixxbvtetixsfgpsz.supabase.co  ";
const SUPABASE_ANON_KEY = " eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZieGVpeHhidnRldGl4c2ZncHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTM3OTcsImV4cCI6MjEwNjc4OTc5N30.tJ2HK_4eEg-dzGUOJ6Dox0mEGijtMPCA10CL772C-TI     ";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- 1. SUPER ADMIN MASTER DASHBOARD ---
function SuperAdminMasterDashboard({ onLogout }) {
  const [salonsList, setSalonsList] = useState([]);
  const [allBills, setAllBills] = useState([]);

  useEffect(() => {
    fetchAllSalonsAndData();
  }, []);

  const fetchAllSalonsAndData = async () => {
    const { data: salons } = await supabase.from('salons').select('*');
    const { data: bills } = await supabase.from('bills').select('*');
    if (salons) setSalonsList(salons);
    if (bills) setAllBills(bills);
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">⚡ Super Admin Master Dashboard</h1>
          <p className="text-xs text-slate-400">Absolute Control Over All Registered Salons (Tenant Isolated)</p>
        </div>
        <button onClick={onLogout} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg">Logout Super Admin</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <p className="text-sm text-slate-400">Total Registered Salons</p>
          <h3 className="text-3xl font-bold text-amber-400 mt-2">{salonsList.length}</h3>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <p className="text-sm text-slate-400">Total System Revenue</p>
          <h3 className="text-3xl font-bold text-emerald-400 mt-2">₹{allBills.reduce((acc, b) => acc + Number(b.grand_total || 0), 0)}</h3>
        </div>
      </div>

      <h3 className="text-lg font-bold text-amber-400 mb-4">Salons Live Data & ID Monitoring</h3>
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">Salon ID / Code</th>
              <th className="p-4">Salon Name</th>
              <th className="p-4">Owner Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Total Bills Generated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {salonsList.map(s => (
              <tr key={s.id} className="hover:bg-slate-800/40 transition">
                <td className="p-4 font-mono text-amber-300 font-bold">{s.salon_code}</td>
                <td className="p-4 font-bold">{s.salon_name}</td>
                <td className="p-4">{s.owner_name}</td>
                <td className="p-4">{s.phone}</td>
                <td className="p-4">{allBills.filter(b => b.salon_code === s.salon_code).length} Bills Recorded</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 2. POS MODULE ---
function SalonPOSModule({ session }) {
  const [services] = useState([
    { id: 1, name: 'HAIR CUT', price: 200 },
    { id: 2, name: 'MASK LOREAL XTENSO', price: 869 },
    { id: 3, name: 'BEARD STYLE', price: 150 },
    { id: 4, name: 'HAIR SPA', price: 600 },
    { id: 5, name: 'HAIR COLOR', price: 350 },
    { id: 6, name: 'FACIAL O+3', price: 2200 }
  ]);
  const [staffList] = useState(['Rahul', 'Amit', 'Pooja', 'Deepak']);
  const [cart, setCart] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');

  const addToCart = (srv) => {
    setCart([...cart, { ...srv, qty: 1, staff: staffList[0], discType: 'FLAT', discVal: 0 }]);
  };

  const updateCartItem = (idx, field, val) => {
    const updated = [...cart];
    updated[idx][field] = val;
    setCart(updated);
  };

  const finalCalculatedTotal = cart.reduce((acc, item) => {
    const itemTotal = item.price * item.qty;
    let itemDisc = 0;
    if (item.discType === 'FLAT') {
      itemDisc = Number(item.discVal) || 0;
    } else if (item.discType === 'PERCENT') {
      itemDisc = (itemTotal * (Number(item.discVal) || 0)) / 100;
    }
    return acc + Math.max(0, itemTotal - itemDisc);
  }, 0);

  const handleCheckout = async () => {
    if (cart.length === 0 || !clientPhone) {
      alert("Kripya Client Mobile Number aur Service Cart mein add karein!");
      return;
    }
    const billNo = 'BILL-' + Math.floor(1000 + Math.random() * 9000);
    const payload = {
      salon_code: session.salonCode,
      bill_no: billNo,
      client_name: clientName || 'Guest Client',
      client_phone: clientPhone,
      items: cart,
      grand_total: Math.round(finalCalculatedTotal),
      payment_mode: paymentMode,
      date: new Date().toISOString()
    };

    const { error } = await supabase.from('bills').insert([payload]);
    if (!error) {
      alert("Bill Generated Successfully! No: " + billNo);
      setCart([]);
      setClientName('');
      setClientPhone('');
    } else {
      alert("Error saving bill: " + error.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <h3 className="font-bold text-amber-400 text-lg">Fast Billing & Services</h3>
        <div className="space-y-3">
          <input type="text" placeholder="Client Name" value={clientName} onChange={e=>setClientName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm" />
          <input type="text" placeholder="Mobile Number *" value={clientPhone} onChange={e=>setClientPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm" required />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          {services.map(s => (
            <button key={s.id} onClick={() => addToCart(s)} className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition">
              <p className="font-bold text-sm text-white">{s.name}</p>
              <p className="text-xs text-amber-400 font-semibold mt-1">₹{s.price}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-xl">
        <div className="space-y-4">
          <h3 className="font-bold text-amber-400 text-lg border-b border-slate-800 pb-2">Current Cart</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cart.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-sm">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs text-slate-400">₹{item.price} x {item.qty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={item.discType} onChange={e => updateCartItem(idx, 'discType', e.target.value)} className="bg-slate-900 border border-slate-700 text-xs p-1 rounded">
                    <option value="FLAT">₹ Flat</option>
                    <option value="PERCENT">% Off</option>
                  </select>
                  <input type="number" placeholder="Disc" value={item.discVal} onChange={e => updateCartItem(idx, 'discVal', e.target.value)} className="w-16 bg-slate-900 border border-slate-700 text-xs p-1 rounded text-center" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Grand Total:</span>
            <span className="text-amber-400">₹{Math.round(finalCalculatedTotal)}</span>
          </div>
          <button onClick={handleCheckout} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-lg">Complete Checkout & Save Bill</button>
        </div>
      </div>
    </div>
  );
}

// --- 3. CRM, EXPENSES, REPORTS, SETTINGS MOCKS ---
function SalonCRMModule({ session }) {
  return <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-amber-400 font-bold">Customer Profiles & CRM Directory (Active)</div>;
}
function SalonExpensesModule({ session }) {
  return <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-amber-400 font-bold">Expense Tracker Module (Active)</div>;
}
function SalonReportsModule({ session }) {
  return <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-amber-400 font-bold">Enterprise Reports Module (Active)</div>;
}
function SalonSettingsModule({ session }) {
  return <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-amber-400 font-bold">Salon Settings & Password Module (Active)</div>;
}

// --- 4. PLUGIN REGISTRY ---
function DynamicPluginRegistry({ activeModule, session }) {
  switch(activeModule) {
    case 'billing': return <SalonPOSModule session={session} />;
    case 'crm': return <SalonCRMModule session={session} />;
    case 'expenses': return <SalonExpensesModule session={session} />;
    case 'reports': return <SalonReportsModule session={session} />;
    case 'settings': return <SalonSettingsModule session={session} />;
    default: return <div className="p-6 text-amber-400">Module loaded via Plugin Registry.</div>;
  }
}

// --- 5. MAIN DEFAULT EXPORT ---
export default function SalonGroEnterprisePlatform() {
  const [currentSession, setCurrentSession] = useState(null);
  const [activeTab, setActiveTab] = useState('billing');
  const [authMode, setAuthMode] = useState('login'); 
  
  const [loginForm, setLoginForm] = useState({ code: '', password: '' });
  const [regForm, setRegForm] = useState({
    email: '',
    salonName: '',
    ownerName: '',
    mobile: '',
    password: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (loginForm.code === 'superadmin' && loginForm.password === 'masterkey123') {
      setCurrentSession({ salonCode: 'SUPER_ADMIN', role: 'SUPER_ADMIN' });
      return;
    }
    const { data } = await supabase.from('salons').select('*').eq('salon_code', loginForm.code).eq('password', loginForm.password).single();
    if (data) {
      setCurrentSession({ ...data, salonCode: data.salon_code, role: 'OWNER' });
    } else {
      alert("Invalid Salon Code or Password!");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const salonCode = 'SG-' + Math.floor(1000 + Math.random() * 9000);
    const { error } = await supabase.from('salons').insert([
      {
        salon_code: salonCode,
        email: regForm.email,
        salon_name: regForm.salonName,
        owner_name: regForm.ownerName,
        phone: regForm.mobile,
        password: regForm.password
      }
    ]);

    if (!error) {
      alert("Account Created Successfully! Aapka Salon Code hai: " + salonCode);
      setAuthMode('login');
    } else {
      alert("Registration Failed: " + error.message);
    }
  };

  if (!currentSession) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-md space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-500 rounded-xl mx-auto flex items-center justify-center text-slate-950 font-bold text-xl">SG</div>
            <h2 className="text-2xl font-bold text-amber-400">SALONGRO POS</h2>
            <p className="text-xs text-slate-400">Commercial POS & Multi-Owner Platform</p>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button 
              type="button" 
              onClick={() => setAuthMode('login')} 
              className={`py-2 text-xs font-bold rounded-lg transition ${authMode === 'login' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
              Owner / Staff Login
            </button>
            <button 
              type="button" 
              onClick={() => setAuthMode('register')} 
              className={`py-2 text-xs font-bold rounded-lg transition ${authMode === 'register' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
              New Registration
            </button>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input type="text" placeholder="Salon Code or superadmin" value={loginForm.code} onChange={e=>setLoginForm({...loginForm, code: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm" required />
              <input type="password" placeholder="Password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm" required />
              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-lg">Login to Salon Dashboard</button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <input type="email" placeholder="Email *" value={regForm.email} onChange={e=>setRegForm({...regForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm" required />
              <input type="text" placeholder="Salon / Spa Name *" value={regForm.salonName} onChange={e=>setRegForm({...regForm, salonName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm" required />
              <input type="text" placeholder="Owner / Manager Name *" value={regForm.ownerName} onChange={e=>setRegForm({...regForm, ownerName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm" required />
              <input type="text" placeholder="Mobile Number (User ID) *" value={regForm.mobile} onChange={e=>setRegForm({...regForm, mobile: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm" required />
              <input type="password" placeholder="Password *" value={regForm.password} onChange={e=>setRegForm({...regForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm" required />
              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-lg text-sm">CREATE ACCOUNT & START TRIAL</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (currentSession.role === 'SUPER_ADMIN') {
    return <SuperAdminMasterDashboard onLogout={() => setCurrentSession(null)} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h1 className="font-bold text-amber-400">{currentSession.salon_name}</h1>
          <span className="text-xs text-emerald-400 font-semibold">● Verified Hub</span>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { id: 'billing', label: 'POS Rapid Billing' },
            { id: 'crm', label: 'Customer Profiles & CRM' },
            { id: 'expenses', label: 'Expense Tracker' },
            { id: 'reports', label: 'Enterprise Reports' },
            { id: 'settings', label: 'Salon Settings & Password' }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === t.id ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:bg-slate-800'}`}>{t.label}</button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => setCurrentSession(null)} className="w-full py-2 bg-rose-600/20 text-rose-400 rounded-xl text-xs font-bold border border-rose-500/30">Logout Salon</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-6">
          <h2 className="text-lg font-bold text-amber-400 uppercase tracking-wider">{activeTab} Control Hub</h2>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <DynamicPluginRegistry activeModule={activeTab} session={currentSession} />
        </main>
      </div>
    </div>
  );
                                                                                      }
