import React, { useState, useEffect } from 'react';
import { Shield, Lock, CheckCircle, XCircle, Search, Activity, Trash2 } from 'lucide-react';

export default function SuperAdmin() {
  const [passkey, setPasskey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [salonsList, setSalonsList] = useState([]);

  // Aapka Secret Master Key
  const MASTER_SECRET = 'SUPER_SALON_2026_SECRET';

  // LocalStorage se automatic salons list load karna
  useEffect(() => {
    const loadedSalons = JSON.parse(localStorage.getItem('salongro_registered_salons')) || [];
    setSalonsList(loadedSalons);
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passkey === MASTER_SECRET) {
      setIsAuthenticated(true);
    } else {
      alert('❌ Galat Master Secret Key hai!');
    }
  };

  const handleToggleSalonStatus = (salonId) => {
    const updated = salonsList.map((s) => {
      if (s.id === salonId || s.salon_id === salonId) {
        const currentStatus = s.status === 'blocked' ? 'active' : 'blocked';
        return { ...s, status: currentStatus };
      }
      return s;
    });
    setSalonsList(updated);
    localStorage.setItem('salongro_registered_salons', JSON.stringify(updated));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="bg-amber-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 text-amber-400">
              <Lock size={24} />
            </div>
            <h2 className="text-xl font-black text-white">Super Admin Control</h2>
            <p className="text-xs text-slate-400">Enter master secret key to access control panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Secret Key"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs transition cursor-pointer shadow-lg"
            >
              UNLOCK CONTROL PANEL
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredSalons = salonsList.filter(s => 
    (s.salon_name && s.salon_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (s.id && s.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.phone && s.phone.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 space-y-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="text-amber-500" size={24} />
            <h1 className="text-xl font-black text-amber-500">SalonGro Master Control Panel</h1>
          </div>
          <p className="text-xs text-slate-400">Manage all registered partner salons, IDs, and live subscriptions.</p>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
        >
          Lock Panel
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs text-slate-400 font-bold">Total Registered Salons</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{salonsList.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs text-slate-400 font-bold">Active Subscriptions</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {salonsList.filter(s => s.status !== 'blocked').length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center">
          <div className="w-full">
            <input
              type="text"
              placeholder="Search by Salon Name, Phone or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Salons List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-xs text-slate-300 uppercase">
          Partner Salons Directory & Live Access Control
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="p-3">Salon ID</th>
                <th className="p-3">Salon Name</th>
                <th className="p-3">Mobile (User ID)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions / Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSalons.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-500">No partner salons found.</td>
                </tr>
              ) : (
                filteredSalons.map((salon) => (
                  <tr key={salon.id || salon.salon_id} className="hover:bg-slate-950/50 transition">
                    <td className="p-3 font-mono font-bold text-amber-400">{salon.id || salon.salon_id}</td>
                    <td className="p-3 font-bold text-white">{salon.salon_name}</td>
                    <td className="p-3 font-mono">{salon.phone}</td>
                    <td className="p-3">
                      {salon.status !== 'blocked' ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                          BLOCKED
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleSalonStatus(salon.id || salon.salon_id)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] cursor-pointer ${
                          salon.status !== 'blocked' 
                            ? 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30' 
                            : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                        }`}
                      >
                        {salon.status !== 'blocked' ? 'Block Access' : 'Activate Salon'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
        }
