import React, { useState } from 'react';

export default function SmartCRM() {
  const [clients, setClients] = useState([
    { id: 'CUST-1001', name: 'Prakash Sharma', phone: '8840786094', visits: 6, totalSpent: 7500, tier: 'VIP Regular' },
    { id: 'CUST-1002', name: 'Anjali Verma', phone: '9876543210', visits: 3, totalSpent: 3200, tier: 'Regular' },
    { id: 'CUST-1003', name: 'Rohit Singh', phone: '9123456780', visits: 1, totalSpent: 950, tier: 'New' },
    { id: 'CUST-1004', name: 'Pooja Kumari', phone: '9988776655', visits: 4, totalSpent: 4800, tier: 'Regular' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleSendOffer = (clientName) => {
    alert(`📱 WhatsApp promotional offer successfully sent to ${clientName}!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-sans space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-amber-500">Smart CRM & Client Auto-Segmentation</h2>
          <p className="text-xs text-slate-400">Manage client tiers, retention metrics, and targeted WhatsApp campaigns.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400">
            Total Clients: {clients.length}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">VIP Regulars</span>
          <h3 className="text-2xl font-black mt-1">1 Client</h3>
          <p className="text-xs text-slate-500 mt-1">Spent &gt; ₹5,000</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Regular Visitors</span>
          <h3 className="text-2xl font-black mt-1">2 Clients</h3>
          <p className="text-xs text-slate-500 mt-1">3-4 visits per month</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">New This Week</span>
          <h3 className="text-2xl font-black mt-1">1 Client</h3>
          <p className="text-xs text-slate-500 mt-1">First-time visitors</p>
        </div>
      </div>

      {/* Search & Client List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-base font-extrabold text-white">Client Database</h3>
          <input
            type="text"
            placeholder="🔍 Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3">Client ID & Name</th>
                <th className="pb-3">Phone Number</th>
                <th className="pb-3">Visits</th>
                <th className="pb-3">Total Spent</th>
                <th className="pb-3">Segment Tier</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-950/40 transition">
                  <td className="py-3 font-bold text-white">
                    {client.name} <span className="block text-[10px] text-slate-500 font-normal">{client.id}</span>
                  </td>
                  <td className="py-3 text-slate-300">{client.phone}</td>
                  <td className="py-3 text-slate-300">{client.visits} Visits</td>
                  <td className="py-3 text-amber-400 font-extrabold">₹{client.totalSpent}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      client.tier === 'VIP Regular' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      client.tier === 'Regular' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {client.tier}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleSendOffer(client.name)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition"
                    >
                      📱 Send Offer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
            }
