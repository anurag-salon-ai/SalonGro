import React, { useState } from 'react';

export default function LoginSignup({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [salonName, setSalonName] = useState('');
  const [ownerName, setOwnerName] = useState('');
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

    if (onLoginSuccess) {
      onLoginSuccess({
        salon_name: isSignup ? salonName : 'Royal Spa & Salon',
        owner_name: isSignup ? ownerName : 'Owner Partner',
        phone: phone,
        trial_active: true,
        trial_days_left: 2
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-amber-500 tracking-wide">SalonGro</h1>
          <p className="text-slate-400 text-xs mt-1">Commercial POS & Multi-Owner Platform</p>
        </div>

        <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => { setIsSignup(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition ${!isSignup ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Owner / Staff Login
          </button>
          <button
            type="button"
            onClick={() => { setIsSignup(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition ${isSignup ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            New Registration (2-Day Trial)
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Salon Name</label>
                <input
                  type="text"
                  required
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  placeholder="e.g. Royal Unisex Salon"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Owner / Manager Name</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mobile Number (User ID)</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit Mobile Number"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-lg transition shadow-lg mt-2 text-xs tracking-wider"
          >
            {isSignup ? 'START 2-DAY FREE TRIAL' : 'LOGIN TO DASHBOARD'}
          </button>
        </form>
      </div>
    </div>
    );
}
