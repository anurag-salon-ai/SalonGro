import React from 'react';

export default function ThermalPrintReceipt({ salonInfo, billData, onBackToPOS }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-sans flex flex-col items-center justify-center">
      <div className="w-full max-w-sm bg-white text-slate-900 p-6 rounded-xl shadow-2xl font-mono text-xs space-y-4 my-4">
        {/* Salon Header */}
        <div className="text-center border-b border-dashed border-slate-400 pb-3 space-y-1">
          <h2 className="text-base font-black tracking-wider uppercase">{salonInfo?.salon_name || 'SalonGro Spa'}</h2>
          <p className="text-[10px] text-slate-600">Professional Salon & Wellness Management</p>
          <p className="text-[10px] text-slate-600">Ph: {salonInfo?.phone || '+91 9876543210'}</p>
        </div>

        {/* Bill Meta */}
        <div className="border-b border-dashed border-slate-400 pb-2 space-y-1 text-[11px] text-slate-700">
          <div className="flex justify-between">
            <span>Date: {billData?.date || new Date().toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Staff / Cashier: {salonInfo?.owner_name || 'Admin'}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="border-b border-dashed border-slate-400 pb-3">
          <div className="flex justify-between font-bold border-b border-slate-300 pb-1 mb-2 text-[11px]">
            <span>ITEM / STAFF</span>
            <span>QTY×PRICE</span>
            <span>TOTAL</span>
          </div>
          
          <div className="space-y-2">
            {billData?.items?.map((item, index) => {
              const itemTotal = (item.price * item.qty) - (item.itemDiscount || 0);
              return (
                <div key={index} className="space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span className="truncate max-w-[140px]">{item.name}</span>
                    <span>{item.qty} × ₹{item.price}</span>
                    <span>₹{itemTotal}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 flex justify-between">
                    <span>Staff: {item.staff}</span>
                    {item.itemDiscount > 0 && <span className="text-rose-600">Disc: -₹{item.itemDiscount}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Totals Calculation */}
        <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-3 text-slate-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{billData?.subtotal || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span>₹{billData?.tax || 0}</span>
          </div>
          {billData?.overallDiscount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Extra Discount</span>
              <span>-₹{billData?.overallDiscount}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-300">
            <span>GRAND TOTAL</span>
            <span>₹{billData?.grandTotal || 0}</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[10px] text-slate-500 space-y-1 pt-1">
          <p>Thank you for visiting!</p>
          <p className="font-bold">Powered by SalonGro POS</p>
        </div>
      </div>

      {/* Action Buttons (Non-printable) */}
      <div className="w-full max-w-sm flex space-x-3 print:hidden">
        <button
          type="button"
          onClick={onBackToPOS}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition text-xs"
        >
          ← Back to POS
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition shadow-lg text-xs"
        >
          🖨️ PRINT RECEIPT
        </button>
      </div>
    </div>
  );
          }
