import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Swal from 'sweetalert2';
import {
  LayoutDashboard, ShoppingCart, ShieldCheck, FileBarChart,
  Package, Printer, Search, Plus, Trash2, Clock, PackagePlus,
  UserCheck, Users, UserPlus, Phone, MapPin
} from 'lucide-react';

// --- TYPES ---
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;       // ລາຄາຂາຍຍ່ອຍ
  promoPrice: number;  // ລາຄາໂປຣ
  agentPrice: number;  // ລາຄາຕົວແທນ
  cost: number;
  stock: number;
}

interface Member {
  id: string;
  name: string;
  phone: string;
  address: string;
}

interface CartItem {
  product: Product;
  qty: number;
  selectedPriceType: 'retail' | 'promo' | 'agent';
  selectedPrice: number;
}

interface SaleRecord {
  id: string;
  date: string;
  timestamp: number;
  items: CartItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
  memberName?: string;
}

interface StockInLog {
  id: string;
  productId: string;
  productName: string;
  qtyAdded: number;
  costPrice: number;
  supplier: string;
  date: string;
}

export default function POSPhengSone() {
  const [activeTab, setActiveTab] = useState<'pos' | 'stockin' | 'members' | 'dashboard' | 'admin' | 'reports'>('pos');

  const [shopName] = useState('ຮ້ານ ແພງສອນ ຂາຍ Online');
  const [realTimeClock, setRealTimeClock] = useState('');
  const [laoDateStr, setLaoDateStr] = useState('');

  const [categories] = useState<string[]>(['ເສື້ອ', 'ໂສ້ງ', 'ເກີບ', 'ອຸປະກອນ']);
  const [selectedCategory, setSelectedCategory] = useState('ທັງໝົດ');

  const [products, setProducts] = useState<Product[]>([
    { id: 'P001', name: 'Alisa Detox ຊອງແດງ', category: 'ອຸປະກອນ', price: 65000, promoPrice: 60000, agentPrice: 55000, cost: 43000, stock: 15 },
    { id: 'P002', name: 'Alisa Green Tea ຊອງຂຽວ', category: 'ອຸປະກອນ', price: 65000, promoPrice: 60000, agentPrice: 55000, cost: 43000, stock: 20 },
  ]);

  const [members, setMembers] = useState<Member[]>([
    { id: 'M001', name: 'ສົມໄຊ ໃຈດີ', phone: '02055551111', address: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 'M002', name: 'ນາງ ນ້ອຍ ຕົວແທນ', phone: '02099998888', address: 'ຫຼວງພະບາງ' },
  ]);

  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [stockLogs, setStockLogs] = useState<StockInLog[]>([]);

  // POS State
  const [posSearch, setPosSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [receivedCash, setReceivedCash] = useState<number | ''>('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Form States (Stock)
  const [stkProductId, setStkProductId] = useState('');
  const [stkQty, setStkQty] = useState<number | ''>('');
  const [stkCost, setStkCost] = useState<number | ''>('');
  const [stkSupplier, setStkSupplier] = useState('');

  // Form States (Admin - Product)
  const [pId, setPId] = useState('');
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState(categories[0]);
  const [pPrice, setPPrice] = useState<number | ''>('');
  const [pPromoPrice, setPPromoPrice] = useState<number | ''>('');
  const [pAgentPrice, setPAgentPrice] = useState<number | ''>('');
  const [pCost, setPCost] = useState<number | ''>('');
  const [pStock, setPStock] = useState<number | ''>('');

  // Form States (Member Tab)
  const [mName, setMName] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mAddress, setMAddress] = useState('');

  useEffect(() => {
    const sProds = localStorage.getItem('pos_products');
    const sMems = localStorage.getItem('pos_members');
    const sSales = localStorage.getItem('pos_sales');
    const sStock = localStorage.getItem('pos_stock_logs');

    if (sProds) setProducts(JSON.parse(sProds));
    if (sMems) setMembers(JSON.parse(sMems));
    if (sSales) setSales(JSON.parse(sSales));
    if (sStock) setStockLogs(JSON.parse(sStock));
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setRealTimeClock(now.toLocaleTimeString('lo-LA'));
      const days = ['ວັນອາທິດ', 'ວັນຈັນ', 'ວັນອັງຄານ', 'ວັນພຸດ', 'ວັນພະຫັດ', 'ວັນສຸກ', 'ວັນເສົາ'];
      const months = ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'];
      setLaoDateStr(`${days[now.getDay()]} ທີ ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.selectedPrice * item.qty, 0);
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const changeAmount = typeof receivedCash === 'number' ? Math.max(0, receivedCash - finalTotal) : 0;

  const showSwal = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info') => {
    Swal.fire({
      title, text, icon,
      background: '#0f172a', color: '#f8fafc', confirmButtonColor: '#06b6d4',
      customClass: { popup: 'rounded-2xl border border-slate-700 shadow-2xl font-["Phetsarath"]' },
    });
  };

  const handleAddStockIn = () => {
    if (!stkProductId || !stkQty || Number(stkQty) <= 0) {
      showSwal('ເຕືອນ!', 'ກະລຸນາເລືອກສິນຄ້າ ແລະ ໃສ່ຈຳນວນຮັບເຂົ້າ', 'warning');
      return;
    }
    const targetProduct = products.find((p) => p.id === stkProductId);
    if (!targetProduct) return;

    const addedQty = Number(stkQty);
    const updatedCost = stkCost !== '' ? Number(stkCost) : targetProduct.cost;
    const updatedProducts = products.map((p) => p.id === stkProductId ? { ...p, stock: p.stock + addedQty, cost: updatedCost } : p);

    const newLog: StockInLog = {
      id: `STK-${Date.now().toString().slice(-6)}`, productId: targetProduct.id,
      productName: targetProduct.name, qtyAdded: addedQty, costPrice: updatedCost,
      supplier: stkSupplier || 'ບໍ່ໄດ້ລະບຸ', date: new Date().toLocaleString('lo-LA'),
    };

    const updatedLogs = [newLog, ...stockLogs];
    setProducts(updatedProducts); setStockLogs(updatedLogs);
    localStorage.setItem('pos_products', JSON.stringify(updatedProducts));
    localStorage.setItem('pos_stock_logs', JSON.stringify(updatedLogs));

    setStkProductId(''); setStkQty(''); setStkCost(''); setStkSupplier('');
    showSwal('ສຳເລັດ!', `ເພີ່ມສະຕ໋ອກສິນຄ້າສຳເລັດ`, 'success');
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      showSwal('ສິນຄ້າໝົດ!', 'ສິນຄ້ານີ້ໝົດສະຕ໋ອກແລ້ວ', 'warning');
      return;
    }
    const exist = cart.find((c) => c.product.id === product.id);
    if (exist) {
      if (exist.qty + 1 > product.stock) {
        showSwal('ສະຕ໋ອກບໍ່ພໍ!', 'ຈຳນວນເກີນສິນຄ້າທີ່ມີ', 'warning');
        return;
      }
      setCart(cart.map((c) => (c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { product, qty: 1, selectedPriceType: 'retail', selectedPrice: product.price }]);
    }
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(cart.map((item) => {
      if (item.product.id === id) {
        const newQty = item.qty + delta;
        if (newQty > item.product.stock) {
          showSwal('ສະຕ໋ອກບໍ່ພໍ!', 'ຈຳນວນເກີນສິນຄ້າທີ່ມີ', 'warning');
          return item;
        }
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const updateCartPriceType = (id: string, type: 'retail' | 'promo' | 'agent') => {
    setCart(cart.map((item) => {
      if (item.product.id === id) {
        let newPrice = item.product.price;
        if (type === 'promo') newPrice = item.product.promoPrice;
        if (type === 'agent') newPrice = item.product.agentPrice;
        return { ...item, selectedPriceType: type, selectedPrice: newPrice };
      }
      return item;
    }));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return showSwal('ກະຕ່າຫວ່າງ!', 'ເລືອກສິນຄ້າກ່ອນຊຳລະເງິນ', 'warning');
    if (typeof receivedCash !== 'number' || receivedCash < finalTotal) return showSwal('ເງິນບໍ່ພໍ!', 'ຈຳນວນເງິນທີ່ຮັບມາບໍ່ພໍ', 'error');

    let totalCostVal = 0;
    const updatedProducts = [...products];
    cart.forEach((c) => {
      const pIndex = updatedProducts.findIndex((p) => p.id === c.product.id);
      if (pIndex !== -1) {
        updatedProducts[pIndex].stock -= c.qty;
        totalCostVal += updatedProducts[pIndex].cost * c.qty;
      }
    });

    const newSale: SaleRecord = {
      id: `INV-${Date.now().toString().slice(-6)}`, date: new Date().toLocaleString('lo-LA'),
      timestamp: Date.now(), items: cart, subtotal, discount: discountAmount,
      totalAmount: finalTotal, totalCost: totalCostVal, totalProfit: finalTotal - totalCostVal,
      memberName: selectedMember?.name,
    };

    const newSalesList = [newSale, ...sales];
    setProducts(updatedProducts); setSales(newSalesList);
    localStorage.setItem('pos_products', JSON.stringify(updatedProducts));
    localStorage.setItem('pos_sales', JSON.stringify(newSalesList));

    window.print();
    setCart([]); setDiscountAmount(0); setReceivedCash(''); setSelectedMember(null);
    showSwal('ຊຳລະເງິນສຳເລັດ!', `ເງິນທອນ: ${changeAmount.toLocaleString()} ₭`, 'success');
  };

  const addProduct = () => {
    if (!pId || !pName || pPrice === '' || pCost === '' || pStock === '') return showSwal('ຂໍ້ມູນບໍ່ຄົບ', 'ກະລຸນາປ້ອນຂໍ້ມູນສິນຄ້າໃຫ້ຄົບຖ້ວນ', 'warning');
    const newP: Product = {
      id: pId, name: pName, category: pCategory, price: Number(pPrice),
      promoPrice: Number(pPromoPrice) || Number(pPrice), agentPrice: Number(pAgentPrice) || Number(pPrice),
      cost: Number(pCost), stock: Number(pStock)
    };
    const updated = [newP, ...products];
    setProducts(updated);
    localStorage.setItem('pos_products', JSON.stringify(updated));
    setPId(''); setPName(''); setPPrice(''); setPPromoPrice(''); setPAgentPrice(''); setPCost(''); setPStock('');
    showSwal('ສຳເລັດ', 'ເພີ່ມສິນຄ້າໃໝ່ແລ້ວ', 'success');
  };

  const addMember = () => {
    if (!mName || !mPhone) return showSwal('ຂໍ້ມູນບໍ່ຄົບ', 'ກະລຸນາປ້ອນຊື່ ແລະ ເບີໂທ', 'warning');
    const newM: Member = { id: `M${Date.now().toString().slice(-4)}`, name: mName, phone: mPhone, address: mAddress };
    const updated = [newM, ...members];
    setMembers(updated);
    localStorage.setItem('pos_members', JSON.stringify(updated));
    setMName(''); setMPhone(''); setMAddress('');
    showSwal('ສຳເລັດ', 'ເພີ່ມສະມາຊິກລູກຄ້າໃໝ່ແລ້ວ', 'success');
  };

  const deleteMember = (id: string) => {
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    localStorage.setItem('pos_members', JSON.stringify(updated));
    showSwal('ສຳເລັດ', 'ລຶບສະມາຊິກແລ້ວ', 'success');
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'ທັງໝົດ' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.id.toLowerCase().includes(posSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <Head>
        <title>{shopName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Phetsarath:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="flex h-screen bg-slate-950 text-slate-100 font-['Phetsarath',sans-serif] overflow-hidden">
        
        {/* SIDEBAR (No Logo) */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 z-20 shadow-2xl">
          <div>
            <div className="text-center py-4 mb-4 border-b border-slate-800">
              <h1 className="text-lg font-bold text-cyan-400 tracking-wide">{shopName}</h1>
              <span className="text-xs text-slate-400 block mt-1">{laoDateStr}</span>
            </div>

            <nav className="space-y-2">
              {[
                { id: 'pos', label: 'ໜ້າຂາຍ (POS)', icon: ShoppingCart },
                { id: 'members', label: 'ຈັດການສະມາຊິກ (Members)', icon: Users },
                { id: 'stockin', label: 'ຮັບສິນຄ້າ (Stock In)', icon: PackagePlus },
                { id: 'dashboard', label: 'ແດຊບອດ (Dashboard)', icon: LayoutDashboard },
                { id: 'admin', label: 'ຈັດການສິນຄ້າ (Admin)', icon: ShieldCheck },
                { id: 'reports', label: 'ລາຍງານ (Reports)', icon: FileBarChart },
              ].map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => setActiveTab(menu.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === menu.id ? 'bg-cyan-500 text-slate-950 shadow-lg font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <menu.icon className="w-5 h-5" /> <span>{menu.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center flex items-center justify-center gap-2 text-cyan-400 text-sm shadow-inner">
            <Clock className="w-4 h-4 animate-pulse" /> <span className="font-bold tracking-wider">{realTimeClock}</span>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          
          {/* TAB 1: POS SCREEN */}
          {activeTab === 'pos' && (
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col p-4 overflow-hidden border-r border-slate-800">
                <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="ຄົ້ນຫາສິນຄ້າ..." value={posSearch} onChange={(e) => setPosSearch(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none" />
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-3 mb-2 border-b border-slate-800">
                  {['ທັງໝົດ', ...categories].map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'}`}>
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pr-1">
                  {filteredProducts.map((p) => (
                    <div key={p.id} onClick={() => addToCart(p)} className="bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-xl p-3 flex flex-col cursor-pointer transition-all hover:scale-[1.02]">
                      <span className="text-[10px] text-slate-400 font-mono mb-1">{p.id}</span>
                      <h3 className="font-bold text-sm text-slate-200 line-clamp-2">{p.name}</h3>
                      <div className="mt-auto pt-3 flex justify-between items-end">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock <= 3 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>Stock: {p.stock}</span>
                        <span className="text-base font-bold text-cyan-400">{p.price.toLocaleString()} ₭</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Panel */}
              <div className="w-[380px] bg-slate-900 flex flex-col h-full">
                <div className="p-3 border-b border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold"><UserCheck className="w-4 h-4" /> ເລືອກລູກຄ້າ/ສະມາຊິກ</div>
                  <input type="text" placeholder="ຄົ້ນຫາຊື່ສະມາຊິກ..." value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-cyan-500" />
                  <select onChange={(e) => setSelectedMember(members.find((x) => x.id === e.target.value) || null)} value={selectedMember?.id || ''} className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg px-2 py-2 text-slate-200 outline-none">
                    <option value="">-- ລູກຄ້າທົ່ວໄປ --</option>
                    {members.filter(m => m.name.includes(memberSearch) || m.phone.includes(memberSearch)).map((m) => (<option key={m.id} value={m.id}>{m.name} ({m.phone})</option>))}
                  </select>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2"><ShoppingCart className="w-10 h-10 opacity-30" /><span>ກະຕ່າຫວ່າງ</span></div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                        <div className="flex justify-between">
                          <h4 className="text-xs font-bold text-slate-200">{item.product.name}</h4>
                          <span className="text-xs text-cyan-400 font-bold">{item.selectedPrice.toLocaleString()} ₭</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <select 
                            value={item.selectedPriceType} 
                            onChange={(e) => updateCartPriceType(item.product.id, e.target.value as any)}
                            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 outline-none"
                          >
                            <option value="retail">ຂາຍຍ່ອຍ ({item.product.price.toLocaleString()})</option>
                            <option value="promo">ໂປຣ ({item.product.promoPrice.toLocaleString()})</option>
                            <option value="agent">ຕົວແທນ ({item.product.agentPrice.toLocaleString()})</option>
                          </select>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateCartQty(item.product.id, -1)} className="w-6 h-6 rounded bg-slate-800 text-slate-300 text-xs font-bold">-</button>
                            <span className="text-xs font-bold w-4 text-center text-cyan-400">{item.qty}</span>
                            <button onClick={() => updateCartQty(item.product.id, 1)} className="w-6 h-6 rounded bg-slate-800 text-slate-300 text-xs font-bold">+</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
                  <div className="flex justify-between text-xs text-slate-400"><span>ລວມຍອດ:</span><span>{subtotal.toLocaleString()} ₭</span></div>
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>ສ່ວນຫຼຸດ:</span>
                    <input 
                      type="number" 
                      value={discountAmount || ''} 
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      className="w-24 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 outline-none focus:border-cyan-500 text-right"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-800 text-cyan-400">
                    <span>ຍອດລວມທັງໝົດ:</span>
                    <span className="text-lg">{finalTotal.toLocaleString()} ₭</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">ຮັບເງິນມາມູນຄ່າ:</span>
                      <input 
                        type="number" 
                        value={receivedCash} 
                        onChange={(e) => setReceivedCash(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-32 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1.5 outline-none focus:border-emerald-500 text-right font-bold"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>ເງິນທອນ:</span>
                      <span className="text-emerald-400 font-bold">{changeAmount.toLocaleString()} ₭</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-50 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-cyan-900/50 mt-2 flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> ຢືນຢັນການຊຳລະເງິນ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STOCK IN (ຮັບສິນຄ້າ) */}
          {activeTab === 'stockin' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2"><PackagePlus className="w-6 h-6"/> ຮັບສິນຄ້າເຂົ້າສາງ (Stock In)</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg h-fit space-y-4">
                  <h3 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2">ຟອມຮັບສິນຄ້າ</h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ເລືອກສິນຄ້າ *</label>
                    <select value={stkProductId} onChange={(e) => setStkProductId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500">
                      <option value="">-- ກະລຸນາເລືອກ --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} (ຍັງເຫຼືອ: {p.stock})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ຈຳນວນທີ່ຮັບເຂົ້າ *</label>
                    <input type="number" value={stkQty} onChange={(e) => setStkQty(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ຕົ້ນທຶນຕໍ່ໜ່ວຍ (ໃໝ່) (ເລືອກໃສ່ໄດ້)</label>
                    <input type="number" value={stkCost} onChange={(e) => setStkCost(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500" placeholder="ຖ້າປ່ຽນແປງຕົ້ນທຶນ..." />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ຜູ້ສະໜອງ / ຮ້ານສົ່ງ (ເລືອກໃສ່ໄດ້)</label>
                    <input type="text" value={stkSupplier} onChange={(e) => setStkSupplier(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500" placeholder="ຊື່ຮ້ານສົ່ງ..." />
                  </div>
                  <button onClick={handleAddStockIn} className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-50 py-2.5 rounded-xl font-bold text-sm transition-all mt-2">
                    ບັນທຶກຮັບເຂົ້າ
                  </button>
                </div>

                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                  <h3 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2 mb-4">ປະຫວັດການຮັບເຂົ້າ</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">ວັນທີ</th>
                          <th className="px-4 py-3">ລະຫັດບິນ</th>
                          <th className="px-4 py-3">ສິນຄ້າ</th>
                          <th className="px-4 py-3 text-center">ຈຳນວນ</th>
                          <th className="px-4 py-3">ຜູ້ສະໜອງ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockLogs.map((log) => (
                          <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                            <td className="px-4 py-3 text-slate-300">{log.date}</td>
                            <td className="px-4 py-3 text-cyan-400">{log.id}</td>
                            <td className="px-4 py-3">{log.productName}</td>
                            <td className="px-4 py-3 text-center font-bold text-emerald-400">+{log.qtyAdded}</td>
                            <td className="px-4 py-3 text-slate-400">{log.supplier}</td>
                          </tr>
                        ))}
                        {stockLogs.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-slate-500">ຍັງບໍ່ມີປະຫວັດການຮັບເຂົ້າ</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEMBERS (ສະມາຊິກ) */}
          {activeTab === 'members' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2"><Users className="w-6 h-6"/> ຈັດການຂໍ້ມູນສະມາຊິກ/ຕົວແທນ</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg h-fit space-y-4">
                  <h3 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2">ເພີ່ມສະມາຊິກໃໝ່</h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ຊື່ ແລະ ນາມສະກຸນ *</label>
                    <input type="text" value={mName} onChange={(e) => setMName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ເບີໂທຕິດຕໍ່ *</label>
                    <input type="text" value={mPhone} onChange={(e) => setMPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ທີ່ຢູ່</label>
                    <textarea value={mAddress} onChange={(e) => setMAddress(e.target.value)} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500" />
                  </div>
                  <button onClick={addMember} className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-50 py-2.5 rounded-xl font-bold text-sm transition-all mt-2 flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4"/> ບັນທຶກສະມາຊິກ
                  </button>
                </div>

                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                  <h3 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2 mb-4">ລາຍຊື່ສະມາຊິກທັງໝົດ</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {members.map(m => (
                      <div key={m.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-200">{m.name}</h4>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{m.id}</span>
                          </div>
                          <div className="text-xs text-slate-400 space-y-1">
                            <p className="flex items-center gap-2"><Phone className="w-3 h-3"/> {m.phone}</p>
                            <p className="flex items-center gap-2"><MapPin className="w-3 h-3"/> {m.address || '-'}</p>
                          </div>
                        </div>
                        <button onClick={() => deleteMember(m.id)} className="mt-4 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 w-fit">
                          <Trash2 className="w-3 h-3"/> ລຶບສະມາຊິກ
                        </button>
                      </div>
                    ))}
                    {members.length === 0 && <div className="col-span-2 text-center py-8 text-slate-500">ຍັງບໍ່ມີຂໍ້ມູນສະມາຊິກ</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN / PRODUCTS (ຈັດການສິນຄ້າ) */}
          {activeTab === 'admin' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2"><ShieldCheck className="w-6 h-6"/> ຈັດການຂໍ້ມູນສິນຄ້າ</h2>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg mb-6">
                 <h3 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2 mb-4">ເພີ່ມສິນຄ້າໃໝ່</h3>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">ລະຫັດສິນຄ້າ (SKU)</label>
                      <input type="text" value={pId} onChange={(e) => setPId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">ຊື່ສິນຄ້າ</label>
                      <input type="text" value={pName} onChange={(e) => setPName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">ໝວດໝູ່</label>
                      <select value={pCategory} onChange={(e) => setPCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">ຕົ້ນທຶນ</label>
                      <input type="number" value={pCost} onChange={(e) => setPCost(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">ລາຄາຂາຍຍ່ອຍ</label>
                      <input type="number" value={pPrice} onChange={(e) => setPPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">ລາຄາໂປຣໂມຊັ່ນ</label>
                      <input type="number" value={pPromoPrice} onChange={(e) => setPPromoPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">ລາຄາຕົວແທນ</label>
                      <input type="number" value={pAgentPrice} onChange={(e) => setPAgentPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">ຈຳນວນ Stock ເບື້ອງຕົ້ນ</label>
                      <input type="number" value={pStock} onChange={(e) => setPStock(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
                    </div>
                    <div className="md:col-span-3 flex items-end">
                       <button onClick={addProduct} className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-50 py-2 rounded-lg font-bold text-sm transition-all flex justify-center items-center gap-2"><Plus className="w-4 h-4"/> ບັນທຶກສິນຄ້າໃໝ່</button>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                <h3 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2 mb-4">ລາຍການສິນຄ້າທັງໝົດໃນລະບົບ</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">SKU</th>
                          <th className="px-4 py-3">ຊື່ສິນຄ້າ</th>
                          <th className="px-4 py-3">ໝວດໝູ່</th>
                          <th className="px-4 py-3 text-right">ຕົ້ນທຶນ</th>
                          <th className="px-4 py-3 text-right">ລາຄາຂາຍ</th>
                          <th className="px-4 py-3 text-center">Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                            <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.id}</td>
                            <td className="px-4 py-3 font-bold text-slate-200">{p.name}</td>
                            <td className="px-4 py-3 text-slate-400">{p.category}</td>
                            <td className="px-4 py-3 text-right text-red-400">{p.cost.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-cyan-400">{p.price.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center font-bold text-emerald-400">{p.stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              </div>
            </div>
          )}

          {/* TAB 5: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2"><LayoutDashboard className="w-6 h-6"/> ພາບລວມລະບົບ (Dashboard)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center"><ShoppingCart className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">ຍອດຂາຍທັງໝົດ</p>
                    <h4 className="text-xl font-bold text-slate-100">{sales.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString()} ₭</h4>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center"><FileBarChart className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">ກຳໄລທັງໝົດ</p>
                    <h4 className="text-xl font-bold text-slate-100">{sales.reduce((sum, s) => sum + s.totalProfit, 0).toLocaleString()} ₭</h4>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center"><Package className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">ສິນຄ້າໃນສາງ (ລວມ)</p>
                    <h4 className="text-xl font-bold text-slate-100">{products.reduce((sum, p) => sum + p.stock, 0)} ລາຍການ</h4>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === 'reports' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2"><FileBarChart className="w-6 h-6"/> ລາຍງານການຂາຍ (Sales Report)</h2>
              
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">ວັນທີຊື້-ຂາຍ</th>
                          <th className="px-4 py-3">ເລກທີບິນ (INV)</th>
                          <th className="px-4 py-3">ລູກຄ້າ</th>
                          <th className="px-4 py-3 text-right">ຍອດລວມ</th>
                          <th className="px-4 py-3 text-right">ສ່ວນຫຼຸດ</th>
                          <th className="px-4 py-3 text-right">ຍອດຮັບຈິງ</th>
                          <th className="px-4 py-3 text-right">ກຳໄລ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map((s) => (
                          <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                            <td className="px-4 py-3 text-slate-400 text-xs">{s.date}</td>
                            <td className="px-4 py-3 font-mono text-cyan-400">{s.id}</td>
                            <td className="px-4 py-3">{s.memberName || 'ລູກຄ້າທົ່ວໄປ'}</td>
                            <td className="px-4 py-3 text-right text-slate-300">{s.subtotal.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-red-400">{s.discount.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-400">{s.totalAmount.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-amber-400">{s.totalProfit.toLocaleString()}</td>
                          </tr>
                        ))}
                        {sales.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-slate-500">ຍັງບໍ່ມີປະຫວັດການຂາຍ</td></tr>}
                      </tbody>
                    </table>
                  </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}