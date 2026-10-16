import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Live Supabase Client Connection (Secure & Crash-Proof)
const SUPABASE_URL = "https://vbxeixxbvtetixsfgpsz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZieGVpeHhidnRldGl4c2ZncHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTM3OTcsImV4cCI6MjEwNjc4OTc5N30.tJ2HK_4eEg-dzGUOJ6Dox0mEGijtMPCA10CL772C-TI";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default function SalonGroEnterprisePlatform() {
  const [currentSession, setCurrentSession] = useState(null);
  const [activeTab, setActiveTab] = useState('billing');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // PWA Install Prompt Listener
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) setIsAppInstalled(true);
  }, []);

  const handleDownloadAppPrompt = () => {
    if (isAppInstalled) {
      alert("SalonGro App pehle se hi aapke device par installed hai!");
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          setIsAppInstalled(true);
        }
        setDeferredPrompt(null);
      });
    } else {
      alert("App install karne ke liye browser menu (3 dots) par click karke 'Add to Home Screen' chunein.");
    }
  };
    const [loginForm, setLoginForm] = useState({ code: '', password: '' });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    // Master Super Admin Control Panel Login
    if (loginForm.code === 'superadmin' && loginForm.password === 'masterkey123') {
      setCurrentSession({ salonCode: 'SUPER_ADMIN', role: 'SUPER_ADMIN', salonName: 'Master Control Center' });
      return;
    }

    // Salon Owner Login with Data Isolation
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('salon_code', loginForm.code)
      .eq('password', loginForm.password)
      .single();

    if (data) {
      setCurrentSession({ ...data, salonCode: data.salon_code, role: 'OWNER' });
    } else {
      alert("Invalid Salon Code or Password! Kripya sahi details bharein.");
    }
  };
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
          <h1 className="text-2xl font-bold text-amber-400">🛡️ Super Admin Master Dashboard</h1>
          <p className="text-xs text-slate-400">Absolute Control Over All Registered Salons (Tenant Isolated)</p>
        </div>
        <button onClick={onLogout} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg">Logout Master</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <p className="text-sm text-slate-400">Total Registered Salons</p>
          <h3 className="text-3xl font-bold text-amber-400 mt-2">{salonsList.length}</h3>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <p className="text-sm text-slate-400">Total System Revenue (All Salons)</p>
          <h3 className="text-3xl font-bold text-emerald-400 mt-2">₹{allBills.reduce((acc, b) => acc + Number(b.grand_total), 0)}</h3>
        </div>
      </div>

      <h3 className="text-lg font-bold text-amber-400 mb-4">Salons Live Data & ID Monitoring</h3>
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
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
  // Upgraded Part 5 & 6: Per-Service Staff & Per-Service Discount Options
function SalonPOSModule({ session }) {
  const [services] = useState([
    { id: 1, name: 'HAIR CUT', price: 200 },
    { id: 2, name: 'Mask loreal xtenso', price: 869 },
    { id: 3, name: 'BEARD STYLE', price: 150 },
    { id: 4, name: 'HAIR SPA', price: 600 },
    { id: 5, name: 'HAIR COLOR', price: 350 },
    { id: 6, name: 'FACIAL O+3', price: 2200 }
  ]);
  const [staffList] = useState(['Rahul', 'Amit', 'Pooja', 'Deepak']);
  const [cart, setCart] = useState([]);

  // Client States
  const [clientList, setClientList] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [autoGeneratedId, setAutoGeneratedId] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');

  useEffect(() => {
    supabase.from('bills').select('client_name, client_phone, client_id').eq('salon_code', session.salonCode).then(({ data }) => {
      if (data) {
        const uniqueClients = Array.from(new Set(data.map(b => b.client_phone)))
          .map(phone => data.find(b => b.client_phone === phone));
        setClientList(uniqueClients);
      }
    });
  }, [session.salonCode]);

  const handleSelectExistingClient = (phone) => {
    const found = clientList.find(c => c.client_phone === phone);
    if (found) {
      setClientName(found.client_name);
      setClientPhone(found.client_phone);
      setAutoGeneratedId(found.client_id);
    }
  };

  const handleSaveNewClient = () => {
    if (!clientName || !clientPhone) {
      alert("Kripya Client Name aur Phone Number dono bharein!");
      return;
    }
    const newId = `#SG-${Math.floor(10 + Math.random() * 89)}a${Math.floor(1 + Math.random() * 9)}`;
    setAutoGeneratedId(newId);
    alert(`New Client Saved Successfully! Client ID: ${newId}`);
  };

  // Add service with default staff, discount type ('FLAT' or 'PERCENT'), and discount value (0)
  const addToCart = (srv) => {
    setCart([...cart, { 
      ...srv, 
      qty: 1, 
      staff: staffList[0], 
      discType: 'FLAT', // 'FLAT' or 'PERCENT'
      discVal: 0 
    }]);
  };

  const updateCartItem = (idx, field, val) => {
    const updated = [...cart];
    updated[idx][field] = val;
    setCart(updated);
  };

  // Grand Total Calculation with Per-Service Discount
  const totalSubTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  
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

    const finalClientId = autoGeneratedId || `#SG-${Math.floor(10 + Math.random() * 89)}a1`;
    const billNo = `BILL-${Math.floor(1000 + Math.random() * 9000)}`;

    const payload = {
      salon_code: session.salonCode,
      bill_no: billNo,
      client_name: clientName || 'Guest Client',
      client_phone: clientPhone,
      client_id: finalClientId,
      items: cart,
      grand_total: Math.round(finalCalculatedTotal),
      payment_mode: paymentMode,
      date: new Date().toISOString()
    };

    await supabase.from('bills').insert([payload]);

    const reviewLink = session.google_review_url || "https://google.com";
    const privateComplaint = `https://wa.me/91${session.whatsapp_number || '919473066394'}?text=Feedback%20Bill%20${billNo}`;

    const msg = `*${session.salon_name}* 🛡️ [Verified Hub]\n` +
      `📍 ${session.address || 'Main Street'}\n\n` +
      `Namaste ${clientName || 'Valued Client'} (${finalClientId}), thank you for visiting us!\n\n` +
      `*Bill No:* ${billNo}\n` +
      `*Services & Staff Mapping:* \n` +
      cart.map(i => `• ${i.name} - ₹${i.price} [Staff: ${i.staff}] (Disc: ${i.discVal}${i.discType === 'FLAT' ? '₹' : '%'})`).join('\n') +
      `\n------------------------\n` +
      `*Grand Total:* ₹${Math.round(finalCalculatedTotal)}\n` +
      `*Payment:* ${paymentMode}\n\n` +
      `⭐ *Rate Us 5★ (Google Review):*\n${reviewLink}\n\n` +
      `⚠️ *Feedback / Complaint:* \n${privateComplaint}`;

    window.open(`https://wa.me/91${clientPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    alert(`Bill ${billNo} Generated Successfully!`);
    setCart([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Front Page Input Section */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
        <h3 className="font-bold text-amber-400 text-lg border-b border-slate-800 pb-2">Front POS Billing & Client Registry</h3>
        
        <div>
          <label className="text-xs text-slate-400">Select Saved Existing Client</label>
          <select 
            onChange={e => handleSelectExistingClient(e.target.value)} 
            className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-amber-300 text-sm mt-1 font-bold"
          >
            <option value="">-- Choose Existing Client --</option>
            {clientList.map((c, idx) => (
              <option key={idx} value={c.client_phone}>
                {c.client_name} ({c.client_phone}) - ID: {c.client_id}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400">Client Name</label>
            <input type="text" placeholder="Client Name" value={clientName} onChange={e=>setClientName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs text-slate-400">Mobile Number</label>
            <input type="text" placeholder="Mobile Number" value={clientPhone} onChange={e=>setClientPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm mt-1" />
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block">Generated Client ID:</span>
            <span className="font-mono text-amber-400 font-bold text-sm">{autoGeneratedId || 'Auto-Generates on Save'}</span>
          </div>
          <button type="button" onClick={handleSaveNewClient} className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition">
            Save New Client
          </button>
        </div>

        <div>
          <label className="text-xs text-slate-400">Select Service from Dropdown List</label>
          <select 
            onChange={(e) => {
              const selected = services.find(s => s.id === Number(e.target.value));
              if (selected) addToCart(selected);
            }} 
            className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm mt-1"
          >
            <option value="">-- Choose Service to Add --</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name} - ₹{s.price}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          {services.map(s => (
            <button key={s.id} onClick={() => addToCart(s)} className="p-2.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 rounded-xl text-left border border-slate-700 transition">
              <p className="font-bold text-xs">{s.name}</p>
              <p className="text-xs text-amber-400">₹{s.price}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart with Per-Service Staff & Per-Service Discount Options */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-2xl">
        <div>
          <h3 className="font-bold text-amber-400 mb-3 border-b border-slate-800 pb-2">Cart, Per-Service Staff & Item Discount</h3>
          {cart.length === 0 ? (
            <p className="text-slate-500 text-sm italic">Cart is empty. Select services.</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-sm">
                  <div className="flex justify-between items-center font-bold">
                    <span>{item.name} (₹{item.price})</span>
                    <span className="text-amber-400">₹{item.price * item.qty}</span>
                  </div>
                  
                  {/* Per Service Staff Dropdown & Discount Options */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block">Assigned Staff</label>
                      <select value={item.staff} onChange={(e) => updateCartItem(idx, 'staff', e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-xs p-1.5 rounded-lg text-amber-300 font-bold">
                        {staffList.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Item Discount (₹ or %)</label>
                      <div className="flex gap-1">
                        <select value={item.discType} onChange={(e) => updateCartItem(idx, 'discType', e.target.value)} className="bg-slate-900 border border-slate-700 text-[10px] p-1 rounded text-white">
                          <option value="FLAT">₹</option>
                          <option value="PERCENT">%</option>
                        </select>
                        <input type="number" placeholder="0" value={item.discVal} onChange={(e) => updateCartItem(idx, 'discVal', e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-xs p-1.5 rounded text-white text-center" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3 mt-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Grand Total:</span>
            <span className="text-amber-400">₹{Math.round(finalCalculatedTotal)}</span>
          </div>
          <button onClick={handleCheckout} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-xl transition">
            Checkout, Print & Send WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
      }
  function SalonCRMModule({ session }) {
  const [clients, setClients] = useState([]);
  useEffect(() => {
    supabase.from('bills').select('*').eq('salon_code', session.salonCode).then(({data}) => {
      if(data) {
        const unique = Array.from(new Set(data.map(b => b.client_phone)))
          .map(phone => data.find(b => b.client_phone === phone));
        setClients(unique);
      }
    });
  }, []);

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
      <h3 className="text-lg font-bold text-amber-400 mb-4">Customer Profiles & CRM Directory</h3>
      <div className="space-y-3">
        {clients.length === 0 ? (
          <p className="text-slate-500 text-sm italic">No client records found yet.</p>
        ) : (
          clients.map((c, i) => (
            <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">{c.client_name} <span className="text-xs text-amber-400">({c.client_id})</span></p>
                <p className="text-xs text-slate-400">Phone: {c.client_phone}</p>
              </div>
              <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 font-bold">Active Client</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
  }
  function SalonExpensesModule({ session }) {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    supabase.from('expenses').select('*').eq('salon_code', session.salonCode).then(({data}) => {
      if(data) setExpenses(data);
    });
  }, []);

  const addExpense = async () => {
    if(!title || !amount) return;
    const newExp = { salon_code: session.salonCode, title, amount: Number(amount), date: new Date().toLocaleString() };
    await supabase.from('expenses').insert([newExp]);
    setExpenses([...expenses, newExp]);
    setTitle(''); setAmount('');
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-xl shadow-xl">
      <h3 className="text-lg font-bold text-amber-400 mb-4">Expense Tracker (Date & Time Stamped)</h3>
      <div className="space-y-3 mb-6">
        <input type="text" placeholder="Expense Title (e.g., Electricity, Shampoo Stock)" value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm" />
        <input type="number" placeholder="Amount (₹)" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm" />
        <button onClick={addExpense} className="w-full py-2.5 bg-amber-500 font-bold text-slate-950 rounded-xl shadow">Add Expense Record</button>
      </div>
      <div className="space-y-2">
        {expenses.map((ex, i) => (
          <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-sm">
            <div>
              <p className="font-bold">{ex.title}</p>
              <p className="text-xs text-slate-500">{ex.date}</p>
            </div>
            <span className="font-bold text-rose-400">-₹{ex.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
  }
  function SalonReportsModule({ session }) {
  const [bills, setBills] = useState([]);
  useEffect(() => {
    supabase.from('bills').select('*').eq('salon_code', session.salonCode).then(({data}) => {
      if(data) setBills(data);
    });
  }, []);

  const totalSales = bills.reduce((acc, b) => acc + Number(b.grand_total), 0);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-amber-400">Enterprise Reports & Staff Commission Dashboard</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <p className="text-sm text-slate-400">Total Salon Revenue</p>
          <h3 className="text-3xl font-bold text-emerald-400 mt-2">₹{totalSales}</h3>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <p className="text-sm text-slate-400">Total Bills Processed</p>
          <h3 className="text-3xl font-bold text-amber-400 mt-2">{bills.length}</h3>
        </div>
      </div>
    </div>
  );
  }
  function SalonSettingsModule({ session }) {
  const [settings, setSettings] = useState({
    salonName: session.salon_name || '',
    ownerName: session.owner_name || '',
    whatsappNumber: session.whatsapp_number || '',
    googleReviewUrl: session.google_review_url || '',
    address: session.address || '',
    gstNo: session.gst_no || '5%',
    jdReg: session.jd_reg || 'JDRR-2026-99',
    walletSystem: true,
    memberships: true,
    comboPackages: true,
    retailInventory: true,
    loyaltyPoints: true,
    gstSupport: true,
    paymentGateway: true,
    verifiedBadge: true
  });

  const [newPassword, setNewPassword] = useState('');

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const payload = {
      salon_name: settings.salonName,
      owner_name: settings.ownerName,
      whatsapp_number: settings.whatsappNumber,
      google_review_url: settings.googleReviewUrl,
      address: settings.address,
      gst_no: settings.gstNo,
      jd_reg: settings.jdReg,
      feature_toggles: {
        walletSystem: settings.walletSystem,
        memberships: settings.memberships,
        comboPackages: settings.comboPackages,
        retailInventory: settings.retailInventory,
        loyaltyPoints: settings.loyaltyPoints,
        gstSupport: settings.gstSupport,
        paymentGateway: settings.paymentGateway,
        verifiedBadge: settings.verifiedBadge
      }
    };

    if (newPassword.trim() !== '') {
      payload.password = newPassword;
    }

    const { error } = await supabase
      .from('salons')
      .update(payload)
      .eq('salon_code', session.salonCode);

    if (!error) {
      alert("Salon Control Profile, Feature Toggles & Password Successfully Saved in Supabase!");
      setNewPassword('');
    } else {
      alert("Error saving settings: " + error.message);
    }
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-4xl shadow-2xl space-y-6">
      <div>
        <h3 className="font-bold text-amber-400 text-xl">Salon Settings, Profile & Feature Control Center</h3>
        <p className="text-xs text-slate-400">Enable/Disable Business Modules and Manage Credentials</p>
      </div>

      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3">Feature Toggles (Active Modules)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'walletSystem', label: 'Wallet System' },
            { key: 'memberships', label: 'Memberships' },
            { key: 'comboPackages', label: 'Combo Packages' },
            { key: 'retailInventory', label: 'Retail Inventory' },
            { key: 'loyaltyPoints', label: 'Loyalty Points' },
            { key: 'gstSupport', label: 'GST Support' },
            { key: 'paymentGateway', label: 'Payment Gateway / QR' },
            { key: 'verifiedBadge', label: 'Verified Badge (Free Hub)' }
          ].map(toggle => (
            <button
              key={toggle.key}
              type="button"
              onClick={() => handleToggle(toggle.key)}
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition ${
                settings[toggle.key]
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <span>{toggle.label}</span>
              <span>{settings[toggle.key] ? '✓ ON' : '✕ OFF'}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400">Salon Name</label>
            <input type="text" value={settings.salonName} onChange={e=>setSettings({...settings, salonName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm mt-1" required/>
          </div>
          <div>
            <label className="text-xs text-slate-400">Owner Name</label>
            <input type="text" value={settings.ownerName} onChange={e=>setSettings({...settings, ownerName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm mt-1"/>
          </div>
          <div>
            <label className="text-xs text-slate-400">Address</label>
            <input type="text" value={settings.address} onChange={e=>setSettings({...settings, address: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm mt-1"/>
          </div>
          <div>
            <label className="text-xs text-slate-400">Owner WhatsApp Complaint Number</label>
            <input type="text" value={settings.whatsappNumber} onChange={e=>setSettings({...settings, whatsappNumber: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm mt-1"/>
          </div>
          <div>
            <label className="text-xs text-slate-400">Google Review Direct URL (5-Star Link)</label>
            <input type="text" value={settings.googleReviewUrl} onChange={e=>setSettings({...settings, googleReviewUrl: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm mt-1"/>
          </div>
          <div>
            <label className="text-xs text-slate-400">Verification / Certificate Reg. ID</label>
            <input type="text" value={settings.jdReg} onChange={e=>setSettings({...settings, jdReg: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-sm mt-1"/>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mt-4">
          <label className="text-xs font-bold text-rose-400 uppercase tracking-wider">Change Salon Account Password</label>
          <input
            type="password"
            placeholder="Enter New Password (Khali chhodein agar badalna nahi hai)"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-white text-sm mt-2"
          />
        </div>

        <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-xl transition">
          Save Salon Profile, Toggles & Updated Credentials
        </button>
      </form>
    </div>
  );
                }
  // MODULAR EXTENSION PLUGINS: Future features (Biometric, Multi-location, etc.)
// can be added here seamlessly without rewriting core logic.
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
// MODULAR EXTENSION PLUGINS: Future features (Biometric, Multi-location, etc.)
// can be added here seamlessly without rewriting core logic.
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

  if (!currentSession) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 p-4">
        <form onSubmit={handleLoginSubmit} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-md space-y-4 shadow-2xl">
          <h2 className="text-2xl font-bold text-amber-400 text-center">SalonGro Enterprise POS</h2>
          <p className="text-xs text-slate-400 text-center">Secure Multi-Tenant SaaS Salon Management</p>
          <input type="text" placeholder="Salon Code or superadmin" value={loginForm.code} onChange={e=>setLoginForm({...loginForm, code: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm" required />
          <input type="password" placeholder="Password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm" required />
          <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-lg">Login to Salon Dashboard</button>
        </form>
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
