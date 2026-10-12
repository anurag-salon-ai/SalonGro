import React, { useState } from 'react';

export default function InventoryManager() {
  const [inventory, setInventory] = useState([
    { id: 'INV-101', name: 'L\'Oréal Professional Shampoo (250ml)', type: 'Retail', category: 'Hair Care', stock: 14, minStock: 5, price: 650, unit: 'Pcs' },
    { id: 'INV-102', name: 'Matrix Opti-Care Hair Mask (500g)', type: 'Back-Bar', category: 'Spa Consumable', stock: 2, minStock: 4, price: 1200, unit: 'Tubs' },
    { id: 'INV-103', name: 'O3+ Power Bright Facial Kit', type: 'Back-Bar', category: 'Skin Consumable', stock: 8, minStock: 3, price: 2800, unit: 'Kits' },
    { id: 'INV-104', name: 'Streax Hair Serum (100ml)', type: 'Retail', category: 'Hair Care', stock: 18, minStock: 6, price: 350, unit: 'Pcs' },
    { id: 'INV-105', name: 'Moroccan Argan Oil Treatment', type: 'Retail', category: 'Styling', stock: 3, minStock: 5, price: 2200, unit: 'Pcs' }
  ]);

  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Retail', 'Back-Bar', 'Low Stock'
  const [searchTerm, setSearchTerm] = useState('');

  // Update Stock Quantity
  const handleStockUpdate = (id, delta) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.stock + delta);
        return { ...item, stock: newQty };
      }
      return item;
    }));
  };

  // Filter Logic
  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'Retail') return matchesSearch && item.type === 'Retail';
    if (activeTab === 'Back-Bar') return matchesSearch && item.type === 'Back-Bar';
    if (activeTab === 'Low Stock') return matchesSearch && item.stock <= item.minStock;
    return matchesSearch;
  });

  const lowStockCount = inventory.filter(i => i.stock <= i.minStock).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-sans space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-amber-500">Dual-Tier Inventory Manager</h2>
          <p className="text-xs text-slate-400">Track salon retail products and back-bar service consumables separately.</p>
        </div>
        <div className="flex gap-2">
          {lowStockCount > 0 && (
            <div className="bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 flex items-center gap-1.5">
              ⚠️ {lowStockCount} Items Low in Stock
            </div>
          )}
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400">
            Total Items: {inventory.length}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:w-auto">
            {['All', 'Retail', 'Back-Bar', 'Low Stock'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === tab
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab} {tab === 'Low Stock' && lowStockCount > 0 && `(${lowStockCount})`}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="🔍 Search products or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3">Item ID & Name</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price / Unit</th>
                <th className="pb-3">Stock Level</th>
                <th className="pb-3 text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => {
                const isLow = item.stock <= item.minStock;
                return (
                  <tr key={item.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-3 font-bold text-white">
                      {item.name}
                      <span className="block text-[10px] text-slate-500 font-normal">{item.id}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.type === 'Retail'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{item.category}</td>
                    <td className="py-3 text-amber-400 font-extrabold">₹{item.price} <span className="text-[10px] text-slate-500 font-normal">/ {item.unit}</span></td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm ${isLow ? 'text-rose-400' : 'text-slate-200'}`}>
                          {item.stock}
                        </span>
                        {isLow && (
                          <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold">
                            Low Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <button
                          onClick={() => handleStockUpdate(item.id, -1)}
                          className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs flex items-center justify-center transition"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleStockUpdate(item.id, 1)}
                          className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs flex items-center justify-center transition"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
      }
