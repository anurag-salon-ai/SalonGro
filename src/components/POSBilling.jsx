import React, { useState, useEffect } from 'react';

export default function POSBilling({ salonData }) {
  const [cart, setCart] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  
  const [totalDiscountValue, setTotalDiscountValue] = useState(0);
  const [totalDiscountType, setTotalDiscountType] = useState('FIXED');
  const [gstType, setGstType] = useState('EXCLUSIVE');
  const [customItem, setCustomItem] = useState({ name: '', price: '', serviceDiscValue: '', serviceDiscType: 'FIXED' });
  const [isListening, setIsListening] = useState(false);

  const salonId = salonData?.id || 'default';
  const savedSettings = JSON.parse(localStorage.getItem(`salon_settings_${salonId}`)) || salonData || {};
  
  const catalogList = savedSettings.catalog || [];
  const staffList = savedSettings.staff_list || [];
  const defaultGstRate = savedSettings.gst_percent || 0;
  const salonWhatsApp = savedSettings.whatsapp_number || savedSettings.phone || '';
  const googleReviewUrl = savedSettings.google_review_url || 'https://g.page/review/salongro';
  const salonName = savedSettings.salon_name || 'SalonGro Studio';

  const startVoiceBilling = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice Recognition unsupported. Use Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const numbers = transcript.match(/\d+/g);
      if (numbers) {
        const price = numbers[numbers.length - 1];
        const name = transcript.replace(price, '').trim();
        setCustomItem({ name: name || 'Voice Service', price: price, serviceDiscValue: '', serviceDiscType: 'FIXED' });
      } else {
        setCustomItem({ name: transcript, price: '', serviceDiscValue: '', serviceDiscType: 'FIXED' });
      }
    };
    recognition.start();
  };

  const handleAddCatalogItem = (service) => {
    const rawPrice = parseFloat(service.price);
    const newItem = {
      id: Date.now().toString() + Math.random(),
      name: service.name,
      originalPrice: rawPrice,
      discountedPrice: rawPrice,
      discValue: 0,
      discType: 'FIXED',
      qty: 1
    };
    setCart([...cart, newItem]);
  };

  const handleAddCustomService = () => {
    if (!customItem.name || !customItem.price) {
      alert('Kripya Service Name aur Rate bharein!');
      return;
    }
    const rawPrice = parseFloat(customItem.price);
    let itemDiscount = 0;
    const discInput = parseFloat(customItem.serviceDiscValue);
    if (!isNaN(discInput) && discInput > 0) {
      if (customItem.serviceDiscType === 'PERCENT') {
        itemDiscount = (rawPrice * discInput) / 100;
      } else {
        itemDiscount = discInput;
      }
    }

    const finalItemPrice = Math.max(0, rawPrice - itemDiscount);

    const newItem = {
      id: Date.now().toString(),
      name: customItem.name,
      originalPrice: rawPrice,
      discountedPrice: finalItemPrice,
      discValue: discInput || 0,
      discType: customItem.serviceDiscType,
      qty: 1
    };

    setCart([...cart, newItem]);
    setCustomItem({ name: '', price: '', serviceDiscValue: '', serviceDiscType: 'FIXED' });
  };

  const removeFromCart = (id) => setCart(cart.filter(c => c.id !== id));

  const handleSaveClientOnly = () => {
    if (!clientName || !clientPhone) {
      alert('Name aur Phone Number bharein!');
      return;
    }
    const generatedClientID = `#SG-${Math.floor(1000 + Math.random() * 9000)}`;
    const storageKey = `salon_clients_${salonId}`;
    const existingClients = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    const duplicate = existingClients.find(c => c.phone === clientPhone);
    if (duplicate) {
      alert(`Client saved pehle se hai: ${duplicate.id}`);
      return;
    }

    const newClient = { id: generatedClientID, name: clientName, phone: clientPhone, visits: 0, spent: 0, walletBalance: 0, tier: 'Regular' };
    localStorage.setItem(storageKey, JSON.stringify([...existingClients, newClient]));
    alert(`✅ Client Saved! ID: ${generatedClientID}`);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.discountedPrice * item.qty), 0);
  let calculatedTotalDiscount = totalDiscountType === 'PERCENT' ? (subtotal * totalDiscountValue) / 100 : totalDiscountValue;
  const taxableAmount = Math.max(0, subtotal - calculatedTotalDiscount);
  let gstAmount = gstType === 'EXCLUSIVE' ? (taxableAmount * defaultGstRate) / 100 : taxableAmount - (taxableAmount / (1 + defaultGstRate / 100));
  const grandTotal = Math.round(gstType === 'EXCLUSIVE' ? taxableAmount + gstAmount : taxableAmount);
    const handleProcessBill = (isThermalPrint = false) => {
    if (!clientName || !clientPhone) { alert('Client info required!'); return; }
    if (cart.length === 0) { alert('Cart Khali Hai!'); return; }

    const clientsKey = `salon_clients_${salonId}`;
    const billsKey = `salon_bills_${salonId}`;
    const inventoryKey = `salon_inventory_${salonId}`;

    const existingClients = JSON.parse(localStorage.getItem(clientsKey)) || [];
    const clientIndex = existingClients.findIndex(c => c.phone === clientPhone);

    const generatedClientID = clientIndex >= 0 ? existingClients[clientIndex].id : `#SG-${Math.floor(1000 + Math.random() * 9000)}`;
    const billNumber = `BILL-${Math.floor(100 + Math.random() * 900)}`;
    const barcodeText = `BAR-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const currentStock = JSON.parse(localStorage.getItem(inventoryKey)) || [];
    const updatedStock = currentStock.map(stockItem => {
      const soldItem = cart.find(c => c.name.toLowerCase() === stockItem.name.toLowerCase());
      return soldItem ? { ...stockItem, qty: Math.max(0, stockItem.qty - soldItem.qty) } : stockItem;
    });
    localStorage.setItem(inventoryKey, JSON.stringify(updatedStock));

    let updatedClients = [...existingClients];
    if (clientIndex >= 0) {
      const prevSpent = updatedClients[clientIndex].spent + grandTotal;
      updatedClients[clientIndex] = { ...updatedClients[clientIndex], visits: updatedClients[clientIndex].visits + 1, spent: prevSpent, tier: prevSpent >= 5000 ? 'VIP' : 'Regular' };
    } else {
      updatedClients.push({ id: generatedClientID, name: clientName, phone: clientPhone, visits: 1, spent: grandTotal, walletBalance: 0, tier: grandTotal >= 5000 ? 'VIP' : 'Regular' });
    }
    localStorage.setItem(clientsKey, JSON.stringify(updatedClients));

    const billRecord = { billNumber, barcode: barcodeText, clientName, clientPhone, clientId: generatedClientID, staff: selectedStaff || 'General', items: cart, subtotal, discount: calculatedTotalDiscount, gst: Math.round(gstAmount), grandTotal, paymentMode, date: new Date().toISOString() };
    const existingBills = JSON.parse(localStorage.getItem(billsKey)) || [];
    localStorage.setItem(billsKey, JSON.stringify([billRecord, ...existingBills]));

    if (isThermalPrint) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html><head><title>Slip</title><style>body{font-family:monospace;width:280px;margin:0 auto;text-align:center;font-size:12px;}.line{border-bottom:1px dashed #000;margin:6px 0;}.t{width:100%;text-align:left;}</style></head>
        <body><div style="font-weight:bold">${salonName}</div><div>Ph: ${salonWhatsApp}</div><div class="line"></div>
        <div style="text-align:left">Bill: ${billNumber}<br/>Client: ${clientName} (${generatedClientID})</div><div class="line"></div>
        <table class="t">${cart.map(i => `<tr><td>${i.name}</td><td style="text-align:right">${i.qty}</td><td style="text-align:right">${i.discountedPrice * i.qty}</td></tr>`).join('')}</table>
        <div class="line"></div><div style="text-align:right">Total: ₹${grandTotal}</div><div class="line"></div>
        <div style="font-weight:bold">*${barcodeText}*</div><script>window.print();setTimeout(()=>window.close(),1000);</script></body></html>
      `);
      printWindow.document.close();
    } else {
      const itemsListText = cart.map(i => `• ${i.name} - ₹${i.discountedPrice}`).join('\n');
      const whatsappMsg = `🧾 *${salonName} Bill*\nBill No: ${billNumber}\nClient: ${clientName}\nPayment: ${paymentMode}\n\n📋 *Services:*\n${itemsListText}\n\n*Net Total:* ₹${grandTotal}\nBarcode: ${barcodeText}\n⭐ Review Us: ${googleReviewUrl}`;
      window.open(`https://wa.me/91${clientPhone}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
    }

    alert(`✅ Complete! Barcode: ${barcodeText}`);
    setCart([]); setClientName(''); setClientPhone(''); setTotalDiscountValue(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 text-slate-100 max-w-7xl mx-auto font-sans">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-black text-amber-500">✂️ POS Billing & Checkout</h2>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <h3 className="font-bold text-sm text-amber-400">👤 Client Info & Save</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <input type="text" placeholder="Name *" value={clientName} onChange={(e) => setClientName(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
            <input type="tel" placeholder="Phone *" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
            <button type="button" onClick={handleSaveClientOnly} className="bg-slate-800 text-amber-400 font-bold p-3 rounded-xl border border-slate-700">💾 Save Client</button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <h3 className="font-bold text-sm text-amber-400">📋 Service Catalog (1-Click)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {catalogList.map((s, i) => (
              <button key={i} type="button" onClick={() => handleAddCatalogItem(s)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-left flex justify-between">
                <span className="text-xs text-slate-200 truncate">{s.name}</span>
                <span className="text-xs font-black text-amber-500">₹{s.price}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-amber-400">⚡ Quick Service Entry</h3>
            <button type="button" onClick={startVoiceBilling} className={`px-3 py-1.5 rounded-xl font-bold text-xs ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-500/20 text-amber-400'}`}>🎤 Voice</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            <input type="text" placeholder="Service *" value={customItem.name} onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })} className="sm:col-span-2 bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
            <input type="number" placeholder="Price *" value={customItem.price} onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
            <div className="flex gap-1">
              <select value={customItem.serviceDiscType} onChange={(e) => setCustomItem({ ...customItem, serviceDiscType: e.target.value })} className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-amber-400 text-[10px]"><option value="FIXED">₹</option><option value="PERCENT">%</option></select>
              <input type="number" placeholder="Disc" value={customItem.serviceDiscValue} onChange={(e) => setCustomItem({ ...customItem, serviceDiscValue: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-white" />
            </div>
            <button type="button" onClick={handleAddCustomService} className="bg-amber-500 text-slate-950 font-black p-3 rounded-xl">+ Add</button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 h-fit">
        <h3 className="font-bold text-amber-400 text-base border-b border-slate-800 pb-2">🛒 Summary</h3>
        <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-slate-300">
          <option value="">Select Staff</option>{staffList.map((st, i) => <option key={i} value={st}>{st}</option>)}
        </select>
        <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-amber-400 font-bold">
          <option value="Cash">Cash</option><option value="UPI / QR Code">UPI / QR Code</option><option value="Card">Card</option><option value="Prepaid Wallet">Prepaid Wallet</option>
        </select>

        <div className="space-y-2 border-t border-b border-slate-800 py-3 max-h-48 overflow-y-auto text-xs">
          {cart.length === 0 ? <p className="text-slate-500 italic text-center py-2">Cart Khali.</p> : cart.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-slate-950 p-2 rounded-lg">
              <div><div className="font-bold text-white">{item.name}</div><div className="text-[10px] text-slate-400">Net: ₹{item.discountedPrice}</div></div>
              <button type="button" onClick={() => removeFromCart(item.id)} className="text-rose-400 font-bold px-1">✕</button>
            </div>
          ))}
        </div>

        <div className="space-y-1 text-xs pt-1">
          <div className="flex justify-between font-black text-amber-500 text-lg pt-2 border-t border-slate-800">
            <span>Grand Total:</span><span>₹{grandTotal}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button type="button" onClick={() => handleProcessBill(false)} className="w-full bg-emerald-500 text-slate-950 font-black py-3 rounded-xl text-xs">📱 Send WhatsApp Bill</button>
          <button type="button" onClick={() => handleProcessBill(true)} className="w-full bg-amber-500 text-slate-950 font-black py-3 rounded-xl text-xs">🖨️ Thermal Print</button>
        </div>
      </div>
    </div>
  );
          }
