import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSalon, setCurrentSalon] = useState(null);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const [authMode, setAuthMode] = useState('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [salonName, setSalonName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [catalog, setCatalog] = useState([]);
  const [clients, setClients] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [salonsList, setSalonsList] = useState([]);

  const [cart, setCart] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [customItem, setCustomItem] = useState({ name: '', price: '' });

  const [setSalonTitle, setSetSalonTitle] = useState('');
  const [setOwnerTitle, setSetOwnerTitle] = useState('');
  const [setAddress, setSetAddress] = useState('');
  const [setGst, setSetGst] = useState(5);
  const [googleReviewLink, setGoogleReviewLink] = useState('');
  const [socialInsta, setSocialInsta] = useState('');
  const [socialFb, setSocialFb] = useState('');
  const [socialYt, setSocialYt] = useState('');
  const [newServName, setNewServName] = useState('');
  const [newServPrice, setNewServPrice] = useState('');

  const [invName, setInvName] = useState('');
  const [invQty, setInvQty] = useState('');
  const [invPrice, setInvPrice] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');

  const [apptClient, setApptClient] = useState('');
  const [apptPhone, setApptPhone] = useState('');
  const [apptService, setApptService] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');

  const isSuperAdminRoute = window.location.search.includes('admin=true') || window.location.hash === '#superadmin';

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });
  }, []);

  const handleInstallApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') setIsInstallable(false);
        setDeferredPrompt(null);
      });
    }
  };

  useEffect(() => {
    if (currentSalon?.id) {
      fetchAllSalonData();
      setSetSalonTitle(currentSalon.salon_name || '');
      setSetOwnerTitle(currentSalon.owner_name || '');
      setSetAddress(currentSalon.address || '');
      setSetGst(currentSalon.default_gst || 5);
      setGoogleReviewLink(currentSalon.google_review_link || '');
      setSocialInsta(currentSalon.social_insta || '');
      setSocialFb(currentSalon.social_fb || '');
      setSocialYt(currentSalon.social_yt || '');
    }
  }, [currentSalon]);

  useEffect(() => {
    if (isSuperAdminRoute) fetchSuperAdminSalons();
  }, [isSuperAdminRoute]);

  const fetchAllSalonData = async () => {
    if (!currentSalon?.id) return;
    const cid = currentSalon.id;
    const [{ data: cat }, { data: cli }, { data: inv }, { data: app }, { data: exp }] = await Promise.all([
      supabase.from('catalog').select('*').eq('salon_id', cid),
      supabase.from('clients').select('*').eq('salon_id', cid),
      supabase.from('inventory').select('*').eq('salon_id', cid),
      supabase.from('appointments').select('*').eq('salon_id', cid),
      supabase.from('expenses').select('*').eq('salon_id', cid),
    ]);
    setCatalog(cat || []);
    setClients(cli || []);
    setInventory(inv || []);
    setAppointments(app || []);
    setExpenses(exp || []);
  };

  const fetchSuperAdminSalons = async () => {
    const { data } = await supabase.from('salons').select('*').order('created_at', { ascending: false });
    setSalonsList(data || []);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'signup') {
        if (!salonName || !ownerName || !phone || !password) throw new Error('Required fields fill karein!');
        const { data: salon, error: sErr } = await supabase.from('salons').insert([{ salon_name: salonName, owner_name: ownerName, phone, email, address: '', default_gst: 5, status: 'active' }]).select().single();
        if (sErr) throw new Error(sErr.message);
        const { error: uErr } = await supabase.from('users').insert([{ salon_id: salon.id, full_name: ownerName, phone, password, role: 'owner' }]);
        if (uErr) throw new Error(uErr.message);
        alert('Account Created! Ab Login Karein.');
        setAuthMode('login');
      } else if (authMode === 'login') {
        if (!phone || !password) throw new Error('Phone aur Password dalein!');
        const { data: user, error: uErr } = await supabase.from('users').select('*, salons(*)').eq('phone', phone).single();
        if (uErr || !user) throw new Error('Phone number registered nahi hai!');
        if (user.password !== password) throw new Error('Galat Password!');
        if (user.salons?.status === 'suspended') throw new Error('Account Suspended!');
        setCurrentSalon(user.salons);
        setIsLoggedIn(true);
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const addToCart = (item, isProduct = false) => setCart([...cart, { ...item, isProduct, qty: 1 }]);
  
  const addCustomCart = () => {
    if (!customItem.name || !customItem.price) return;
    setCart([...cart, { id: Date.now().toString(), name: customItem.name, price: parseFloat(customItem.price), qty: 1, isProduct: false }]);
    setCustomItem({ name: '', price: '' });
  };
  
  const grandTotal = cart.reduce((acc, i) => acc + (parseFloat(i.price) * i.qty), 0);

  const processFullBill = async () => {
    if (!clientName || !clientPhone) { alert('Client Name & Phone Required!'); return; }
    if (cart.length === 0) { alert('Cart Khali hai!'); return; }
    
    const billNo = `BILL-${Math.floor(100 + Math.random() * 900)}`;

    for (const item of cart) {
      if (item.isProduct && item.id) {
        const invItem = inventory.find(i => i.id === item.id);
        if (invItem && invItem.qty > 0) {
          const updatedQty = Math.max(0, invItem.qty - item.qty);
          await supabase.from('inventory').update({ qty: updatedQty }).eq('id', item.id);
        }
      }
    }

    await supabase.from('bills').insert([{
      salon_id: currentSalon.id, bill_number: billNo, client_name: clientName, client_phone: clientPhone,
      items: cart, grand_total: grandTotal, payment_mode: paymentMode
    }]);

    const existing = clients.find(c => c.phone === clientPhone);
    if (existing) {
      await supabase.from('clients').update({
        total_visits: existing.total_visits + 1, total_spent: parseFloat(existing.total_spent) + grandTotal,
        tier: (parseFloat(existing.total_spent) + grandTotal) >= 5000 ? 'VIP' : 'Regular'
      }).eq('id', existing.id);
    } else {
      await supabase.from('clients').insert([{ salon_id: currentSalon.id, name: clientName, phone: clientPhone, total_visits: 1, total_spent: grandTotal, tier: grandTotal >= 5000 ? 'VIP' : 'Regular' }]);
    }

    const billDetails = cart.map(i => `• ${i.name} - ₹${i.price}`).join('\n');
    let waMsg = `*${currentSalon.salon_name}*\n\nNamaste ${clientName} ji, thank you for visiting us!\n\n*Bill Summary (${billNo}):*\n${billDetails}\n------------------\n*Total Paid: ₹${grandTotal}*\n`;
    
    if (googleReviewLink) {
      waMsg += `\n🌟 *Feedback:* Hamaari service kaisi lagi? Rating dene ke liye yahan click karein:\n${googleReviewLink}`;
    }

    window.open(`https://wa.me/91${clientPhone}?text=${encodeURIComponent(waMsg)}`, '_blank');

    const p = window.open('', '_blank');
    p.document.write(`<html><body style="font-family:monospace;width:280px;text-align:center;"><h2>${currentSalon.salon_name}</h2><p>Bill: ${billNo}</p><p>Client: ${clientName}</p><hr/><p>Total: ₹${grandTotal}</p><script>window.print();setTimeout(()=>window.close(),1000);</script></body></html>`);
    p.document.close();

    alert('Bill Processed, Stock Deducted & WhatsApp Dispatched!');
    setCart([]); setClientName(''); setClientPhone('');
    fetchAllSalonData();
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    await supabase.from('salons').update({
      salon_name: setSalonTitle, owner_name: setOwnerTitle, address: setAddress, default_gst: setGst,
      google_review_link: googleReviewLink, social_insta: socialInsta, social_fb: socialFb, social_yt: socialYt
    }).eq('id', currentSalon.id);
    setCurrentSalon({ ...currentSalon, salon_name: setSalonTitle, owner_name: setOwnerTitle, address: setAddress, default_gst: setGst, google_review_link: googleReviewLink, social_insta: socialInsta, social_fb: socialFb, social_yt: socialYt });
    alert('Settings & Google Review Link Saved!');
  };

  const handleAddCatalog = async () => {
    if (!newServName || !newServPrice) return;
    await supabase.from('catalog').insert([{ salon_id: currentSalon.id, name: newServName.toUpperCase(), price: parseFloat(newServPrice) }]);
    setNewServName(''); setNewServPrice(''); fetchAllSalonData();
  };

  const handleAddInventory = async () => {
    if (!invName || !invQty || !invPrice) return;
    await supabase.from('inventory').insert([{ salon_id: currentSalon.id, product_name: invName, qty: parseInt(invQty), selling_price: parseFloat(invPrice) }]);
    setInvName(''); setInvQty(''); setInvPrice(''); fetchAllSalonData();
  };

  const handleAddAppointment = async () => {
    if (!apptClient || !apptPhone || !apptService || !apptDate || !apptTime) return;
    await supabase.from('appointments').insert([{ salon_id: currentSalon.id, client_name: apptClient, phone: apptPhone, service_name: apptService, appointment_date: apptDate, appointment_time: apptTime }]);
    setApptClient(''); setApptPhone(''); setApptService(''); setApptDate(''); setApptTime(''); fetchAllSalonData();
  };

  const handleAddExpense = async () => {
    if (!expTitle || !expAmount) return;
    await supabase.from('expenses').insert([{ salon_id: currentSalon.id, title: expTitle, amount: parseFloat(expAmount) }]);
    setExpTitle(''); setExpAmount(''); fetchAllSalonData();
  };
    if (isSuperAdminRoute) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 bg-slate-950 text-white min-h-screen font-sans">
        <h1 className="text-2xl font-black text-amber-500 uppercase">SalonGro SuperAdmin Panel</h1>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-amber-400 font-bold border-b border-slate-800">
              <tr><th className="p-4">Salon Name</th><th className="p-4">Owner</th><th className="p-4">Phone</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {salonsList.map(s => (
                <tr key={s.id}>
                  <td className="p-4 font-bold">{s.salon_name}</td><td className="p-4">{s.owner_name}</td><td className="p-4">{s.phone}</td>
                  <td className="p-4"><span className={`px-2 py-0.5 rounded font-bold ${s.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{s.status}</span></td>
                  <td className="p-4 text-right">
                    <button onClick={async () => { await supabase.from('salons').update({ status: s.status === 'active' ? 'suspended' : 'active' }).eq('id', s.id); fetchSuperAdminSalons(); }} className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold">{s.status === 'active' ? 'Suspend' : 'Activate'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center font-black text-slate-950 text-xl">SG</div>
            <h2 className="text-xl font-black text-amber-500 uppercase">
              {authMode === 'signup' ? 'Register New Salon' : 'Salon Owner Login'}
            </h2>
          </div>
          {authError && <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-400 font-bold text-center">{authError}</div>}
          <form onSubmit={handleAuth} className="space-y-4 text-xs">
            {authMode === 'signup' && (
              <>
                <input type="text" placeholder="Salon Name *" value={salonName} onChange={e => setSalonName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                <input type="text" placeholder="Owner Name *" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
              </>
            )}
            <input type="tel" placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
            <input type="password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
            <button type="submit" disabled={authLoading} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl text-xs">
              {authLoading ? 'Processing...' : authMode === 'signup' ? 'Create Salon Account' : 'Login To Dashboard'}
            </button>
          </form>
          <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-800">
            {authMode === 'login' ? (
              <button onClick={() => setAuthMode('signup')} className="text-amber-400 font-bold hover:underline w-full text-center">Register New Salon</button>
            ) : (
              <button onClick={() => setAuthMode('login')} className="text-amber-400 font-bold hover:underline w-full text-center">Back to Login</button>
            )}
          </div>
        </div>
      </div>
    );
                  }
    return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center font-black text-slate-950">SG</div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-amber-500 text-sm truncate">{currentSalon?.salon_name}</h1>
              <p className="text-[10px] text-emerald-400 font-bold">● Live Verified SaaS</p>
            </div>
          </div>

          {isInstallable && (
            <button onClick={handleInstallApp} className="w-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold py-2 rounded-xl">
              📲 Add App to Home Screen
            </button>
          )}

          <nav className="space-y-1.5 text-xs">
            <button onClick={() => setActiveTab('pos')} className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold ${activeTab === 'pos' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>POS & Rapid Billing</button>
            <button onClick={() => setActiveTab('crm')} className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold ${activeTab === 'crm' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>Smart CRM ({clients.length})</button>
            <button onClick={() => setActiveTab('inventory')} className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold ${activeTab === 'inventory' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>Stock & Inventory ({inventory.length})</button>
            <button onClick={() => setActiveTab('appointments')} className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold ${activeTab === 'appointments' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>Appointments ({appointments.length})</button>
            <button onClick={() => setActiveTab('expenses')} className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold ${activeTab === 'expenses' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>Expenses ({expenses.length})</button>
            <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold ${activeTab === 'settings' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>Settings & Google Link</button>
          </nav>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl">Logout</button>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-black text-amber-500">POS Automated Billing</h2>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <input type="text" placeholder="Client Name *" value={clientName} onChange={e => setClientName(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
                <input type="tel" placeholder="Phone Number *" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="font-bold text-amber-400 text-xs">Services Catalog</h3>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto text-xs">
                  {catalog.length === 0 ? <p className="text-slate-500 italic col-span-full">Service list khali hai. Settings se add karein.</p> : catalog.map(item => (
                    <button key={item.id} onClick={() => addToCart(item, false)} className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-left flex justify-between items-center">
                      <span className="truncate">{item.name}</span><span className="text-amber-500 font-bold">₹{item.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="font-bold text-amber-400 text-xs">Retail Products (Auto-Stock Minus)</h3>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto text-xs">
                  {inventory.length === 0 ? <p className="text-slate-500 italic col-span-full">Product stock khali hai.</p> : inventory.map(prod => (
                    <button key={prod.id} onClick={() => addToCart({ id: prod.id, name: prod.product_name, price: prod.selling_price }, true)} className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-left flex justify-between items-center">
                      <span className="truncate">{prod.product_name} ({prod.qty})</span><span className="text-emerald-400 font-bold">₹{prod.selling_price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex gap-2 text-xs">
                <input type="text" placeholder="Custom Service Name" value={customItem.name} onChange={e => setCustomItem({ ...customItem, name: e.target.value })} className="flex-1 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
                <input type="number" placeholder="Price ₹" value={customItem.price} onChange={e => setCustomItem({ ...customItem, price: e.target.value })} className="w-24 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
                <button onClick={addCustomCart} className="bg-amber-500 text-slate-950 font-black px-4 rounded-xl">+ Add</button>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-amber-400 text-sm">Cart & Auto Dispatch</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.length === 0 ? <p className="text-slate-500 italic text-center p-4">Cart Khali hai</p> : cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between bg-slate-950 p-2 rounded-lg">
                    <span>{item.name} {item.isProduct && '(Stock Item)'}</span><span className="font-bold text-amber-500">₹{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="text-lg font-black text-amber-500 flex justify-between border-t border-slate-800 pt-2">
                <span>Total Amount:</span><span>₹{grandTotal}</span>
              </div>
              <button onClick={processFullBill} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase">
                ⚡ Process Bill, Print & WhatsApp Review
              </button>
            </div>
          </div>
        )}
                {activeTab === 'crm' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-lg font-black text-amber-500">Smart CRM Database</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-amber-400 p-3"><tr><th className="p-3">Client</th><th className="p-3">Phone</th><th className="p-3">Visits</th><th className="p-3">Total Spent</th><th className="p-3">Tier</th></tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {clients.length === 0 ? <tr><td colSpan="5" className="p-4 text-center text-slate-500 italic">No Client Data Yet. Zero Dummy Entries.</td></tr> : clients.map(c => (<tr key={c.id}><td className="p-3 font-bold">{c.name}</td><td className="p-3">{c.phone}</td><td className="p-3">{c.total_visits}</td><td className="p-3 text-amber-500 font-bold">₹{c.total_spent}</td><td className="p-3"><span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">{c.tier}</span></td></tr>))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-lg font-black text-amber-500">Stock & Product Inventory</h2>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex gap-2">
              <input type="text" placeholder="Product Name" value={invName} onChange={e => setInvName(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white flex-1" />
              <input type="number" placeholder="Qty" value={invQty} onChange={e => setInvQty(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white w-20" />
              <input type="number" placeholder="Selling Price ₹" value={invPrice} onChange={e => setInvPrice(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white w-28" />
              <button onClick={handleAddInventory} className="bg-amber-500 text-slate-950 font-black px-4 rounded-xl">+ Add Stock</button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-amber-400"><tr><th className="p-3">Product</th><th className="p-3">Stock Qty</th><th className="p-3">Price</th></tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {inventory.length === 0 ? <tr><td colSpan="3" className="p-4 text-center text-slate-500 italic">Inventory is Empty. Add products above.</td></tr> : inventory.map(i => (<tr key={i.id}><td className="p-3 font-bold">{i.product_name}</td><td className="p-3 text-amber-400 font-bold">{i.qty}</td><td className="p-3 text-emerald-400 font-bold">₹{i.selling_price}</td></tr>))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-lg font-black text-amber-500">Appointments Calendar</h2>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-6 gap-2">
              <input type="text" placeholder="Client Name" value={apptClient} onChange={e => setApptClient(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              <input type="tel" placeholder="Phone" value={apptPhone} onChange={e => setApptPhone(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              <input type="text" placeholder="Service" value={apptService} onChange={e => setApptService(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              <input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              <input type="time" value={apptTime} onChange={e => setApptTime(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              <button onClick={handleAddAppointment} className="bg-amber-500 text-slate-950 font-black p-2.5 rounded-xl">+ Book</button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-amber-400"><tr><th className="p-3">Client</th><th className="p-3">Phone</th><th className="p-3">Service</th><th className="p-3">Date & Time</th></tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {appointments.length === 0 ? <tr><td colSpan="4" className="p-4 text-center text-slate-500 italic">No Bookings Found.</td></tr> : appointments.map(a => (<tr key={a.id}><td className="p-3 font-bold">{a.client_name}</td><td className="p-3">{a.phone}</td><td className="p-3">{a.service_name}</td><td className="p-3 text-amber-400">{a.appointment_date} {a.appointment_time}</td></tr>))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-lg font-black text-amber-500">Expense Tracker</h2>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex gap-2">
              <input type="text" placeholder="Expense Title" value={expTitle} onChange={e => setExpTitle(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white flex-1" />
              <input type="number" placeholder="Amount ₹" value={expAmount} onChange={e => setExpAmount(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white w-32" />
              <button onClick={handleAddExpense} className="bg-amber-500 text-slate-950 font-black px-4 rounded-xl">+ Record</button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-amber-400"><tr><th className="p-3">Title</th><th className="p-3">Amount</th></tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {expenses.length === 0 ? <tr><td colSpan="2" className="p-4 text-center text-slate-500 italic">No Expenses Recorded.</td></tr> : expenses.map(e => (<tr key={e.id}><td className="p-3 font-bold">{e.title}</td><td className="p-3 text-rose-400 font-bold">₹{e.amount}</td></tr>))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 text-xs">
            <h2 className="text-lg font-black text-amber-500">Salon Control & Google Review Settings</h2>
            <form onSubmit={handleSaveSettings} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-amber-400 text-sm">Salon Business & Social Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Salon Name" value={setSalonTitle} onChange={e => setSetSalonTitle(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                <input type="text" placeholder="Owner Name" value={setOwnerTitle} onChange={e => setSetOwnerTitle(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                <input type="text" placeholder="Address" value={setAddress} onChange={e => setSetAddress(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                <input type="number" placeholder="Default GST %" value={setGst} onChange={e => setSetGst(parseFloat(e.target.value) || 0)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                <input type="text" placeholder="Google Review Direct URL (Paste Here)" value={googleReviewLink} onChange={e => setGoogleReviewLink(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white col-span-full" />
                <input type="text" placeholder="Instagram Link" value={socialInsta} onChange={e => setSocialInsta(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                <input type="text" placeholder="Facebook Link" value={socialFb} onChange={e => setSocialFb(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
              </div>
              <button type="submit" className="bg-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl">Save All Settings & Review Links</button>
            </form>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-amber-400 text-sm">Add Service to Catalog</h3>
              <div className="flex gap-2">
                <input type="text" placeholder="Service Name" value={newServName} onChange={e => setNewServName(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white flex-1" />
                <input type="number" placeholder="Price ₹" value={newServPrice} onChange={e => setNewServPrice(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white w-32" />
                <button type="button" onClick={handleAddCatalog} className="bg-amber-500 text-slate-950 font-black px-5 rounded-xl">+ Add Service</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
                  }
  
  













                
