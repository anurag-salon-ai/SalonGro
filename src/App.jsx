import React, { useState } from 'react';
import { 
  Scissors, Users, Calendar, DollarSign, Shield, 
  Smartphone, Printer, MessageSquare, Plus, Trash2, 
  Mic, Package, TrendingUp, Lock, CheckCircle, AlertCircle, Phone
} from 'lucide-react';

 function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState('pos');
  const [billingMode, setBillingMode] = useState('quick'); // 'quick' or 'detailed'
  
  // Master Password State
  const [masterPin, setMasterPin] = useState('1234');
  const [inputPin, setInputPin] = useState('');

  // Customer & Search State
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');

  // Cart & Inventory State
  const [cart, setCart] = useState([]);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');

  // Master Data: Services & Staff
  const servicesList = [
    { id: 's1', name: 'Master Hair Cut', price: 350, category: 'Hair' },
    { id: 's2', name: 'Advanced Hair Spa', price: 1200, category: 'Hair' },
    { id: 's3', name: 'Beard Sculpting', price: 250, category: 'Grooming' },
    { id: 's4', name: 'O3+ Luxury Facial', price: 2500, category: 'Skin' },
    { id: 's5', name: 'Global Hair Color', price: 2200, category: 'Hair' },
    { id: 's6', name: 'De-Tan Cleanup', price: 700, category: 'Skin' }
  ];

  const staffList = [
    { id: 'stf_1', name: 'Rahul (Master Stylist)' },
    { id: 'stf_2', name: 'Amit (Skin Expert)' },
    { id: 'stf_3', name: 'Pooja (Senior Stylist)' }
  ];

  // Smart Client Lookup & Auto-Segmentation Simulator
  const handlePhoneInput = (val) => {
    setCustomerPhone(val);
    if (val.length === 10) {
      setCustomerId(`CUST-${Math.floor(1000 + Math.random() * 9000)}`);
      setCustomerName(val === '8840786094' ? 'Prakash (VIP Regular)' : 'Walk-in Client');
    } else {
      setCustomerId('');
      setCustomerName('');
    }
  };

  // Add to Cart
  const addToCart = (srv) => {
    const existing = cart.find(item => item.id === srv.id);
    if (existing) {
      setCart(cart.map(item => item.id === srv.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...srv, qty: 1, staff: staffList[0].id, discount: 0 }]);
    }
  };

  // Voice Billing Simulation
  const handleVoiceBilling = () => {
    alert("🎤 Voice Billing Listening... (Simulated: Added 'Master Hair Cut')");
    addToCart(servicesList[0]);
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => {
    const itemTotal = item.price * item.qty;
    const disc = billingMode === 'detailed' ? (itemTotal * (item.discount || 0)) / 100 : 0;
    return acc + (itemTotal - disc);
  }, 0);

  const finalDiscount = billingMode === 'quick' ? (subtotal * overallDiscount) / 100 : 0;
  const netPayable = Math.round(subtotal - finalDiscount);

  // Print Thermal Bill
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp Gateway
  const handleWhatsAppBill = () => {
    alert(`📱 Professional Digital Bill & 2-Step Review Gateway sent to WhatsApp (+91 ${customerPhone || 'Customer'}) successfully!`);
  };

  return (
    <div className="min-h-screen bg-[#111827] text-gray-100 font-sans flex flex-col md:flex-row">
      
      {/* --- VASTU LUXURY SIDEBAR (Deep Navy #1A1D20 & Champagne Gold #D4AF37) --- */}
      <aside className="w-full md:w-64 bg-[#1A1D20] border-r border-gray-800 flex flex-col justify-between p-5">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-[#D4AF37] p-2.5 rounded-xl text-[#1A1D20] font-bold">
              <Scissors size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide text-[#D4AF37]">SalonGro</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">World-Class SaaS POS</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'pos', label: 'POS & Billing', icon: DollarSign },
              { id: 'crm', label: 'Smart CRM & Segments', icon: Users },
              { id: 'inventory', label: 'Dual Inventory', icon: Package },
              { id: 'appointments', label: 'Omnichannel Calendar', icon: Calendar },
              { id: 'security', label: 'Master Security & Sessions', icon: Shield },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === item.id 
                      ? 'bg-[#D4AF37] text-[#1A1D20] font-bold shadow-lg shadow-[#D4AF37]/20' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-xs">
          <div className="flex items-center justify-between text-[#10B981] font-semibold mb-1">
            <span>● Supabase RLS Secured</span>
          </div>
          <p className="text-gray-400 text-[11px]">Master Login Active</p>
        </div>
      </aside>

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#0B0F17]">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#161D2E] p-4 rounded-2xl border border-gray-800 mb-6 gap-4 shadow-xl">
          <div>
            <h2 className="text-2xl font-bold text-white">Royal Spa & Salon (Master Terminal)</h2>
            <p className="text-xs text-gray-400">Muzaffarpur • Multi-Tenant Isolated Environment</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleVoiceBilling}
              className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Mic size={16} /> Voice Billing
            </button>
            <span className="bg-[#10B981]/20 text-[#10B981] text-xs font-bold px-3 py-1.5 rounded-full border border-[#10B981]/30">
              Trial Active
            </span>
          </div>
        </header>

        {/* --- TAB 1: POS & BILLING --- */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Customer & Services */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Customer Box */}
              <div className="bg-[#161D2E] p-5 rounded-2xl border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Users size={18} className="text-[#D4AF37]" /> Client & Mode Selection
                  </h3>
                  <div className="bg-[#0B0F17] p-1 rounded-xl flex gap-1 border border-gray-800">
                    <button 
                      onClick={() => setBillingMode('quick')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${billingMode === 'quick' ? 'bg-[#D4AF37] text-[#1A1D20]' : 'text-gray-400'}`}
                    >
                      ⚡ Quick Mode
                    </button>
                    <button 
                      onClick={() => setBillingMode('detailed')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${billingMode === 'detailed' ? 'bg-[#D4AF37] text-[#1A1D20]' : 'text-gray-400'}`}
                    >
                      🛠 Detailed Mode
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mobile Number (Diary Sync)</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-3 text-gray-500" />
                      <input 
                        type="text" 
                        maxLength={10}
                        placeholder="Enter 10 digit number..." 
                        value={customerPhone}
                        onChange={(e) => handlePhoneInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-[#D4AF37] text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Client Name & Auto ID</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Customer Name" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#0B0F17] border border-gray-800 rounded-xl text-white text-sm"
                      />
                      {customerId && (
                        <span className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold px-3 py-2 rounded-xl flex items-center border border-[#D4AF37]/40">
                          {customerId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Catalog */}
              <div className="bg-[#161D2E] p-5 rounded-2xl border border-gray-800">
                <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
                  <Scissors size={18} className="text-[#D4AF37]" /> Select Services
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {servicesList.map(srv => (
                    <button
                      key={srv.id}
                      onClick={() => addToCart(srv)}
                      className="p-4 rounded-xl border border-gray-800 bg-[#0B0F17] hover:border-[#D4AF37] transition-all text-left flex flex-col justify-between group"
                    >
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-[#D4AF37]">{srv.category}</span>
                        <h4 className="font-semibold text-sm text-gray-200 group-hover:text-[#D4AF37] mt-0.5">{srv.name}</h4>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="font-bold text-sm text-white">₹{srv.price}</span>
                        <div className="w-6 h-6 rounded-lg bg-gray-800 text-white flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#1A1D20]">
                          <Plus size={14} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Col: Cart & Thermal / WhatsApp Actions */}
            <div className="bg-[#161D2E] p-5 rounded-2xl border border-gray-800 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-white mb-4 flex justify-between items-center">
                  <span>Current Bill</span>
                  <span className="text-xs bg-gray-800 px-2.5 py-1 rounded-lg text-gray-300">{cart.length} Items</span>
                </h3>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-xs border border-dashed border-gray-800 rounded-xl">
                      Cart is empty. Select services.
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="p-3 bg-[#0B0F17] rounded-xl border border-gray-800 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold text-xs text-white">{item.name}</h5>
                            <p className="text-[11px] text-gray-400">₹{item.price} × {item.qty}</p>
                          </div>
                          <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-red-400 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {billingMode === 'detailed' && (
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
                            <select 
                              value={item.staff}
                              onChange={(e) => setCart(cart.map(i => i.id === item.id ? {...i, staff: e.target.value} : i))}
                              className="w-full text-[11px] p-1 bg-gray-900 border border-gray-800 rounded text-gray-300"
                            >
                              {staffList.map(stf => <option key={stf.id} value={stf.id}>{stf.name}</option>)}
                            </select>
                            <input 
                              type="number" 
                              placeholder="Disc %"
                              value={item.discount}
                              onChange={(e) => setCart(cart.map(i => i.id === item.id ? {...i, discount: Number(e.target.value)} : i))}
                              className="w-full text-[11px] p-1 bg-gray-900 border border-gray-800 rounded text-right text-gray-300"
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {billingMode === 'quick' && cart.length > 0 && (
                  <div className="mt-4 p-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20 flex justify-between items-center">
                    <span className="text-xs font-bold text-[#D4AF37]">Overall Flat / % Discount</span>
                    <input 
                      type="number" 
                      value={overallDiscount}
                      onChange={(e) => setOverallDiscount(Number(e.target.value))}
                      className="w-16 p-1 text-right text-xs font-bold bg-[#0B0F17] border border-[#D4AF37]/40 rounded text-white"
                    />
                  </div>
                )}
              </div>

              {/* Totals & Actions */}
              <div className="mt-6 pt-4 border-t border-gray-800 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {finalDiscount > 0 && (
                    <div className="flex justify-between text-[#10B981]">
                      <span>Discount</span>
                      <span>-₹{finalDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-gray-800">
                    <span>Net Payable</span>
                    <span className="text-[#D4AF37]">₹{netPayable}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                    onClick={handlePrint}
                    disabled={cart.length === 0}
                    className="bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Printer size={14} /> Print Bill
                  </button>
                  <button 
                    onClick={handleWhatsAppBill}
                    disabled={cart.length === 0 || !customerPhone}
                    className="bg-[#10B981] hover:bg-[#059669] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <MessageSquare size={14} /> WhatsApp
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* --- TAB 2: SMART CRM & SEGMENTATION --- */}
        {activeTab === 'crm' && (
          <div className="bg-[#161D2E] p-6 rounded-2xl border border-gray-800 space-y-6">
            <div>
              <h3 className="font-bold text-xl text-white mb-1">AI Client Auto-Segmentation Engine</h3>
              <p className="text-gray-400 text-xs">Automatically categorizes clients by spending tiers and visit frequency.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#0B0F17] rounded-xl border border-gray-800">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase">High-Paying (VIP)</span>
                <h4 className="text-2xl font-bold text-white mt-1">18 Clients</h4>
                <p className="text-xs text-gray-400 mt-1">Spent > ₹5,000 this month</p>
              </div>
              <div className="p-4 bg-[#0B0F17] rounded-xl border border-gray-800">
                <span className="text-[10px] font-bold text-blue-400 uppercase">Regulars (3-4 visits/mo)</span>
                <h4 className="text-2xl font-bold text-white mt-1">42 Clients</h4>
                <p className="text-xs text-gray-400 mt-1">High retention rate</p>
              </div>
              <div className="p-4 bg-[#0B0F17] rounded-xl border border-gray-800">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">New This Week</span>
                <h4 className="text-2xl font-bold text-white mt-1">12 Clients</h4>
                <p className="text-xs text-gray-400 mt-1">Auto-updating category</p>
              </div>
            </div>
          </div>
        )}
        </main>
         
</div>
);
}

export default App; 
    
