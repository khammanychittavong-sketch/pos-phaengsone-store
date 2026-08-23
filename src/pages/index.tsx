import React, { useState, useEffect, useRef } from 'react';

// === ຂໍ້ມູນເລີ່ມຕົ້ນ ===
const initialProducts = [
  { id: '1', code: 'P001', name: 'Alisa Detox Tea', qty: 50, price: 85000, cost: 50000 },
  { id: '2', code: 'P002', name: 'Alisa Green Tea', qty: 30, price: 85000, cost: 50000 },
  { id: '3', code: 'P003', name: 'ຄໍລາເຈນ VIP', qty: 15, price: 150000, cost: 100000 },
];

const initialCustomers = [
  { id: 'C01', name: 'ລູກຄ້າທົ່ວໄປ', phone: '-' },
  { id: 'C02', name: 'ນາງ ສົມສີ', phone: '020 5555 6666' },
  { id: 'C03', name: 'ທ້າວ ຄຳສຸກ', phone: '020 9999 8888' },
];

export default function POSSystem() {
  const [activeTab, setActiveTab] = useState('pos');
  const [shopName, setShopName] = useState('ຮ້ານ ແພງສອນ online');
  const [logoUrl, setLogoUrl] = useState('');

  // ໂລໂກ້ປ່ຽນສີຂອບທຸກ 10 ວິນາທີ
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

  // POS States
  const [products, setProducts] = useState(initialProducts);
  const [customers, setCustomers] = useState(initialCustomers);
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(initialCustomers[0]);
  const [cart, setCart] = useState<any[]>([]);
  const [payAmount, setPayAmount] = useState<any>('');

  // Admin Form States
  const [newProd, setNewProd] = useState({ id: '', code: '', name: '', qty: '', price: '', cost: '' });
  const [newCust, setNewCust] = useState({ name: '', phone: '' });

  // Filtered lists
  const filteredProducts = products.filter(p => 
    p.id.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.code.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  // ຈັດການກະຕ່າສິນຄ້າ
  const addToCart = (product: any) => {
    const exist = cart.find(item => item.id === product.id);
    if (exist) {
      setCart(cart.map(item => item.id === product.id ? {...item, qty: item.qty + 1} : item));
    } else {
      setCart([...cart, {...product, qty: 1}]);
    }
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? {...item, qty: newQty} : null;
      }
      return item;
    }).filter(Boolean));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const changeAmount = Number(payAmount) - totalAmount;

  // ບັນທຶກສິນຄ້າໃໝ່ (ຈາກໜ້າ Admin)
  const handleAddProduct = () => {
    if (!newProd.name || !newProd.price) {
      alert('⚠️ ກະລຸນາໃສ່ຊື່ສິນຄ້າ ແລະ ລາຄາໃຫ້ครบ!');
      return;
    }
    setProducts([...products, { ...newProd, id: String(products.length + 1), qty: Number(newProd.qty) || 0, price: Number(newProd.price), cost: Number(newProd.cost) || 0 }]);
    setNewProd({ id: '', code: '', name: '', qty: '', price: '', cost: '' });
    alert('✅ ເພີ່ມສິນຄ້າສຳເລັດ!');
  };

  // ບັນທຶກລູກຄ້າໃໝ່
  const handleAddCustomer = () => {
    if (!newCust.name) {
      alert('⚠️ ກະລຸນາໃສ່ຊື່ລູກຄ້າ!');
      return;
    }
    setCustomers([...customers, { id: `C0${customers.length + 1}`, ...newCust }]);
    setNewCust({ name: '', phone: '' });
    alert('✅ ເພີ່ມລູກຄ້າສຳເລັດ!');
  };

  return (
    <div className="flex h-screen bg-[#0d1b2a] text-white overflow-hidden" style={{ fontFamily: "'Phetsalart OT', sans-serif" }}>
      
      {/* ================= SIDEBAR ================= */}
      <div className="w-72 bg-[#1b263b] flex flex-col justify-between border-r border-slate-700 p-5 shadow-2xl z-10">
        <div>
          {/* Logo ຮ້ານ */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden transition-all duration-1000 shadow-lg bg-[#0d1b2a]"
              style={{ border: `4px solid ${borderColor}`, boxShadow: `0 0 20px ${borderColor}60` }}
            >
              {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-cyan-400 font-bold text-xl">LOGO</span>}
            </div>
            <h2 className="font-bold text-base text-center text-cyan-200 tracking-wide">{shopName}</h2>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${activeTab === 'dashboard' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800'}`}>📊 1. ໜ້າຫຼັກ Dashboard</button>
            <button onClick={() => setActiveTab('pos')} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${activeTab === 'pos' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800'}`}>🛒 2. ໜ້າຂາຍສິນຄ້າ POS</button>
            <button onClick={() => setActiveTab('admin')} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${activeTab === 'admin' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800'}`}>⚙️ 3. ຈັດການລະບົບ (Admin)</button>
            <button onClick={() => setActiveTab('reports')} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${activeTab === 'reports' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800'}`}>📈 4. ລາຍງານຍອດຂາຍ</button>
          </nav>
        </div>

        <div className="text-xs text-slate-500 text-center border-t border-slate-700/50 pt-3">
          POS System v2.2 • ຮ້ານ ແພງສອນ online
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* 1. DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-cyan-300 mb-2">ພາບລວມລະບົບ (Dashboard)</h1>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-[#1b263b] p-6 rounded-2xl border border-slate-700 shadow-xl">
                <p className="text-sm text-slate-400 font-medium">ສິນຄ້າໃນຄັງທັງໝົດ</p>
                <p className="text-3xl font-extrabold text-white mt-2">{products.length} ລາຍການ</p>
              </div>
              <div className="bg-[#1b263b] p-6 rounded-2xl border border-slate-700 shadow-xl">
                <p className="text-sm text-slate-400 font-medium">ລູກຄ້າທັງໝົດ</p>
                <p className="text-3xl font-extrabold text-amber-400 mt-2">{customers.length} ຄົນ</p>
              </div>
              <div className="bg-[#1b263b] p-6 rounded-2xl border border-slate-700 shadow-xl">
                <p className="text-sm text-slate-400 font-medium">ຍອດຂາຍລວມ</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-2">₭2,500,000</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. POS */}
        {activeTab === 'pos' && (
          <div className="flex gap-6 h-[calc(100vh-4rem)] max-w-7xl mx-auto">
            {/* ຝັ່ງຊ້າຍ: ຄົ້ນຫາສິນຄ້າ ແລະ ລາຍການສິນຄ້າ */}
            <div className="flex-[2] flex flex-col gap-4 overflow-hidden">
              <input 
                type="text" 
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="🔍 ຄົ້ນຫາສິນຄ້າ (ID, ລະຫັດ, ຊື່ສິນຄ້າ)..." 
                className="w-full bg-[#1b263b] p-4 rounded-xl border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 shadow-lg text-sm" 
              />
              <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4">
                {filteredProducts.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => addToCart(p)}
                    className="bg-[#1b263b] p-4 rounded-2xl border border-slate-700 hover:border-cyan-400 cursor-pointer transition shadow-lg flex flex-col justify-between h-32"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm">{p.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">ລະຫັດ: {p.code} | ຄົງเหลือ: {p.qty}</p>
                    </div>
                    <p className="text-cyan-400 font-extrabold text-base">₭{p.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ຝັ່ງຂວາ: ຄົ້ນຫາລູກຄ້າ ແລະ ບິນຂາຍ */}
            <div className="flex-[1.4] bg-[#1b263b] p-5 rounded-2xl border border-slate-700 flex flex-col shadow-2xl justify-between">
              <div>
                <h3 className="font-bold text-sm mb-1 text-cyan-300">👤 ຄົ້ນຫາ ແລະ ເລືອກລູກຄ້າ</h3>
                <input 
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="🔍 ພິມຊື່ ຫຼື ເเบີໂທລູກຄ້າ..."
                  className="w-full bg-[#0d1b2a] p-2.5 rounded-xl border border-slate-700 text-xs text-white mb-2"
                />
                <select 
                  value={selectedCustomer.id}
                  onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value))}
                  className="w-full bg-[#0d1b2a] p-2.5 rounded-xl border border-slate-700 text-sm text-white mb-4"
                >
                  {filteredCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>

                <h3 className="font-bold text-sm mb-2 text-cyan-300">🛒 ລາຍການສິນຄ້າໃນບິນ</h3>
                <div className="bg-[#0d1b2a] rounded-xl p-3 h-44 overflow-y-auto space-y-2 border border-slate-800">
                  {cart.length === 0 ? (
                    <p className="text-center text-slate-500 text-xs mt-14">ຍັງບໍ່ມີສິນຄ້າໃນກະຕ່າ</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-slate-400">₭{item.price.toLocaleString()} x {item.qty}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateCartQty(item.id, -1)} className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">-</button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateCartQty(item.id, 1)} className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold">+</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-700">
                <div className="flex justify-between text-base font-bold">
                  <span>ລວມເງິນທັງໝົດ:</span>
                  <span className="text-emerald-400">₭{totalAmount.toLocaleString()}</span>
                </div>
                <input 
                  type="number" 
                  value={payAmount} 
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="ຮັບເງິນມາ..." 
                  className="w-full bg-[#0d1b2a] p-2.5 rounded-xl text-center text-sm border border-slate-700 text-white font-bold" 
                />
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">ເງິນທອນ:</span>
                  <span className="text-rose-400 font-bold">₭{changeAmount >= 0 ? changeAmount.toLocaleString() : 0}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (cart.length === 0) { alert('⚠️ ກະລຸນາເລືອກສິນຄ້າກ่อน!'); return; }
                      if (Number(payAmount) < totalAmount) { alert('⚠️ ເງິນຮັບມານ້ອຍກว่ายอดรวม!'); return; }
                      alert('✅ ຊຳລະເງິນສຳເລັດ!');
                      setCart([]);
                      setPayAmount('');
                    }}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 rounded-xl font-bold transition text-xs shadow-lg"
                  >
                    ຊຳລະເງິນ (Enter)
                  </button>
                  <button 
                    onClick={() => {
                      if (cart.length === 0) { alert('⚠️ ບໍ່ມີຂໍ້ມູນໃນບິນສຳລັບພິມ!'); return; }
                      alert('🖨️ กำลังส่งพิมพ์ใบเสร็จ...');
                    }}
                    className="bg-slate-700 hover:bg-slate-600 px-4 py-2.5 rounded-xl font-bold text-xs"
                  >
                    ພິມບິນ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. ADMIN */}
        {activeTab === 'admin' && (
          <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <h1 className="text-2xl font-bold text-cyan-300">⚙️ ຈັດການລະບົບ (Admin)</h1>
            
            <div className="grid grid-cols-2 gap-6">
              {/* ຕັ້ງຄ່າຮ້ານ ແລະ ໂລໂກ້ */}
              <div className="bg-[#1b263b] p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">
                <h3 className="font-bold text-base text-amber-400 border-b border-slate-700 pb-2">🏢 ຕັ້ງຄ່າຮ້ານຄ້າ & ໂລໂກ້</h3>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">ປ່ຽນຊື່ຮ້ານ:</label>
                  <input 
                    type="text" 
                    value={shopName} 
                    onChange={(e) => setShopName(e.target.value)} 
                    className="w-full bg-[#0d1b2a] p-3 rounded-xl border border-slate-700 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">ປ່ຽນຮູບໂລໂກ້:</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setLogoUrl(URL.createObjectURL(e.target.files[0]));
                      }
                    }} 
                    className="w-full text-xs text-slate-400 bg-[#0d1b2a] p-2 rounded-xl border border-slate-700" 
                  />
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <h4 className="font-bold text-xs text-cyan-300 mb-2">👥 ເພີ່ມລູກຄ້າສະມາຊິກ</h4>
                  <div className="space-y-2 text-xs">
                    <input 
                      type="text" 
                      placeholder="ຊື່ລູກຄ້າ" 
                      value={newCust.name}
                      onChange={(e) => setNewCust({...newCust, name: e.target.value})}
                      className="w-full bg-[#0d1b2a] p-2.5 rounded-xl border border-slate-700" 
                    />
                    <input 
                      type="text" 
                      placeholder="ເບີໂທລະສັບ" 
                      value={newCust.phone}
                      onChange={(e) => setNewCust({...newCust, phone: e.target.value})}
                      className="w-full bg-[#0d1b2a] p-2.5 rounded-xl border border-slate-700" 
                    />
                    <button onClick={handleAddCustomer} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl font-bold">ບັນທຶກລູກຄ້າ</button>
                  </div>
                </div>
              </div>

              {/* ເພີ່ມສິນຄ້າ */}
              <div className="bg-[#1b263b] p-6 rounded-2xl border border-slate-700 shadow-xl space-y-3">
                <h3 className="font-bold text-base text-cyan-400 border-b border-slate-700 pb-2">📦 ເเพີ່ມສິນຄ້າໃໝ່</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <input 
                    type="text" 
                    placeholder="ລະຫັດສິນຄ້າ (Code)" 
                    value={newProd.code} 
                    onChange={(e) => setNewProd({...newProd, code: e.target.value})}
                    className="bg-[#0d1b2a] p-2.5 rounded-xl border border-slate-700" 
                  />
                  <input 
                    type="text" 
                    placeholder="ຊື່ສິນຄ້າ" 
                    value={newProd.name} 
                    onChange={(e) => setNewProd({...newProd, name: e.target.value})}
                    className="bg-[#0d1b2a] p-2.5 rounded-xl border border-slate-700" 
                  />
                  <input 
                    type="number" 
                    placeholder="ຈຳນວນ (Qty)" 
                    value={newProd.qty} 
                    onChange={(e) => setNewProd({...newProd, qty: e.target.value})}
                    className="bg-[#0d1b2a] p-2.5 rounded-xl border border-slate-700" 
                  />
                  <input 
                    type="number" 
                    placeholder="ລາຄາຂາຍ" 
                    value={newProd.price} 
                    onChange={(e) => setNewProd({...newProd, price: e.target.value})}
                    className="bg-[#0d1b2a] p-2.5 rounded-xl border border-slate-700" 
                  />
                  <input 
                    type="number" 
                    placeholder="ຕົ້ນທຶນ" 
                    value={newProd.cost} 
                    onChange={(e) => setNewProd({...newProd, cost: e.target.value})}
                    className="bg-[#0d1b2a] p-2.5 rounded-xl border border-slate-700 col-span-2" 
                  />
                </div>
                <button onClick={handleAddProduct} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs">ບັນທຶກສິນຄ້າ</button>
              </div>
            </div>
          </div>
        )}

        {/* 4. REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6 max-w-6xl mx-auto pb-10">
            <h1 className="text-2xl font-bold text-cyan-300">📈 ລາຍງານຍອດຂາຍ</h1>
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