import React, { useState, useEffect, useRef } from 'react';

export default function POSSystem() {
  const [activeTab, setActiveTab] = useState('pos');
  const [shopName, setShopName] = useState('ຮ້ານ ແພງສອນ online');
  const [logoUrl, setLogoUrl] = useState('');
  
  // ປ່ຽນສີຂອບໂລໂກ້ທຸກໆ 10 ວິນາທີ
  const [borderColor, setBorderColor] = useState('#00f5d4');
  const borderColors = ['#00f5d4', '#f50057', '#00e676', '#ffea00', '#2979ff'];
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % borderColors.length;
      setBorderColor(borderColors[index]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="flex h-screen bg-[#0d1b2a] text-white font-sans overflow-hidden" style={{ fontFamily: "'Phetsalart OT', sans-serif" }}>
      
      {/* ================= SIDEBAR (ເມນູດ້ານຊ້າຍ) ================= */}
      <div className="w-72 bg-[#1b263b] flex flex-col justify-between border-r border-slate-700 p-5 shadow-2xl">
        <div>
          {/* Logo ຮ້ານ (ຄລິກເພື່ອປ່ຽນຮູບ + ປ່ຽນສີຂອບທຸກ 10 ວິນາທີ) */}
          <div className="flex flex-col items-center gap-3 mb-8 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden transition-all duration-1000 shadow-lg"
              style={{ border: `4px solid ${borderColor}`, boxShadow: `0 0 20px ${borderColor}60` }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-cyan-400 font-bold text-lg">LOGO</span>
              )}
            </div>
            <h2 className="font-bold text-base text-center text-cyan-200 tracking-wide">{shopName}</h2>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
          </div>

          {/* เมນູຊ້າຍ */}
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${activeTab === 'dashboard' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              📊 1. ໜ້າຫຼັກ Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('pos')} 
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${activeTab === 'pos' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              🛒 2. ໜ້າຂາຍສິນຄ້າ POS
            </button>
            <button 
              onClick={() => setActiveTab('admin')} 
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${activeTab === 'admin' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              ⚙️ 3. ຈັດການລະບົບ (Admin)
            </button>
            <button 
              onClick={() => setActiveTab('reports')} 
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${activeTab === 'reports' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              📈 4. ລາຍງານຍອດຂາຍ
            </button>
          </nav>
        </div>

        <div className="text-xs text-slate-500 text-center border-t border-slate-700/50 pt-3">
          POS System v2.0 • ຮ້ານ ແພງສອນ online
        </div>
      </div>

      {/* ================= CONTENT AREA (ເນື້ອຫາດ້ານຂວາ) ================= */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* --- 1. DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-cyan-300 mb-2">ພາບລວມລະບົບ (Dashboard)</h1>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-[#1b263b] p-6 rounded-2xl border border-slate-700 shadow-xl">
                <p className="text-sm text-slate-400 font-medium">ຄັງສິນຄ້າລວມ (ລາຍການ)</p>
                <p className="text-3xl font-extrabold text-white mt-2">12 ປະເພດ</p>
              </div>
              <div className="bg-[#1b263b] p-6 rounded-2xl border border-slate-700 shadow-xl">
                <p className="text-sm text-slate-400 font-medium">ຍອດຂາຍລວມທັງໝົດ</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-2">₭2,500,000</p>
              </div>
              <div className="bg-[#1b263b] p-6 rounded-2xl border border-slate-700 shadow-xl">
                <p className="text-sm text-slate-400 font-medium">ຈຳນວນສະມາຊິກລູກຄ້າ</p>
                <p className="text-3xl font-extrabold text-amber-400 mt-2">45 ຄົນ</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#1b263b] p-6 rounded-2xl border border-slate-700 shadow-xl">
                <h3 className="text-amber-400 font-bold mb-4">🏆 3 ອັນດັບສິນຄ້າຂາຍດີ</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-[#0d1b2a] p-3 rounded-xl border border-slate-800">
                    <span>1. Alisa Detox Tea Herb</span>
                    <span className="text-cyan-400 font-bold">16 ຊຸດ</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#0d1b2a] p-3 rounded-xl border border-slate-800">
                    <span>2. Alisa Green Tea Herb</span>
                    <span className="text-cyan-400 font-bold">12 ຊຸດ</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#0d1b2a] p-3 rounded-xl border border-slate-800">
                    <span>3. ຄໍລາເຈນ VIP</span>
                    <span className="text-cyan-400 font-bold">5 ຊຸດ</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1b263b] p-6 rounded-2xl border border-slate-700 shadow-xl">
                <h3 className="text-cyan-400 font-bold mb-4">💰 ມູນຄ່າສິນຄ້າໃນຄັງ</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                    <span className="text-slate-400">ຕົ້ນທຶນສິນຄ້າລວມ:</span>
                    <span className="text-xl font-bold text-rose-400">₭3,200,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">ມູນຄ່າລາຄາຂາຍລວມ:</span>
                    <span className="text-xl font-bold text-emerald-400">₭5,800,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 2. POS --- */}
        {activeTab === 'pos' && (
          <div className="flex gap-6 h-full max-w-7xl mx-auto pb-10">
            <div className="flex-[2] flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="🔍 ຄົ້ນຫາສິນຄ້າ (ID, ລະຫັດ, ຊື່ສິນຄ້າ)..." 
                className="w-full bg-[#1b263b] p-4 rounded-xl border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 shadow-lg" 
              />
              <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2">
                {[
                  { id: '1', name: 'Alisa Detox Tea', price: 85000 },
                  { id: '2', name: 'Alisa Green Tea', price: 85000 },
                  { id: '3', name: 'ຄໍລາເຈນ VIP', price: 150000 }
                ].map(p => (
                  <div key={p.id} className="bg-[#1b263b] p-5 rounded-2xl border border-slate-700 hover:border-cyan-400 cursor-pointer transition shadow-lg flex flex-col justify-between h-32">
                    <div>
                      <h4 className="font-bold text-white">{p.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">ລະຫັດ: P00{p.id}</p>
                    </div>
                    <p className="text-cyan-400 font-extrabold text-lg">₭{p.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-[1.2] bg-[#1b263b] p-6 rounded-2xl border border-slate-700 flex flex-col shadow-2xl">
              <h3 className="font-bold text-lg mb-4 text-cyan-300">🛒 ບິນຂາຍສິນຄ້າ</h3>
              <div className="flex-1 bg-[#0d1b2a] rounded-xl p-3 overflow-y-auto mb-4 border border-slate-800">
                <p className="text-center text-slate-500 text-sm mt-20">ຍັງບໍ່ມີສິນຄ້າໃນກະຕ່າ</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>ລວມເງິນ:</span>
                  <span className="text-emerald-400">₭0</span>
                </div>
                <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3.5 rounded-xl font-bold transition shadow-lg">
                  ຊຳລະເງິນ (Enter)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. ADMIN --- */}
        {activeTab === 'admin' && (
          <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <h1 className="text-2xl font-bold text-cyan-300">⚙️ ຈັດການລະບົບ (Admin)</h1>
            <div className="bg-[#1b263b] p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">
              <h3 className="font-bold text-lg text-amber-400 border-b border-slate-700 pb-2">📦 ເພີ່ມສິນຄ້າໃໝ່</h3>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="ID / ລະຫັດສິນຄ້າ" className="bg-[#0d1b2a] p-3 rounded-xl border border-slate-700 text-sm" />
                <input type="text" placeholder="ຊື່ສິນຄ້າ" className="bg-[#0d1b2a] p-3 rounded-xl border border-slate-700 text-sm" />
                <input type="number" placeholder="ຈຳນວນໃນຄັງ" className="bg-[#0d1b2a] p-3 rounded-xl border border-slate-700 text-sm" />
                <input type="number" placeholder="ລາຄາຍ່ອຍ" className="bg-[#0d1b2a] p-3 rounded-xl border border-slate-700 text-sm" />
                <input type="number" placeholder="ລາຄາໂປຣ" className="bg-[#0d1b2a] p-3 rounded-xl border border-slate-700 text-sm" />
                <input type="number" placeholder="ລາຄາຕົວແທນ" className="bg-[#0d1b2a] p-3 rounded-xl border border-slate-700 text-sm" />
                <input type="number" placeholder="ຕົ້ນທຶນ" className="bg-[#0d1b2a] p-3 rounded-xl border border-slate-700 text-sm" />
              </div>
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg">ບັນທຶກສິນຄ້າ</button>
            </div>
          </div>
        )}

        {/* --- 4. REPORTS --- */}
        {activeTab === 'reports' && (
          <div className="space-y-6 max-w-6xl mx-auto pb-10">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-cyan-300">📈 ລายງານຍອດຂາຍ</h1>
              <div className="flex gap-3">
                <button className="bg-rose-600 hover:bg-rose-500 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg transition">📄 ດາວໂຫລດ PDF</button>
                <button className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg transition">📊 ດາວໂຫລດ EXCEL</button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-[#1b263b] p-6 rounded-2xl border-2 border-emerald-500/50 shadow-xl">
                <p className="text-slate-400 font-medium">ລາຍໄດ້ລວມ</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-2">₭8,500,000</p>
              </div>
              <div className="bg-[#1b263b] p-6 rounded-2xl border-2 border-amber-500/50 shadow-xl">
                <p className="text-slate-400 font-medium">ຕົ້ນທຶນລວມ</p>
                <p className="text-3xl font-extrabold text-amber-400 mt-2">₭5,200,000</p>
              </div>
              <div className="bg-[#1b263b] p-6 rounded-2xl border-2 border-rose-500/50 shadow-xl">
                <p className="text-slate-400 font-medium">ກຳໄລສຸດທິ</p>
                <p className="text-3xl font-extrabold text-rose-400 mt-2">₭3,300,000</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}