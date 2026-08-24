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
import { Bar } from 'react-chartjs-2';
import {
  LayoutDashboard,
  ShoppingCart,
  ShieldCheck,
  Settings,
  FileBarChart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Trash2,
  Edit,
  Printer,
  Download,
  Search,
  Tag,
  Percent,
  RefreshCw,
  CheckCircle,
  X,
  CreditCard,
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
  promoPrice: number;
  wholesalePrice: number;
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
  memberId?: string;
  memberName?: string;
}

export default function POSPhengSone() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'admin' | 'settings' | 'reports'>('pos');
  
  // Customization & Shop Info
  const [shopName, setShopName] = useState('ຮ້ານ ແພງສອນ ຂາຍ Online');
  const [logoUrl, setLogoUrl] = useState('https://via.placeholder.com/150/06b6d4/ffffff?text=PhengSone');
  const [adminPassword, setAdminPassword] = useState('11222');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  // Time & Date State
  const [timeStr, setTimeStr] = useState('');
  const [laoDateStr, setLaoDateStr] = useState('');

  // Categories
  const categories = ['ທັງໝົດ', 'ເສື້ອ', 'ໂສ້ງ', 'ເກີບ', 'ອຸປະກອນ'];
  const [selectedCategory, setSelectedCategory] = useState('ທັງໝົດ');

  // Data Stores
  const [products, setProducts] = useState<Product[]>([
    { id: 'P001', name: 'ເສື້ອຢືດ A1 (ຂາວ)', category: 'ເສື້ອ', price: 85000, promoPrice: 75000, wholesalePrice: 65000, cost: 50000, stock: 45 },
    { id: 'P002', name: 'ໂສ້ງຢີນ B2 (ດຳ)', category: 'ໂສ້ງ', price: 180000, promoPrice: 160000, wholesalePrice: 140000, cost: 110000, stock: 20 },
    { id: 'P003', name: 'ເກີບຜ້າໃບ C3 (Sneaker)', category: 'ເກີບ', price: 250000, promoPrice: 230000, wholesalePrice: 200000, cost: 150000, stock: 8 },
  ]);

  const [members, setMembers] = useState<Member[]>([
    { id: 'M001', name: 'ສົມໄຊ ໃຈດີ', phone: '02055551111', address: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 'M002', name: 'ນາງ ນ້ອຍ', phone: '02099998888', address: 'ຫຼວງພະບາງ' },
  ]);

  const [sales, setSales] = useState<SaleRecord[]>([]);

  // Form States (Admin Product)
  const [pId, setPId] = useState('');
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('ເສື້ອ');
  const [pPrice, setPPrice] = useState<number | ''>('');
  const [pPromo, setPPromo] = useState<number | ''>('');
  const [pWholesale, setPWholesale] = useState<number | ''>('');
  const [pCost, setPCost] = useState<number | ''>('');
  const [pStock, setPStock] = useState<number | ''>('');
  const [editProductMode, setEditProductMode] = useState(false);

  // Form States (Admin Member)
  const [mId, setMId] = useState('');
  const [mName, setMName] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mAddress, setMAddress] = useState('');
  const [editMemberMode, setEditMemberMode] = useState(false);

  // POS State
  const [posProductSearch, setPosProductSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [receivedCash, setReceivedCash] = useState<number | ''>('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clock
  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString('lo-LA'));
      setLaoDateStr(d.toLocaleDateString('lo-LA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // --- ADMIN AUTH ---
  const handleAdminTabAccess = () => {
    if (isAdminUnlocked) {
      setActiveTab('admin');
      return;
    }
    Swal.fire({
      title: '🔐 ປົດລັອກລະບົບ Admin',
      text: 'ກະລຸນາ ໃສ່ລະຫັດຜ່ານ:',
      input: 'password',
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#06b6d4',
      showCancelButton: true,
      cancelButtonText: 'ຍົກເລີກ',
    }).then((res) => {
      if (res.isConfirmed && res.value === adminPassword) {
        setIsAdminUnlocked(true);
        setActiveTab('admin');
      } else if (res.isConfirmed) {
        showSwal('ຜິດພາດ!', 'ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ!', 'error');
      }
    });
  };

  // --- MEMBER ACTIONS (WITH DELETE) ---
  const handleSaveMember = () => {
    if (!mId || !mName || !mPhone) {
      showSwal('ເຕືອນ!', 'ກະລຸນາປ້ອນຂໍ້ມູນສະມາຊິກໃຫ້ຄົບ', 'warning');
      return;
    }
    const newM: Member = { id: mId, name: mName, phone: mPhone, address: mAddress };
    if (editMemberMode) {
      setMembers(members.map((m) => (m.id === mId ? newM : m)));
      showSwal('ສຳເລັດ!', 'ອັບເດດຂໍ້ມູນສະມາຊິກແລ້ວ', 'success');
    } else {
      if (members.some((m) => m.id === mId)) {
        showSwal('ID ຊໍ້າ!', 'ລະຫັດສະມາຊິກນີ້ມີແລ້ວ', 'error');
        return;
      }
      setMembers([...members, newM]);
      showSwal('ສຳເລັດ!', 'ເພີ່ມສະມາຊິກໃໝ່ແລ້ວ', 'success');
    }
    resetMemberForm();
  };

  const handleDeleteMember = (id: string) => {
    Swal.fire({
      title: 'ຢືນຢັນການລົບ?',
      text: 'ທ່ານຕ້ອງການລົບລາຍຊື່ສະມາຊິກນີ້ອອກຈາກລະບົບແທ້ບໍ?',
      icon: 'warning',
      showCancelButton: true,
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'ລົບ',
      cancelButtonText: 'ຍົກເລີກ',
    }).then((res) => {
      if (res.isConfirmed) {
        setMembers(members.filter((m) => m.id !== id));
        if (selectedMember?.id === id) setSelectedMember(null);
        showSwal('ສຳເລັດ!', 'ລົບລາຍຊື່ສະມາຊິກຮຽບຮ້ອຍແລ້ວ', 'success');
      }
    });
  };

  const resetMemberForm = () => {
    setMId(''); setMName(''); setMPhone(''); setMAddress('');
    setEditMemberMode(false);
  };

  // --- PRODUCT ACTIONS ---
  const handleSaveProduct = () => {
    if (!pId || !pName || pPrice === '' || pCost === '') {
      showSwal('ເຕືອນ!', 'ກະລຸນາປ້ອນຂໍ້ມູນສິນຄ້າໃຫ້ຄົບ', 'warning');
      return;
    }
    const newP: Product = {
      id: pId,
      name: pName,
      category: pCategory,
      price: Number(pPrice),
      promoPrice: Number(pPromo || pPrice),
      wholesalePrice: Number(pWholesale || pPrice),
      cost: Number(pCost),
      stock: Number(pStock || 0),
    };

    if (editProductMode) {
      setProducts(products.map((p) => (p.id === pId ? newP : p)));
      showSwal('ສຳເລັດ!', 'ອັບເດດສິນຄ້າແລ້ວ', 'success');
    } else {
      if (products.some((p) => p.id === pId)) {
        showSwal('ID ຊໍ້າ!', 'ລະຫັດສິນຄ້ານີ້ມີແລ້ວ', 'error');
        return;
      }
      setProducts([...products, newP]);
      showSwal('ສຳເລັດ!', 'ເພີ່ມສິນຄ້າໃໝ່ແລ້ວ', 'success');
    }
    resetProductForm();
  };

  const handleDeleteProduct = (id: string) => {
    Swal.fire({
      title: 'ຢືນຢັນການລົບ?',
      text: 'ຕ້ອງການລົບສິນຄ້ານີ້ອອກບໍ?',
      icon: 'warning',
      showCancelButton: true,
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'ລົບ',
    }).then((res) => {
      if (res.isConfirmed) {
        setProducts(products.filter((p) => p.id !== id));
        showSwal('ສຳເລັດ!', 'ລົບສິນຄ້າແລ້ວ', 'success');
      }
    });
  };

  const resetProductForm = () => {
    setPId(''); setPName(''); setPPrice(''); setPPromo(''); setPWholesale(''); setPCost(''); setPStock('');
    setEditProductMode(false);
  };

  // --- POS CART ---
  const addToCart = (product: Product, priceType: 'price' | 'promoPrice' | 'wholesalePrice' = 'price') => {
    if (product.stock <= 0) {
      showSwal('ສິນຄ້າໝົດ!', 'ສິນຄ້ານີ້ໝົດສະຕ໋ອກແລ້ວ', 'warning');
      return;
    }
    const price = product[priceType];
    const exist = cart.find((c) => c.product.id === product.id);
    if (exist) {
      if (exist.qty + 1 > product.stock) {
        showSwal('ສະຕ໋ອກບໍ່ພໍ!', 'ຈຳນວນເກີນສິນຄ້າທີ່ມີ', 'warning');
        return;
      }
      setCart(cart.map((c) => (c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { product, qty: 1, selectedPrice: price }]);
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

  const subtotal = cart.reduce((sum, item) => sum + item.selectedPrice * item.qty, 0);
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const changeAmount = typeof receivedCash === 'number' ? Math.max(0, receivedCash - finalTotal) : 0;

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
      memberId: selectedMember?.id,
      memberName: selectedMember?.name,
    };

    setProducts(updatedProducts);
    setSales([newSale, ...sales]);
    
    // Print dialog & reset
    window.print();
    setCart([]);
    setDiscountAmount(0);
    setReceivedCash('');
    setSelectedMember(null);
    showSwal('ຊຳລະເງິນສຳເລັດ!', `ເງິນທອນ: ${changeAmount.toLocaleString()} ₭`, 'success');
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'ທັງໝົດ' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(posProductSearch.toLowerCase()) || p.id.toLowerCase().includes(posProductSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
      <Head>
        <title>{shopName} - POS System</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="flex h-screen bg-slate-950 text-slate-100 font-['Noto_Sans_Lao','Phetsarath_OT',sans-serif] overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 z-20">
          <div>
            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer rounded-2xl border-2 border-cyan-500/50 p-1 hover:border-cyan-400 transition-all shadow-lg shadow-cyan-500/10 group"
              >
                <img src={logoUrl} alt="Logo" className="w-24 h-24 object-cover rounded-xl" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity text-xs font-medium">
                  ປ່ຽນຮູບ
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={(e) => {
                if (e.target.files?.[0]) setLogoUrl(URL.createObjectURL(e.target.files[0]));
              }} accept="image/*" className="hidden" />
              <h1 className="mt-3 text-base font-bold text-cyan-400 text-center">{shopName}</h1>
              <span className="text-xs text-slate-400 mt-1">{laoDateStr}</span>
            </div>

            {/* Menu */}
            <nav className="space-y-1.5">
              {[
                { id: 'pos', label: 'ໜ້າຂາຍ (POS)', icon: ShoppingCart },
                { id: 'dashboard', label: 'ແດຊບອດ (Dashboard)', icon: LayoutDashboard },
                { id: 'admin', label: 'ຈັດການລະບົບ (Admin)', icon: ShieldCheck, action: handleAdminTabAccess },
                { id: 'reports', label: 'ລາຍງານ (Reports)', icon: FileBarChart },
                { id: 'settings', label: 'ຕັ້ງຄ່າ (Settings)', icon: Settings },
              ].map((menu) => {
                const Icon = menu.icon;
                const active = activeTab === menu.id;
                return (
                  <button
                    key={menu.id}
                    onClick={() => (menu.action ? menu.action() : setActiveTab(menu.id as any))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{menu.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="text-center text-xs text-slate-500 py-2 border-t border-slate-800">
            {timeStr} | POS v2.5 Pro
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* TAB 1: POS SCREEN */}
          {activeTab === 'pos' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Left Side: Product Grid */}
              <div className="flex-1 flex flex-col p-4 overflow-hidden border-r border-slate-800">
                {/* Search & Category Filter Header */}
                <div className="flex flex-col gap-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ ຫຼື ລະຫັດ (Barcode)..."
                      value={posProductSearch}
                      onChange={(e) => setPosProductSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                          selectedCategory === cat
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Cards */}
                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pr-1">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-md group"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1 mb-1">
                          <span className="text-xs text-slate-500 font-mono">{p.id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.stock <= 5 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            ສະຕ໋ອກ: {p.stock}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-2">
                          {p.name}
                        </h3>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-end">
                        <span className="text-xs text-slate-400">{p.category}</span>
                        <span className="text-base font-bold text-cyan-400">
                          {p.price.toLocaleString()} ₭
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Cart & Payment Checkout */}
              <div className="w-[380px] bg-slate-900 flex flex-col h-full border-l border-slate-800">
                {/* Member Selector Bar */}
                <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-medium text-slate-300">
                      {selectedMember ? selectedMember.name : 'ລູກຄ້າທົ່ວໄປ'}
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      const m = members.find((x) => x.id === e.target.value);
                      setSelectedMember(m || null);
                    }}
                    value={selectedMember?.id || ''}
                    className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
                  >
                    <option value="">-- ເລືອກສະມາຊິກ --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                      <ShoppingCart className="w-10 h-10 opacity-30" />
                      <span>ຍັງບໍ່ມີສິນຄ້າໃນກະຕ່າ</span>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                        <div className="flex-1 pr-2">
                          <h4 className="text-xs font-semibold text-slate-200 truncate">{item.product.name}</h4>
                          <span className="text-[11px] text-cyan-400 font-bold">{item.selectedPrice.toLocaleString()} ₭</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-5 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateCartQty(item.product.id, 1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Checkout Panel */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
                  {/* Totals */}
                  <div className="space-y-1.5 text-xs">
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
                      <span className="text-cyan-400 text-base">{finalTotal.toLocaleString()} ₭</span>
                    </div>
                  </div>

                  {/* Cash Received Input */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">ຮັບເງິນມາ (₭):</label>
                    <input
                      type="number"
                      value={receivedCash}
                      onChange={(e) => setReceivedCash(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg px-3 py-2 text-right font-bold text-cyan-400 text-base focus:outline-none focus:border-cyan-400"
                    />
                    {/* Quick Cash Buttons */}
                    <div className="grid grid-cols-3 gap-1.5 mt-2">
                      {[50000, 100000, 500000].map((val) => (
                        <button
                          key={val}
                          onClick={() => setReceivedCash((prev) => (typeof prev === 'number' ? prev + val : val))}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 rounded text-[11px] font-medium"
                        >
                          +{val / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Change */}
                  <div className="flex justify-between text-xs font-semibold text-emerald-400 pt-1">
                    <span>ເງິນທອນ:</span>
                    <span>{changeAmount.toLocaleString()} ₭</span>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Printer className="w-5 h-5" />
                    <span>ຊຳລະເງິນ & ພິມໃບບິນ</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADMIN PANEL (PRODUCTS & MEMBERS WITH DELETE) */}
          {activeTab === 'admin' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Product Management */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <h2 className="text-base font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span>ຈັດການສິນຄ້າ (Products)</span>
                </h2>

                {/* Form */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <input placeholder="ລະຫັດສິນຄ້າ (ID)" value={pId} onChange={(e) => setPId(e.target.value)} disabled={editProductMode} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" />
                  <input placeholder="ຊື່ສິນຄ້າ" value={pName} onChange={(e) => setPName(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" />
                  <select value={pCategory} onChange={(e) => setPCategory(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                    {categories.filter(c => c !== 'ທັງໝົດ').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="number" placeholder="ລາຄາຂາຍ (₭)" value={pPrice} onChange={(e) => setPPrice(e.target.value === '' ? '' : Number(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" />
                  <input type="number" placeholder="ຕົ້ນທຶນ (₭)" value={pCost} onChange={(e) => setPCost(e.target.value === '' ? '' : Number(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" />
                  <input type="number" placeholder="ຈຳນວນສະຕ໋ອກ" value={pStock} onChange={(e) => setPStock(e.target.value === '' ? '' : Number(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" />
                  <div className="col-span-2 flex gap-2">
                    <button onClick={handleSaveProduct} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-xl text-xs">
                      {editProductMode ? 'ອັບເດດ' : 'ເພີ່ມສິນຄ້າ'}
                    </button>
                    {editProductMode && <button onClick={resetProductForm} className="bg-slate-800 px-4 py-2 rounded-xl text-xs">ຍົກເລີກ</button>}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">ID</th>
                        <th className="p-2.5">ຊື່ສິນຄ້າ</th>
                        <th className="p-2.5">ໝວດໝູ່</th>
                        <th className="p-2.5">ລາຄາຂາຍ</th>
                        <th className="p-2.5">ຕົ້ນທຶນ</th>
                        <th className="p-2.5">ສະຕ໋ອກ</th>
                        <th className="p-2.5 text-right">ຈັດການ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-850">
                          <td className="p-2.5 font-mono text-cyan-400">{p.id}</td>
                          <td className="p-2.5 font-medium text-slate-200">{p.name}</td>
                          <td className="p-2.5 text-slate-400">{p.category}</td>
                          <td className="p-2.5">{p.price.toLocaleString()} ₭</td>
                          <td className="p-2.5">{p.cost.toLocaleString()} ₭</td>
                          <td className="p-2.5">{p.stock}</td>
                          <td className="p-2.5 text-right space-x-2">
                            <button onClick={() => {
                              setPId(p.id); setPName(p.name); setPCategory(p.category); setPPrice(p.price); setPCost(p.cost); setPStock(p.stock); setEditProductMode(true);
                            }} className="text-amber-400 hover:underline">ແກ້ໄຂ</button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400 hover:underline">ລົບ</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Member Management WITH DELETE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <h2 className="text-base font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>ຈັດການສະມາຊິກ (Members / Customers)</span>
                </h2>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                  <input placeholder="ID ສະມາຊິກ" value={mId} onChange={(e) => setMId(e.target.value)} disabled={editMemberMode} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" />
                  <input placeholder="ຊື່ ແລະ ນາມສະກຸນ" value={mName} onChange={(e) => setMName(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" />
                  <input placeholder="ເບີໂທລະສັບ" value={mPhone} onChange={(e) => setMPhone(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" />
                  <input placeholder="ທີ່ຢູ່" value={mAddress} onChange={(e) => setMAddress(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div className="flex gap-2 mb-4">
                  <button onClick={handleSaveMember} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs">
                    {editMemberMode ? 'ອັບເດດສະມາຊິກ' : 'ເພີ່ມສະມາຊິກໃໝ່'}
                  </button>
                  {editMemberMode && <button onClick={resetMemberForm} className="bg-slate-800 px-4 py-2 rounded-xl text-xs">ຍົກເລີກ</button>}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">ID</th>
                        <th className="p-2.5">ຊື່ສະມາຊິກ</th>
                        <th className="p-2.5">ເບີໂທ</th>
                        <th className="p-2.5">ທີ່ຢູ່</th>
                        <th className="p-2.5 text-right">ຈັດການ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {members.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-850">
                          <td className="p-2.5 font-mono text-cyan-400">{m.id}</td>
                          <td className="p-2.5 font-medium text-slate-200">{m.name}</td>
                          <td className="p-2.5">{m.phone}</td>
                          <td className="p-2.5 text-slate-400">{m.address}</td>
                          <td className="p-2.5 text-right space-x-3">
                            <button onClick={() => {
                              setMId(m.id); setMName(m.name); setMPhone(m.phone); setMAddress(m.address); setEditMemberMode(true);
                            }} className="text-amber-400 hover:underline">ແກ້ໄຂ</button>
                            <button onClick={() => handleDeleteMember(m.id)} className="text-red-400 hover:underline font-semibold">
                              ລົບລາຍຊື່
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DASHBOARD STATS */}
          {activeTab === 'dashboard' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-100">ພາບລວມຍອດຂາຍ (Dashboard)</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-xs text-slate-400">ຍອດຂາຍລວມ</span>
                  <p className="text-xl font-bold text-cyan-400 mt-1">
                    {sales.reduce((acc, s) => acc + s.totalAmount, 0).toLocaleString()} ₭
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-xs text-slate-400">ກຳໄລລວມ</span>
                  <p className="text-xl font-bold text-emerald-400 mt-1">
                    {sales.reduce((acc, s) => acc + s.totalProfit, 0).toLocaleString()} ₭
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-xs text-slate-400">ຈຳນວນອໍເດີ</span>
                  <p className="text-xl font-bold text-amber-400 mt-1">{sales.length} ອໍເດີ</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-xs text-slate-400">ສິນຄ້າໃນສະຕ໋ອກ</span>
                  <p className="text-xl font-bold text-purple-400 mt-1">
                    {products.reduce((acc, p) => acc + p.stock, 0)} ຊິ້ນ
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PRINT RECEIPT STYLING (FOR 80MM THERMAL PRINTER) */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-receipt, .printable-receipt * {
            visibility: visible;
          }
          .printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 10px;
            color: #000;
            background: #fff;
            font-family: 'Noto Sans Lao', sans-serif;
          }
        }
      `}</style>
    </>
  );
}