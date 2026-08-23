import React, { useState, useEffect, useRef } from 'react';

// === ຂໍ້ມູນຈຳລອງ (Mock Data) ===
const mockProducts = [
  { id: '1', code: 'P001', name: 'Alisa Detox Tea', qty: 50, price: 85000, cost: 50000 },
  { id: '2', code: 'P002', name: 'Alisa Green Tea', qty: 30, price: 85000, cost: 50000 },
  { id: '3', code: 'P003', name: 'ຄໍລາເຈນ VIP', qty: 15, price: 150000, cost: 100000 },
];

const mockCustomers = [
  { id: 'C01', name: 'ລູກຄ້າທົ່ວໄປ', phone: '-' },
  { id: 'C02', name: 'ນາງ ສົມສີ', phone: '020 5555 6666' },
];

export default function POSSystem() {
  // === State ຫຼັກຂອງລະບົບ ===
  const [activeTab, setActiveTab] = useState('pos');
  const [shopName, setShopName] = useState('ຮ້ານ ແພງສອນ online');
  const [logoUrl, setLogoUrl] = useState('');
  
  // === State ໂລໂກ້ & ທີມ ===
  const [borderColor, setBorderColor] = useState('#00f5d4');
  const borderColors = ['#00f5d4', '#f50057', '#00e676', '#ffea00', '#2979ff'];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // === State ສຳລັບ POS ===
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState(mockCustomers[0]);
  const [payAmount, setPayAmount] = useState(0);

  // === ປ່ຽນສີຂອບໂລໂກ້ທຸກໆ 10 ວິນາທີ ===
  useEffect(() => {
    let colorIndex = 0;
    const interval = setInterval(() => {
      colorIndex = (colorIndex + 1) % borderColors.length;
      setBorderColor(borderColors[colorIndex]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // === ຈັດການ ຄີລັດ (Keyboard Shortcuts) ສຳລັບໜ້າ POS ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'pos') return;
      
      const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      
      // กด Spacebar = ຮັບເງິນພໍດີ
      if (e.code === 'Space') {
        e.preventDefault();
        setPayAmount(total);
      }
      // กด Enter = ຊຳລະເງິນ
      if (e.code === 'Enter') {
        e.preventDefault();
        if (payAmount >= total && total > 0) {
          alert('✅ ຊຳລະເງິນສຳເລັດ! ບັນທຶກບິນແລ້ວ.');
          setCart([]);
          setPayAmount(0);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, cart, payAmount]);

  // === ຟັງຊັນປ່ຽນໂລໂກ້ ===
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div 
      className="flex min-h-screen bg-[#0d1b2a] text-white" 
      style={{ fontFamily: "'Phetsalart OT', sans-serif" }} // ໃຊ້ຟອນ Phetsalart OT
    >
      {/* ================= SIDEBAR ================= */}
      <div className="w-64 bg-[#1b263b] p-4 flex flex-col justify-between border-r border-slate-700">
        <div>
          {/* Logo Section (ຄລິກເພື່ອປ່ຽນ) */}
          <div className="flex flex-col items-center gap-3 mb-8 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden transition-all duration-1000"
              style={{ border: `4px solid ${borderColor}`, boxShadow: `0 0 15px ${borderColor}80` }}
            >
              {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-cyan-400 font-bold text-2xl">Logo</span>}
            </div>
            <span className="font-bold text-lg text-center">{shopName}</span>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
          </div>

          {/* Menu */}
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-4 py-3 rounded ${activeTab === 'dashboard' ? 'bg-cyan-600/30 text-cyan-400' : 'hover:bg-slate-700'}`}>🏠 ໜ້າຫຼັກ (Dashboard)</button>
            <button onClick={() => setActiveTab('pos')} className={`w-full text-left px-4 py-3 rounded ${activeTab === 'pos' ? 'bg-cyan-600/30 text-cyan-400' : 'hover:bg-slate-700'}`}>🛒 ຂາຍສິນຄ້າ (POS)</button>
            <button onClick={() => setActiveTab('admin')} className={`w-full text-left px-4 py-3 rounded ${activeTab === 'admin' ? 'bg-cyan-600/30 text-cyan-400' : 'hover:bg-slate-700'}`}>⚙️ ຈັດການລະບົບ (Admin)</button>
            <button onClick={() => setActiveTab('reports')} className={`w-full text-left px-4 py-3 rounded ${activeTab === 'reports' ? 'bg-cyan-600/30 text-cyan-400' : 'hover:bg-slate-700'}`}>📊 ລາຍງານຍອດຂາຍ</button>
          </nav>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 p-6 overflow-y-auto h-screen">
        
        {/* 1. ໜ້າຫຼັກ DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-cyan-300 mb-4">🏠 ພາບລວມລະບົບ (Dashboard)</h1>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#1b263b] p-4 rounded-xl border border-slate-700">
                <p className="text-sm text-slate-400">ຄັງສິນຄ້າລວມ</p><p className="text-2xl font-bold">95 ລາຍການ</p>
              </div>
              <div className="bg-[#1b263b] p-4 rounded-xl border border-slate-700">
                <p className="text-sm text-slate-400">ຍອດຂາຍລວມ</p><p className="text-2xl font-bold text-emerald-400">₭2,500,000</p>
              </div>
              <div className="bg-[#1b263b] p-4 rounded-xl border border-slate-700">
                <p className="text-sm text-slate-400">ຈຳນວນສະມາຊິກ</p><p className="text-2xl font-bold text-amber-400">128 ຄົນ</p>
              </div>
              <div className="bg-[#1b263b] p-4 rounded-xl border border-slate-700">
                <p className="text-sm text-slate-400">ມູນຄ່າຕົ້ນທຶນສິນຄ້າໃນຄັງ</p><p className="text-2xl font-bold text-rose-400">₭5,500,000</p>
              </div>
            </div>

            <div className="bg-[#1b263b] p-4 rounded-xl border border-amber-500/30">
              <h2 className="text-amber-400 font-semibold mb-3">🏆 ຍອດຂາຍສະເພາະສິນຄ້າຂາຍດີ 3 ອັນດັບ</h2>
              {/* Mockup Top 3 */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between bg-[#0d1b2a] p-2 rounded"><span>#1 Alisa Detox Tea</span><span className="text-cyan-400">₭1,360,000 (16 ຊຸດ)</span></div>
                <div className="flex justify-between bg-[#0d1b2a] p-2 rounded"><span>#2 Alisa Green Tea</span><span className="text-cyan-400">₭1,020,000 (12 ຊຸດ)</span></div>
                <div className="flex justify-between bg-[#0d1b2a] p-2 rounded"><span>#3 ຄໍລາເຈນ VIP</span><span className="text-cyan-400">₭450,000 (3 ຊຸດ)</span></div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ໜ້າຂາຍສິນຄ້າ POS */}
        {activeTab === 'pos' && (
          <div className="flex gap-4 h-full">
            {/* ລາຍການສິນຄ້າທາງຊ້າຍ */}
            <div className="flex-[2] flex flex-col gap-4">
              <input type="text" placeholder="🔍 ຄົ້ນຫາສິນຄ້າດ້ວຍ ID, ລະຫັດ, ຊື່ສິນຄ້າ..." className="w-full bg-[#1b263b] p-3 rounded-lg border border-slate-600 focus:outline-none focus:border-cyan-400" />
              
              <div className="grid grid-cols-3 gap-3 overflow-y-auto">
                {mockProducts.map(p => (
                  <div key={p.id} onClick={() => setCart([...cart, {...p, qty: 1}])} className="bg-[#1b263b] p-4 rounded-lg cursor-pointer hover:bg-slate-700 border border-slate-600">
                    <p className="font-bold">{p.name}</p>
                    <p className="text-sm text-slate-400">ລະຫັດ: {p.code}</p>
                    <p className="text-cyan-400 font-bold mt-2">₭{p.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-[#1b263b] p-3 rounded-lg border border-slate-600">
                <p className="text-sm text-slate-400 mb-2">ປະຫວັດບິນລ່າສຸດ (1-4 ບິນເພື່ອກົດແກ້ໄຂ)</p>
                <div className="flex gap-2">
                  <button className="bg-[#0d1b2a] px-3 py-1 rounded text-xs">ບິນ #001</button>
                  <button className="bg-[#0d1b2a] px-3 py-1 rounded text-xs">ບິນ #002</button>
                </div>
              </div>
            </div>

            {/* ບິນຄິດເງິນທາງຂວາ */}
            <div className="flex-[1] bg-[#1b263b] rounded-xl p-4 flex flex-col border border-slate-700">
              <div className="mb-4">
                <label className="text-xs text-slate-400">ລູກຄ້າ:</label>
                <select className="w-full bg-[#0d1b2a] p-2 rounded text-sm mt-1 border border-slate-600">
                  {mockCustomers.map(c => <option key={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto bg-[#0d1b2a] rounded p-2 mb-4 space-y-2">
                {cart.length === 0 ? <p className="text-center text-slate-500 mt-10">ຍັງບໍ່ມີສິນຄ້າໃນບິນ</p> : 
                  cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-700 pb-2">
                      <div>
                        <p>{item.name}</p>
                        <p className="text-slate-400">₭{item.price.toLocaleString()} x {item.qty}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button className="bg-red-500/20 text-red-400 px-2 rounded">-</button>
                        <span>{item.qty}</span>
                        <button className="bg-green-500/20 text-green-400 px-2 rounded">+</button>
                      </div>
                    </div>
                  ))
                }
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>ລວມເງິນ:</span>
                  <span className="text-emerald-400">₭{cart.reduce((s, i) => s + (i.price * i.qty), 0).toLocaleString()}</span>
                </div>
                
                <input 
                  type="number" 
                  value={payAmount || ''} 
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  placeholder="ຮັບເງິນມາ..." 
                  className="w-full bg-[#0d1b2a] p-3 rounded text-lg border border-slate-600 text-center" 
                />
                
                <div className="flex justify-between text-lg">
                  <span>ເງິນທອນ:</span>
                  <span className="text-rose-400">
                    ₭{payAmount - cart.reduce((s, i) => s + (i.price * i.qty), 0) > 0 ? (payAmount - cart.reduce((s, i) => s + (i.price * i.qty), 0)).toLocaleString() : '0'}
                  </span>
                </div>

                <p className="text-center text-xs text-slate-400">⌨️ ກົດ Spacebar = ຮັບເງິນພໍດີ | ກົດ Enter = ຊຳລະເງິນ</p>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-cyan-600 hover:bg-cyan-700 py-3 rounded-lg font-bold">ຊຳລະເງິນ (Enter)</button>
                  <button className="bg-slate-600 hover:bg-slate-500 px-4 py-3 rounded-lg font-bold">🖨️ ປີ້ນບິນ</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. ໜ້າ ADMIN */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-cyan-300">⚙️ ຈັດການລະບົບ (Admin)</h1>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Add Product Form */}
              <div className="bg-[#1b263b] p-4 rounded-xl border border-slate-700">
                <h2 className="font-bold mb-4 border-b border-slate-600 pb-2">📦 ເພີ່ມ/ແກ້ໄຂ ສິນຄ້າ</h2>
                <div className="space-y-3 text-sm">
                  <input type="text" placeholder="ID / ລະຫັດສິນຄ້າ" className="w-full bg-[#0d1b2a] p-2 rounded border border-slate-600" />
                  <input type="text" placeholder="ຊື່ສິນຄ້າ" className="w-full bg-[#0d1b2a] p-2 rounded border border-slate-600" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="ຕົ້ນທຶນ" className="bg-[#0d1b2a] p-2 rounded border border-slate-600" />
                    <input type="number" placeholder="ຈຳນວນ (Qty)" className="bg-[#0d1b2a] p-2 rounded border border-slate-600" />
                    <input type="number" placeholder="ລາຄາຍ່ອຍ" className="bg-[#0d1b2a] p-2 rounded border border-slate-600" />
                    <input type="number" placeholder="ລາຄາໂປຣ" className="bg-[#0d1b2a] p-2 rounded border border-slate-600" />
                    <input type="number" placeholder="ລາຄາຕົວແທນ" className="bg-[#0d1b2a] p-2 rounded border border-slate-600" />
                  </div>
                  <button className="w-full bg-emerald-600 py-2 rounded font-bold">ບັນທຶກສິນຄ້າ</button>
                </div>
              </div>

              {/* Add Customer & Settings */}
              <div className="space-y-6">
                <div className="bg-[#1b263b] p-4 rounded-xl border border-slate-700">
                  <h2 className="font-bold mb-4 border-b border-slate-600 pb-2">👥 ເພີ່ມສະມາຊິກລູກຄ້າ</h2>
                  <div className="space-y-3 text-sm">
                    <input type="text" placeholder="ຊື່ລູກຄ້າ" className="w-full bg-[#0d1b2a] p-2 rounded border border-slate-600" />
                    <input type="text" placeholder="ເບີໂທ" className="w-full bg-[#0d1b2a] p-2 rounded border border-slate-600" />
                    <input type="text" placeholder="ທີ່ຢູ່" className="w-full bg-[#0d1b2a] p-2 rounded border border-slate-600" />
                    <button className="w-full bg-blue-600 py-2 rounded font-bold">ບັນທຶກສະມາຊິກ</button>
                  </div>
                </div>

                <div className="bg-[#1b263b] p-4 rounded-xl border border-slate-700">
                  <h2 className="font-bold mb-4 border-b border-slate-600 pb-2">ຮ້ານ ແລະ ຄວາມປອດໄພ</h2>
                  <div className="space-y-3 text-sm">
                    <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="ປ່ຽນຊື່ຮ້ານ" className="w-full bg-[#0d1b2a] p-2 rounded border border-slate-600" />
                    <input type="password" placeholder="ປ່ຽນລະຫັດເຂົ້າ Admin" className="w-full bg-[#0d1b2a] p-2 rounded border border-slate-600" />
                    <div className="flex gap-2">
                      <button className="flex-1 bg-amber-600 py-2 rounded font-bold">ລະບົບຮັບສິນຄ້າ</button>
                      <button className="flex-1 bg-purple-600 py-2 rounded font-bold">ລະບົບໂອນສິນຄ້າ</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. ໜ້າ ລາຍງານ REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-cyan-300">📊 ລາຍງານຍອດຂາຍປະຈຳວັນ/ເດືອນ</h1>
              <div className="flex gap-2">
                <button className="bg-rose-600 px-4 py-2 rounded text-sm font-bold">📄 ໂຫຼດ PDF</button>
                <button className="bg-emerald-600 px-4 py-2 rounded text-sm font-bold">📊 ໂຫຼດ EXCEL/CSV</button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#1b263b] p-6 rounded-xl border-2 border-emerald-500/50">
                <p className="text-slate-400">ລາຍໄດ້ລວມ</p><p className="text-3xl font-bold text-emerald-400">₭8,500,000</p>
              </div>
              <div className="bg-[#1b263b] p-6 rounded-xl border-2 border-amber-500/50">
                <p className="text-slate-400">ຕົ້ນທຶນ</p><p className="text-3xl font-bold text-amber-400">₭5,200,000</p>
              </div>
              <div className="bg-[#1b263b] p-6 rounded-xl border-2 border-rose-500/50">
                <p className="text-slate-400">ກຳໄລ</p><p className="text-3xl font-bold text-rose-400">₭3,300,000</p>
              </div>
            </div>

            {/* Mockup Charts Area */}
            <div className="grid grid-cols-2 gap-4 h-64">
              <div className="bg-[#1b263b] rounded-xl border border-slate-700 flex items-center justify-center">
                <p className="text-slate-500">📈 ພື້ນທີ່ສະແດງ ກຣາຟແທ່ງທຽນ (Candlestick/Bar)</p>
              </div>
              <div className="bg-[#1b263b] rounded-xl border border-slate-700 flex items-center justify-center">
                <p className="text-slate-500">🍩 ພື້ນທີ່ສະແດງ ກຣາຟວົງກົມ (Donut Chart)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}