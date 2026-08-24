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
import { Bar, Doughnut } from 'react-chartjs-2';
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
  Upload,
  CheckCircle,
  XCircle,
  Clock,
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
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
  memberId?: string;
  memberName?: string;
}

interface StockHistory {
  id: string;
  productName: string;
  qty: number;
  date: string;
  type: 'IN' | 'OUT';
}

export default function POSPhengSone() {
  // --- STATES ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'admin' | 'settings' | 'reports'>('dashboard');
  
  // Customization & Shop Info
  const [shopName, setShopName] = useState('ຮ້ານ ແພງສອນ ຂາຍ Online');
  const [logoUrl, setLogoUrl] = useState('https://via.placeholder.com/150/06b6d4/ffffff?text=PhengSone');
  const [adminPassword, setAdminPassword] = useState('11222');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [textColor, setTextColor] = useState('#f8fafc');
  const [numberColor, setNumberColor] = useState('#38bdf8');
  
  // Logo Border Color Cycling (10s interval)
  const borderColors = [
    'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]',
    'border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.6)]',
    'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]',
    'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
  ];
  const [borderColorIndex, setBorderColorIndex] = useState(0);

  // Time & Date State
  const [timeStr, setTimeStr] = useState('');
  const [laoDateStr, setLaoDateStr] = useState('');

  // Data Stores
  const [products, setProducts] = useState<Product[]>([
    { id: 'P001', name: 'ເສື້ອຢືດ A1', price: 85000, promoPrice: 75000, wholesalePrice: 65000, cost: 50000, stock: 45 },
    { id: 'P002', name: 'ໂສ້ງຢີນ B2', price: 180000, promoPrice: 160000, wholesalePrice: 140000, cost: 110000, stock: 20 },
    { id: 'P003', name: 'ເກີບຜ້າໃບ C3', price: 250000, promoPrice: 230000, wholesalePrice: 200000, cost: 150000, stock: 12 },
  ]);

  const [members, setMembers] = useState<Member[]>([
    { id: 'M001', name: 'ສົມໄຊ ໃຈດີ', phone: '02055551111', address: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 'M002', name: 'ນາງ ນ້ອຍ', phone: '02099998888', address: 'ຫຼວງພະບາງ' },
  ]);

  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([
    { id: 'ST01', productName: 'ເສື້ອຢືດ A1', qty: 50, date: '20.08.2026 10:00', type: 'IN' }
  ]);

  // Admin Forms State
  const [pId, setPId] = useState('');
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState<number | ''>('');
  const [pPromo, setPPromo] = useState<number | ''>('');
  const [pWholesale, setPWholesale] = useState<number | ''>('');
  const [pCost, setPCost] = useState<number | ''>('');
  const [pStock, setPStock] = useState<number | ''>('');
  const [editProductMode, setEditProductMode] = useState(false);

  const [mId, setMId] = useState('');
  const [mName, setMName] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mAddress, setMAddress] = useState('');
  const [editMemberMode, setEditMemberMode] = useState(false);

  // POS State
  const [posProductSearch, setPosProductSearch] = useState('');
  const [posMemberSearch, setPosMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receivedCash, setReceivedCash] = useState<number | ''>('');

  // Report State
  const [reportFilter, setReportFilter] = useState<'day' | 'week' | 'month' | 'year'>('day');

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HELPER FUNC: Lao Date ---
  const updateClock = () => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const secs = String(d.getSeconds()).padStart(2, '0');
    setTimeStr(`${hours}:${mins}:${secs}`);

    const days = ['ວັນອາທິດ', 'ວັນຈັນ', 'ວັນອັງຄານ', 'ວັນພຸດ', 'ວັນພະຫັດ', 'ວັນເສົາ', 'ວັນເສົາ'];
    const months = ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'];
    setLaoDateStr(`${days[d.getDay()]}ທີ ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`);
  };

  useEffect(() => {
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const colorTimer = setInterval(() => {
      setBorderColorIndex((prev) => (prev + 1) % borderColors.length);
    }, 10000);
    return () => clearInterval(colorTimer);
  }, []);

  // Custom Dark SweetAlert2 Helper
  const showSwal = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info') => {
    Swal.fire({
      title,
      text,
      icon,
      background: '#0f172a',
      color: '#f8fafc',
      confirmButtonColor: '#06b6d4',
      customClass: {
        popup: 'border border-slate-800 rounded-xl backdrop-blur-md shadow-2xl',
      },
    });
  };

  // --- ADMIN PASS CHECK ---
  const handleAdminTabAccess = () => {
    if (isAdminUnlocked) {
      setActiveTab('admin');
      return;
    }
    Swal.fire({
      title: '🛡️ ລະບົບປ້ອງກັນ Admin',
      text: 'ກະລຸນາໃສ່ລະຫັດຜ່ານເພື່ອເຂົ້າສູ່ Admin Panel:',
      input: 'password',
      inputPlaceholder: 'ໃສ່ລະຫັດຜ່ານ (Default: 11222)',
      background: '#0f172a',
      color: '#f8fafc',
      confirmButtonColor: '#06b6d4',
      showCancelButton: true,
      cancelButtonText: 'ຍົກເລີກ',
      customClass: {
        popup: 'border border-slate-800 rounded-xl backdrop-blur-md',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value === adminPassword) {
          setIsAdminUnlocked(true);
          setActiveTab('admin');
          showSwal('ສໍາເລັດ!', 'ເຂົ້າສູ່ລະບົບ Admin 成功', 'success');
        } else {
          showSwal('ຜິດພາດ!', 'ລະຫັດຜ່ານຜິດ ກະລຸນາລອງໃໝ່!', 'error');
        }
      }
    });
  };

  // --- PRODUCT MANAGEMENT ---
  const handleSaveProduct = () => {
    if (!pId || !pName || pPrice === '' || pCost === '') {
      showSwal('ເຕືອນ!', 'ກະລຸນາປ້ອນຂໍ້ມູນສິນຄ້າໃຫ້ຄົບຖ້ວນ', 'warning');
      return;
    }

    if (!editProductMode && products.some((p) => p.id.toLowerCase() === pId.toLowerCase())) {
      showSwal('ID ຊໍ້າກັນ!', `ລະຫັດສິນຄ້າ "${pId}" ມີໃນລະບົບແລ້ວ! ບໍ່ສາມາດບັນທຶກຊໍ້າໄດ້.`, 'error');
      return;
    }

    const newProd: Product = {
      id: pId,
      name: pName,
      price: Number(pPrice),
      promoPrice: Number(pPromo || pPrice),
      wholesalePrice: Number(pWholesale || pPrice),
      cost: Number(pCost),
      stock: Number(pStock || 0),
    };

    if (editProductMode) {
      setProducts(products.map((p) => (p.id === pId ? newProd : p)));
      showSwal('ສໍາເລັດ!', 'ແກ້ໄຂຂໍ້ມູນສິນຄ້າຮຽບຮ້ອຍ', 'success');
    } else {
      setProducts([...products, newProd]);
      showSwal('ສໍາເລັດ!', 'ເພີ່ມສິນຄ້າໃໝ່ຮຽບຮ້ອຍ', 'success');
    }

    resetProductForm();
  };

  const resetProductForm = () => {
    setPId(''); setPName(''); setPPrice(''); setPPromo(''); setPWholesale(''); setPCost(''); setPStock('');
    setEditProductMode(false);
  };

  const handleEditProduct = (p: Product) => {
    setPId(p.id); setPName(p.name); setPPrice(p.price); setPPromo(p.promoPrice); setPWholesale(p.wholesalePrice); setPCost(p.cost); setPStock(p.stock);
    setEditProductMode(true);
  };

  const handleDeleteProduct = (id: string) => {
    Swal.fire({
      title: 'ຢືນຢັນການລົບ?',
      text: 'ທ່ານຕ້ອງການລົບສິນຄ້ານີ້ອອກຈາກລະບົບແທ້ບໍ?',
      icon: 'warning',
      showCancelButton: true,
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'ລົບ',
      cancelButtonText: 'ຍົກເລີກ',
    }).then((res) => {
      if (res.isConfirmed) {
        setProducts(products.filter((p) => p.id !== id));
        showSwal('ສໍາເລັດ!', 'ລົບສິນຄ້າຮຽບຮ້ອຍແລ້ວ', 'success');
      }
    });
  };

  // --- MEMBER MANAGEMENT ---
  const handleSaveMember = () => {
    if (!mId || !mName || !mPhone) {
      showSwal('ເຕືອນ!', 'ກະລຸນາປ້ອນຂໍ້ມູນສະມາຊິກໃຫ້ຄົບຖ້ວນ', 'warning');
      return;
    }

    if (!editMemberMode && members.some((m) => m.id.toLowerCase() === mId.toLowerCase())) {
      showSwal('ID ຊໍ້າກັນ!', `ລະຫັດສະມາຊິກ "${mId}" ມີໃນລະບົບແລ້ວ!`, 'error');
      return;
    }

    const newM: Member = { id: mId, name: mName, phone: mPhone, address: mAddress };

    if (editMemberMode) {
      setMembers(members.map((m) => (m.id === mId ? newM : m)));
      showSwal('ສໍາເລັດ!', 'ແກ້ໄຂຂໍ້ມູນສະມາຊິກຮຽບຮ້ອຍ', 'success');
    } else {
      setMembers([...members, newM]);
      showSwal('ສໍາເລັດ!', 'ເພີ່ມສະມາຊິກໃໝ່ຮຽບຮ້ອຍ', 'success');
    }
    resetMemberForm();
  };

  const resetMemberForm = () => {
    setMId(''); setMName(''); setMPhone(''); setMAddress('');
    setEditMemberMode(false);
  };

  // --- POS CART ACTIONS ---
  const addToCart = (product: Product, priceType: 'price' | 'promoPrice' | 'wholesalePrice' = 'price') => {
    if (product.stock <= 0) {
      showSwal('ສິນຄ້າໝົດ!', 'ສິນຄ້ານີ້ໝົດສະຕ໋ອກແລ້ວ', 'warning');
      return;
    }
    const selectedPrice = product[priceType];
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      if (existing.qty + 1 > product.stock) {
        showSwal('ສະຕ໋ອກບໍ່ພໍ!', 'ຈຳນວນໃນສະຕ໋ອກບໍ່ພໍ', 'warning');
        return;
      }
      setCart(cart.map((item) => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { product, qty: 1, selectedPrice }]);
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

  const updateCartItemPrice = (id: string, newPrice: number) => {
    setCart(cart.map((item) => item.product.id === id ? { ...item, selectedPrice: newPrice } : item));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.selectedPrice * item.qty, 0);
  const changeAmount = typeof receivedCash === 'number' ? Math.max(0, receivedCash - cartTotal) : 0;

  // KEYBOARD SHORTCUTS IN POS: Spacebar (Exact money) -> Enter (Pay)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'pos') return;
      if (e.code === 'Space' && (document.activeElement?.tagName !== 'INPUT')) {
        e.preventDefault();
        setReceivedCash(cartTotal);
      } else if (e.code === 'Enter' && cart.length > 0 && typeof receivedCash === 'number' && receivedCash >= cartTotal) {
        e.preventDefault();
        confirmPayment();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, cart, cartTotal, receivedCash]);

  const confirmPayment = () => {
    if (cart.length === 0) {
      showSwal('ກະຕ່າຫວ່າງ!', 'ກະລຸນາເລືອກສິນຄ້າກ່ອນຊຳລະເງິນ', 'warning');
      return;
    }
    if (typeof receivedCash !== 'number' || receivedCash < cartTotal) {
      showSwal('ເງິນບໍ່ພໍ!', 'ຈຳນວນເງິນທີ່ຮັບມາບໍ່ພໍກັບຍອດລວມ', 'error');
      return;
    }

    // Deduct stock and calculate cost/profit
    let saleCost = 0;
    const updatedProducts = [...products];

    cart.forEach((cartItem) => {
      const pIdx = updatedProducts.findIndex((p) => p.id === cartItem.product.id);
      if (pIdx !== -1) {
        updatedProducts[pIdx].stock -= cartItem.qty;
        saleCost += updatedProducts[pIdx].cost * cartItem.qty;
      }
    });

    const newSale: SaleRecord = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString('lo-LA'),
      timestamp: Date.now(),
      items: cart,
      totalAmount: cartTotal,
      totalCost: saleCost,
      totalProfit: cartTotal - saleCost,
      memberId: selectedMember?.id,
      memberName: selectedMember?.name,
    };

    setProducts(updatedProducts);
    setSales([newSale, ...sales]);
    setCart([]);
    setReceivedCash('');
    setSelectedMember(null);

    showSwal('ຊຳລະເງິນສຳເລັດ!', `ເງິນທອນ: ${changeAmount.toLocaleString()} ₭`, 'success');
  };

  const handlePrintReceipt = () => {
    if (cart.length === 0) return;
    window.print();
  };

  // --- LOGO UPLOAD ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
      showSwal('ສໍາເລັດ!', 'ອັບໂຫຼດໂລໂກ້ຮ້ານໃໝ່ຮຽບຮ້ອຍ', 'success');
    }
  };

  // --- DASHBOARD CALCULATIONS ---
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
  const todaySales = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalCost = sales.reduce((acc, s) => acc + s.totalCost, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.totalProfit, 0);

  // --- REPORT EXPORTS ---
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,ID,Date,Member,TotalAmount,Cost,Profit\n';
    sales.forEach((s) => {
      csvContent += `${s.id},${s.date},${s.memberName || 'General'},${s.totalAmount},${s.totalCost},${s.totalProfit}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <>
      <Head>
        <title>{shopName} - POS System</title>
        <meta name="description" content="POS System for PhengSone Online Shop" />
      </Head>

      <div className="flex h-screen bg-[#0b1120] text-slate-100 font-sans overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-[#0f172a]/80 backdrop-blur-md border-r border-slate-800 flex flex-col justify-between p-4 z-20">
          <div>
            {/* Store Logo with Pulsing Color Border (3x3cm / ~113px) */}
            <div className="flex flex-col items-center mb-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer transition-all duration-700 rounded-2xl border-4 p-1 ${borderColors[borderColorIndex]}`}
                title="ຄິກເພື່ອປ່ຽນຮູບໂລໂກ້"
              >
                <img
                  src={logoUrl}
                  alt="Shop Logo"
                  className="w-[113px] h-[113px] object-cover rounded-xl shadow-inner"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity text-xs text-white">
                  ປ່ຽນຮູບ
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              <h1 className="mt-3 text-lg font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {shopName}
              </h1>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-r-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>ໜ້າຫຼັກ Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('pos')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'pos'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-r-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>ໜ້າຂາຍ (POS)</span>
              </button>

              <button
                onClick={handleAdminTabAccess}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-r-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span>ໜ້າລະບົບ Admin</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-r-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>ການຕັ້ງຄ່າ Settings</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'reports'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-r-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <FileBarChart className="w-5 h-5" />
                <span>ລາຍງານ Report</span>
              </button>
            </nav>
          </div>

          <div className="text-xs text-slate-500 text-center">
            v2.0 POS System © 2026
          </div>
        </aside>

        {/* MAIN BODY AREA */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* HEADER / TOP BAR */}
          <header className="h-20 bg-[#0f172a]/60 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <Clock className="w-6 h-6 text-cyan-400 animate-pulse" />
              <div>
                <div className="text-2xl font-black text-cyan-400 tracking-wider">
                  {timeStr}
                </div>
                <div className="text-xs text-slate-400">{laoDateStr}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1.5 rounded-full font-medium shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                Online
              </span>
            </div>
          </header>

          {/* DYNAMIC CONTENT WRAPPER */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. DASHBOARD PANEL */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-md">
                  <h2 className="text-2xl font-bold text-cyan-300">
                    👋 ຍິນດີຕ້ອນຮັບສູ່ {shopName}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    ລະບົບຈັດການການຂາຍອອນໄລນ໌ ຮອງຮັບການເຮັດວຽກ Real-time
                  </p>
                </div>

                {/* 5 Dynamic KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-slate-400">ສິນຄ້າໃນຄັງ</span>
                      <Package className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="text-2xl font-bold mt-2" style={{ color: numberColor }}>
                      {totalStockCount} <span className="text-xs text-slate-400">ຊິ້ນ</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-slate-400">ຍອດຂາຍມື້ນີ້</span>
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-xl font-bold mt-2 text-emerald-400">
                      {todaySales.toLocaleString()} ₭
                    </div>
                  </div>

                  <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-slate-400">ສະມາຊິກ</span>
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold mt-2" style={{ color: numberColor }}>
                      {members.length} <span className="text-xs text-slate-400">ຄົນ</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-slate-400">ຕົ້ນທຶນລວມ</span>
                      <TrendingUp className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-xl font-bold mt-2 text-amber-400">
                      {totalCost.toLocaleString()} ₭
                    </div>
                  </div>

                  <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-slate-400">ກຳໄລລວມ</span>
                      <DollarSign className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="text-xl font-bold mt-2 text-cyan-400">
                      {totalProfit.toLocaleString()} ₭
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
                    <h3 className="text-md font-semibold text-slate-200 mb-4">
                      📊 ຍອດຂາຍຍ້ອນຫຼັງ 7 ວັນ (Bar Chart)
                    </h3>
                    <Bar
                      data={{
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [
                          {
                            label: 'ຍອດຂາຍ (₭)',
                            data: [1200000, 1900000, 3000000, 2500000, 2200000, 3000000, todaySales || 1500000],
                            backgroundColor: 'rgba(6, 182, 212, 0.6)',
                            borderColor: '#06b6d4',
                            borderWidth: 2,
                            borderRadius: 8,
                          },
                        ],
                      }}
                      options={{ responsive: true, plugins: { legend: { display: false } } }}
                    />
                  </div>

                  <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex flex-col justify-center items-center">
                    <h3 className="text-md font-semibold text-slate-200 mb-4">
                      🍩 ສັດສ່ວນສິນຄ້າໃນສະຕ໋ອກ
                    </h3>
                    <div className="w-48 h-48">
                      <Doughnut
                        data={{
                          labels: products.map((p) => p.name),
                          datasets: [
                            {
                              data: products.map((p) => p.stock),
                              backgroundColor: ['#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'],
                              borderColor: '#0f172a',
                              borderWidth: 2,
                            },
                          ],
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. POS PAGE */}
            {activeTab === 'pos' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Left: Product Search & Grid */}
                <div className="lg:col-span-2 space-y-4 flex flex-col">
                  {/* Search bar */}
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="ຄົ້ນຫາສິນຄ້າ (ID ຫຼື ຊື່)..."
                        value={posProductSearch}
                        onChange={(e) => setPosProductSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl focus:border-cyan-500 focus:outline-none text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-[calc(100vh-220px)] pr-2">
                    {products
                      .filter(
                        (p) =>
                          p.name.toLowerCase().includes(posProductSearch.toLowerCase()) ||
                          p.id.toLowerCase().includes(posProductSearch.toLowerCase())
                      )
                      .map((p) => (
                        <div
                          key={p.id}
                          className="bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 flex flex-col justify-between transition-all group"
                        >
                          <div>
                            <span className="text-xs text-cyan-400 font-mono">{p.id}</span>
                            <h4 className="font-semibold text-slate-200 mt-1">{p.name}</h4>
                            <p className="text-xs text-slate-400">
                              ຄັງ: <span className="text-cyan-400 font-medium">{p.stock}</span>
                            </p>
                          </div>
                          <div className="mt-3">
                            <div className="text-emerald-400 font-bold text-sm">
                              {p.price.toLocaleString()} ₭
                            </div>
                            <div className="grid grid-cols-3 gap-1 mt-2">
                              <button
                                onClick={() => addToCart(p, 'price')}
                                className="bg-cyan-600/30 hover:bg-cyan-600 text-cyan-300 hover:text-white text-[10px] py-1 rounded border border-cyan-500/30 transition-all"
                              >
                                ລາຄາປົກກະຕິ
                              </button>
                              <button
                                onClick={() => addToCart(p, 'promoPrice')}
                                className="bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white text-[10px] py-1 rounded border border-purple-500/30 transition-all"
                              >
                                ໂປຣ
                              </button>
                              <button
                                onClick={() => addToCart(p, 'wholesalePrice')}
                                className="bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white text-[10px] py-1 rounded border border-amber-500/30 transition-all"
                              >
                                ຕົວແທນ
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Right: Cart & Payment */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-[calc(100vh-140px)] shadow-2xl">
                  <div>
                    <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" /> ກະຕ່າສິນຄ້າ
                    </h3>

                    {/* Member Selector */}
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="ຄົ້ນຫາ ID/ຊື່/ເບີ ສະມາຊິກ..."
                        value={posMemberSearch}
                        onChange={(e) => setPosMemberSearch(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                      />
                      {posMemberSearch && (
                        <div className="bg-slate-950 border border-slate-800 rounded-lg mt-1 max-h-24 overflow-y-auto">
                          {members
                            .filter(
                              (m) =>
                                m.name.includes(posMemberSearch) ||
                                m.id.includes(posMemberSearch) ||
                                m.phone.includes(posMemberSearch)
                            )
                            .map((m) => (
                              <div
                                key={m.id}
                                onClick={() => {
                                  setSelectedMember(m);
                                  setPosMemberSearch('');
                                }}
                                className="p-2 text-xs hover:bg-cyan-500/20 cursor-pointer flex justify-between"
                              >
                                <span>{m.name}</span>
                                <span className="text-slate-400">{m.phone}</span>
                              </div>
                            ))}
                        </div>
                      )}
                      {selectedMember && (
                        <div className="mt-2 text-xs bg-cyan-950/40 border border-cyan-800 p-2 rounded-lg flex justify-between items-center text-cyan-300">
                          <span>👤 ສະມາຊິກ: {selectedMember.name}</span>
                          <button
                            onClick={() => setSelectedMember(null)}
                            className="text-red-400 hover:underline"
                          >
                            ຍົກເລີກ
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Items List */}
                    <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center"
                        >
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-slate-200">
                              {item.product.name}
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-xs">
                              <span className="text-slate-400">ລາຄາ:</span>
                              <input
                                type="number"
                                value={item.selectedPrice}
                                onChange={(e) => updateCartItemPrice(item.product.id, Number(e.target.value))}
                                className="w-20 px-1 bg-slate-900 border border-slate-700 rounded text-emerald-400 text-xs"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartQty(item.product.id, -1)}
                              className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-slate-100">{item.qty}</span>
                            <button
                              onClick={() => updateCartQty(item.product.id, 1)}
                              className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment & Summary */}
                  <div className="border-t border-slate-800 pt-3 space-y-3">
                    <div className="flex justify-between items-center text-slate-300 font-bold">
                      <span>ຍອດລວມທັງໝົດ:</span>
                      <span className="text-xl text-emerald-400">{cartTotal.toLocaleString()} ₭</span>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400">ຈຳນວນເງິນທີ່ຮັບມາ (₭):</label>
                      <input
                        type="number"
                        placeholder="ປ້ອນຈຳນວນເງິນ..."
                        value={receivedCash}
                        onChange={(e) => setReceivedCash(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-bold text-lg focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>ເງິນທອນ:</span>
                      <span className="text-md font-bold text-cyan-400">
                        {changeAmount.toLocaleString()} ₭
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 italic text-center">
                      💡 ປຸ່ມລັດ: ກົດ Spacebar = ເງິນພໍດີ | Press Enter = ບັນທຶກຊຳລະ
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={confirmPayment}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" /> ຢືນຢັນຊຳລະເງິນ
                      </button>

                      <button
                        onClick={handlePrintReceipt}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-slate-700"
                      >
                        <Printer className="w-4 h-4" /> ພິມໃບເສັດ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ADMIN PANEL */}
            {activeTab === 'admin' && (
              <div className="space-y-8">
                {/* Product Management Form & Table */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-cyan-400 mb-4">
                    📦 ຈັດການຂໍ້ມູນສິນຄ້າ (Product Management)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="ID ສິນຄ້າ (ເຊັ່ນ: P001)"
                      value={pId}
                      disabled={editProductMode}
                      onChange={(e) => setPId(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="ຊື່ລາຍການສິນຄ້າ"
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="ລາຄາຂາຍປົກກະຕິ (₭)"
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="ລາຄາໂປຣ (₭)"
                      value={pPromo}
                      onChange={(e) => setPPromo(e.target.value === '' ? '' : Number(e.target.value))}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="ລາຄາຕົວແທນ (₭)"
                      value={pWholesale}
                      onChange={(e) => setPWholesale(e.target.value === '' ? '' : Number(e.target.value))}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="ຕົ້ນທຶນ (₭)"
                      value={pCost}
                      onChange={(e) => setPCost(e.target.value === '' ? '' : Number(e.target.value))}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="ຈຳນວນໃນສະຕ໋ອກ"
                      value={pStock}
                      onChange={(e) => setPStock(e.target.value === '' ? '' : Number(e.target.value))}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProduct}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all"
                      >
                        {editProductMode ? 'ບັນທຶກແກ້ໄຂ' : 'ເພີ່ມສິນຄ້າ'}
                      </button>
                      {editProductMode && (
                        <button
                          onClick={resetProductForm}
                          className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm"
                        >
                          ຍົກເລີກ
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Product Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                        <tr>
                          <th className="p-3">ID</th>
                          <th className="p-3">ຊື່ສິນຄ້າ</th>
                          <th className="p-3">ລາຄາປົກກະຕິ</th>
                          <th className="p-3">ລາຄາໂປຣ</th>
                          <th className="p-3">ຕົ້ນທຶນ</th>
                          <th className="p-3">ກຳໄລ/ຊິ້ນ</th>
                          <th className="p-3">ສະຕ໋ອກ</th>
                          <th className="p-3 text-center">ຈັດການ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono text-cyan-400">{p.id}</td>
                            <td className="p-3 font-medium text-slate-200">{p.name}</td>
                            <td className="p-3 text-emerald-400">{p.price.toLocaleString()} ₭</td>
                            <td className="p-3 text-purple-400">{p.promoPrice.toLocaleString()} ₭</td>
                            <td className="p-3 text-amber-400">{p.cost.toLocaleString()} ₭</td>
                            <td className="p-3 text-cyan-400">{(p.price - p.cost).toLocaleString()} ₭</td>
                            <td className="p-3 font-bold">{p.stock}</td>
                            <td className="p-3 text-center space-x-2">
                              <button
                                onClick={() => handleEditProduct(p)}
                                className="p-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white rounded-lg transition-all"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Member Management Form & Table */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-purple-400 mb-4">
                    👥 ຈັດການຂໍ້ມູນສະມາຊິກ (Member Management)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="ID ສະມາຊິກ (ເຊັ່ນ: M001)"
                      value={mId}
                      disabled={editMemberMode}
                      onChange={(e) => setMId(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="ຊື່ ແລະ ນາມສະກຸນ"
                      value={mName}
                      onChange={(e) => setMName(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="ເບີໂທຕິດຕໍ່"
                      value={mPhone}
                      onChange={(e) => setMPhone(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="ທີ່ຢູ່"
                      value={mAddress}
                      onChange={(e) => setMAddress(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm"
                    />
                  </div>
                  <button
                    onClick={handleSaveMember}
                    className="mb-4 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm transition-all"
                  >
                    {editMemberMode ? 'ບັນທຶກແກ້ໄຂ' : 'ເພີ່ມສະມາຊິກ'}
                  </button>

                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">ຊື່</th>
                        <th className="p-3">ເບີໂທ</th>
                        <th className="p-3">ທີ່ຢູ່</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {members.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono text-purple-400">{m.id}</td>
                          <td className="p-3">{m.name}</td>
                          <td className="p-3">{m.phone}</td>
                          <td className="p-3">{m.address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* General Stock Receipts History */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-amber-400 mb-2">
                    📥 ປະຫວັດການຮັບສິນຄ້າເຂົ້າ (Stock Receipts)
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    ໝາຍເຫດ: ປະຫວັດການຮັບສິນຄ້າເຂົ້າຈະບໍ່ຕັດສະຕ໋ອກ
                  </p>
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">ລາຍການສິນຄ້າ</th>
                        <th className="p-3">ຈຳນວນຮັບ</th>
                        <th className="p-3">ວັນທີ-ເວລາ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {stockHistory.map((sh) => (
                        <tr key={sh.id}>
                          <td className="p-3 font-mono text-amber-400">{sh.id}</td>
                          <td className="p-3">{sh.productName}</td>
                          <td className="p-3 text-emerald-400 font-bold">+{sh.qty}</td>
                          <td className="p-3 text-slate-400">{sh.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. SETTINGS PAGE */}
            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Branding */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-bold text-cyan-400">⚙️ ຕັ້ງຄ່າຂໍ້ມູນຮ້ານ & Logo</h3>
                  <div>
                    <label className="text-xs text-slate-400">ຊື່ຮ້ານຄ້າ:</label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">ປ່ຽນລະຫັດ Admin Panel:</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">ອັບໂຫຼດ Logo ຮ້ານ:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full mt-1 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
                    />
                  </div>
                </div>

                {/* Color Adjustments */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-bold text-purple-400">🎨 ຕັ້ງຄ່າສີ ແລະ ຕົວໜັງສື</h3>
                  <div>
                    <label className="text-xs text-slate-400">ສີຕົວໜັງສືທົ່ວໄປ:</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-10 mt-1 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">ສີຕົວເລກ/KPI dynamic:</label>
                    <input
                      type="color"
                      value={numberColor}
                      onChange={(e) => setNumberColor(e.target.value)}
                      className="w-full h-10 mt-1 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. SALES REPORT PAGE */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                {/* Filter Header */}
                <div className="flex flex-wrap justify-between items-center bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Filter ເບິ່ງຍອດ:</span>
                    {(['day', 'week', 'month', 'year'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setReportFilter(filter)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                          reportFilter === filter
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  {/* Top 3 Best Sellers */}
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-400 font-bold">🏆 3 ອັນດັບຂາຍດີ:</span>
                    <span className="text-cyan-400 font-medium">1. ເສື້ອຢືດ A1</span>
                    <span className="text-cyan-400 font-medium">2. ໂສ້ງຢີນ B2</span>
                    <span className="text-cyan-400 font-medium">3. ເກີບຜ້າໃບ C3</span>
                  </div>
                </div>

                {/* Sales Records Table */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-md font-bold text-slate-200 mb-4">
                    📋 ປະຫວັດການຂາຍທັງໝົດ
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                        <tr>
                          <th className="p-3">ເລກທີໃບເສັດ</th>
                          <th className="p-3">ວັນທີ-ເວລາ</th>
                          <th className="p-3">ສະມາຊິກ</th>
                          <th className="p-3">ຍອດລວມ</th>
                          <th className="p-3">ຕົ້ນທຶນ</th>
                          <th className="p-3">ກຳໄລ net</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {sales.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono text-cyan-400">{s.id}</td>
                            <td className="p-3 text-slate-400">{s.date}</td>
                            <td className="p-3">{s.memberName || 'ລູກຄ້າທົ່ວໄປ'}</td>
                            <td className="p-3 text-emerald-400 font-bold">{s.totalAmount.toLocaleString()} ₭</td>
                            <td className="p-3 text-amber-400">{s.totalCost.toLocaleString()} ₭</td>
                            <td className="p-3 text-cyan-400 font-bold">{s.totalProfit.toLocaleString()} ₭</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Action Buttons at Bottom Left */}
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={exportToPDF}
                      className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg"
                    >
                      <Download className="w-4 h-4" /> ດາວໂຫຼດ PDF
                    </button>
                    <button
                      onClick={exportToCSV}
                      className="flex items-center gap-2 bg-emerald-600/80 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg"
                    >
                      <Download className="w-4 h-4" /> ດາວໂຫຼດ Excel/CSV
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}