import React, { useState, useEffect } from 'react';

export default function POSBilling({ salonData }) {
  const [cart, setCart] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  
  // Total Level Discount
  const [totalDiscountValue, setTotalDiscountValue] = useState(0);
  const [totalDiscountType, setTotalDiscountType] = useState('FIXED');
  
  // GST Settings
  const [gstType, setGstType] = useState('EXCLUSIVE');
  
  // Single-Box Service Entry (Per-service discount optional)
  const [customItem, setCustomItem] = useState({ name: '', price: '', serviceDiscValue: '', serviceDiscType: 'FIXED' });
  const [isListening, setIsListening] = useState(false);

  // Multi-Tenant Isolation using Salon ID
  const salonId = salonData?.id || 'default';
  const savedSettings = JSON.parse(localStorage.getItem(`salon_settings_${salonId}`)) || salonData || {};
  
  const catalogList = savedSettings.catalog || [];
  const staffList = savedSettings.staff_list || [];
  const defaultGstRate = savedSettings.gst_percent || 0;
  const salonWhatsApp = savedSettings.whatsapp_number || savedSettings.phone || '';
  const googleReviewUrl = savedSettings.google_review_url || 'https://g.page/review/salongro';
  const salonName = savedSettings.salon_name || 'SalonGro Studio';

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
      alert('Kripya Service Name aur Rate dono bharein!');
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

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id));
  };

  // One-Click Client Registration (Isolated per Salon)
  const handleSaveClientOnly = () => {
    if (!clientName || !clientPhone) {
      alert('Client Name aur Phone Number dono bharein!');
      return;
    }
    const generatedClientID = `#SG-${Math.floor(1000 + Math.random() * 9000)}`;
    const storageKey = `salon_clients_${salonId}`;
    const existingClients = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    const duplicate = existingClients.find(c => c.phone === clientPhone);
    if (duplicate) {
      alert(`Client pehle se saved hai! ID: ${duplicate.id}`);
      return;
    }

    const newClient = {
      id: generatedClientID,
      name: clientName,
      phone: clientPhone,
      visits: 0,
      spent: 0,
      walletBalance: 0,
      tier: 'Regular'
    };
    localStorage.setItem(storageKey, JSON.stringify([...existingClients, newClient]));
    alert(`✅ Client Successfully Saved! Client ID: ${generatedClientID}`);
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

  // Complete Checkout with Barcode & Isolated Storage Sync
  const handleProcessBill = (isThermalPrint = false) => {
    if (!clientName || !clientPhone) {
      alert('Kripya Client Name aur Phone Number zaroor bharein!');
      return;
    }
    if (cart.length === 0) {
      alert('Cart khali hai!');
      return;
    }

    const clientsKey = `salon_clients_${salonId}`;
    const billsKey = `salon_bills_${salonId}`;
    const inventoryKey = `salon_inventory_${salonId}`;

    const existingClients = JSON.parse(localStorage.getItem(clientsKey)) || [];
    const clientIndex = existingClients.findIndex(c => c.phone === clientPhone);

    const generatedClientID = clientIndex >= 0 ? existingClients[clientIndex].id : `#SG-${Math.floor(1000 + Math.random() * 9000)}`;
    const billNumber = `BILL-${Math.floor(100 + Math.random() * 900)}`;
    const barcodeText = `BAR-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // 1. Stock Auto-Minus (Isolated)
    const currentStock = JSON.parse(localStorage.getItem(inventoryKey)) || [];
    const updatedStock = currentStock.map(stockItem => {
      const soldItem = cart.find(c => c.name.toLowerCase() === stockItem.name.toLowerCase());
      if (soldItem) {
        return { ...stockItem, qty: Math.max(0, stockItem.qty - soldItem.qty) };
      }
      return stockItem;
    });
    localStorage.setItem(inventoryKey, JSON.stringify(updatedStock));

    // 2. Save Client Record (Isolated)
    let updatedClients = [...existingClients];
    if (clientIndex >= 0) {
      const prevSpent = updatedClients[clientIndex].spent + grandTotal;
      const prevVisits = updatedClients[clientIndex].visits + 1;
      updatedClients[clientIndex] = {
        ...updatedClients[clientIndex],
        visits: prevVisits,
        spent: prevSpent,
        tier: prevSpent >= 5000 ? 'VIP' : 'Regular'
      };
    } else {
      updatedClients.push({
        id: generatedClientID,
        name: clientName,
        phone: clientPhone,
        visits: 1,
        spent: grandTotal,
        walletBalance: 0,
        tier: grandTotal >= 5000 ? 'VIP' : 'Regular'
      });
    }
    localStorage.setItem(clientsKey, JSON.stringify(updatedClients));

    // 3. Save Bill History (Isolated)
    const billRecord = {
      billNumber,
      barcode: barcodeText,
      clientName,
      clientPhone,
      clientId: generatedClientID,
      staff: selectedStaff || 'General',
      items: cart,
      subtotal,
      discount: calculatedTotalDiscount,
      gst: Math.round(gstAmount),
      grandTotal,
      paymentMode,
      date: new Date().toISOString()
    };
    const existingBills = JSON.parse(localStorage.getItem(billsKey)) || [];
    localStorage.setItem(billsKey, JSON.stringify([billRecord, ...existingBills]));

    // Thermal Print / WhatsApp Bill Trigger
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
              .barcode { font-size: 16px; font-weight: bold; letter-spacing: 3px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">${salonName}</div>
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
              <div>Discount: -₹${calculatedTotalDiscount}</div>
              <div>GST: ₹${Math.round(gstAmount)}</div>
              <div style="font-weight:bold; font-size:14px;">Grand Total: ₹${grandTotal}</div>
            </div>
            <div class="line"></div>
            <div class="barcode">*${barcodeText}*</div>
            <div style="font-size: 10px; margin-top:5px;">Thank You! Visit Again.</div>
            <script>window.print(); setTimeout(() => window.close(), 1000);</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      const itemsListText = cart.map(i => `• ${i.name} - ₹${i.discountedPrice}`).join('\n');
      const whatsappMsg = `🧾 *${salonName} Digital Bill*\nBill No: ${billNumber}\nClient ID: ${generatedClientID}\nClient Name: ${clientName}\nPayment: ${paymentMode}\n\n📋 *Services:*\n${itemsListText}\n\nSubtotal: ₹${subtotal}\nDiscount: -₹${calculatedTotalDiscount}\nGST: ₹${Math.round(gstAmount)}\n*Net Amount:* ₹${grandTotal}\n\nBarcode: ${barcodeText}\n\n⭐ *Review Us on Google:* ${googleReviewUrl}\n\nThank you for visiting!`;
      window.open(`https://wa.me/91${clientPhone}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
    }

    alert(`✅ Billing Complete & Saved! Barcode: ${barcodeText}`);
    setCart([]);
    setClientName('');
    setClientPhone('');
    setTotalDiscountValue(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 text-slate-100 max-w-7xl mx-auto font-sans">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-black text-amber-500">✂️ POS Billing & Checkout</h2>

        {/* Client Info & Direct Save */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <h3 className="font-bold text-sm text-amber-400">👤 Client Information & Direct Save</h3>
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
              type="button"
              onClick={handleSaveClientOnly}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold p-3 rounded-xl border border-slate-700 cursor-pointer"
            >
              💾 Save Client
            </button>
          </div>
        </div>

        {/* Service Rate List Catalog */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <h3 className="font-bold text-sm text-amber-400">📋 Service Rate List (1-Click Add)</h3>
          {catalogList.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Rate List khali hai. Salon Settings se services add karein!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {catalogList.map((service, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAddCatalogItem(service)}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-xl text-left transition flex justify-between items-center cursor-pointer group"
                >
                  <span className="text-xs text-slate-200 font-semibold truncate group-hover:text-amber-400">{service.name}</span>
                  <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg">₹{service.price}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom Service Entry + Optional Discount */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-amber-400">⚡ Single-Box Custom Service Entry</h3>
            <button
              type="button"
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
              type="button"
              onClick={handleAddCustomService}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-3 rounded-xl cursor-pointer"
            >
              + Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Checkout & Payment Options */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 h-fit">
        <h3 className="font-bold text-amber-400 text-base border-b border-slate-800 pb-2">🛒 Active Bill Summary</h3>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Select Staff Member</label>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-slate-300"
          >
            <option value="">Select Staff</option>
            {staffList.map((st, i) => <option key={i} value={st}>{st}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Mode</label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-amber-400 font-bold"
          >
            <option value="Cash">Cash</option>
            <option value="UPI / QR Code">UPI / QR Code</option>
            <option value="Card">Card</option>
            <option value="Prepaid Wallet">Prepaid Wallet</option>
          </select>
        </div>

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
                <button type="button" onClick={() => removeFromCart(item.id)} className="text-rose-400 font-bold px-1 cursor-pointer">✕</button>
              </div>
            ))
          )}
        </div>

        {/* Discount & GST Controls */}
        <div className="space-y-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div>
            <label className="block text-[10px] text-slate-400 mb-1 font-bold">TOTAL BILL DISCOUNT (OPTIONAL)</label>
            <div className="flex gap-2">
              <select
                value={totalDiscountType}
                onChange={(e) => setTotalDiscountType(e.target.value)}
      900 border border-slate-800 p-2 rounded-lg text-amber-400 font-bold"
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
            type="button"
            onClick={() => handleProcessBill(false)}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs transition cursor-pointer"
          >
            📱 Send Zero-API WhatsApp Bill + Barcode
          </button>
          <button
            type="button"
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
