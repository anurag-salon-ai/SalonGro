import React, { useState } from 'react';

export default function LoginSignup({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [salonName, setSalonName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isSignup && !agreeTerms) {
      setError('Aapko Privacy Policy & Terms accept karna zaroori hai.');
      return;
    }

    if (phone.length < 10) {
      setError('Kripya valid 10-digit mobile number daalein.');
      return;
    }

    // Unique Salon ID Generation (#SG-XXXX)
    const salonId = `SG-${Math.floor(1000 + Math.random() * 9000)}`;

    const salonData = {
      id: salonId,
      salon_id: salonId,
      salon_name: isSignup ? salonName : 'My Salon',
      owner_name: isSignup ? ownerName : 'Salon Owner',
      email: isSignup ? email : 'owner@salongro.com',
      phone: phone,
      status: 'active',
      is_active: true,
      trial_active: true,
      trial_days_left: 2,
      created_at: new Date().toISOString()
    };

    // 1. Registered Salons Master List Update (For SuperAdmin Control Panel)
    const existingSalons = JSON.parse(localStorage.getItem('salongro_registered_salons')) || [];
    const salonExists = existingSalons.find(s => s.phone === phone);

    if (!salonExists) {
      existingSalons.push(salonData);
      localStorage.setItem('salongro_registered_salons', JSON.stringify(existingSalons));
    }

    // 2. Save Current Login Session
    localStorage.setItem('salon_current', JSON.stringify(salonData));

    // 3. Callback to Parent App Component
    if (onLoginSuccess) {
      onLoginSuccess(salonData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/20 mb-2">
            SG
          </div>
          <h1 className="text-2xl font-black text-amber-500 tracking-wide">SalonGro POS</h1>
          <p className="text-slate-400 text-xs mt-1">Commercial POS & Multi-Owner Platform</p>
        </div>

        <div className="flex bg-slate-950 rounded-xl p-1 mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => { setIsSignup(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${!isSignup ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Owner / Staff Login
          </button>
          <button
            type="button"
            onClick={() => { setIsSignup(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${isSignup ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            New Registration (2-Day Trial)
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl mb-4 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Salon / Spa Name *</label>
                <input
                  type="text"
                  required
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  placeholder="e.g. Royal Unisex Salon"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Owner / Manager Name *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile Number (User ID) *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit Mobile Number"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {isSignup && (
            <div className="flex items-start space-x-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-800 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="terms" className="text-[11px] text-slate-400">
                I agree to the <span className="text-amber-500 underline cursor-pointer">Terms & Privacy Policy</span>. Starts 2-Day Free Trial.
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition shadow-lg mt-2 text-xs tracking-wider cursor-pointer"
          >
            {isSignup ? 'CREATE ACCOUNT & START TRIAL' : 'LOGIN TO DASHBOARD'}
          </button>
        </form>
      </div>
    </div>
  );
}
