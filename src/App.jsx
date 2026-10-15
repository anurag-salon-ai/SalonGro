import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSalon, setCurrentSalon] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('owner');

  const [authMode, setAuthMode] = useState('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [salonName, setSalonName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [catalog, setCatalog] = useState([]);
  const [clients, setClients] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [bills, setBills] = useState([]);
  const [salonsList, setSalonsList] = useState([]);
    // Feature Toggles & Salon Settings State
  const [enableWallet, setEnableWallet] = useState(true);
  const [enableMemberships, setEnableMemberships] = useState(true);
  const [enablePackages, setEnablePackages] = useState(true);
  const [enableInventory, setEnableInventory] = useState(true);
  const [enableLoyalty, setEnableLoyalty] = useState(true);
  const [enableGst, setEnableGst] = useState(true);
  const [enableJdTrusted, setEnableJdTrusted] = useState(true);
  const [enablePaymentGateway, setEnablePaymentGateway] = useState(true);

  const [cart, setCart] = useState([]);
  const [clientSearchText, setClientSearchText] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientWalletBalance, setClientWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [selectedProfileClient, setSelectedProfileClient] = useState(null);

  const [paymentMode, setPaymentMode] = useState('Cash');
  const [staffName, setStaffName] = useState('Rahul (Stylist)');
  const [billDiscountType, setBillDiscountType] = useState('flat');
  const [billDiscountVal, setBillDiscountVal] = useState(0);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercent, setGstPercent] = useState(5);
  const [voiceSearchText, setVoiceSearchText] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
    const [newCatalogName, setNewCatalogName] = useState('');
  const [newCatalogPrice, setNewCatalogPrice] = useState('');

  const [pkgName, setPkgName] = useState('');
  const [pkgPrice, setPkgPrice] = useState('');

  const [membName, setMembName] = useState('');
  const [membPrice, setMembPrice] = useState('');
  const [membDiscount, setMembDiscount] = useState('');

  const [stName, setStName] = useState('');
  const [stRole, setStRole] = useState('Stylist');
  const [stPhone, setStPhone] = useState('');

  const [setSalonTitle, setSetSalonTitle] = useState('');
  const [setOwnerTitle, setSetOwnerTitle] = useState('');
  const [setAddress, setSetAddress] = useState('');
  const [setGst, setSetGst] = useState(5);
  const [googleReviewLink, setGoogleReviewLink] = useState('');
  const [socialInsta, setSocialInsta] = useState('');
  const [socialFb, setSocialFb] = useState('');
  const [socialX, setSocialX] = useState('');
  const [jdCertificateNo, setJdCertificateNo] = useState('JDRR-2026-99');

  const [invName, setInvName] = useState('');
  const [invQty, setInvQty] = useState('');
  const [invPrice, setInvPrice] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');

  const [apptClientName, setApptClientName] = useState('');
  const [apptPhone, setApptPhone] = useState('');
  const [apptService, setApptService] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const isSuperAdminRoute = window.location.search.includes('admin=true') || window.location.hash === '#superadmin';
    useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') setDeferredPrompt(null);
      });
    } else {
      alert('App already installed ya browser menu se "Add to Home Screen" select karein!');
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
    }
  }, [currentSalon]);

  useEffect(() => {
    if (isSuperAdminRoute) fetchSuperAdminSalons();
  }, [isSuperAdminRoute]);

  const fetchAllSalonData = async () => {
    if (!currentSalon?.id) return;
    const cid = currentSalon.id;
    const [{ data: cat }, { data: cli }, { data: inv }, { data: exp }, { data: appt }, { data: pkg }, { data: memb }, { data: staff }, { data: bl }] = await Promise.all([
      supabase.from('catalog').select('*').eq('salon_id', cid),
      supabase.from('clients').select('*').eq('salon_id', cid),
      supabase.from('inventory').select('*').eq('salon_id', cid),
      supabase.from('expenses').select('*').eq('salon_id', cid),
      supabase.from('appointments').select('*').eq('salon_id', cid),
      supabase.from('packages').select('*').eq('salon_id', cid),
      supabase.from('memberships').select('*').eq('salon_id', cid),
      supabase.from('staff').select('*').eq('salon_id', cid),
      supabase.from('bills').select('*').eq('salon_id', cid),
    ]);
    setCatalog(cat || []);
    setClients(cli || []);
    setInventory(inv || []);
    setExpenses(exp || []);
    setAppointments(appt || []);
    setPackages(pkg || []);
    setMemberships(memb || []);
    setStaffList(staff || []);
    setBills(bl || []);
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
        if (!salonName || !ownerName || !phone || !password || !email) throw new Error('Sabhi fields bharein!');
        const { data: salon, error: sErr } = await supabase.from('salons').insert([{ salon_name: salonName, owner_name: ownerName, phone, email, address: 'Main Street', default_gst: 5, status: 'active' }]).select().single();
        if (sErr) throw new Error(sErr.message);
        const { error: uErr } = await supabase.from('users').insert([{ salon_id: salon.id, full_name: ownerName, phone, password, role: 'owner' }]);
        if (uErr) throw new Error(uErr.message);
        alert('Account Created Successfully! Ab Login Karein.');
        setAuthMode('login');
      } else if (authMode === 'login') {
        if (!phone || !password) throw new Error('Phone aur Password dalein!');
        const { data: user, error: uErr } = await supabase.from('users').select('*, salons(*)').eq('phone', phone).single();
        if (uErr || !user) throw new Error('Phone number registered nahi hai!');
        if (user.password !== password) throw new Error('Galat Password!');
        if (user.salons?.status === 'suspended') throw new Error('Account Suspended by Administrator!');
        setCurrentSalon(user.salons);
        setCurrentUserRole(user.role || 'owner');
        setIsLoggedIn(true);
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };
    const handleSelectClient = (c) => {
    setClientName(c.name);
    setClientPhone(c.phone);
    setSelectedClientId(`#SG-${c.id.substring(0, 4)}`);
    setClientWalletBalance(c.wallet_balance || 0);
    setClientSearchText(`${c.name} (${c.phone})`);
    setShowClientDropdown(false);
  };

  const addToCart = (item, isProduct = false) => {
    const existing = cart.find(i => i.id === item.id && i.isProduct === isProduct);
    if (existing) {
      setCart(cart.map(i => i.id === item.id && i.isProduct === isProduct ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...item, isProduct, qty: 1, discountType: 'flat', discountVal: 0, staff: staffName }]);
    }
  };

  const handleAddSelectedServiceToCart = () => {
    if (!selectedServiceId) return;
    const serv = catalog.find(c => String(c.id) === String(selectedServiceId));
    if (serv) { addToCart(serv, false); setSelectedServiceId(''); }
  };

  const handleQuickAddServiceToCatalog = async () => {
    if (!newCatalogName || !newCatalogPrice) return;
    const { data, error } = await supabase.from('catalog').insert([{ salon_id: currentSalon.id, name: newCatalogName.toUpperCase(), price: parseFloat(newCatalogPrice) }]).select().single();
    if (!error && data) { setCatalog([...catalog, data]); addToCart(data, false); setNewCatalogName(''); setNewCatalogPrice(''); alert('Service Added & Added to Cart!'); }
  };

  const calculateSubtotal = () => {
    return cart.reduce((acc, i) => {
      let itemPrice = parseFloat(i.price) * i.qty;
      if (i.discountType === 'flat') itemPrice -= (parseFloat(i.discountVal) || 0);
      else itemPrice -= itemPrice * ((parseFloat(i.discountVal) || 0) / 100);
      return acc + Math.max(0, itemPrice);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  
  const calculateGrandTotal = () => {
    let total = subtotal;
    if (billDiscountVal > 0) {
      if (billDiscountType === 'flat') total -= parseFloat(billDiscountVal);
      else total -= total * (parseFloat(billDiscountVal) / 100);
    }
    if (gstEnabled && enableGst) total += total * (gstPercent / 100);
    let net = Math.max(0, Math.round(total));
    if (useWallet && enableWallet) net = Math.max(0, net - clientWalletBalance);
    return net;
  };

  const grandTotal = calculateGrandTotal();
    const handlePrintBill = () => {
    if (!clientName || !clientPhone) { alert('Client Name & Phone Number Required!'); return; }
    if (cart.length === 0) { alert('Cart is empty!'); return; }
    const billNo = `BILL-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalClientId = selectedClientId || `#SG-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const p = window.open('', '_blank');
    p.document.write(`
      <html>
        <body style="font-family:monospace;width:300px;text-align:center;margin:0;padding:10px;">
          <h2 style="margin:0;font-size:18px;">${currentSalon?.salon_name || 'Salon'}</h2>
          ${enableJdTrusted ? `<p style="background:#2563eb;color:#fff;font-size:10px;padding:3px;font-weight:bold;margin:2px 0;">🛡️ JD TRUSTED SEAL | ${jdCertificateNo}</p>` : ''}
          <p style="margin:2px 0;font-size:11px;">${currentSalon?.address || 'Main Street'}</p>
          <p style="margin:2px 0;font-size:11px;">Ph: ${currentSalon?.phone || ''} | GST: ${enableGst ? (currentSalon?.default_gst || 5) : 0}%</p>
          <hr style="border-top:1px dashed #000;"/>
          <p style="margin:2px 0;font-size:11px;text-align:left;">Date: ${new Date().toLocaleDateString()} | Bill No: ${billNo}</p>
          <p style="margin:2px 0;font-size:11px;text-align:left;">Client: ${clientName} (${finalClientId})</p>
          <hr style="border-top:1px dashed #000;"/>
          <table style="width:100%;font-size:11px;text-align:left;">
            <thead><tr><th>Item</th><th>Qty</th><th>Rate</th></tr></thead>
            <tbody>
              ${cart.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>₹${i.price}</td></tr>`).join('')}
            </tbody>
          </table>
          <hr style="border-top:1px dashed #000;"/>
          <p style="text-align:right;font-size:12px;margin:2px 0;">Subtotal: ₹${subtotal}</p>
          <p style="text-align:right;font-size:12px;margin:2px 0;">Payment: ${paymentMode}</p>
          <h3 style="margin:5px 0;font-size:15px;text-align:right;">Net Amount: ₹${grandTotal}</h3>
          <p style="font-size:10px;margin-top:10px;">T&C: 1. NO REFUND 2. NO EXCHANGE<br/>Thank You! Visit Again 🙏</p>
          <script>window.print();setTimeout(()=>window.close(),1000);</script>
        </body>
      </html>
    `);
    p.document.close();
  };

  const handleWhatsAppShare = () => {
    if (!clientName || !clientPhone) { alert('Client Name & Phone Number Required!'); return; }
    if (cart.length === 0) { alert('Cart is empty!'); return; }
    const billNo = `BILL-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalClientId = selectedClientId || `#SG-${Math.floor(1000 + Math.random() * 9000)}`;
    const billDetails = cart.map(i => `• ${i.name} - ₹${i.price} (Qty: ${i.qty})`).join('\n');
    let waMsg = `*${currentSalon?.salon_name}* ${enableJdTrusted ? '🛡️ [JD Verified]' : ''}\n📍 ${currentSalon?.address || ''}\n\nNamaste ${clientName} ji (${finalClientId}), thank you for visiting us!\n\n*Bill No:* ${billNo}\n*Items:*\n${billDetails}\n------------------\n*Grand Total: ₹${grandTotal}*\n*Payment:* ${paymentMode}\n\n🌟 *Google Review:*\n${googleReviewLink || 'https://google.com'}`;
    window.open(`https://wa.me/91${clientPhone}?text=${encodeURIComponent(waMsg)}`, '_blank');
  };

  const handleProcessAndSaveBill = async () => {
    if (!clientName || !clientPhone) { alert('Client Name & Phone Number Required!'); return; }
    if (cart.length === 0) { alert('Cart is empty!'); return; }
    
    const billNo = `BILL-${Math.floor(1000 + Math.random() * 9000)}`;

    if (enableInventory) {
      for (const item of cart) {
        if (item.isProduct && item.id) {
          const invItem = inventory.find(i => String(i.id) === String(item.id));
          if (invItem) {
            const newQty = Math.max(0, parseInt(invItem.qty) - parseInt(item.qty));
            await supabase.from('inventory').update({ qty: newQty }).eq('id', invItem.id);
          }
        }
      }
    }

    const earnedPoints = enableLoyalty ? Math.floor(grandTotal * 0.05) : 0;

    await supabase.from('bills').insert([{
      salon_id: currentSalon.id, bill_number: billNo, client_name: clientName, client_phone: clientPhone,
      items: cart, grand_total: grandTotal, payment_mode: paymentMode
    }]);

    const existingClient = clients.find(c => c.phone === clientPhone || c.name.toLowerCase() === clientName.toLowerCase());
    if (existingClient) {
      await supabase.from('clients').update({
        total_visits: existingClient.total_visits + 1, 
        total_spent: parseFloat(existingClient.total_spent) + grandTotal,
        loyalty_points: (existingClient.loyalty_points || 0) + earnedPoints,
        tier: (parseFloat(existingClient.total_spent) + grandTotal) >= 5000 ? 'VIP' : 'Regular'
      }).eq('id', existingClient.id);
    } else {
      const { data: newCli } = await supabase.from('clients').insert([{ 
        salon_id: currentSalon.id, name: clientName, phone: clientPhone, 
        total_visits: 1, total_spent: grandTotal, loyalty_points: earnedPoints, tier: grandTotal >= 5000 ? 'VIP' : 'Regular' 
      }]).select().single();
      if (newCli) setSelectedClientId(`#SG-${newCli.id.substring(0, 4)}`);
    }

    alert('Bill Saved Successfully & Client ID Registered!');
    setCart([]); setClientName(''); setClientPhone(''); setClientSearchText(''); setSelectedClientId(''); setUseWallet(false);
    fetchAllSalonData();
  };

  const handleAddAppointment = async () => {
    if (!apptClientName || !apptPhone || !apptService || !apptDate || !apptTime) { alert('Sabhi appointment fields bharein!'); return; }
    const { data, error } = await supabase.from('appointments').insert([{
      salon_id: currentSalon.id, client_name: apptClientName, phone: apptPhone, service: apptService, date: apptDate, time: apptTime, status: 'Confirmed'
    }]).select().single();
    if (!error && data) {
      setAppointments([...appointments, data]);
      setApptClientName(''); setApptPhone(''); setApptService(''); setApptDate(''); setApptTime('');
      alert('Appointment Booked Successfully!');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    await supabase.from('salons').update({
      salon_name: setSalonTitle, owner_name: setOwnerTitle, address: setAddress, default_gst: setGst,
      google_review_link: googleReviewLink, social_insta: socialInsta, social_fb: socialFb
    }).eq('id', currentSalon.id);
    setCurrentSalon({ ...currentSalon, salon_name: setSalonTitle, owner_name: setOwnerTitle, address: setAddress, default_gst: setGst, google_review_link: googleReviewLink, social_insta: socialInsta, social_fb: socialFb });
    alert('Salon Profile & Settings Saved Successfully!');
  };

  const handleAddInventory = async () => {
    if (!invName || !invQty || !invPrice) return;
    await supabase.from('inventory').insert([{ salon_id: currentSalon.id, product_name: invName, qty: parseInt(invQty), selling_price: parseFloat(invPrice) }]);
    setInvName(''); setInvQty(''); setInvPrice(''); fetchAllSalonData();
  };

  const handleAddExpense = async () => {
    if (!expTitle || !expAmount) return;
    await supabase.from('expenses').insert([{ salon_id: currentSalon.id, title: expTitle, amount: parseFloat(expAmount) }]);
    setExpTitle(''); setExpAmount(''); fetchAllSalonData();
  };

  const totalRevenue = bills.reduce((acc, b) => acc + b.grand_total, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
    if (isSuperAdminRoute) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 bg-slate-950 text-white min-h-screen font-sans">
        <h1 className="text-2xl font-black text-amber-500 uppercase">SalonGro Master SuperAdmin Control Panel</h1>
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
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 font-sans text-white">
        <div className="bg-[#0f172a] border border-[#1e293b] p-6 sm:p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center font-black text-slate-950 text-2xl shadow-lg">SG</div>
            <h2 className="text-2xl font-black text-amber-500 uppercase">SalonGro POS</h2>
            <p className="text-xs text-slate-400 font-semibold">Commercial POS & Multi-Role Platform</p>
          </div>
          <div className="bg-[#070b14] p-1.5 rounded-2xl flex border border-[#1e293b] text-xs font-bold">
            <button onClick={() => setAuthMode('login')} className={`flex-1 py-2.5 rounded-xl transition-all ${authMode === 'login' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}>Owner / Staff Login</button>
            <button onClick={() => setAuthMode('signup')} className={`flex-1 py-2.5 rounded-xl transition-all ${authMode === 'signup' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}>New Registration</button>
          </div>
          {authError && <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-400 font-bold text-center">{authError}</div>}
          <form onSubmit={handleAuth} className="space-y-4 text-xs">
            {authMode === 'signup' && (
              <>
                <input type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#070b14] border border-[#1e293b] p-3.5 rounded-xl text-white outline-none focus:border-amber-500" />
                <input type="text" placeholder="Salon / Spa Name *" value={salonName} onChange={e => setSalonName(e.target.value)} className="w-full bg-[#070b14] border border-[#1e293b] p-3.5 rounded-xl text-white outline-none focus:border-amber-500" />
                <input type="text" placeholder="Owner / Manager Name *" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="w-full bg-[#070b14] border border-[#1e293b] p-3.5 rounded-xl text-white outline-none focus:border-amber-500" />
              </>
            )}
            <input type="tel" placeholder="Mobile Number (User ID) *" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[#070b14] border border-[#1e293b] p-3.5 rounded-xl text-white outline-none focus:border-amber-500" />
            <input type="password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#070b14] border border-[#1e293b] p-3.5 rounded-xl text-white outline-none focus:border-amber-500" />
            <button type="submit" disabled={authLoading} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-wider shadow-lg">
              {authLoading ? 'Processing...' : authMode === 'signup' ? 'Create Account & Start Free' : 'Login to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearchText.toLowerCase()) || c.phone.includes(clientSearchText));
  const filteredCatalogByVoice = catalog.filter(c => c.name.toLowerCase().includes(voiceSearchText.toLowerCase()));
    return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center font-black text-slate-950">SG</div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-amber-500 text-sm truncate">{currentSalon?.salon_name}</h1>
              <p className="text-[10px] text-emerald-400 font-bold">● Role: {currentUserRole.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={handleInstallClick} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md">
            📱 Add to Home Screen
          </button>
          <nav className="space-y-1 text-xs">
            <button onClick={() => { setActiveTab('pos'); setSelectedProfileClient(null); }} className={`w-full text-left px-3 py-2 rounded-xl font-bold ${activeTab === 'pos' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>POS Rapid Billing</button>
            <button onClick={() => setActiveTab('crm')} className={`w-full text-left px-3 py-2 rounded-xl font-bold ${activeTab === 'crm' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>Customer Profiles & CRM</button>
            <button onClick={() => setActiveTab('appointments')} className={`w-full text-left px-3 py-2 rounded-xl font-bold ${activeTab === 'appointments' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>Appointments ({appointments.length})</button>
            
            {currentUserRole === 'owner' && (
              <>
                <button onClick={() => setActiveTab('staff')} className={`w-full text-left px-3 py-2 rounded-xl font-bold ${activeTab === 'staff' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>Staff & Permissions</button>
                {enablePackages && <button onClick={() => setActiveTab('packages')} className={`w-full text-left px-3 py-2 rounded-xl font-bold ${activeTab === 'packages' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>Combo Packages</button>}
                {enableMemberships && <button onClick={() => setActiveTab('memberships')} className={`w-full text-left px-3 py-2 rounded-xl font-bold ${activeTab === 'memberships' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>Memberships</button>}
                {enableInventory && <button onClick={() => setActiveTab('inventory')} className={`w-full text-left px-3 py-2 rounded-xl font-bold ${activeTab === 'inventory' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>Retail Inventory</button>}
                <button onClick={() => setActiveTab('expenses')} className={`w-full text-left px-3 py-2 rounded-xl font-bold ${activeTab === 'expenses' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>Expense Tracker</button>
                <button onClick={() => setActiveTab('reports')} className={`w-full text-left px-3 py-2 rounded-xl font-bold ${activeTab === 'reports' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>Enterprise Reports</button>
                <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-3 py-2 rounded-xl font-bold ${activeTab === 'settings' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>Salon Settings & Profile</button>
              </>
            )}
          </nav>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl">Logout</button>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-amber-500">POS Rapid Billing</h2>
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="🎙️ Voice / Quick Search..." value={voiceSearchText} onChange={e => setVoiceSearchText(e.target.value)} className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-white text-xs" />
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 relative text-xs">
                <label className="block text-[10px] text-amber-400 font-black uppercase">Client Name & Mobile Number (Auto Client ID Generation) *</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="🔍 Search or Type Client Name..." value={clientSearchText} onChange={e => { setClientSearchText(e.target.value); setShowClientDropdown(true); setClientName(e.target.value); }} className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-amber-500" />
                  <input type="tel" placeholder="Mobile Number *" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-40 bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-amber-500" />
                </div>
                {selectedClientId && <p className="text-[10px] text-emerald-400 font-bold">✓ Registered Client ID: {selectedClientId}</p>}
                {enableWallet && clientWalletBalance > 0 && (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-emerald-400 font-bold">
                    <span>Client Wallet Balance: ₹{clientWalletBalance}</span>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={useWallet} onChange={e => setUseWallet(e.target.checked)} className="accent-emerald-500" /><span>Use Wallet</span></label>
                  </div>
                )}
                {showClientDropdown && clientSearchText && filteredClients.length > 0 && (
                  <div className="absolute left-4 right-4 top-16 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-40 overflow-y-auto divide-y divide-slate-800">
                    {filteredClients.map(c => (
                      <div key={c.id} onClick={() => handleSelectClient(c)} className="p-3 hover:bg-slate-900 cursor-pointer flex justify-between items-center">
                        <div><p className="font-bold text-white">{c.name}</p><p className="text-[10px] text-slate-400">📱 {c.phone} | ID: #SG-{c.id.substring(0,4)}</p></div>
                        <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded font-bold">{c.tier}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-amber-400 text-xs uppercase">Service Rate List (Front Dropdown)</h3>
                <div className="flex gap-2">
                  <select value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-xl text-white text-xs outline-none focus:border-amber-500">
                    <option value="">-- Select Service from Rate List --</option>
                    {(voiceSearchText ? filteredCatalogByVoice : catalog).map(c => (<option key={c.id} value={c.id}>{c.name} - ₹{c.price}</option>))}
                  </select>
                  <button onClick={handleAddSelectedServiceToCart} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 rounded-xl text-xs">+ Add Service</button>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <input type="text" placeholder="Quick Service Name" value={newCatalogName} onChange={e => setNewCatalogName(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white text-xs" />
                  <input type="number" placeholder="Price ₹" value={newCatalogPrice} onChange={e => setNewCatalogPrice(e.target.value)} className="w-24 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white text-xs" />
                  <button onClick={handleQuickAddServiceToCatalog} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 rounded-xl text-xs">+ Save & Add</button>
                </div>
              </div>

              {enableInventory && inventory.length > 0 && (
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <h3 className="font-bold text-amber-400 text-xs uppercase">Retail Products (Auto-Stock Minus)</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto text-xs">
                    {inventory.map(prod => (
                      <button key={prod.id} onClick={() => addToCart({ id: prod.id, name: prod.product_name, price: prod.selling_price }, true)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-left flex justify-between items-center hover:border-emerald-500">
                        <span className="truncate">{prod.product_name} ({prod.qty})</span><span className="text-emerald-400 font-bold">₹{prod.selling_price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-amber-400 text-sm">Cart & Checkout</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.length === 0 ? <p className="text-slate-500 italic text-center p-4">Cart is Empty</p> : cart.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-xl space-y-2 border border-slate-800">
                    <div className="flex justify-between font-bold"><span>{item.name}</span><span className="text-amber-500">₹{item.price * item.qty}</span></div>
                    <div className="flex gap-2 items-center text-[10px]">
                      <span>Qty:</span>
                      <input type="number" min="1" value={item.qty} onChange={e => { const u = [...cart]; u[idx].qty = parseInt(e.target.value) || 1; setCart(u); }} className="w-12 bg-slate-900 border border-slate-800 text-white rounded p-1 text-center" />
                      <select value={item.discountType} onChange={e => { const u = [...cart]; u[idx].discountType = e.target.value; setCart(u); }} className="bg-slate-900 border border-slate-800 text-white rounded p-1">
                        <option value="flat">Flat ₹</option><option value="percent">Disc %</option>
                      </select>
                      <input type="number" placeholder="Disc" value={item.discountVal} onChange={e => { const u = [...cart]; u[idx].discountVal = e.target.value; setCart(u); }} className="w-16 bg-slate-900 border border-slate-800 text-white rounded p-1 text-right" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="flex justify-between items-center"><span>Subtotal:</span><span className="font-bold">₹{subtotal}</span></div>
                <div className="flex gap-2 items-center">
                  <span className="text-slate-400">Total Bill Disc:</span>
                  <select value={billDiscountType} onChange={e => setBillDiscountType(e.target.value)} className="bg-slate-950 border border-slate-800 text-white p-1 rounded">
                    <option value="flat">Flat ₹</option><option value="percent">Disc %</option>
                  </select>
                  <input type="number" value={billDiscountVal} onChange={e => setBillDiscountVal(parseFloat(e.target.value) || 0)} className="w-20 bg-slate-950 border border-slate-800 p-1 rounded text-right text-white" />
                </div>
                <div className="flex gap-2 items-center">
                  <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="bg-slate-950 border border-slate-800 text-white p-1.5 rounded-xl flex-1">
                    <option>Cash</option>
                    {enablePaymentGateway && <option>UPI / QR Code</option>}
                    <option>Card</option>
                  </select>
                </div>
                {enableGst && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={gstEnabled} onChange={e => setGstEnabled(e.target.checked)} className="accent-amber-500" /><span>Apply GST %</span></label>
                    {gstEnabled && <input type="number" value={gstPercent} onChange={e => setGstPercent(parseFloat(e.target.value) || 0)} className="w-16 bg-slate-950 border border-slate-800 p-1 rounded text-right text-white" />}
                  </div>
                )}
              </div>

              <div className="text-base font-black text-amber-500 flex justify-between border-t border-slate-800 pt-2">
                <span>Grand Total:</span><span>₹{grandTotal}</span>
              </div>

              {enablePaymentGateway && paymentMode === 'UPI / QR Code' && (
                <div className="p-3 bg-slate-950 rounded-xl text-center border border-slate-800">
                  <p className="text-[10px] text-amber-400 font-bold mb-1">Scan UPI QR to Pay ₹{grandTotal}</p>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=salon@upi&am=${grandTotal}`} alt="UPI QR" className="mx-auto rounded-lg" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button onClick={handlePrintBill} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider">🖨️ Print Receipt</button>
                <button onClick={handleWhatsAppShare} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider">💬 WhatsApp Bill</button>
              </div>
              <button onClick={handleProcessAndSaveBill} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider mt-2">💾 Complete Sale & Save ID</button>
            </div>
          </div>
        )}
                {activeTab === 'crm' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-lg font-black text-amber-500">Customer Profiles & CRM Directory</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-amber-400 p-3"><tr><th className="p-3">Client ID</th><th className="p-3">Client Name</th><th className="p-3">Phone</th><th className="p-3">Visits</th><th className="p-3">Total Spent</th><th className="p-3">Tier</th></tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {clients.length === 0 ? <tr><td colSpan="6" className="p-4 text-center text-slate-500 italic">No Clients Found.</td></tr> : clients.map(c => (
                    <tr key={c.id}>
                      <td className="p-3 font-bold text-amber-400">#SG-{c.id.substring(0,4)}</td>
                      <td className="p-3 font-bold">{c.name}</td>
                      <td className="p-3">{c.phone}</td>
                      <td className="p-3">{c.total_visits}</td>
                      <td className="p-3 text-emerald-400 font-bold">₹{c.total_spent}</td>
                      <td className="p-3"><span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">{c.tier}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-lg font-black text-amber-500">Appointments Manager</h2>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input type="text" placeholder="Client Name" value={apptClientName} onChange={e => setApptClientName(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              <input type="tel" placeholder="Mobile Number" value={apptPhone} onChange={e => setApptPhone(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              <input type="text" placeholder="Service Name" value={apptService} onChange={e => setApptService(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              <input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              <input type="time" value={apptTime} onChange={e => setApptTime(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              <button onClick={handleAddAppointment} className="bg-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl">+ Book Appointment</button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-amber-400"><tr><th className="p-3">Client Name</th><th className="p-3">Phone</th><th className="p-3">Service</th><th className="p-3">Date & Time</th><th className="p-3">Status</th></tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {appointments.length === 0 ? <tr><td colSpan="5" className="p-4 text-center text-slate-500 italic">No Appointments.</td></tr> : appointments.map(a => (
                    <tr key={a.id}><td className="p-3 font-bold">{a.client_name}</td><td className="p-3">{a.phone}</td><td className="p-3 text-amber-400">{a.service}</td><td className="p-3">{a.date} at {a.time}</td><td className="p-3"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">{a.status}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'staff' && currentUserRole === 'owner' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-lg font-black text-amber-500">Staff & Role Permissions</h2>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input type="text" placeholder="Staff Name" value={stName} onChange={e => setStName(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              <select value={stRole} onChange={e => setStRole(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white">
                <option value="Stylist">Stylist / Cashier</option><option value="Manager">Manager</option>
              </select>
              <input type="tel" placeholder="Phone Number" value={stPhone} onChange={e => setStPhone(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              <button onClick={async () => {
                if (!stName || !stPhone) return;
                const { data } = await supabase.from('staff').insert([{ salon_id: currentSalon.id, name: stName, role: stRole, phone: stPhone, commission_percent: 10 }]).select().single();
                if (data) { setStaffList([...staffList, data]); setStName(''); setStPhone(''); alert('Staff Added!'); }
              }} className="bg-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl">+ Add Staff Member</button>
            </div>
          </div>
        )}

        {activeTab === 'packages' && currentUserRole === 'owner' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-lg font-black text-amber-500">Combo Packages</h2>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex gap-2">
              <input type="text" placeholder="Package Name" value={pkgName} onChange={e => setPkgName(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white flex-1" />
              <input type="number" placeholder="Price ₹" value={pkgPrice} onChange={e => setPkgPrice(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white w-32" />
              <button onClick={async () => {
                if (!pkgName || !pkgPrice) return;
                const { data } = await supabase.from('packages').insert([{ salon_id: currentSalon.id, package_name: pkgName.toUpperCase(), price: parseFloat(pkgPrice) }]).select().single();
                if (data) { setPackages([...packages, data]); setPkgName(''); setPkgPrice(''); alert('Package Added!'); }
              }} className="bg-amber-500 text-slate-950 font-black px-4 rounded-xl">+ Create</button>
            </div>
          </div>
        )}

        {activeTab === 'memberships' && currentUserRole === 'owner' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-lg font-black text-amber-500">Memberships</h2>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input type="text" placeholder="Membership Name" value={membName} onChange={e => setMembName(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              <input type="number" placeholder="Price ₹" value={membPrice} onChange={e => setMembPrice(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              <input type="number" placeholder="Discount %" value={membDiscount} onChange={e => setMembDiscount(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white" />
              <button onClick={async () => {
                if (!membName || !membPrice || !membDiscount) return;
                const { data } = await supabase.from('memberships').insert([{ salon_id: currentSalon.id, membership_name: membName.toUpperCase(), price: parseFloat(membPrice), discount_percent: parseFloat(membDiscount) }]).select().single();
                if (data) { setMemberships([...memberships, data]); setMembName(''); setMembPrice(''); setMembDiscount(''); alert('Membership Added!'); }
              }} className="bg-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl">+ Add</button>
            </div>
          </div>
        )}
                {activeTab === 'inventory' && currentUserRole === 'owner' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-lg font-black text-amber-500">Retail Inventory</h2>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex gap-2">
              <input type="text" placeholder="Product Name" value={invName} onChange={e => setInvName(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white flex-1" />
              <input type="number" placeholder="Qty" value={invQty} onChange={e => setInvQty(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white w-20" />
              <input type="number" placeholder="Price ₹" value={invPrice} onChange={e => setInvPrice(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white w-28" />
              <button onClick={handleAddInventory} className="bg-amber-500 text-slate-950 font-black px-4 rounded-xl">+ Add Stock</button>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && currentUserRole === 'owner' && (
          <div className="space-y-4 text-xs">
            <h2 className="text-lg font-black text-amber-500">Expense Tracker</h2>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex gap-2">
              <input type="text" placeholder="Expense Title" value={expTitle} onChange={e => setExpTitle(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white flex-1" />
              <input type="number" placeholder="Amount ₹" value={expAmount} onChange={e => setExpAmount(e.target.value)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white w-32" />
              <button onClick={handleAddExpense} className="bg-amber-500 text-slate-950 font-black px-4 rounded-xl">+ Record</button>
            </div>
          </div>
        )}

        {activeTab === 'reports' && currentUserRole === 'owner' && (
          <div className="space-y-6 text-xs">
            <h2 className="text-lg font-black text-amber-500">Enterprise Reports</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800"><p className="text-slate-400">Total Revenue</p><p className="text-2xl font-black text-emerald-400">₹{totalRevenue}</p></div>
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800"><p className="text-slate-400">Total Expenses</p><p className="text-2xl font-black text-rose-400">₹{totalExpenses}</p></div>
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800"><p className="text-slate-400">Net Profit</p><p className="text-2xl font-black text-amber-500">₹{netProfit}</p></div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && currentUserRole === 'owner' && (
          <div className="space-y-6 text-xs">
            <h2 className="text-lg font-black text-amber-500">Salon Settings, Profile & Free JD Trusted Hub</h2>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-amber-400 text-sm">Feature Toggles (Salon Dependent)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800"><input type="checkbox" checked={enableWallet} onChange={e => setEnableWallet(e.target.checked)} className="accent-amber-500" /><span>Wallet System</span></label>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800"><input type="checkbox" checked={enableMemberships} onChange={e => setEnableMemberships(e.target.checked)} className="accent-amber-500" /><span>Memberships</span></label>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800"><input type="checkbox" checked={enablePackages} onChange={e => setEnablePackages(e.target.checked)} className="accent-amber-500" /><span>Combo Packages</span></label>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800"><input type="checkbox" checked={enableInventory} onChange={e => setEnableInventory(e.target.checked)} className="accent-amber-500" /><span>Retail Inventory</span></label>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800"><input type="checkbox" checked={enableLoyalty} onChange={e => setEnableLoyalty(e.target.checked)} className="accent-amber-500" /><span>Loyalty Points</span></label>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800"><input type="checkbox" checked={enableGst} onChange={e => setEnableGst(e.target.checked)} className="accent-amber-500" /><span>GST Support</span></label>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800"><input type="checkbox" checked={enablePaymentGateway} onChange={e => setEnablePaymentGateway(e.target.checked)} className="accent-amber-500" /><span>Payment Gateway/QR</span></label>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800"><input type="checkbox" checked={enableJdTrusted} onChange={e => setEnableJdTrusted(e.target.checked)} className="accent-amber-500" /><span>JD Trusted Badge (Free)</span></label>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-amber-400 text-sm">Salon Profile & Justdial Certified Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Salon Name" value={setSalonTitle} onChange={e => setSetSalonTitle(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                <input type="text" placeholder="Owner Name" value={setOwnerTitle} onChange={e => setSetOwnerTitle(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                <input type="text" placeholder="Address" value={setAddress} onChange={e => setSetAddress(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                <input type="number" placeholder="Default GST %" value={setGst} onChange={e => setSetGst(parseFloat(e.target.value) || 0)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                <input type="text" placeholder="JDRR Certificate Number" value={jdCertificateNo} onChange={e => setJdCertificateNo(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                <input type="text" placeholder="Google Review Direct URL" value={googleReviewLink} onChange={e => setGoogleReviewLink(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white col-span-full" />
                <input type="text" placeholder="Instagram Link" value={socialInsta} onChange={e => setSocialInsta(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                <input type="text" placeholder="Facebook Link" value={socialFb} onChange={e => setSocialFb(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
              </div>
              <button type="submit" className="bg-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl">Save Salon Profile & Settings</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
                }
  
  
