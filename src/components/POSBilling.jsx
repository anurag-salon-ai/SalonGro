import React, { useState, useEffect } from 'react';

export default function POSBilling({ salonData }) {
  const [cart, setCart] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  
  // Total Level Discount
  const [totalDiscountValue, setTotalDiscountValue] = useState(0);
  const [totalDiscountType, setTotalDiscountType] = useState('FIXED'); // 'FIXED' ya 'PERCENT'
  
  // GST Settings
  const [gstType, setGstType] = useState('EXCLUSIVE'); // 'EXCLUSIVE' ya 'INCLUSIVE'
  
  // Single-Box Service Entry (Per-service discount optional)
  const [customItem, setCustomItem] = useState({ name: '', price: '', serviceDiscValue: '', serviceDiscType: 'FIXED' });
  const [isListening, setIsListening] = useState(false);

  // Local Storage Sync
  const savedSettings = JSON.parse(localStorage.getItem(`salon_settings_${salonData?.id || 'default'}`)) || salonData || {};
  const [inventoryList, setInventoryList] = useState(JSON.parse(localStorage.getItem('salon_inventory')) || []);
  const staffList = savedSettings.staff_list || [];
  const defaultGstRate = savedSettings.gst_percent || 0;
  const salonWhatsApp = savedSettings.whatsapp_number || savedSettings.phone || '';

  // Zero-API Voice Billing
  const startVoiceBilling = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Aapke browser me Voice Recognition support nahi hai. Chrome browser use karein.');
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

  // Add Item to Cart with OPTIONAL Per-Service Level Discount
  const handleAddCustomService = () => {
    if (!customItem.name || !customItem.price) {
      alert('Kripya Service Name aur Rate dono bharein!');
      return;
    }
    const rawPrice = parseFloat(customItem.price);
    let itemDiscount = 0;
    
    // Check if optional discount is provided
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

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id));
  };

  // Dedicated One-Click Client Save Option
  const handleSaveClientOnly = () => {
    if (!clientName || !clientPhone) {
      alert('Client Name aur Number dono bharein!');
      return;
    }
    const generatedClientID = `#SG-${Math.floor(1000 + Math.random() * 9000)}`;
    const existingClients = JSON.parse(localStorage.getItem('salon_clients')) || [];
    const newClient = {
      id: generatedClientID,
      name: clientName,
      phone: clientPhone,
      visits: 0,
      spent: 0,
      tier: 'New'
    };
    localStorage.setItem('salon_clients', JSON.stringify([...existingClients, newClient]));
    alert(`✅ Client Safaltapoorvak Save Ho Gaya! ID: ${generatedClientID}`);
  };

  // Calculate Totals
  const subtotal = cart.reduce((acc, item) => acc + (item.discountedPrice * item.qty), 0);

  let calculatedTotalDiscount = 0;
  if (totalDiscountType === 'PERCENT') {
    calculatedTotalDiscount = (subtotal * totalDiscountValue) / 100;
  } else {
    calculatedTotalDiscount = totalDiscountValue;
  }

  const taxableAmount = Math.max(0, subtotal - calculatedTotalDiscount);

  let gstAmount = 0;
  if (gstType === 'EXCLUSIVE') {
    gstAmount = (taxableAmount * defaultGstRate) / 100;
  } else {
    gstAmount = taxableAmount - (taxableAmount / (1 + defaultGstRate / 100));
  }

  const grandTotal = Math.round(gstType === 'EXCLUSIVE' ? taxableAmount + gstAmount : taxableAmount);

  // Complete Checkout with Stock Minus + Auto Client ID
  const handleProcessBill = (isThermalPrint = false) => {
    if (!clientName || !clientPhone) {
      alert('Kripya Client Name aur Number zaroor bharein!');
      return;
    }
    if (cart.length === 0) {
      alert('Cart khali hai!');
      return;
    }

    const generatedClientID = `#SG-${Math.floor(1000 + Math.random() * 9000)}`;
    const billNumber = `BILL-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Stock Auto-Minus Logic
    const currentStock = JSON.parse(localStorage.getItem('salon_inventory')) || [];
    const updatedStock = currentStock.map(stockItem => {
      const soldItem = cart.find(c => c.name.toLowerCase() === stockItem.name.toLowerCase());
      if (soldItem) {
        return { ...stockItem, qty: Math.max(0, stockItem.qty - soldItem.qty) };
      }
      return stockItem;
    });
    localStorage.setItem('salon_inventory', JSON.stringify(updatedStock));
    setInventoryList(updatedStock);

    // 2. Save Client & Dynamic Category Tier
    const existingClients = JSON.parse(localStorage.getItem('salon_clients')) || [];
    const existingClientIndex = existingClients.findIndex(c => c.phone === clientPhone);
    
    let updatedClients = [...existingClients];
    if (existingClientIndex >= 0) {
      const prevSpent = updatedClients[existingClientIndex].spent + grandTotal;
      const prevVisits = updatedClients[existingClientIndex].visits + 1;
      updatedClients[existingClientIndex] = {
        ...updatedClients[existingClientIndex],
        visits: prevVisits,
        spent: prevSpent,
        tier: prevSpent > 5000 ? 'VIP' : 'Regular'
      };
    } else {
      updatedClients.push({
        id: generatedClientID,
        name: clientName,
        phone: clientPhone,
        visits: 1,
        spent: grandTotal,
        tier: grandTotal > 5000 ? 'VIP' : 'Regular'
      });
    }
    localStorage.setItem('salon_clients', JSON.stringify(updatedClients));

    if (isThermalPrint) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Thermal Print Slip</title>
            <style>
              body { font-family: monospace; width: 280px; padding: 10px; margin: 0 auto; text-align: center; font-size: 12px; }
              .header { font-weight: bold; font-size: 14px; text-transform: uppercase; }
              .line { border-bottom: 1px dashed #000; margin: 8px 0; }
              .table { width: 100%; text-align: left; border-collapse: collapse; }
              .table th, .table td { padding: 4px 0; }
              .text-right { text-align: right; }
            </style>
          </head>
          <body>
            <div class="header">${savedSettings.salon_name || 'SalonGro Studio'}</div>
            <div>Phone: ${salonWhatsApp}</div>
            <div class="line"></div>
            <div style="text-align:left;">
              <div>Bill No: ${billNumber}</div>
              <div>Client: ${clientName} (${generatedClientID})</div>
              <div>Staff: ${selectedStaff || 'General'}</div>
            </div>
            <div class="line"></div>
            <table class="table">
              <thead>
                <tr><th>Item</th><th class="text-right">Qty</th><th class="text-right">Amt</th></tr>
              </thead>
              <tbody>
                ${cart.map(i => `<tr><td>${i.name}</td><td class="text-right">${i.qty}</td><td class="text-right">${i.discountedPrice * i.qty}</td></tr>`).join('')}
              </tbody>
            </table>
            <div class="line"></div>
            <div style="text-align:right;">
              <div>Subtotal: ₹${subtotal}</div>
              <div>Total Discount: -₹${calculatedTotalDiscount}</div>
              <div>GST (${defaultGstRate}%): ₹${Math.round(gstAmount)}</div>
              <div style="font-weight:bold; font-size:14px;">Grand Total: ₹${grandTotal}</div>
            </div>
            <script>window.print(); setTimeout(() => window.close(), 1000);</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      const reviewUrl = savedSettings.google_review_url || '';
      const itemsListText = cart.map(i => `• ${i.name} - ₹${i.discountedPrice} (Qty: ${i.qty})`).join('\n');
      const whatsappMsg = `🧾 *${savedSettings.salon_name || 'SalonGro'} Digital Bill*\nBill No: ${billNumber}\nClient ID: ${generatedClientID}\nClient Name: ${clientName}\nStaff: ${selectedStaff || 'Default'}\n\n📋 *Services:*\n${itemsListText}\n\nSubtotal: ₹${subtotal}\nDiscount: -₹${calculatedTotalDiscount}\nGST: ₹${Math.round(gstAmount)}\n*Net Amount:* ₹${grandTotal}\n\n⭐ Review Us: ${reviewUrl}`;
      window.open(`https://wa.me/91${clientPhone}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
    }

    alert(`✅ Billing Complete! Auto Client ID: ${generatedClientID}`);
    setCart([]);
    setClientName('');
    setClientPhone('');
    setTotalDiscountValue(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 text-slate-100 max-w-7xl mx-auto font-sans">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-black text-amber-500">✂️ POS Billing & Checkout</h2>

        {/* Client Name & Phone Direct Save Option */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <h3 className="font-bold text-sm text-amber-400">👤 Client Information & One-Click Save</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <input
              type="text"
              placeholder="Client Name *"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="bg-slate-950 border border-slate-800 p-3 rounded-xl focus:outline-none focus:border-amber-500 text-white"
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="bg-slate-950 border border-slate-800 p-3 rounded-xl focus:outline-none focus:border-amber-500 text-white"
            />
            <button
              onClick={handleSaveClientOnly}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold p-3 rounded-xl border border-slate-700 cursor-pointer"
            >
              💾 Save Client
            </button>
          </div>
        </div>

        {/* Single-Box Quick Entry with Optional Per-Service Discount */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-amber-400">⚡ Single-Box Quick Entry (Optional Per-Service Discount)</h3>
            <button
              onClick={startVoiceBilling}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}
            >
              🎤 {isListening ? 'Listening...' : 'Voice Entry'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            <input
              type="text"
              placeholder="Service Name *"
              value={customItem.name}
              onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
              className="sm:col-span-2 bg-slate-950 border border-slate-800 p-3 rounded-xl text-white"
            />
            <input
              type="number"
              placeholder="Price (₹) *"
              value={customItem.price}
              onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })}
              className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white"
            />
            
            {/* Optional Per Service Discount (Flat / %) */}
            <div className="flex gap-1">
              <select
                value={customItem.serviceDiscType}
                onChange={(e) => setCustomItem({ ...customItem, serviceDiscType: e.target.value })}
                className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-amber-400 text-[10px]"
              >
                <option value="FIXED">₹</option>
                <option value="PERCENT">%</option>
              </select>
              <input
                type="number"
                placeholder="Disc (Opt)"
                value={customItem.serviceDiscValue}
                onChange={(e) => setCustomItem({ ...customItem, serviceDiscValue: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-white"
              />
            </div>

            <button
              onClick={handleAddCustomService}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-3 rounded-xl cursor-pointer"
            >
              + Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Checkout + Total Discount + GST */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 h-fit">
        <h3 className="font-bold text-amber-400 text-base border-b border-slate-800 pb-2">🛒 Active Bill Summary</h3>

        <select
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-slate-300"
        >
          <option value="">Select Staff Member</option>
          {staffList.map((st, i) => <option key={i} value={st}>{st}</option>)}
        </select>

        {/* Selected Services List */}
        <div className="space-y-2 border-t border-b border-slate-800 py-3 max-h-48 overflow-y-auto text-xs">
          {cart.length === 0 ? (
            <p className="text-slate-500 italic text-center py-2">Cart Khali Hai.</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-950 p-2 rounded-lg">
                <div>
                  <div className="font-bold text-white">{item.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {item.discValue > 0 ? `Orig: ₹${item.originalPrice} | Disc: -${item.discValue}${item.discType === 'PERCENT' ? '%' : '₹'} | ` : ''}
                    Net: ₹{item.discountedPrice}
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-rose-400 font-bold px-1 cursor-pointer">✕</button>
              </div>
            ))
          )}
        </div>

        {/* Total Bill Level Discount & GST */}
        <div className="space-y-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div>
            <label className="block text-[10px] text-slate-400 mb-1 font-bold">TOTAL BILL DISCOUNT (OPTIONAL)</label>
            <div className="flex gap-2">
              <select
                value={totalDiscountType}
                onChange={(e) => setTotalDiscountType(e.target.value)}
                className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-amber-400 font-bold"
              >
                <option value="FIXED">Flat (₹)</option>
                <option value="PERCENT">Percent (%)</option>
              </select>
              <input
                type="number"
                value={totalDiscountValue}
                onChange={(e) => setTotalDiscountValue(parseFloat(e.target.value) || 0)}
                className="flex-1 bg-slate-900 border border-slate-800 p-2 rounded-lg text-right font-bold text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1 font-bold">GST MODE ({defaultGstRate}%)</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGstType('EXCLUSIVE')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer ${gstType === 'EXCLUSIVE' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
              >
                Exclusive (+GST)
              </button>
              <button
                type="button"
                onClick={() => setGstType('INCLUSIVE')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer ${gstType === 'INCLUSIVE' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
              >
                Inclusive (Included)
              </button>
            </div>
          </div>
        </div>

        {/* Grand Total */}
        <div className="space-y-1 text-xs pt-1">
          <div className="flex justify-between text-slate-400"><span>Subtotal:</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between font-black text-amber-500 text-lg pt-2 border-t border-slate-800">
            <span>Grand Total:</span>
            <span>₹{grandTotal}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => handleProcessBill(false)}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs transition cursor-pointer"
          >
            📱 Send Zero-API WhatsApp Bill
          </button>
          <button
            onClick={() => handleProcessBill(true)}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs transition cursor-pointer"
          >
            🖨️ Thermal Paper Print
          </button>
        </div>
      </div>
    </div>
  );
      }
