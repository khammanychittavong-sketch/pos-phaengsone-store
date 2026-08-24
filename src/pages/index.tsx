import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Swal from 'sweetalert2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  LayoutDashboard,
  ShoppingCart,
  ShieldCheck,
  Settings,
  FileBarChart,
  Package,
  Users,
  Printer,
  Search,
  Plus,
  Trash2,
  Edit,
  Save,
  Clock,
  PackagePlus,
  UserCheck,
  TrendingUp,
  ArrowDownCircle,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- TYPES ---
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
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
  const [activeTab, setActiveTab] = useState<'pos' | 'dashboard' | 'stockin' | 'admin' | 'reports' | 'settings'>('pos');

  // Shop Info & Customization
  const [shopName, setShopName] = useState('ຮ້ານ ແພງສອນ ຂາຍ Online');
  const [logoUrl, setLogoUrl] = useState('https://via.placeholder.com/200/06b6d4/ffffff?text=Logo');
  const [adminPassword, setAdminPassword] = useState('11222');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  // Real-time Lao Clock
  const [realTimeClock, setRealTimeClock] = useState('');
  const [laoDateStr, setLaoDateStr] = useState('');

  // Dynamic Categories
  const [categories, setCategories] = useState<string[]>(['ເສື້ອ', 'ໂສ້ງ', 'ເກີບ', 'ອຸປະກອນ']);
  const [selectedCategory, setSelectedCategory] = useState('ທັງໝົດ');
  const [newCatInput, setNewCatInput] = useState('');

  // Data Stores
  const [products, setProducts] = useState<Product[]>([
    { id: 'P001', name: 'Alisa Detox ສູ່ອງແດງ', category: 'ອຸປະກອນ', price: 64500, cost: 43000, stock: 15 },
    { id: 'P002', name: 'Alisa Green Tea ສູ່ອງຂຽວ', category: 'ອຸປະກອນ', price: 64500, cost: 43000, stock: 20 },
  ]);

  const [members, setMembers] = useState<Member[]>([
    { id: 'M001', name: 'ສົມໄຊ ໃຈດີ', phone: '02055551111', address: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 'M002', name: 'ນາງ ນ້ອຍ ມະນີ', phone: '02099887766', address: 'ຫຼວງພະບາງ' },
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

  // Stock In Form State
  const [stkProductId, setStkProductId] = useState('');
  const [stkQty, setStkQty] = useState<number | ''>('');
  const [stkCost, setStkCost] = useState<number | ''>('');
  const [stkSupplier, setStkSupplier] = useState('');

  // Admin Form States
  const [pId, setPId] = useState('');
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('');
  const [pPrice, setPPrice] = useState<number | ''>('');
  const [pCost, setPCost] = useState<number | ''>('');
  const [pStock, setPStock] = useState<number | ''>('');
  const [editProductMode, setEditProductMode] = useState(false);

  const [mId, setMId] = useState('');
  const [mName, setMName] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mAddress, setMAddress] = useState('');
  const [editMemberMode, setEditMemberMode] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);

  // Load Initial Storage
  useEffect(() => {
    const sName = localStorage.getItem('pos_shop_name');
    const sLogo = localStorage.getItem('pos_logo');
    const sPass = localStorage.getItem('pos_admin_pw');
    const sCats = localStorage.getItem('pos_categories');
    const sProds = localStorage.getItem('pos_products');
    const sMems = localStorage.getItem('pos_members');
    const sSales = localStorage.getItem('pos_sales');
    const sStock = localStorage.getItem('pos_stock_logs');

    if (sName) setShopName(sName);
    if (sLogo) setLogoUrl(sLogo);
    if (sPass) setAdminPassword(sPass);
    if (sCats) setCategories(JSON.parse(sCats));
    if (sProds) setProducts(JSON.parse(sProds));
    if (sMems) setMembers(JSON.parse(sMems));
    if (sSales) setSales(JSON.parse(sSales));
    if (sStock) setStockLogs(JSON.parse(sStock));
  }, []);

  // Real-time Clock Handler ( Liveliness )
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setRealTimeClock(now.toLocaleTimeString('lo-LA'));

      const days = ['ວັນອາທິດ', 'ວັນຈັນ', 'ວັນອັງຄານ', 'ວັນພຸດ', 'ວັນພະຫັດ', 'ວັນສຸກ', 'ວັນເສົາ'];
      const months = ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'];

      setLaoDateStr(`${days[now.getDay()]}ທີ ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculation for Checkout
  const subtotal = cart.reduce((sum, item) => sum + item.selectedPrice * item.qty, 0);
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const changeAmount = typeof receivedCash === 'number' ? Math.max(0, receivedCash - finalTotal) : 0;

  // Spacebar Keybind for Exact Cash
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab === 'pos' && e.code === 'Space') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          if (cart.length > 0) {
            setReceivedCash(finalTotal);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, finalTotal, cart]);

  const showSwal = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info') => {
    Swal.fire({
      title,
      text,
      icon,
      background: '#0f172a',
      color: '#f8fafc',
      confirmButtonColor: '#06b6d4',
      customClass: { popup: 'rounded-2xl border border-slate-700 shadow-2xl' },
    });
  };

  // Logo Upload Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result as string;
        setLogoUrl(b64);
        localStorage.setItem('pos_logo', b64);
        showSwal('ສຳເລັດ!', 'ບັນທຶກໂລໂກ້ຮູບວົງມົນຮຽບຮ້ອຍແລ້ວ', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Stock In Action (ລະບົບຮັບສິນຄ້າເຂົ້າ)
  const handleAddStockIn = () => {
    if (!stkProductId || !stkQty || Number(stkQty) <= 0) {
      showSwal('ເຕືອນ!', 'ກະລຸນາເລືອກສິນຄ້າ ແລະ ໃສ່ຈຳນວນຮັບເຂົ້າ', 'warning');
      return;
    }
    const targetProduct = products.find((p) => p.id === stkProductId);
    if (!targetProduct) return;

    const addedQty = Number(stkQty);
    const updatedCost = stkCost !== '' ? Number(stkCost) : targetProduct.cost;

    // Update product stock & cost
    const updatedProducts = products.map((p) =>
      p.id === stkProductId
        ? { ...p, stock: p.stock + addedQty, cost: updatedCost }
        : p
    );

    // Create log
    const newLog: StockInLog = {
      id: `STK-${Date.now().toString().slice(-6)}`,
      productId: targetProduct.id,
      productName: targetProduct.name,
      qtyAdded: addedQty,
      costPrice: updatedCost,
      supplier: stkSupplier || 'ບໍ່ໄດ້ລະບຸ',
      date: new Date().toLocaleString('lo-LA'),
    };

    const updatedLogs = [newLog, ...stockLogs];

    setProducts(updatedProducts);
    setStockLogs(updatedLogs);

    localStorage.setItem('pos_products', JSON.stringify(updatedProducts));
    localStorage.setItem('pos_stock_logs', JSON.stringify(updatedLogs));

    setStkProductId('');
    setStkQty('');
    setStkCost('');
    setStkSupplier('');
    showSwal('ສຳເລັດ!', `ເພີ່ມສະຕ໋ອກສິນຄ້າ ${targetProduct.name} (+${addedQty}) ເຂົ້າລະບົບແລ້ວ`, 'success');
  };

  // Add to Cart
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
      setCart([...cart, { product, qty: 1, selectedPrice: product.price }]);
    }
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.product.id === id) {
            const newQty = item.qty + delta;
            if (newQty > item.product.stock) {
              showSwal('ສະຕ໋ອກບໍ່ພໍ!', 'ຈຳນວນເກີນສິນຄ້າທີ່ມີ', 'warning');
              return item;
            }
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      showSwal('ກະຕ່າຫວ່າງ!', 'ເລືອກສິນຄ້າກ່ອນຊຳລະເງິນ', 'warning');
      return;
    }
    if (typeof receivedCash !== 'number' || receivedCash < finalTotal) {
      showSwal('ເງິນບໍ່ພໍ!', 'ຈຳນວນເງິນທີ່ຮັບມາບໍ່ພໍ', 'error');
      return;
    }

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
      id: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString('lo-LA'),
      timestamp: Date.now(),
      items: cart,
      subtotal,
      discount: discountAmount,
      totalAmount: finalTotal,
      totalCost: totalCostVal,
      totalProfit: finalTotal - totalCostVal,
      memberName: selectedMember?.name,
    };

    const newSalesList = [newSale, ...sales];
    setProducts(updatedProducts);
    setSales(newSalesList);

    localStorage.setItem('pos_products', JSON.stringify(updatedProducts));
    localStorage.setItem('pos_sales', JSON.stringify(newSalesList));

    window.print();
    setCart([]);
    setDiscountAmount(0);
    setReceivedCash('');
    setSelectedMember(null);
    showSwal('ຊຳລະເງິນສຳເລັດ!', `ເງິນທອນ: ${changeAmount.toLocaleString()} ₭`, 'success');
  };

  // Filters
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'ທັງໝົດ' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.id.toLowerCase().includes(posSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.phone.includes(memberSearch)
  );

  return (
    <>
      <Head>
        <title>{shopName} - POS System</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="flex h-screen bg-slate-950 text-slate-100 font-['Noto_Sans_Lao','Phetsarath_OT',sans-serif] overflow-hidden">
        {/* SIDEBAR WITH MODERN GRADIENT & CIRCULAR 3x3 LOGO */}
        <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/80 flex flex-col justify-between p-4 z-20 shadow-2xl">
          <div>
            {/* 3x3 Big Circular Logo */}
            <div className="flex flex-col items-center mb-6 pt-2">
              <div
                onClick={() => logoInputRef.current?.click()}
                className="relative cursor-pointer w-28 h-28 rounded-full border-4 border-cyan-500/40 p-1 hover:border-cyan-400 transition-all shadow-xl shadow-cyan-500/20 group bg-slate-950 flex items-center justify-center overflow-hidden"
              >
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-full" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity text-[11px] font-bold text-cyan-300 text-center px-2">
                  ປ່ຽນໂລໂກ້ 3x3 ວົງມົນ
                </div>
              </div>
              <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              <h1 className="mt-3 text-base font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent text-center line-clamp-1">
                {shopName}
              </h1>
              <span className="text-[11px] text-slate-400 mt-1 text-center font-medium">{laoDateStr}</span>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1.5">
              {[
                { id: 'pos', label: 'ໜ້າຂາຍ (POS)', icon: ShoppingCart },
                { id: 'stockin', label: 'ຮັບສິນຄ້າເຂົ້າ (Stock In)', icon: PackagePlus },
                { id: 'dashboard', label: 'ແດຊບອດ (Dashboard)', icon: LayoutDashboard },
                { id: 'admin', label: 'ຈັດການລະບົບ (Admin)', icon: ShieldCheck },
                { id: 'reports', label: 'ລາຍງານ (Reports)', icon: FileBarChart },
                { id: 'settings', label: 'ຕັ້ງຄ່າ (Settings)', icon: Settings },
              ].map((menu) => {
                const Icon = menu.icon;
                const active = activeTab === menu.id;
                return (
                  <button
                    key={menu.id}
                    onClick={() => setActiveTab(menu.id as any)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{menu.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Real-time Ticking Clock */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-center flex items-center justify-center gap-2 text-cyan-400 font-mono text-xs shadow-inner">
            <Clock className="w-4 h-4 animate-pulse text-cyan-400" />
            <span className="font-bold tracking-wider">{realTimeClock}</span>
          </div>
        </aside>

        {/* MAIN DISPLAY AREA */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* TAB 1: POS SCREEN */}
          {activeTab === 'pos' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Product Grid Area */}
              <div className="flex-1 flex flex-col p-4 overflow-hidden border-r border-slate-800">
                <div className="flex flex-col gap-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ ຫຼື ລະຫັດ Barcode..."
                      value={posSearch}
                      onChange={(e) => setPosSearch(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
                    />
                  </div>

                  {/* Category Buttons */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {['ທັງໝົດ', ...categories].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                          selectedCategory === cat
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products List */}
                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pr-1">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-lg group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] text-slate-500 font-mono font-bold">{p.id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.stock <= 3 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                            ສະຕ໋ອກ: {p.stock}
                          </span>
                        </div>
                        <h3 className="font-semibold text-xs text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-2">
                          {p.name}
                        </h3>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-end">
                        <span className="text-[10px] text-slate-400">{p.category}</span>
                        <span className="text-sm font-extrabold text-cyan-400">
                          {p.price.toLocaleString()} ₭
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Panel & Customer Search */}
              <div className="w-[390px] bg-slate-900/90 flex flex-col h-full border-l border-slate-800">
                {/* Customer Search Section (ເພີ່ມຊ່ອງຄົ້ນຫາລູກຄ້າ) */}
                <div className="p-3 border-b border-slate-800 bg-slate-950/60 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                    <UserCheck className="w-4 h-4" />
                    <span>ຄົ້ນຫາ & ເລືອກລູກຄ້າ</span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ພິມຊື່ ຫຼື ເບີໂທລູກຄ້າ..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-[11px] text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <select
                    onChange={(e) => {
                      const m = members.find((x) => x.id === e.target.value);
                      setSelectedMember(m || null);
                    }}
                    value={selectedMember?.id || ''}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none font-medium"
                  >
                    <option value="">-- ລູກຄ້າທົ່ວໄປ (General Customer) --</option>
                    {filteredMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                      <ShoppingCart className="w-10 h-10 opacity-30" />
                      <span>ກະຕ່າຫວ່າງ (ກົດ Spacebar ເພື່ອຮັບເງິນພໍດີ)</span>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between shadow-sm">
                        <div className="flex-1 pr-2">
                          <h4 className="text-xs font-semibold text-slate-200 truncate">{item.product.name}</h4>
                          <span className="text-[11px] text-cyan-400 font-bold">{item.selectedPrice.toLocaleString()} ₭</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="text-xs font-extrabold w-6 text-center text-cyan-400">{item.qty}</span>
                          <button
                            onClick={() => updateCartQty(item.product.id, 1)}
                            className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Summary & Spacebar Quick Cash */}
                <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>ລວມຍອດສິນຄ້າ:</span>
                      <span>{subtotal.toLocaleString()} ₭</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>ສ່ວນຫຼຸດ (₭):</span>
                      <input
                        type="number"
                        value={discountAmount || ''}
                        onChange={(e) => setDiscountAmount(Number(e.target.value))}
                        placeholder="0"
                        className="w-24 bg-slate-900 border border-slate-800 text-right px-2 py-0.5 rounded text-xs text-amber-400"
                      />
                    </div>
                    <div className="flex justify-between font-bold text-sm text-slate-100 pt-1 border-t border-slate-800">
                      <span>ຍອດຕ້ອງຊຳລະ:</span>
                      <span className="text-cyan-400 text-base font-extrabold">{finalTotal.toLocaleString()} ₭</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] text-slate-400 font-medium">ຮັບເງິນມາ (₭):</label>
                      <span className="text-[10px] text-cyan-400/90 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        [Spacebar] = ຮັບເງິນພໍດີ
                      </span>
                    </div>
                    <input
                      type="number"
                      value={receivedCash}
                      onChange={(e) => setReceivedCash(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl px-3 py-2 text-right font-extrabold text-cyan-400 text-base focus:outline-none focus:border-cyan-400 shadow-inner"
                    />
                  </div>

                  <div className="flex justify-between text-xs font-bold text-emerald-400 pt-1">
                    <span>ເງິນທອນ:</span>
                    <span>{changeAmount.toLocaleString()} ₭</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>ຊຳລະເງິນ & ພິມໃບບິນ</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STOCK IN (ລະບົບຈັດການຮັບສິນຄ້າເຂົ້າ) */}
          {activeTab === 'stockin' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <PackagePlus className="w-6 h-6 text-cyan-400" />
                <h2 className="text-base font-bold text-slate-100">ລະບົບຈັດການຮັບສິນຄ້າເຂົ້າສະຕ໋ອກ (Stock In System)</h2>
              </div>

              {/* Form Add Stock In */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">ບັນທຶກການຮັບສິນຄ້າໃໝ່</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">ເລືອກສິນຄ້າ:</label>
                    <select
                      value={stkProductId}
                      onChange={(e) => {
                        setStkProductId(e.target.value);
                        const p = products.find((x) => x.id === e.target.value);
                        if (p) setStkCost(p.cost);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- ເລືອກສິນຄ້າ --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.id} - {p.name} (ສະຕ໋ອກປັດຈຸບັນ: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">ຈຳນວນຮັບເຂົ້າ (+):</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={stkQty}
                      onChange={(e) => setStkQty(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">ຕົ້ນທຶນໃໝ່ (₭ / ຊິ້ນ):</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={stkCost}
                      onChange={(e) => setStkCost(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">ຜູ້ສະໜອງ / ໝາຍເຫດ:</label>
                    <input
                      type="text"
                      placeholder="ຊື່ຮ້ານ / ໂຮງງານ..."
                      value={stkSupplier}
                      onChange={(e) => setStkSupplier(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddStockIn}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>ບັນທຶກຮັບສິນຄ້າເຂົ້າ</span>
                </button>
              </div>

              {/* Log History */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                  <span>ປະວັດການຮັບສິນຄ້າເຂົ້າສະຕ໋ອກ</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">ID ຮັບເຂົ້າ</th>
                        <th className="p-2.5">ວັນທີ-ເວລາ</th>
                        <th className="p-2.5">ຊື່ສິນຄ້າ</th>
                        <th className="p-2.5 text-center">ຈຳນວນຮັບ</th>
                        <th className="p-2.5">ຕົ້ນທຶນ/ຊິ້ນ</th>
                        <th className="p-2.5">ຜູ້ສະໜອງ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {stockLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-slate-500 py-6">
                            ຍັງບໍ່ມີປະວັດການຮັບສິນຄ້າເຂົ້າ
                          </td>
                        </tr>
                      ) : (
                        stockLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-850">
                            <td className="p-2.5 font-mono text-cyan-400">{log.id}</td>
                            <td className="p-2.5 text-slate-400">{log.date}</td>
                            <td className="p-2.5 font-medium text-slate-200">{log.productName}</td>
                            <td className="p-2.5 text-center font-bold text-emerald-400">+{log.qtyAdded}</td>
                            <td className="p-2.5">{log.costPrice.toLocaleString()} ₭</td>
                            <td className="p-2.5 text-slate-400">{log.supplier}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span>ພາບລວມຍອດຂາຍ (Dashboard Real-time)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-slate-800 p-4 rounded-2xl shadow-lg">
                  <span className="text-xs text-slate-400">ຍອດຂາຍລວມ</span>
                  <p className="text-2xl font-extrabold text-cyan-400 mt-1">
                    {sales.reduce((acc, s) => acc + s.totalAmount, 0).toLocaleString()} ₭
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-slate-800 p-4 rounded-2xl shadow-lg">
                  <span className="text-xs text-slate-400">ກຳໄລລວມ</span>
                  <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                    {sales.reduce((acc, s) => acc + s.totalProfit, 0).toLocaleString()} ₭
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-900 to-amber-950/40 border border-slate-800 p-4 rounded-2xl shadow-lg">
                  <span className="text-xs text-slate-400">ອໍເດີທັງໝົດ</span>
                  <p className="text-2xl font-extrabold text-amber-400 mt-1">{sales.length} ບິນ</p>
                </div>
                <div className="bg-gradient-to-br from-slate-900 to-purple-950/40 border border-slate-800 p-4 rounded-2xl shadow-lg">
                  <span className="text-xs text-slate-400">ສິນຄ້າຄົງຄັງ</span>
                  <p className="text-2xl font-extrabold text-purple-400 mt-1">
                    {products.reduce((acc, p) => acc + p.stock, 0)} ຊິ້ນ
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN */}
          {activeTab === 'admin' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <h2 className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>ຈັດການສິນຄ້າ (Products Management)</span>
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  <input placeholder="ID ສິນຄ້າ (ພິມເອງ)" value={pId} onChange={(e) => setPId(e.target.value)} disabled={editProductMode} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100" />
                  <input placeholder="ຊື່ສິນຄ້າ" value={pName} onChange={(e) => setPName(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 col-span-2" />
                  <select value={pCategory} onChange={(e) => setPCategory(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100">
                    {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                  <input type="number" placeholder="ລາຄາຂາຍ (₭)" value={pPrice} onChange={(e) => setPPrice(e.target.value === '' ? '' : Number(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100" />
                  <input type="number" placeholder="ຕົ້ນທຶນ (₭)" value={pCost} onChange={(e) => setPCost(e.target.value === '' ? '' : Number(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REPORTS */}
          {activeTab === 'reports' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileBarChart className="w-5 h-5 text-cyan-400" />
                <span>ລາຍງານປະວັດການຂາຍ (Sales Reports)</span>
              </h2>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">ID ໃບບິນ</th>
                      <th className="p-2.5">ວັນທີ-ເວລາ</th>
                      <th className="p-2.5">ລູກຄ້າ</th>
                      <th className="p-2.5">ຍອດຊຳລະ</th>
                      <th className="p-2.5">ກຳໄລ Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {sales.map((s) => (
                      <tr key={s.id}>
                        <td className="p-2.5 font-mono text-cyan-400">{s.id}</td>
                        <td className="p-2.5 text-slate-400">{s.date}</td>
                        <td className="p-2.5">{s.memberName || 'ລູກຄ້າທົ່ວໄປ'}</td>
                        <td className="p-2.5 font-bold text-cyan-400">{s.totalAmount.toLocaleString()} ₭</td>
                        <td className="p-2.5 font-bold text-emerald-400">{s.totalProfit.toLocaleString()} ₭</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                <span>ຕັ້ງຄ່າລະບົບ (System Settings)</span>
              </h2>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <label className="text-xs text-slate-400 block">ຊື່ຮ້ານ:</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => {
                    setShopName(e.target.value);
                    localStorage.setItem('pos_shop_name', e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}