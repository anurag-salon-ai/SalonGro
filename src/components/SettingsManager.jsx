import React, { useState } from 'react';
import { Settings, Save, Plus, Trash2, Star, Calendar, Percent, MapPin, Building, Phone } from 'lucide-react';

export default function SettingsManager({ salonData, onSaveSettings, catalogList, onUpdateCatalog }) {
  const [salonInfo, setSalonInfo] = useState(salonData || {
    salon_name: '',
    owner_name: '',
    address: '',
    phone: '',
    google_review_url: '',
    appointment_link: '',
    default_gst: 5
  });

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemType, setNewItemType] = useState('SERVICE');

  const handleSave = (e) => {
    e.preventDefault();
    if (!salonInfo.salon_name.trim()) {
      alert('Kripya Salon ka Naam zaroor dalein!');
      return;
    }
    onSaveSettings(salonInfo);
    alert('Salon Settings Safaltapoorvak Save Ho Gayi!');
  };

  const handleAddService = () => {
    if (!newItemName.trim() || !newItemPrice) {
      alert('Service Name aur Price dono bharein!');
      return;
    }
    const item = {
      id: Date.now(),
      name: newItemName.trim().toUpperCase(),
      price: parseFloat(newItemPrice) || 0,
      type: newItemType
    };
    onUpdateCatalog([...catalogList, item]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const handleDeleteService = (id) => {
    onUpdateCatalog(catalogList.filter(item => item.id !== id));
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 bg-slate-950 text-white min-h-screen font-sans">
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl font-black text-amber-500 uppercase flex items-center gap-2">
            <Settings size={22} /> Blank Salon Profile & System Setup
          </h1>
          <p className="text-xs text-slate-400">Apne salon ki rate list, links aur tax rules set karein.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Branding Info */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
          <h2 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building size={16} /> Salon Business Details
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-bold block mb-1">Salon Name</label>
              <input
                type="text"
                placeholder="e.g. Royal Unisex Salon"
                value={salonInfo.salon_name}
                onChange={(e) => setSalonInfo({ ...salonInfo, salon_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Owner / Manager Name</label>
              <input
                type="text"
                placeholder="Owner Full Name"
                value={salonInfo.owner_name}
                onChange={(e) => setSalonInfo({ ...salonInfo, owner_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Full Address / Location</label>
              <input
                type="text"
                placeholder="Shop No, Area, City, State"
                value={salonInfo.address}
                onChange={(e) => setSalonInfo({ ...salonInfo, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Default GST Rate (%)</label>
              <input
                type="number"
                placeholder="5"
                value={salonInfo.default_gst}
                onChange={(e) => setSalonInfo({ ...salonInfo, default_gst: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Links & Secret Features Config */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Star size={16} /> Smart Review & Booking Links
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Google Review Link (Secret Weapon)</label>
                <input
                  type="text"
                  placeholder="https://g.page/r/your-google-review-link/review"
                  value={salonInfo.google_review_url}
                  onChange={(e) => setSalonInfo({ ...salonInfo, google_review_url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Good Review (5★) dene wale client is link par redirect honge.</p>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Online Appointment Booking Link</label>
                <input
                  type="text"
                  placeholder="https://your-salon-booking-page.com"
                  value={salonInfo.appointment_link}
                  onChange={(e) => setSalonInfo({ ...salonInfo, appointment_link: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Yeh link bill receipt ke sath client ke WhatsApp par auto-share hoga.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer mt-4"
          >
            <Save size={16} /> Save Salon Configuration
          </button>
        </div>
      </form>

      {/* Catalog Services Setup Engine */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-xs font-black text-amber-400 uppercase tracking-wider">
          Custom Catalog & Rate List Manager
        </h2>

        {/* Add Service Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <input
            type="text"
            placeholder="Service / Product Name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          />
          <input
            type="number"
            placeholder="Price (₹)"
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          />
          <select
            value={newItemType}
            onChange={(e) => setNewItemType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="SERVICE">SERVICE</option>
            <option value="PRODUCT">PRODUCT</option>
          </select>
          <button
            type="button"
            onClick={handleAddService}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus size={16} /> Add To Catalog
          </button>
        </div>

        {/* Catalog Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {catalogList.length === 0 ? (
            <p className="text-xs text-slate-500 col-span-full text-center py-6">Catalog khali hai. Upar se services add karein.</p>
          ) : (
            catalogList.map((item) => (
              <div key={item.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[9px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-bold">{item.type}</span>
                  <h4 className="font-bold text-xs mt-1 text-white">{item.name}</h4>
                  <p className="text-amber-500 font-black text-xs">₹{item.price}</p>
                </div>
                <button
                  onClick={() => handleDeleteService(item.id)}
                  className="text-rose-400 hover:text-rose-300 p-1.5 cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
    }
