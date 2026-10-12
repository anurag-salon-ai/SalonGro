import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, Scissors, Plus, CheckCircle } from 'lucide-react';

export default function AppointmentsCalendar() {
  const [appointments, setAppointments] = useState([
    { id: 'APT-1', clientName: 'Prakash Sharma', phone: '8840786094', service: 'Master Hair Cut', staff: 'Rahul (Master Stylist)', time: '10:00 AM', date: '2026-10-12', status: 'Confirmed' },
    { id: 'APT-2', clientName: 'Anjali Verma', phone: '9876543210', service: 'Advanced Hair Spa', staff: 'Pooja (Senior Stylist)', time: '11:30 AM', date: '2026-10-12', status: 'In-Service' },
    { id: 'APT-3', clientName: 'Rohit Singh', phone: '9123456780', service: 'Beard Sculpting', staff: 'Rahul (Master Stylist)', time: '02:00 PM', date: '2026-10-12', status: 'Pending' }
  ]);

  const [newClient, setNewClient] = useState('');
  const [newService, setNewService] = useState('Master Hair Cut');
  const [newTime, setNewTime] = useState('03:00 PM');

  const handleAddAppointment = (e) => {
    e.preventDefault();
    if (!newClient) return;
    const newApt = {
      id: `APT-${Date.now().toString().slice(-3)}`,
      clientName: newClient,
      phone: '9988776655',
      service: newService,
      staff: 'Amit (Skin Expert)',
      time: newTime,
      date: '2026-10-12',
      status: 'Confirmed'
    };
    setAppointments([newApt, ...appointments]);
    setNewClient('');
    alert('📅 New Appointment Booked Successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-sans space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-amber-500">Omnichannel Calendar & Appointments</h2>
          <p className="text-xs text-slate-400">Manage client salon bookings, staff allocation, and scheduling timelines.</p>
        </div>
        <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400">
          Today's Bookings: {appointments.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <CalendarIcon size={18} className="text-amber-500" /> Today's Schedule Timeline
          </h3>
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{apt.time}</span>
                    <h4 className="font-extrabold text-sm text-white">{apt.clientName}</h4>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Scissors size={12} className="text-amber-500" /> {apt.service} • <span className="text-slate-300">{apt.staff}</span>
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  apt.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  apt.status === 'In-Service' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Booking Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Plus size={18} className="text-amber-500" /> Quick Book Appointment
          </h3>
          <form onSubmit={handleAddAppointment} className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Client Name</label>
              <input
                type="text"
                required
                placeholder="Enter client name..."
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Service</label>
              <select
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option>Master Hair Cut</option>
                <option>Advanced Hair Spa</option>
                <option>O3+ Luxury Facial</option>
                <option>Beard Sculpting</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Time Slot</label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              Book Appointment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
        }
