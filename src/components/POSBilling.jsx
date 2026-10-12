import React, { useState } from 'react';

export default function POSBilling({ salonInfo, onCompleteCheckout }) {
  const catalog = [
    { id: 1, name: 'Hair Cut & Styling', price: 350, type: 'service' },
    { id: 2, name: 'Advanced Facial Glow', price: 1200, type: 'service' },
    { id: 3, name: 'Hair Spa & Treatment', price: 900, type: 'service' },
    { id: 4, name: 'Beard Trim & Set', price: 200, type: 'service' },
    { id: 5, name: 'Professional Hair Serum', price: 650, type: 'product' },
    { id: 6, name: 'Anti-Dandruff Shampoo', price: 450, type: 'product' },
  ];

  const staffList = ['Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Neha Verma'];

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(staffList[0]);
  const [discountType, setDiscountType] = useState('flat');
  const [discountValue, setDiscountValue] = useState(0);

  const filteredCatalog = catalog.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1, itemDiscount: 0, staff: selectedStaff }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(c => {
      if (c.id === id) {
        const newQty = c.qty + delta;
        return newQty > 0 ? { ...c, qty: newQty } : null;
      }
      return c;
    }).filter(Boolean));
  };

  const updateItemDiscount = (id, val) => {
    setCart(cart.map(c => c.id === id ? { ...c, itemDiscount: Number(val) || 0 } : c));
  };

  const updateItemStaff = (id, staffName) => {
    setCart(cart.map(c => c.id === id ? { ...c, staff: staffName } : c));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty) - item.itemDiscount, 0);
  const tax = Math.round(subtotal * 0.05);
  const overallDiscount = discountType === 'flat' ? Number(discountValue) : Math.round((subtotal * Number(discountValue)) / 100);
  const grandTotal = Math.max(0, subtotal + tax - overallDiscount);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    const billData = {
      items: cart,
      subtotal,
      tax,
      overallDiscount,
      grandTotal,
      date: new Date().toLocaleString()
    };
    if (onCompleteCheckout) {
      onCompleteCheckout(billData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-sans grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-amber-500">POS Billing Engine</h2>
            <p className="text-xs text-slate-400">{salonInfo?.salon_name || 'SalonGro'} • Smart Catalog</p>
          </div>
          <div className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-bold">
            Trial Active: {salonInfo?.trial_days_left || 2} Days Left
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search services or retail products..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[60vh] pr-1">
          {filteredCatalog.map(item => (
            <div
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 p-3 rounded-xl cursor-pointer transition flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {item.type}
                </span>
                <h3 className="text-xs font-bold mt-2 text-white line-clamp-2">{item.name}</h3>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-amber-400 font-extrabold text-sm">₹{item.price}</span>
                <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-1 rounded font-bold">+ Add</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-extrabold text-amber-500 mb-3 border-b border-slate-800 pb-2">Current Bill / Cart</h3>
          
          <div className="space-y-3 overflow-y-auto max-h-[40vh] pr-1">
            {cart.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">Cart is empty. Click items from catalog to bill.</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <p className="text-amber-400 text-xs font-bold">₹{item.price} each</p>
                    </div>
                    <button onClick={() => updateQty(item.id, -item.qty)} className="text-rose-400 text-xs font-bold hover:underline">Remove</button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                    <select
                      value={item.staff}
                      onChange={(e) => updateItemStaff(item.id, e.target.value)}
                      className="bg-slate-900 text-slate-300 border border-slate-800 rounded px-2 py-1 text-[11px]"
                    >
                      {staffList.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>

                    <div className="flex items-center space-x-2">
                      <button onClick={() => updateQty(item.id, -1)} className="bg-slate-800 px-2 py-0.5 rounded font-bold">-</button>
                      <span className="font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="bg-slate-800 px-2 py-0.5 rounded font-bold">+</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                    <span>Disc (₹):</span>
                    <input
                      type="number"
                      value={item.itemDiscount}
                      onChange={(e) => updateItemDiscount(item.id, e.target.value)}
                      className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-white text-right"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 mt-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal:</span>
            <span className="font-bold text-white">₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>GST (5%):</span>
            <span className="font-bold text-white">₹{tax}</span>
          </div>
          
          <div className="flex justify-between items-center text-slate-400 pt-1">
            <span>Extra Disc:</span>
            <div className="flex space-x-1">
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="0"
                className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-right"
              />
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-1 text-[10px] text-slate-300"
              >
                <option value="flat">₹</option>
                <option value="percent">%</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between text-base font-extrabold text-amber-500 pt-2 border-t border-slate-800">
            <span>Grand Total:</span>
            <span>₹{grandTotal}</span>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition shadow-lg mt-3 text-xs tracking-wider"
          >
            PROCEED TO THERMAL PRINT
          </button>
        </div>
      </div>
    </div>
  );
}
