import React, { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import Swal from 'sweetalert2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  LayoutDashboard,
  ShoppingCart,
  ShieldCheck,
  BarChart3,
  Settings,
  Search,
  Plus,
  Trash2,
  Edit,
  Printer,
  FileSpreadsheet,
  FileText,
  UserCheck,
  Package,
  DollarSign,
  TrendingUp,
  Boxes,
  Users,
  RefreshCw,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Store,
  ChevronDown,
  X,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Types
export interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
  promoPrice: number;
  agentPrice: number;
  stock: number;
  image?: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  address: string;
  tier: 'general' | 'promo' | 'agent';
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface SaleRecord {
  id: string;
  timestamp: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    subtotal: number;
    subtotalCost: number;
  }[];
  totalAmount: number;
  totalCost: number;
  profit: number;
  cashReceived: number;
  change: number;
  customerId: string;
  customerName: string;
  customerTier: string;
  paymentMethod: string;
}

export interface StockInRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  date: string;
  timestamp: string;
  supplierNote: string;
}

export interface AppSettings {
  storeName: string;
  storeGreeting: string;
  adminPass: string;
  logoEmoji: string;
  logoUrl: string;
  logoBorderSpeed: number;
  fontSize: 'small' | 'normal' | 'large';
  textColor: string;
  numberColor: string;
  defaultPriceTier: 'general' | 'promo' | 'agent';
}

// Initial Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Alisa Detox Tea Herb ຊາອະລິສາກ່ອງ ແດງ',
    category: 'ຊາສະໝຸນໄພ',
    costPrice: 45000,
    salePrice: 64500,
    promoPrice: 60000,
    agentPrice: 55000,
    stock: 4,
  },
  {
    id: '2',
    name: 'Alisa Green Tea Herb ຊາອະລິສາກ່ອງ ຂຽວ',
    category: 'ຊາສະໝຸນໄພ',
    costPrice: 45000,
    salePrice: 64500,
    promoPrice: 60000,
    agentPrice: 55000,
    stock: 13,
  },
  {
    id: '3',
    name: 'ກັນແດດໂນໂອ NoO Sunscreen SPF50+',
    category: 'ເຄື່ອງສຳອາງ',
    costPrice: 100000,
    salePrice: 150000,
    promoPrice: 140000,
    agentPrice: 120000,
    stock: 8,
  },
  {
    id: '4',
    name: 'ຄຣີມບຳລຸງຜິວ ໜ້າໃສ Whitening Cream',
    category: 'ບຳລຸງຜິວ',
    costPrice: 55000,
    salePrice: 85000,
    promoPrice: 80000,
    agentPrice: 70000,
    stock: 15,
  },
  {
    id: '5',
    name: 'ເຊລັ່ມວິຕາມິນຊີ Vitamin C Brightening Serum',
    category: 'ບຳລຸງຜິວ',
    costPrice: 75000,
    salePrice: 120000,
    promoPrice: 110000,
    agentPrice: 95000,
    stock: 10,
  },
  {
    id: '6',
    name: 'ສະບູ່ສະໝຸນໄພ ທຳມະຊາດ Herbal Soap',
    category: 'ທຳຄວາມສະອາດ',
    costPrice: 12000,
    salePrice: 25000,
    promoPrice: 22000,
    agentPrice: 18000,
    stock: 25,
  },
];

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'M001',
    name: 'ສົມສີ ໄຊຍະວົງ (Somsy)',
    phone: '020 5555 1234',
    address: 'ນະຄອນຫຼວງວຽງຈັນ',
    tier: 'general',
  },
  {
    id: 'M002',
    name: 'ມານີວອນ ແກ້ວມະນີ (Maneevone)',
    phone: '020 5678 8899',
    address: 'ຫຼວງພະບາງ',
    tier: 'promo',
  },
  {
    id: 'M003',
    name: 'ຄໍາຫຼ້າ ພອນສະຫວັນ (Khamla)',
    phone: '020 9988 7766',
    address: 'ປາກເຊ',
    tier: 'agent',
  },
];

const INITIAL_SETTINGS: AppSettings = {
  storeName: 'ຮ້ານ ແພງສອນ ຂາຍ Online',
  storeGreeting: 'ຍິນດີຕ້ອນຮັບ',
  adminPass: '11222',
  logoEmoji: '🛒🛍️',
  logoUrl: '',
  logoBorderSpeed: 10,
  fontSize: 'normal',
  textColor: '#f1f5f9',
  numberColor: '#34d399',
  defaultPriceTier: 'general',
};

export default function POSIndex() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'admin' | 'reports' | 'settings'>('pos');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);

  // Core States
  const [products, setProducts] = useState<Product[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [stockInHistory, setStockInHistory] = useState<StockInRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);

  // Clock & Lao Date States
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('00:00:00');
  const [currentLaoDateStr, setCurrentLaoDateStr] = useState<string>('');

  // POS States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTier, setSelectedTier] = useState<'general' | 'promo' | 'agent'>('general');
  const [productSearch, setProductSearch] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberSearch, setMemberSearch] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [lastReceipt, setLastReceipt] = useState<SaleRecord | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  // Admin States
  const [adminSubTab, setAdminSubTab] = useState<'products' | 'members' | 'stockin' | 'general'>('products');
  const [productForm, setProductForm] = useState<Partial<Product>>({
    id: '',
    name: '',
    category: 'ທົ່ວໄປ',
    costPrice: 0,
    salePrice: 0,
    promoPrice: 0,
    agentPrice: 0,
    stock: 0,
  });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<Partial<Member>>({
    id: '',
    name: '',
    phone: '',
    address: '',
    tier: 'general',
  });
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Stock In Form
  const [stockInForm, setStockInForm] = useState({
    productId: '',
    quantity: 1,
    costPrice: 0,
    supplierNote: 'ຮັບສິນຄ້າເຂົ້າສາງ',
  });

  // Report States
  const [reportFilter, setReportFilter] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('today');
  const [reportSearch, setReportSearch] = useState<string>('');

  // Refs for POS shortcuts
  const cashInputRef = useRef<HTMLInputElement>(null);

  // Dark Swal Helper
  const showDarkSwal = (options: any) => {
    return Swal.fire({
      customClass: {
        popup: 'dark-swal',
        title: 'dark-swal-title',
        htmlContainer: 'dark-swal-html',
        input: 'dark-swal-input',
      },
      background: '#0f172a',
      color: '#f8fafc',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      ...options,
    });
  };

  // Load Initial Data from LocalStorage
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('pos_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('pos_products', JSON.stringify(INITIAL_PRODUCTS));
      }

      const savedMembers = localStorage.getItem('pos_members');
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      } else {
        setMembers(INITIAL_MEMBERS);
        localStorage.setItem('pos_members', JSON.stringify(INITIAL_MEMBERS));
      }

      const savedSales = localStorage.getItem('pos_sales');
      if (savedSales) {
        setSalesHistory(JSON.parse(savedSales));
      }

      const savedStockIn = localStorage.getItem('pos_stockin');
      if (savedStockIn) {
        setStockInHistory(JSON.parse(savedStockIn));
      }

      const savedSettings = localStorage.getItem('pos_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.error('Failed to load localStorage data', e);
      setProducts(INITIAL_PRODUCTS);
      setMembers(INITIAL_MEMBERS);
    }
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('pos_products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (members.length > 0) {
      localStorage.setItem('pos_members', JSON.stringify(members));
    }
  }, [members]);

  useEffect(() => {
    localStorage.setItem('pos_sales', JSON.stringify(salesHistory));
  }, [salesHistory]);

  useEffect(() => {
    localStorage.setItem('pos_stockin', JSON.stringify(stockInHistory));
  }, [stockInHistory]);

  useEffect(() => {
    localStorage.setItem('pos_settings', JSON.stringify(settings));
    document.documentElement.style.setProperty('--app-text-color', settings.textColor);
    document.documentElement.style.setProperty('--app-number-color', settings.numberColor);
  }, [settings]);

  // Real-time Clock & Lao Date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Time string format: HH:mm:ss
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTimeStr(`${hours}:${minutes}:${seconds}`);

      // Lao Days & Months
      const laoDays = [
        'ວັນອາທິດ',
        'ວັນຈັນ',
        'ວັນອັງຄານ',
        'ວັນພຸດ',
        'ວັນພະຫັດ',
        'ວັນສຸກ',
        'ວັນເສົາ',
      ];
      const laoMonths = [
        'ມັງກອນ',
        'ກຸມພາ',
        'ມີນາ',
        'ເມສາ',
        'ພຶດສະພາ',
        'ມິຖຸນາ',
        'ກໍລະກົດ',
        'ສິງຫາ',
        'ກັນຍາ',
        'ຕຸລາ',
        'ພະຈິກ',
        'ທັນວາ',
      ];

      const dayName = laoDays[now.getDay()];
      const dayNum = now.getDate();
      const monthName = laoMonths[now.getMonth()];
      const yearCE = now.getFullYear();

      setCurrentLaoDateStr(`${dayName} ທີ ${dayNum} ${monthName} ${yearCE}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format Kip Currency
  const formatKip = (amount: number) => {
    return `₭${(amount || 0).toLocaleString('en-US')}`;
  };

  // Switch Tier when Customer is Selected
  const handleSelectMember = (member: Member | null) => {
    setSelectedMember(member);
    if (member) {
      setSelectedTier(member.tier);
      // Update cart item unit prices according to new tier
      setCart((prev) =>
        prev.map((item) => {
          let newPrice = item.product.salePrice;
          if (member.tier === 'promo') newPrice = item.product.promoPrice;
          if (member.tier === 'agent') newPrice = item.product.agentPrice;
          return { ...item, unitPrice: newPrice };
        })
      );
    }
  };

  // Change Tier Manually
  const handleTierChange = (tier: 'general' | 'promo' | 'agent') => {
    setSelectedTier(tier);
    setCart((prev) =>
      prev.map((item) => {
        let newPrice = item.product.salePrice;
        if (tier === 'promo') newPrice = item.product.promoPrice;
        if (tier === 'agent') newPrice = item.product.agentPrice;
        return { ...item, unitPrice: newPrice };
      })
    );
  };

  // Add Product to Cart
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      showDarkSwal({
        icon: 'error',
        title: 'ສິນຄ້າໝົດສະຕ໊ອກ!',
        text: `ສິນຄ້າ ${product.name} ຍັງເຫຼືອ 0 ຊິ້ນໃນສາງ`,
      });
      return;
    }

    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let unitPrice = product.salePrice;
    if (selectedTier === 'promo') unitPrice = product.promoPrice;
    if (selectedTier === 'agent') unitPrice = product.agentPrice;

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty + 1 > product.stock) {
        showDarkSwal({
          icon: 'warning',
          title: 'ຈຳນວນເກີນສະຕ໊ອກ!',
          text: `ສິນຄ້າໃນສາງມີພຽງ ${product.stock} ຊິ້ນເທົ່ານັ້ນ`,
        });
        return;
      }
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { product, quantity: 1, unitPrice }]);
    }
  };

  // Update Cart Item Quantity
  const handleUpdateCartQty = (productId: string, newQty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    if (newQty > product.stock) {
      showDarkSwal({
        icon: 'warning',
        title: 'ຈຳນວນເກີນສະຕ໊ອກ!',
        text: `ສິນຄ້າໃນສາງມີພຽງ ${product.stock} ຊິ້ນເທົ່ານັ້ນ`,
      });
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  // Update Cart Item Custom Unit Price
  const handleUpdateCartUnitPrice = async (productId: string, currentPrice: number) => {
    const { value: newPriceStr } = await showDarkSwal({
      title: 'ປັບລາຄາຂາຍສິນຄ້າ',
      input: 'number',
      inputValue: currentPrice,
      inputLabel: 'ໃສ່ລາຄາໃໝ່ (₭)',
      showCancelButton: true,
      confirmButtonText: 'ບັນທຶກ',
      cancelButtonText: 'ຍົກເລີກ',
    });

    if (newPriceStr !== undefined && newPriceStr !== null) {
      const parsedPrice = parseFloat(newPriceStr);
      if (!isNaN(parsedPrice) && parsedPrice >= 0) {
        setCart((prev) =>
          prev.map((item) =>
            item.product.id === productId ? { ...item, unitPrice: parsedPrice } : item
          )
        );
      }
    }
  };

  // Remove Item from Cart
  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Clear Cart
  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    setCashReceived('');
  };

  // Cart Calculations
  const grandTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const grandCost = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.costPrice * item.quantity, 0);
  }, [cart]);

  const parsedCashReceived = useMemo(() => {
    return parseFloat(cashReceived) || 0;
  }, [cashReceived]);

  const changeAmount = useMemo(() => {
    return Math.max(0, parsedCashReceived - grandTotal);
  }, [parsedCashReceived, grandTotal]);

  // Checkout Payment
  const handleConfirmPayment = async () => {
    if (cart.length === 0) {
      showDarkSwal({
        icon: 'info',
        title: 'ກະຕ່າສິນຄ້າວ່າງເປົ່າ!',
        text: 'ກະລຸນາເລືອກສິນຄ້າໃສ່ກະຕ່າກ່ອນຊຳລະເງິນ',
      });
      return;
    }

    if (parsedCashReceived < grandTotal) {
      showDarkSwal({
        icon: 'error',
        title: 'ຈຳນວນເງິນບໍ່ພຽງພໍ!',
        text: `ຍອດລວມແມ່ນ ${formatKip(grandTotal)} ແຕ່ຮັບມາພຽງ ${formatKip(parsedCashReceived)}`,
      });
      return;
    }

    // Process Sale Record
    const saleId = 'INV-' + Date.now().toString().slice(-6);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timestampStr = now.toLocaleDateString('lo-LA') + ' ' + now.toLocaleTimeString('lo-LA');

    const saleItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      costPrice: item.product.costPrice,
      subtotal: item.unitPrice * item.quantity,
      subtotalCost: item.product.costPrice * item.quantity,
    }));

    const newSaleRecord: SaleRecord = {
      id: saleId,
      timestamp: timestampStr,
      date: dateStr,
      items: saleItems,
      totalAmount: grandTotal,
      totalCost: grandCost,
      profit: grandTotal - grandCost,
      cashReceived: parsedCashReceived,
      change: changeAmount,
      customerId: selectedMember?.id || 'ທົ່ວໄປ',
      customerName: selectedMember?.name || 'ລູກຄ້າທົ່ວໄປ',
      customerTier: selectedTier,
      paymentMethod: 'ເງິນສົດ (Cash)',
    };

    // Deduct stock in products state
    setProducts((prev) =>
      prev.map((p) => {
        const inCart = cart.find((item) => item.product.id === p.id);
        if (inCart) {
          return { ...p, stock: Math.max(0, p.stock - inCart.quantity) };
        }
        return p;
      })
    );

    // Save Sale Record
    setSalesHistory((prev) => [newSaleRecord, ...prev]);
    setLastReceipt(newSaleRecord);
    setShowReceiptModal(true);

    // Reset Cart
    setCart([]);
    setCashReceived('');
    setSelectedMember(null);

    // Success Notification
    showDarkSwal({
      icon: 'success',
      title: 'ຊຳລະເງິນສຳເລັດແລ້ວ! 🎉',
      html: `
        <div class="text-left py-2 text-slate-200">
          <p>ເລກທີບິນ: <strong class="text-cyan-400">${saleId}</strong></p>
          <p>ຍອດລວມ: <strong class="text-emerald-400">${formatKip(grandTotal)}</strong></p>
          <p>ຮັບມາ: <strong class="text-white">${formatKip(parsedCashReceived)}</strong></p>
          <p>ເງິນທອນ: <strong class="text-emerald-400">${formatKip(changeAmount)}</strong></p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '🖨️ ພິມໃບບິນ',
      cancelButtonText: 'ປິດໜ້າຕ່າງ',
    }).then((res) => {
      if (res.isConfirmed) {
        setTimeout(() => {
          window.print();
        }, 300);
      }
    });
  };

  // Keyboard Shortcuts: Space for Exact Cash, Enter for Checkout
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'pos') return;

      // Don't trigger if user is typing in standard text inputs (except quick shortcut conditions)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      // Spacebar to auto-set Exact Amount (when cart has items and not inside a text search box)
      if (e.code === 'Space' && (!isInput || target.id === 'cash-received-input')) {
        if (cart.length > 0 && grandTotal > 0) {
          e.preventDefault();
          setCashReceived(grandTotal.toString());
        }
      }

      // Enter to trigger checkout if inside cash input or on main screen
      if (e.key === 'Enter') {
        if (cart.length > 0 && parsedCashReceived >= grandTotal && grandTotal > 0) {
          e.preventDefault();
          handleConfirmPayment();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, cart, grandTotal, parsedCashReceived, changeAmount]);

  // Admin Password Gate
  const handleNavigateAdmin = async () => {
    if (isAdminUnlocked) {
      setActiveTab('admin');
      return;
    }

    const { value: enteredPassword } = await showDarkSwal({
      title: '🔐 ລະບົບປ້ອງກັນ Admin Panel',
      input: 'password',
      inputLabel: 'ກະລຸນາໃສ່ລະຫັດຜ່ານເພື່ອເຂົ້າສູ່ລະບົບ',
      inputPlaceholder: 'ລະຫັດຜ່ານ (ຄ່າເລີ່ມຕົ້ນ: 11222)',
      showCancelButton: true,
      confirmButtonText: 'ເຂົ້າສູ່ລະບົບ',
      cancelButtonText: 'ຍົກເລີກ',
      inputValidator: (value) => {
        if (!value) {
          return 'ກະລຸນາໃສ່ລະຫັດຜ່ານ!';
        }
      },
    });

    if (enteredPassword !== undefined) {
      if (enteredPassword === settings.adminPass) {
        setIsAdminUnlocked(true);
        setActiveTab('admin');
        showDarkSwal({
          icon: 'success',
          title: 'ຍິນດີຕ້ອນຮັບສູ່ Admin Panel 🛡️',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        showDarkSwal({
          icon: 'error',
          title: 'ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ!',
          text: 'ກະລຸນາກວດສອບລະຫັດຜ່ານແລ້ວລອງໃໝ່ອີກຄັ້ງ',
        });
      }
    }
  };

  // Product Management Functions
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.id || !productForm.name) {
      showDarkSwal({
        icon: 'warning',
        title: 'ຂໍ້ມູນບໍ່ຄົບຖ້ວນ!',
        text: 'ກະລຸນາໃສ່ລະຫັດ ID ແລະ ຊື່ສິນຄ້າ',
      });
      return;
    }

    // Check duplicate ID
    if (!editingProductId) {
      const exists = products.some((p) => p.id.trim().toLowerCase() === productForm.id?.trim().toLowerCase());
      if (exists) {
        showDarkSwal({
          icon: 'error',
          title: 'ລະຫັດ ID ຊໍ້າກັນ!',
          text: `ລະຫັດ ID "${productForm.id}" ມີໃນລະບົບແລ້ວ ຫ້າມບັນທຶກຊໍ້າກັນ!`,
        });
        return;
      }
    }

    const finalProduct: Product = {
      id: productForm.id.trim(),
      name: productForm.name.trim(),
      category: productForm.category || 'ທົ່ວໄປ',
      costPrice: Number(productForm.costPrice) || 0,
      salePrice: Number(productForm.salePrice) || 0,
      promoPrice: Number(productForm.promoPrice) || Number(productForm.salePrice) || 0,
      agentPrice: Number(productForm.agentPrice) || Number(productForm.salePrice) || 0,
      stock: Number(productForm.stock) || 0,
    };

    if (editingProductId) {
      setProducts((prev) => prev.map((p) => (p.id === editingProductId ? finalProduct : p)));
      setEditingProductId(null);
      showDarkSwal({ icon: 'success', title: 'ແກ້ໄຂສິນຄ້າສຳເລັດ! ✅', timer: 1500, showConfirmButton: false });
    } else {
      setProducts((prev) => [...prev, finalProduct]);
      showDarkSwal({ icon: 'success', title: 'ເພີ່ມສິນຄ້າໃໝ່ສຳເລັດ! 📦', timer: 1500, showConfirmButton: false });
    }

    setProductForm({
      id: '',
      name: '',
      category: 'ທົ່ວໄປ',
      costPrice: 0,
      salePrice: 0,
      promoPrice: 0,
      agentPrice: 0,
      stock: 0,
    });
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm(prod);
    setAdminSubTab('products');
  };

  const handleDeleteProduct = (productId: string) => {
    showDarkSwal({
      title: 'ຢືນຢັນການລົບສິນຄ້າ?',
      text: 'ທ່ານຕ້ອງການລົບສິນຄ້ານີ້ແທ້ຫຼືບໍ່?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ລົບສິນຄ້າ',
      cancelButtonText: 'ຍົກເລີກ',
      confirmButtonColor: '#ef4444',
    }).then((res) => {
      if (res.isConfirmed) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        showDarkSwal({ icon: 'success', title: 'ລົບສິນຄ້າແລ້ວ!', timer: 1200, showConfirmButton: false });
      }
    });
  };

  // Member Management Functions
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.id || !memberForm.name) {
      showDarkSwal({
        icon: 'warning',
        title: 'ຂໍ້ມູນບໍ່ຄົບຖ້ວນ!',
        text: 'ກະລຸນາໃສ່ລະຫັດ ID ແລະ ຊື່ສະມາຊິກ',
      });
      return;
    }

    // Check duplicate ID
    if (!editingMemberId) {
      const exists = members.some((m) => m.id.trim().toLowerCase() === memberForm.id?.trim().toLowerCase());
      if (exists) {
        showDarkSwal({
          icon: 'error',
          title: 'ລະຫັດສະມາຊິກຊໍ້າກັນ!',
          text: `ລະຫັດ ID "${memberForm.id}" ມີໃນລະບົບແລ້ວ! ຫ້າມບັນທຶກຊໍ້າກັນ`,
        });
        return;
      }
    }

    const finalMember: Member = {
      id: memberForm.id.trim(),
      name: memberForm.name.trim(),
      phone: memberForm.phone?.trim() || '',
      address: memberForm.address?.trim() || '',
      tier: memberForm.tier || 'general',
    };

    if (editingMemberId) {
      setMembers((prev) => prev.map((m) => (m.id === editingMemberId ? finalMember : m)));
      setEditingMemberId(null);
      showDarkSwal({ icon: 'success', title: 'ແກ້ໄຂສະມາຊິກສຳເລັດ! ✅', timer: 1500, showConfirmButton: false });
    } else {
      setMembers((prev) => [...prev, finalMember]);
      showDarkSwal({ icon: 'success', title: 'ເພີ່ມສະມາຊິກໃໝ່ສຳເລັດ! 👫🏻', timer: 1500, showConfirmButton: false });
    }

    setMemberForm({
      id: '',
      name: '',
      phone: '',
      address: '',
      tier: 'general',
    });
  };

  const handleEditMember = (mem: Member) => {
    setEditingMemberId(mem.id);
    setMemberForm(mem);
    setAdminSubTab('members');
  };

  const handleDeleteMember = (memberId: string) => {
    showDarkSwal({
      title: 'ຢືນຢັນການລົບສະມາຊິກ?',
      text: 'ທ່ານຕ້ອງການລົບລູກຄ້າສະມາຊິກນີ້ແທ້ຫຼືບໍ່?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ລົບ',
      cancelButtonText: 'ຍົກເລີກ',
      confirmButtonColor: '#ef4444',
    }).then((res) => {
      if (res.isConfirmed) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        showDarkSwal({ icon: 'success', title: 'ລົບສະມາຊິກແລ້ວ!', timer: 1200, showConfirmButton: false });
      }
    });
  };

  // Stock Inbound Reception
  const handleStockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInForm.productId || stockInForm.quantity <= 0) {
      showDarkSwal({
        icon: 'warning',
        title: 'ກະລຸນາເລືອກສິນຄ້າ ແລະ ຈຳນວນທີ່ຖືກຕ້ອງ',
      });
      return;
    }

    const prod = products.find((p) => p.id === stockInForm.productId);
    if (!prod) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timestampStr = now.toLocaleDateString('lo-LA') + ' ' + now.toLocaleTimeString('lo-LA');

    const newRecord: StockInRecord = {
      id: 'IN-' + Date.now().toString().slice(-6),
      productId: prod.id,
      productName: prod.name,
      quantity: Number(stockInForm.quantity),
      costPrice: Number(stockInForm.costPrice) || prod.costPrice,
      date: dateStr,
      timestamp: timestampStr,
      supplierNote: stockInForm.supplierNote || 'ຮັບເຂົ້າສາງ',
    };

    // Add to stock history and update product inventory
    setStockInHistory((prev) => [newRecord, ...prev]);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === prod.id
          ? {
              ...p,
              stock: p.stock + Number(stockInForm.quantity),
              costPrice: Number(stockInForm.costPrice) > 0 ? Number(stockInForm.costPrice) : p.costPrice,
            }
          : p
      )
    );

    showDarkSwal({
      icon: 'success',
      title: 'ບັນທຶກການຮັບສິນຄ້າສຳເລັດ! 📥',
      text: `ເພີ່ມສິນຄ້າ ${prod.name} ຈຳນວນ ${stockInForm.quantity} ຊິ້ນເຂົ້າສາງແລ້ວ`,
      timer: 2000,
      showConfirmButton: false,
    });

    setStockInForm({
      productId: '',
      quantity: 1,
      costPrice: 0,
      supplierNote: 'ຮັບສິນຄ້າເຂົ້າສາງ',
    });
  };

  // Reports Filtered Data
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return salesHistory.filter((sale) => {
      // Date filter
      if (reportFilter === 'today') {
        if (sale.date !== todayStr) return false;
      } else if (reportFilter === 'week') {
        const saleDate = new Date(sale.date);
        const diffDays = (now.getTime() - saleDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7) return false;
      } else if (reportFilter === 'month') {
        const saleMonth = sale.date.slice(0, 7);
        const currentMonth = todayStr.slice(0, 7);
        if (saleMonth !== currentMonth) return false;
      } else if (reportFilter === 'year') {
        const saleYear = sale.date.slice(0, 4);
        const currentYear = todayStr.slice(0, 4);
        if (saleYear !== currentYear) return false;
      }

      // Search filter
      if (reportSearch.trim()) {
        const q = reportSearch.toLowerCase();
        const matchesId = sale.id.toLowerCase().includes(q);
        const matchesCustomer = sale.customerName.toLowerCase().includes(q);
        const matchesItem = sale.items.some((item) => item.productName.toLowerCase().includes(q));
        return matchesId || matchesCustomer || matchesItem;
      }

      return true;
    });
  }, [salesHistory, reportFilter, reportSearch]);

  // Report Summary Statistics
  const reportTotals = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    let profit = 0;
    filteredSales.forEach((sale) => {
      revenue += sale.totalAmount;
      cost += sale.totalCost;
      profit += sale.profit;
    });
    return {
      revenue,
      cost,
      profit,
      count: filteredSales.length,
    };
  }, [filteredSales]);

  // Top 3 Best Sellers
  const topSellingProducts = useMemo(() => {
    const map: { [id: string]: { id: string; name: string; qty: number; revenue: number } } = {};
    salesHistory.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!map[item.productId]) {
          map[item.productId] = {
            id: item.productId,
            name: item.productName,
            qty: 0,
            revenue: 0,
          };
        }
        map[item.productId].qty += item.quantity;
        map[item.productId].revenue += item.subtotal;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 3);
  }, [salesHistory]);

  // Dashboard 7-day Sales Chart Data
  const last7DaysChartData = useMemo(() => {
    const days: string[] = [];
    const salesValues: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
      days.push(dayLabel);

      const dayTotal = salesHistory
        .filter((s) => s.date === dateStr)
        .reduce((sum, s) => sum + s.totalAmount, 0);
      salesValues.push(dayTotal);
    }

    return {
      labels: days,
      datasets: [
        {
          label: 'ຍອດຂາຍ (₭)',
          data: salesValues,
          backgroundColor: 'rgba(6, 182, 212, 0.65)',
          borderColor: '#06b6d4',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: '#22d3ee',
        },
      ],
    };
  }, [salesHistory]);

  // Donut Chart Data (Top 5 Products / Category Sales)
  const donutChartData = useMemo(() => {
    const map: { [name: string]: number } = {};
    salesHistory.forEach((sale) => {
      sale.items.forEach((item) => {
        map[item.productName] = (map[item.productName] || 0) + item.subtotal;
      });
    });

    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const labels = sorted.map((item) => item[0].slice(0, 15) + (item[0].length > 15 ? '...' : ''));
    const dataValues = sorted.map((item) => item[1]);

    if (labels.length === 0) {
      return {
        labels: ['ຍັງບໍ່ມີຂໍ້ມູນ'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#334155'],
            borderColor: '#1e293b',
          },
        ],
      };
    }

    return {
      labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: [
            '#06b6d4',
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ec4899',
          ],
          borderColor: '#0f172a',
          borderWidth: 2,
        },
      ],
    };
  }, [salesHistory]);

  // Export to CSV with UTF-8 BOM for Lao text
  const exportToExcelCSV = () => {
    if (filteredSales.length === 0) {
      showDarkSwal({ icon: 'info', title: 'ບໍ່ມີຂໍ້ມູນທີ່ຈະສົ່ງອອກ!' });
      return;
    }

    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'ເລກທີບິນ,ວັນທີເວລາ,ຊື່ລູກຄ້າ,ສະຖານະ,ລາຍການສິນຄ້າ,ຍອດລວມ(₭),ຕົ້ນທຶນ(₭),ກຳໄລ(₭)\n';

    filteredSales.forEach((sale) => {
      const itemsDetail = sale.items
        .map((i) => `${i.productName} x${i.quantity}`)
        .join(' | ')
        .replace(/,/g, ' ');
      csvContent += `"${sale.id}","${sale.timestamp}","${sale.customerName}","${sale.customerTier}","${itemsDetail}",${sale.totalAmount},${sale.totalCost},${sale.profit}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showDarkSwal({
      icon: 'success',
      title: 'ດາວໂຫຼດ Excel/CSV ສຳເລັດແລ້ວ! 📊',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // Export to PDF / Print Report
  const exportToPDF = () => {
    window.print();
  };

  // Filtered Products in POS Tab
  const posFilteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  // Filtered Members in POS Member Search
  const posFilteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members.slice(0, 6);
    const q = memberSearch.toLowerCase();
    return members.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

  // 5 Real-time Dashboard Summary Cards calculation
  const totalStockCount = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stock, 0);
  }, [products]);

  const todayRevenue = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return salesHistory
      .filter((s) => s.date === todayStr)
      .reduce((sum, s) => sum + s.totalAmount, 0);
  }, [salesHistory]);

  const totalCostAllTime = useMemo(() => {
    return salesHistory.reduce((sum, s) => sum + s.totalCost, 0);
  }, [salesHistory]);

  const totalProfitAllTime = useMemo(() => {
    return salesHistory.reduce((sum, s) => sum + s.profit, 0);
  }, [salesHistory]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-darkbg-950 text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Head>
        <title>{settings.storeName} - POS Realtime</title>
      </Head>

      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside className="w-64 flex-shrink-0 flex flex-col justify-between border-r border-slate-800/80 bg-darkbg-900/95 backdrop-blur-md z-20">
        {/* Top Logo & Store Name */}
        <div>
          <div className="p-4 flex items-center space-x-3 border-b border-slate-800/60">
            {/* Animated Rainbow Glowing Logo */}
            <div
              className="w-12 h-12 rounded-full border-4 rainbow-logo-border flex items-center justify-center bg-slate-900 text-2xl shadow-lg flex-shrink-0"
              style={{ animationDuration: `${settings.logoBorderSpeed || 10}s` }}
            >
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{settings.logoEmoji || '🛒🛍️'}</span>
              )}
            </div>

            <div className="overflow-hidden">
              <h1 className="text-base font-bold text-cyan-400 truncate drop-shadow-md">
                {settings.storeName}
              </h1>
              <p className="text-xs text-slate-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400 inline" />
                <span>{settings.storeGreeting}</span>
              </p>
            </div>
          </div>

          {/* Navigation Menu Items */}
          <nav className="p-3 space-y-1.5 mt-2">
            {/* 1. Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'sidebar-item-active text-cyan-300'
                  : 'text-slate-300 sidebar-item-hover'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0 text-cyan-400" />
              <span className="truncate">ໜ້າຫຼັກ (Dashboard)</span>
            </button>

            {/* 2. POS */}
            <button
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'pos'
                  ? 'sidebar-item-active text-cyan-300'
                  : 'text-slate-300 sidebar-item-hover'
              }`}
            >
              <ShoppingCart className="w-5 h-5 flex-shrink-0 text-cyan-400" />
              <span className="truncate">ຂາຍສິນຄ້າ (POS)</span>
            </button>

            {/* 3. Admin Panel */}
            <button
              onClick={handleNavigateAdmin}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'sidebar-item-active text-cyan-300'
                  : 'text-slate-300 sidebar-item-hover'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-amber-400" />
                <span className="truncate">ຈັດການລະບົບ (Admin)</span>
              </div>
              {!isAdminUnlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* 4. Sales Report */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'reports'
                  ? 'sidebar-item-active text-cyan-300'
                  : 'text-slate-300 sidebar-item-hover'
              }`}
            >
              <BarChart3 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span className="truncate">ລາຍງານຍອດຂາຍ</span>
            </button>

            {/* 5. Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'sidebar-item-active text-cyan-300'
                  : 'text-slate-300 sidebar-item-hover'
              }`}
            >
              <Settings className="w-5 h-5 flex-shrink-0 text-indigo-400" />
              <span className="truncate">ການຕັ້ງຄ່າ</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Version */}
        <div className="p-4 border-t border-slate-800/60">
          <div className="glass-card py-2 px-3 rounded-lg text-center text-xs text-slate-400 flex items-center justify-between">
            <span className="font-mono">POS System v2.0</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-darkbg-950">
        {/* TOP BAR / HEADER */}
        <header className="h-16 flex-shrink-0 px-6 border-b border-slate-800/70 bg-darkbg-900/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {activeTab === 'dashboard' && '🏠 ໜ້າຫຼັກ ສະຫຼຸບພາບລວມ (Dashboard)'}
              {activeTab === 'pos' && '💸 ຈຸດຂາຍສິນຄ້າ ແລະ ຊຳລະເງິນ (Point of Sale)'}
              {activeTab === 'admin' && '🛡️ ຈັດການລະບົບຫຼັງບ້ານ (Admin Management)'}
              {activeTab === 'reports' && '📊 ລາຍງານສະຖິຕິຍອດຂາຍ (Sales Analytics)'}
              {activeTab === 'settings' && '⚙️ ການຕັ້ງຄ່າລະບົບ ແລະ ຖານຂໍ້ມູນ (Settings)'}
            </span>
          </div>

          {/* Real-time Digital Clock, Lao Date & Online Status Badge */}
          <div className="flex items-center space-x-4">
            {/* Real-time Large Clock & Lao Full Date with C.E. */}
            <div className="text-right">
              <div className="font-clock text-xl md:text-2xl font-bold text-cyan-400 tracking-wider">
                {currentTimeStr}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {currentLaoDateStr}
              </div>
            </div>

            {/* Online Status Pill */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>online</span>
            </div>
          </div>
        </header>

        {/* ==================== TAB 1: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Welcome Greeting Banner */}
            <div className="glass-card-glow rounded-2xl p-6 bg-gradient-to-r from-slate-900/90 via-cyan-950/40 to-slate-900/90 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-white flex items-center space-x-2">
                  <span>ຍິນດີຕ້ອນຮັບສູ່ {settings.storeName}</span>
                  <span className="text-2xl">✨</span>
                </h2>
                <p className="text-sm text-cyan-300/80 mt-1">
                  ລະບົບ POS ອອນລາຍ Real-time ຄົບວົງຈອນ ພ້ອມສະຖິຕິການຂາຍ ແລະ ຈັດການສາງສິນຄ້າ
                </p>
              </div>
              <button
                onClick={() => setActiveTab('pos')}
                className="mt-4 md:mt-0 flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>ໄປໜ້າຂາຍສິນຄ້າ</span>
              </button>
            </div>

            {/* 5 Real-Time Summary Cards in Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 1. Total Stock */}
              <div className="glass-card p-4 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">ຈຳນວນສິນຄ້າໃນສາງ</span>
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold text-blue-400">
                  {totalStockCount.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ຊິ້ນ</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">{products.length} ລາຍການສິນຄ້າ</div>
              </div>

              {/* 2. Today's Revenue */}
              <div className="glass-card p-4 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">ຍອດຂາຍມື້ນີ້</span>
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold text-emerald-400">
                  {formatKip(todayRevenue)}
                </div>
                <div className="text-xs text-slate-400 mt-1">ອັບເດດ Real-time</div>
              </div>

              {/* 3. Total Members */}
              <div className="glass-card p-4 rounded-xl border border-slate-700/50 hover:border-amber-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">ຈຳນວນລູກຄ້າສະມາຊິກ</span>
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold text-amber-400">
                  {members.length} <span className="text-xs text-slate-400 font-normal">ຄົນ</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">ສະມາຊິກທີ່ລົງທະບຽນ</div>
              </div>

              {/* 4. Total Cost */}
              <div className="glass-card p-4 rounded-xl border border-slate-700/50 hover:border-rose-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">ຕົ້ນທຶນລວມ</span>
                  <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                    <Boxes className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold text-rose-400">
                  {formatKip(totalCostAllTime)}
                </div>
                <div className="text-xs text-slate-400 mt-1">ຕົ້ນທຶນສິນຄ້າທີ່ຂາຍໄດ້</div>
              </div>

              {/* 5. Total Profit */}
              <div className="glass-card p-4 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">ກຳໄລລວມ</span>
                  <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold text-cyan-400">
                  {formatKip(totalProfitAllTime)}
                </div>
                <div className="text-xs text-slate-400 mt-1">ກຳໄລສຸດທິ</div>
              </div>
            </div>

            {/* Charts Section: 7-Day Bar Chart & Donut Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bar Chart (7 Days Sales) */}
              <div className="lg:col-span-2 glass-card p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-cyan-400 flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>ກຣາບຍອດຂາຍຍ້ອນຫຼັງ 7 ມື້ (Bar Chart)</span>
                  </h3>
                  <span className="text-xs text-slate-400">ສະກູນເງິນ: ກີບ (₭)</span>
                </div>
                <div className="h-64">
                  <Bar
                    data={last7DaysChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (ctx) => `ຍອດຂາຍ: ₭${(ctx.parsed.y || 0).toLocaleString()}`,
                          },
                        },
                      },
                      scales: {
                        x: {
                          ticks: { color: '#94a3b8' },
                          grid: { color: 'rgba(51, 65, 85, 0.2)' },
                        },
                        y: {
                          ticks: {
                            color: '#94a3b8',
                            callback: (v) => `${(Number(v) / 1000).toLocaleString()}k`,
                          },
                          grid: { color: 'rgba(51, 65, 85, 0.2)' },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Donut Chart (Sales Proportion) */}
              <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-cyan-400 flex items-center space-x-2">
                    <span>ສັດສ່ວນສິນຄ້າຂາຍດີ</span>
                  </h3>
                  <span className="text-xs text-slate-400">Donut Chart</span>
                </div>
                <div className="h-56 flex items-center justify-center">
                  <Doughnut
                    data={donutChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { color: '#94a3b8', boxWidth: 10, font: { size: 10 } },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Transactions Mini Table */}
            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span>ລາຍການຂາຍຫຼ້າສຸດ (Recent Invoices)</span>
                </h3>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  ເບິ່ງທັງໝົດ →
                </button>
              </div>

              {salesHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  ຍັງບໍ່ມີປະຫວັດການຂາຍ
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2.5 px-3">ເລກທີບິນ</th>
                        <th className="py-2.5 px-3">ວັນທີ & ເວລາ</th>
                        <th className="py-2.5 px-3">ລູກຄ້າ</th>
                        <th className="py-2.5 px-3">ຈຳນວນ</th>
                        <th className="py-2.5 px-3 text-right">ຍອດລວມ</th>
                        <th className="py-2.5 px-3 text-right">ກຳໄລ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {salesHistory.slice(0, 5).map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono text-cyan-400 font-medium">{sale.id}</td>
                          <td className="py-2.5 px-3 text-slate-300">{sale.timestamp}</td>
                          <td className="py-2.5 px-3 text-slate-200">{sale.customerName}</td>
                          <td className="py-2.5 px-3 text-slate-400">
                            {sale.items.reduce((s, i) => s + i.quantity, 0)} ຊິ້ນ
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                            {formatKip(sale.totalAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-cyan-400">
                            {formatKip(sale.profit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: POS SALES REGISTER (MATCHES USER SCREENSHOT) ==================== */}
        {activeTab === 'pos' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* POS LEFT SIDE: SEARCH, TIER & PRODUCT GRID */}
            <div className="flex-1 flex flex-col border-r border-slate-800/80 p-5 overflow-hidden">
              {/* Search Bar & Tier Dropdown Selector (Exact match to screenshot) */}
              <div className="flex items-center space-x-3 mb-4 flex-shrink-0">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="🔍 ຄົ້ນຫາ ID ຫຼື ຊື່ສິນຄ້າ..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-400 focus:ring-1 focus:ring-cyan-500"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Price Tier Dropdown Selector */}
                <div className="relative w-44">
                  <select
                    value={selectedTier}
                    onChange={(e) => handleTierChange(e.target.value as any)}
                    className="w-full py-2.5 px-3 pr-8 rounded-xl glass-input text-xs font-semibold text-cyan-300 appearance-none cursor-pointer focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="general" className="bg-slate-900 text-white">
                      ລາຄາຂາຍທົ່ວໄປ
                    </option>
                    <option value="promo" className="bg-slate-900 text-amber-300">
                      ລາຄາໂປຣ (Promo)
                    </option>
                    <option value="agent" className="bg-slate-900 text-emerald-300">
                      ລາຄາຕົວແທນ (Agent)
                    </option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
                </div>
              </div>

              {/* Product Cards Grid (Matches screenshot layout) */}
              <div className="flex-1 overflow-y-auto pr-1">
                {posFilteredProducts.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm">
                    <Package className="w-12 h-12 mb-2 stroke-[1.5] text-slate-600" />
                    <span>ບໍ່ພົບສິນຄ້າທີ່ກົງກັບການຄົ້ນຫາ</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                    {posFilteredProducts.map((product) => {
                      let activePrice = product.salePrice;
                      if (selectedTier === 'promo') activePrice = product.promoPrice;
                      if (selectedTier === 'agent') activePrice = product.agentPrice;

                      const isOutOfStock = product.stock <= 0;

                      return (
                        <div
                          key={product.id}
                          onClick={() => !isOutOfStock && handleAddToCart(product)}
                          className={`glass-card p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${
                            isOutOfStock
                              ? 'opacity-45 cursor-not-allowed border-rose-900/50 bg-rose-950/10'
                              : 'border-slate-800 hover:border-cyan-500/70 hover:shadow-lg hover:shadow-cyan-500/10 active:scale-[0.98]'
                          }`}
                        >
                          <div>
                            {/* Product ID Badge */}
                            <div className="text-xs font-mono font-bold text-slate-400 mb-1">
                              #{product.id}
                            </div>
                            {/* Product Name */}
                            <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                              {product.name}
                            </h4>
                          </div>

                          {/* Price & Stock Indicator */}
                          <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-800/60">
                            <span className="text-base font-extrabold text-cyan-400">
                              {formatKip(activePrice)}
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                product.stock < 5
                                  ? 'text-rose-400'
                                  : product.stock < 10
                                  ? 'text-amber-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              ທະບຽນ: {product.stock}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* POS RIGHT SIDE: CART & CHECKOUT (Exact match to screenshot) */}
            <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col bg-darkbg-900/80 p-5 overflow-hidden">
              {/* Header: ລາຍການສັ່ງຊື້ + ລ້າງກະຕ່າ */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-base">
                  <ShoppingCart className="w-5 h-5" />
                  <span>ລາຍການສັ່ງຊື້</span>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                  >
                    <span>ລ້າງຖາດກະຕ່າ</span>
                  </button>
                )}
              </div>

              {/* Customer Selector / Search Input */}
              <div className="py-3 border-b border-slate-800/80 flex-shrink-0 space-y-2">
                <div className="relative">
                  <UserCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="👤 ຮັບເລກລູກຄ້າ (ID, ຊື່, ເບີໂທ)..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-400 focus:ring-1 focus:ring-cyan-500"
                  />
                  {memberSearch && (
                    <button
                      onClick={() => setMemberSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Member Search Suggestions Dropdown */}
                {memberSearch && (
                  <div className="glass-card rounded-xl p-1 max-h-36 overflow-y-auto space-y-1 text-xs">
                    {posFilteredMembers.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          handleSelectMember(m);
                          setMemberSearch('');
                        }}
                        className="p-2 rounded-lg hover:bg-slate-800 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <span className="font-bold text-cyan-300">[{m.id}]</span> {m.name}
                          <span className="text-slate-400 text-[10px] block">{m.phone}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          {m.tier === 'agent' ? 'ຕົວແທນ' : m.tier === 'promo' ? 'ໂປຣ' : 'ທົ່ວໄປ'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Customer Display */}
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                  <span>
                    ລູກຄ້າ:{' '}
                    <strong className="text-cyan-300 font-medium">
                      {selectedMember ? `${selectedMember.name} (${selectedMember.id})` : 'ທົ່ວໄປ'}
                    </strong>
                  </span>
                  {selectedMember && (
                    <button
                      onClick={() => handleSelectMember(null)}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      ຍົກເລີກ
                    </button>
                  )}
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
                    <ShoppingCart className="w-10 h-10 mb-2 stroke-1 text-slate-600" />
                    <span>ຍັງບໍ່ມີລາຍການສິນຄ້າໃນກະຕ່າ</span>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="glass-card p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between space-x-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {item.product.name}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <button
                            onClick={() =>
                              handleUpdateCartUnitPrice(item.product.id, item.unitPrice)
                            }
                            className="text-xs font-mono text-cyan-400 hover:underline"
                            title="ກົດເພື່ອປັບລາຄາຂາຍ"
                          >
                            {formatKip(item.unitPrice)}
                          </button>
                          <span className="text-[10px] text-slate-400">/ຊິ້ນ</span>
                        </div>
                      </div>

                      {/* Quantity Modifier Buttons */}
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <button
                          onClick={() =>
                            handleUpdateCartQty(item.product.id, item.quantity - 1)
                          }
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-bold text-xs text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateCartQty(item.product.id, item.quantity + 1)
                          }
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total & Delete */}
                      <div className="text-right flex-shrink-0 pl-1">
                        <div className="text-xs font-bold text-emerald-400">
                          {formatKip(item.unitPrice * item.quantity)}
                        </div>
                        <button
                          onClick={() => handleRemoveCartItem(item.product.id)}
                          className="text-rose-400 hover:text-rose-300 text-xs mt-0.5 inline-block"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Calculation & Action Panel (Exact match to screenshot) */}
              <div className="pt-3 border-t border-slate-800 space-y-3 flex-shrink-0">
                {/* ຍອດລວມເງິນໝົດ */}
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-300">ຍອດລວມເງິນໝົດ:</span>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    {formatKip(grandTotal)}
                  </span>
                </div>

                {/* ຈຳນວນເງິນທີ່ຮັບມາ (₭) Input */}
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                    <span>ຈຳນວນເງິນທີ່ຮັບມາ (₭):</span>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      (ກົດ Spacebar = ເງິນພໍດີ)
                    </span>
                  </div>
                  <input
                    ref={cashInputRef}
                    id="cash-received-input"
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="0"
                    className="w-full py-2.5 px-4 rounded-xl glass-input text-right font-mono text-lg font-bold text-cyan-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Quick Cash Buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => setCashReceived(grandTotal.toString())}
                    className="py-1 px-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[10px] font-semibold text-cyan-300 text-center"
                  >
                    ພໍດີ
                  </button>
                  <button
                    onClick={() => setCashReceived((parsedCashReceived + 50000).toString())}
                    className="py-1 px-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 text-center"
                  >
                    +50k
                  </button>
                  <button
                    onClick={() => setCashReceived((parsedCashReceived + 100000).toString())}
                    className="py-1 px-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 text-center"
                  >
                    +100k
                  </button>
                  <button
                    onClick={() => setCashReceived((parsedCashReceived + 500000).toString())}
                    className="py-1 px-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 text-center"
                  >
                    +500k
                  </button>
                </div>

                {/* ເງິນທອນ */}
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-300">ເງິນທອນ:</span>
                  <span className="text-xl font-extrabold text-amber-400 font-mono">
                    {formatKip(changeAmount)}
                  </span>
                </div>

                {/* Big Green Confirm Payment Button (Enter) */}
                <button
                  onClick={handleConfirmPayment}
                  disabled={cart.length === 0}
                  className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg ${
                    cart.length > 0
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 hover:shadow-emerald-600/30 active:scale-[0.98]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>✅ ຢືນຍັນການຊຳລະເງິນ (Enter)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: ADMIN PANEL (PROTECTED) ==================== */}
        {activeTab === 'admin' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Admin Sub-navigation Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAdminSubTab('products')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    adminSubTab === 'products'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  📦 ຈັດການສິນຄ້າ ({products.length})
                </button>
                <button
                  onClick={() => setAdminSubTab('members')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    adminSubTab === 'members'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  👫🏻 ຈັດການສະມາຊິກ ({members.length})
                </button>
                <button
                  onClick={() => setAdminSubTab('stockin')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    adminSubTab === 'stockin'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  📥 ລະບົບຮັບສິນຄ້າເຂົ້າສາງ
                </button>
                <button
                  onClick={() => setAdminSubTab('general')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    adminSubTab === 'general'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  🛠️ ຂໍ້ມູນທົ່ວໄປຮ້ານຄ້າ
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setIsAdminUnlocked(false);
                    setActiveTab('pos');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center space-x-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>ລັອກ Admin</span>
                </button>
              </div>
            </div>

            {/* ADMIN SUB-TAB 1: PRODUCTS MANAGEMENT */}
            {adminSubTab === 'products' && (
              <div className="space-y-6">
                {/* Add / Edit Product Form */}
                <div className="glass-card p-5 rounded-2xl border border-slate-700/60">
                  <h3 className="text-base font-bold text-cyan-400 mb-4 flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>{editingProductId ? 'ແກ້ໄຂຂໍ້ມູນສິນຄ້າ' : 'ເພີ່ມລາຍການສິນຄ້າໃໝ່'}</span>
                  </h3>

                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* ID */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          ເລກທີ ID <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.id}
                          onChange={(e) =>
                            setProductForm({ ...productForm, id: e.target.value })
                          }
                          disabled={!!editingProductId}
                          placeholder="ຕົວຢ່າງ: 1, 2, PROD-01"
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs font-mono font-bold text-cyan-300"
                        />
                      </div>

                      {/* Name */}
                      <div className="md:col-span-2">
                        <label className="block text-xs text-slate-400 mb-1">
                          ລາຍການສິນຄ້າ <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={(e) =>
                            setProductForm({ ...productForm, name: e.target.value })
                          }
                          placeholder="ຊື່ສິນຄ້າ..."
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs text-white"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">ໝວດໝູ່</label>
                        <input
                          type="text"
                          value={productForm.category}
                          onChange={(e) =>
                            setProductForm({ ...productForm, category: e.target.value })
                          }
                          placeholder="ໝວດໝູ່..."
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Price Tiers & Costs (Multi-price System) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                      {/* Cost Price */}
                      <div>
                        <label className="block text-xs text-rose-400 font-semibold mb-1">
                          ຕົ້ນທຶນ (₭)
                        </label>
                        <input
                          type="number"
                          value={productForm.costPrice || ''}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              costPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs font-mono text-rose-300"
                        />
                      </div>

                      {/* Sale Price */}
                      <div>
                        <label className="block text-xs text-emerald-400 font-semibold mb-1">
                          ລາຄາຂາຍທົ່ວໄປ (₭)
                        </label>
                        <input
                          type="number"
                          value={productForm.salePrice || ''}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              salePrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs font-mono text-emerald-300"
                        />
                      </div>

                      {/* Promo Price */}
                      <div>
                        <label className="block text-xs text-amber-400 font-semibold mb-1">
                          ລາຄາໂປຣ (₭)
                        </label>
                        <input
                          type="number"
                          value={productForm.promoPrice || ''}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              promoPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs font-mono text-amber-300"
                        />
                      </div>

                      {/* Agent Price */}
                      <div>
                        <label className="block text-xs text-cyan-400 font-semibold mb-1">
                          ລາຄາຕົວແທນ (₭)
                        </label>
                        <input
                          type="number"
                          value={productForm.agentPrice || ''}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              agentPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs font-mono text-cyan-300"
                        />
                      </div>

                      {/* Stock Qty */}
                      <div>
                        <label className="block text-xs text-blue-400 font-semibold mb-1">
                          ຈຳນວນໃນສະຕ໊ອກ
                        </label>
                        <input
                          type="number"
                          value={productForm.stock || ''}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              stock: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs font-mono text-blue-300"
                        />
                      </div>
                    </div>

                    {/* Calculated Profit Preview */}
                    <div className="glass-card py-2.5 px-4 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        ຄຳນວນກຳໄລໂດຍປະມານຕໍ່ຊິ້ນ:{' '}
                        <strong className="text-white">
                          ລາຄາຂາຍ ({formatKip(productForm.salePrice || 0)}) - ຕົ້ນທຶນ (
                          {formatKip(productForm.costPrice || 0)})
                        </strong>
                      </span>
                      <span className="font-mono font-bold text-sm text-cyan-400">
                        = {formatKip((productForm.salePrice || 0) - (productForm.costPrice || 0))}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-2">
                      {editingProductId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductId(null);
                            setProductForm({
                              id: '',
                              name: '',
                              category: 'ທົ່ວໄປ',
                              costPrice: 0,
                              salePrice: 0,
                              promoPrice: 0,
                              agentPrice: 0,
                              stock: 0,
                            });
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                        >
                          ຍົກເລີກ
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-900/40 flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{editingProductId ? 'ບັນທຶກການແກ້ໄຂ' : 'ບັນທຶກສິນຄ້າ'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Products Table */}
                <div className="glass-card p-5 rounded-2xl">
                  <h4 className="text-sm font-bold text-white mb-3">
                    ລາຍການສິນຄ້າທັງໝົດໃນລະບົບ ({products.length} ລາຍການ)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-3 px-3">#ID</th>
                          <th className="py-3 px-3">ຊື່ສິນຄ້າ</th>
                          <th className="py-3 px-3">ໝວດໝູ່</th>
                          <th className="py-3 px-3 text-right">ຕົ້ນທຶນ</th>
                          <th className="py-3 px-3 text-right">ລາຄາຂາຍ</th>
                          <th className="py-3 px-3 text-right">ລາຄາໂປຣ</th>
                          <th className="py-3 px-3 text-right">ລາຄາຕົວແທນ</th>
                          <th className="py-3 px-3 text-center">ສະຕ໊ອກ</th>
                          <th className="py-3 px-3 text-center">ຈັດການ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                              #{p.id}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                            <td className="py-2.5 px-3 text-slate-400">{p.category}</td>
                            <td className="py-2.5 px-3 text-right text-rose-400 font-mono">
                              {formatKip(p.costPrice)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-emerald-400 font-mono font-bold">
                              {formatKip(p.salePrice)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-amber-400 font-mono">
                              {formatKip(p.promoPrice)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-cyan-400 font-mono">
                              {formatKip(p.agentPrice)}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  p.stock <= 0
                                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                    : p.stock < 5
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                }`}
                              >
                                {p.stock}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center space-x-2">
                              <button
                                onClick={() => handleEditProduct(p)}
                                className="p-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-400"
                                title="ແກ້ໄຂ"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-400"
                                title="ລົບ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

            {/* ADMIN SUB-TAB 2: MEMBER MANAGEMENT */}
            {adminSubTab === 'members' && (
              <div className="space-y-6">
                {/* Add / Edit Member Form */}
                <div className="glass-card p-5 rounded-2xl border border-slate-700/60">
                  <h3 className="text-base font-bold text-cyan-400 mb-4 flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>
                      {editingMemberId ? 'ແກ້ໄຂຂໍ້ມູນສະມາຊິກ' : 'ເພີ່ມລູກຄ້າສະມາຊິກໃໝ່'}
                    </span>
                  </h3>

                  <form onSubmit={handleSaveMember} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                      {/* ID */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          ເລກທີ ID <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={memberForm.id}
                          onChange={(e) =>
                            setMemberForm({ ...memberForm, id: e.target.value })
                          }
                          disabled={!!editingMemberId}
                          placeholder="M001, M002..."
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs font-mono font-bold text-cyan-300"
                        />
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          ຊື່ ແລະ ນາມສະກຸນ <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={memberForm.name}
                          onChange={(e) =>
                            setMemberForm({ ...memberForm, name: e.target.value })
                          }
                          placeholder="ຊື່ສະມາຊິກ..."
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs text-white"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">ເບີໂທຕິດຕໍ່</label>
                        <input
                          type="text"
                          value={memberForm.phone}
                          onChange={(e) =>
                            setMemberForm({ ...memberForm, phone: e.target.value })
                          }
                          placeholder="020..."
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs text-white"
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">ທີ່ຢູ່</label>
                        <input
                          type="text"
                          value={memberForm.address}
                          onChange={(e) =>
                            setMemberForm({ ...memberForm, address: e.target.value })
                          }
                          placeholder="ນະຄອນຫຼວງ, ຕ່າງແຂວງ..."
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs text-white"
                        />
                      </div>

                      {/* Tier */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          ລະດັບລາຄາສະມາຊິກ
                        </label>
                        <select
                          value={memberForm.tier}
                          onChange={(e) =>
                            setMemberForm({ ...memberForm, tier: e.target.value as any })
                          }
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs text-cyan-300 bg-slate-900"
                        >
                          <option value="general">ລາຄາຂາຍທົ່ວໄປ</option>
                          <option value="promo">ລາຄາໂປຣ (Promo)</option>
                          <option value="agent">ລາຄາຕົວແທນ (Agent)</option>
                        </select>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-2">
                      {editingMemberId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMemberId(null);
                            setMemberForm({
                              id: '',
                              name: '',
                              phone: '',
                              address: '',
                              tier: 'general',
                            });
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                        >
                          ຍົກເລີກ
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-900/40 flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{editingMemberId ? 'ບັນທຶກການແກ້ໄຂ' : 'ບັນທຶກສະມາຊິກ'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Member Table */}
                <div className="glass-card p-5 rounded-2xl">
                  <h4 className="text-sm font-bold text-white mb-3">
                    ລາຍຊື່ສະມາຊິກທັງໝົດ ({members.length} ຄົນ)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-3 px-3">#ID ສະມາຊິກ</th>
                          <th className="py-3 px-3">ຊື່ ແລະ ນາມສະກຸນ</th>
                          <th className="py-3 px-3">ເບີໂທຕິດຕໍ່</th>
                          <th className="py-3 px-3">ທີ່ຢູ່</th>
                          <th className="py-3 px-3 text-center">ລະດັບລາຄາ</th>
                          <th className="py-3 px-3 text-center">ຈັດການ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {members.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                              {m.id}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-white">{m.name}</td>
                            <td className="py-2.5 px-3 text-slate-300 font-mono">{m.phone}</td>
                            <td className="py-2.5 px-3 text-slate-400">{m.address}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  m.tier === 'agent'
                                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                                    : m.tier === 'promo'
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}
                              >
                                {m.tier === 'agent'
                                  ? 'ລາຄາຕົວແທນ'
                                  : m.tier === 'promo'
                                  ? 'ລາຄາໂປຣ'
                                  : 'ລາຄາທົ່ວໄປ'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center space-x-2">
                              <button
                                onClick={() => handleEditMember(m)}
                                className="p-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-400"
                                title="ແກ້ໄຂ"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMember(m.id)}
                                className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-400"
                                title="ລົບ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

            {/* ADMIN SUB-TAB 3: STOCK INBOUND RECEIVING */}
            {adminSubTab === 'stockin' && (
              <div className="space-y-6">
                <div className="glass-card p-5 rounded-2xl border border-slate-700/60">
                  <h3 className="text-base font-bold text-cyan-400 mb-4 flex items-center space-x-2">
                    <Boxes className="w-5 h-5" />
                    <span>ບັນທຶກການຮັບສິນຄ້າເຂົ້າສາງ (Stock Inbound)</span>
                  </h3>

                  <form onSubmit={handleStockInSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Select Product */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          ເລືອກສິນຄ້າ <span className="text-rose-400">*</span>
                        </label>
                        <select
                          required
                          value={stockInForm.productId}
                          onChange={(e) => {
                            const pId = e.target.value;
                            const prod = products.find((p) => p.id === pId);
                            setStockInForm({
                              ...stockInForm,
                              productId: pId,
                              costPrice: prod ? prod.costPrice : 0,
                            });
                          }}
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs text-white bg-slate-900"
                        >
                          <option value="">-- ເລືອກສິນຄ້າ --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              #{p.id} - {p.name} (ຍັງເຫຼືອ: {p.stock})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          ຈຳນວນທີ່ຮັບມາ (ຊິ້ນ) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={stockInForm.quantity}
                          onChange={(e) =>
                            setStockInForm({
                              ...stockInForm,
                              quantity: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs font-mono text-cyan-300"
                        />
                      </div>

                      {/* Cost Price */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          ຕົ້ນທຶນຮັບມາຕໍ່ຊິ້ນ (₭)
                        </label>
                        <input
                          type="number"
                          value={stockInForm.costPrice}
                          onChange={(e) =>
                            setStockInForm({
                              ...stockInForm,
                              costPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs font-mono text-emerald-300"
                        />
                      </div>

                      {/* Supplier Note */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">ໝາຍເຫດ/ຜູ້ສະໜອງ</label>
                        <input
                          type="text"
                          value={stockInForm.supplierNote}
                          onChange={(e) =>
                            setStockInForm({
                              ...stockInForm,
                              supplierNote: e.target.value,
                            })
                          }
                          placeholder="ຕົວຢ່າງ: ຮັບຈາກໂຮງງານ..."
                          className="w-full py-2 px-3 rounded-xl glass-input text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg flex items-center space-x-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>ບັນທຶກຮັບສິນຄ້າເຂົ້າສາງ</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Stock Inbound History Table */}
                <div className="glass-card p-5 rounded-2xl">
                  <h4 className="text-sm font-bold text-white mb-3">
                    ປະຫວັດການຮັບສິນຄ້າເຂົ້າສາງທັງໝົດ ({stockInHistory.length} ລາຍການ)
                  </h4>
                  {stockInHistory.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      ຍັງບໍ່ມີລາຍການຮັບສິນຄ້າ
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-2.5 px-3">ເລກທີຮັບ</th>
                            <th className="py-2.5 px-3">ວັນທີ & ເວລາ</th>
                            <th className="py-2.5 px-3">ລາຍການສິນຄ້າ</th>
                            <th className="py-2.5 px-3 text-center">ຈຳນວນຮັບ</th>
                            <th className="py-2.5 px-3 text-right">ຕົ້ນທຶນຮັບ</th>
                            <th className="py-2.5 px-3">ໝາຍເຫດ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {stockInHistory.map((rec) => (
                            <tr key={rec.id} className="hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                                {rec.id}
                              </td>
                              <td className="py-2.5 px-3 text-slate-300">{rec.timestamp}</td>
                              <td className="py-2.5 px-3 font-semibold text-white">
                                {rec.productName}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-emerald-400">
                                +{rec.quantity}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                                {formatKip(rec.costPrice)}
                              </td>
                              <td className="py-2.5 px-3 text-slate-400">{rec.supplierNote}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ADMIN SUB-TAB 4: GENERAL STORE SETTINGS */}
            {adminSubTab === 'general' && (
              <div className="glass-card p-5 rounded-2xl max-w-2xl space-y-4">
                <h3 className="text-base font-bold text-cyan-400 mb-2 flex items-center space-x-2">
                  <Store className="w-5 h-5" />
                  <span>ຂໍ້ມູນທົ່ວໄປ ແລະ ລະຫັດຜ່ານ Admin</span>
                </h3>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">ຊື່ຮ້ານຄ້າ</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">ຄຳທັກທາຍ</label>
                  <input
                    type="text"
                    value={settings.storeGreeting}
                    onChange={(e) =>
                      setSettings({ ...settings, storeGreeting: e.target.value })
                    }
                    className="w-full py-2 px-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    ລະຫັດຜ່ານ Admin Panel (ປ້ອງກັນການເຂົ້າເຖິງ)
                  </label>
                  <input
                    type="text"
                    value={settings.adminPass}
                    onChange={(e) => setSettings({ ...settings, adminPass: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl glass-input text-xs font-mono text-amber-300"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      showDarkSwal({
                        icon: 'success',
                        title: 'ບັນທຶກຂໍ້ມູນທົ່ວໄປສຳເລັດ! ✅',
                        timer: 1500,
                        showConfirmButton: false,
                      });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg"
                  >
                    ບັນທຶກການຕັ້ງຄ່າ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 4: SALES REPORT ==================== */}
        {activeTab === 'reports' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top 3 Best Sellers Display */}
            <div className="glass-card-glow p-5 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-3 flex items-center space-x-2">
                <span>🏆 3 ອັນດັບສິນຄ້າຂາຍດີທີ່ສຸດ (Top 3 Best Sellers)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topSellingProducts.map((item, idx) => {
                  const medals = ['🥇 ອັນດັບ 1', '🥈 ອັນດັບ 2', '🥉 ອັນດັບ 3'];
                  const medalColors = [
                    'from-amber-500/20 border-amber-500/50 text-amber-300',
                    'from-slate-400/20 border-slate-400/50 text-slate-200',
                    'from-amber-700/20 border-amber-700/50 text-amber-600',
                  ];
                  return (
                    <div
                      key={item.id}
                      className={`glass-card p-4 rounded-xl border bg-gradient-to-b ${medalColors[idx] || ''}`}
                    >
                      <div className="text-xs font-bold mb-1">{medals[idx]}</div>
                      <div className="font-semibold text-sm text-white truncate">
                        {item.name}
                      </div>
                      <div className="mt-2 flex items-baseline justify-between text-xs">
                        <span className="text-slate-400">ຂາຍໄດ້: {item.qty} ຊິ້ນ</span>
                        <span className="font-bold text-emerald-400">
                          {formatKip(item.revenue)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {topSellingProducts.length === 0 && (
                  <div className="col-span-3 text-center py-4 text-slate-500 text-xs">
                    ຍັງບໍ່ມີຂໍ້ມູນການຂາຍ
                  </div>
                )}
              </div>
            </div>

            {/* Filters Bar: ມື້ນີ້ / ອາທິດ / ເດືອນ / ປີ + Search Box */}
            <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-4 rounded-2xl">
              {/* Date Filters */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium">ເລືອກເບິ່ງ:</span>
                <button
                  onClick={() => setReportFilter('today')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    reportFilter === 'today'
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ມື້ນີ້
                </button>
                <button
                  onClick={() => setReportFilter('week')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    reportFilter === 'week'
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  7 ມື້ຜ່ານມາ
                </button>
                <button
                  onClick={() => setReportFilter('month')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    reportFilter === 'month'
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ເດືອນນີ້
                </button>
                <button
                  onClick={() => setReportFilter('year')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    reportFilter === 'year'
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ປີນີ້
                </button>
                <button
                  onClick={() => setReportFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    reportFilter === 'all'
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ທັງໝົດ
                </button>
              </div>

              {/* Search Filter */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  placeholder="ຄົ້ນຫາບິນ, ລູກຄ້າ, ສິນຄ້າ..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg glass-input text-xs text-white"
                />
              </div>
            </div>

            {/* Summary Totals: Revenue, Cost, Profit, Transactions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 rounded-xl">
                <span className="text-xs text-slate-400">ຍອດຂາຍລວມ</span>
                <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
                  {formatKip(reportTotals.revenue)}
                </div>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <span className="text-xs text-slate-400">ຕົ້ນທຶນລວມ</span>
                <div className="text-xl font-bold text-rose-400 mt-1 font-mono">
                  {formatKip(reportTotals.cost)}
                </div>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <span className="text-xs text-slate-400">ກຳໄລສຸດທິ</span>
                <div className="text-xl font-bold text-cyan-400 mt-1 font-mono">
                  {formatKip(reportTotals.profit)}
                </div>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <span className="text-xs text-slate-400">ຈຳນວນບິນຂາຍ</span>
                <div className="text-xl font-bold text-amber-400 mt-1 font-mono">
                  {reportTotals.count} <span className="text-xs text-slate-400">ບິນ</span>
                </div>
              </div>
            </div>

            {/* Sales Detailed Table */}
            <div className="glass-card p-5 rounded-2xl">
              <h4 className="text-sm font-bold text-white mb-3">
                ຕາຕະລາງລາຍການຂາຍ ({filteredSales.length} ບິນ)
              </h4>
              {filteredSales.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  ບໍ່ພົບລາຍການຂາຍໃນຊ່ວງເວລານີ້
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2.5 px-3">ເລກທີບິນ</th>
                        <th className="py-2.5 px-3">ວັນທີ & ເວລາ</th>
                        <th className="py-2.5 px-3">ລູກຄ້າ</th>
                        <th className="py-2.5 px-3">ສິນຄ້າທີ່ຊື້</th>
                        <th className="py-2.5 px-3 text-right">ຍອດລວມ</th>
                        <th className="py-2.5 px-3 text-right">ຕົ້ນທຶນ</th>
                        <th className="py-2.5 px-3 text-right">ກຳໄລ</th>
                        <th className="py-2.5 px-3 text-center">ໃບບິນ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                            {sale.id}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">{sale.timestamp}</td>
                          <td className="py-2.5 px-3 text-slate-200">
                            {sale.customerName}{' '}
                            <span className="text-[10px] text-slate-400">({sale.customerTier})</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {sale.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-400 font-mono">
                            {formatKip(sale.totalAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-rose-400 font-mono">
                            {formatKip(sale.totalCost)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-cyan-400 font-mono">
                            {formatKip(sale.profit)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                setLastReceipt(sale);
                                setShowReceiptModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300"
                              title="ເບິ່ງ/ພິມໃບບິນ"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom Export Buttons (Exact Requirement: Bottom Left PDF and Excel/CSV buttons) */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={exportToPDF}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-cyan-300 flex items-center space-x-2 transition-all shadow-md"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>📄 ດາວໂຫລດ PDF / ພິມລາຍງານ</span>
              </button>

              <button
                onClick={exportToExcelCSV}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-xs font-bold text-white flex items-center space-x-2 transition-all shadow-md shadow-emerald-900/30"
              >
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <span>📊 ດາວໂຫຼດ Excel/CSV</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: SETTINGS ==================== */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo & Branding Customization */}
              <div className="glass-card p-5 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-cyan-400 mb-2 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>ຕັ້ງຄ່າໂລໂກ້ ແລະ ແບຣນຮ້ານຄ້າ</span>
                </h3>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    ໂລໂກ້ Emoji (ໄອຄອນ)
                  </label>
                  <input
                    type="text"
                    value={settings.logoEmoji}
                    onChange={(e) => setSettings({ ...settings, logoEmoji: e.target.value })}
                    placeholder="🛒🛍️"
                    className="w-full py-2 px-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    ຫຼື ໃສ່ URL ຮູບໂລໂກ້ຮ້ານ
                  </label>
                  <input
                    type="text"
                    value={settings.logoUrl}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full py-2 px-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    ຄວາມໄວການປ່ຽນສີຂອບຮູ່ງ (ວິນາທີ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.logoBorderSpeed}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        logoBorderSpeed: parseInt(e.target.value) || 10,
                      })
                    }
                    className="w-full py-2 px-3 rounded-xl glass-input text-xs font-mono text-cyan-300"
                  />
                </div>
              </div>

              {/* Typography & Color Customization */}
              <div className="glass-card p-5 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-cyan-400 mb-2 flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>ປັບແຕ່ງສີຕົວໜັງສື ແລະ ຕົວເລກ</span>
                </h3>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    ສີຂໍ້ຄວາມຫຼັກ (Text Color)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.textColor}
                      onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">{settings.textColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    ສີຕົວເລກ/ລາຄາ (Number & Currency Color)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.numberColor}
                      onChange={(e) =>
                        setSettings({ ...settings, numberColor: e.target.value })
                      }
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">{settings.numberColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    ລະດັບລາຄາເລີ່ມຕົ້ນໃນ POS
                  </label>
                  <select
                    value={settings.defaultPriceTier}
                    onChange={(e) =>
                      setSettings({ ...settings, defaultPriceTier: e.target.value as any })
                    }
                    className="w-full py-2 px-3 rounded-xl glass-input text-xs text-white bg-slate-900"
                  >
                    <option value="general">ລາຄາຂາຍທົ່ວໄປ</option>
                    <option value="promo">ລາຄາໂປຣ (Promo)</option>
                    <option value="agent">ລາຄາຕົວແທນ (Agent)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data Export & Backup Tools */}
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-cyan-400 mb-2 flex items-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <span>ດຶງຂໍ້ມູນປະຫວັດ & ສຳຮອງຖານຂໍ້ມູນ (Data Backup)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Export Sales */}
                <button
                  onClick={exportToExcelCSV}
                  className="p-4 rounded-xl glass-card hover:border-cyan-500 text-left transition-all"
                >
                  <FileSpreadsheet className="w-6 h-6 text-emerald-400 mb-2" />
                  <div className="text-xs font-bold text-white">ດຶງປະຫວັດການຂາຍ</div>
                  <div className="text-[10px] text-slate-400 mt-1">ສົ່ງອອກໄຟລ໌ Excel/CSV</div>
                </button>

                {/* Export Members */}
                <button
                  onClick={() => {
                    let csvContent = '\uFEFFID,ຊື່,ເບີໂທ,ທີ່ຢູ່,ລະດັບລາຄາ\n';
                    members.forEach((m) => {
                      csvContent += `"${m.id}","${m.name}","${m.phone}","${m.address}","${m.tier}"\n`;
                    });
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Members_${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                  }}
                  className="p-4 rounded-xl glass-card hover:border-cyan-500 text-left transition-all"
                >
                  <Users className="w-6 h-6 text-cyan-400 mb-2" />
                  <div className="text-xs font-bold text-white">ດຶງປະຫວັດລູກຄ້າສະມາຊິກ</div>
                  <div className="text-[10px] text-slate-400 mt-1">ສົ່ງອອກໄຟລ໌ສະມາຊິກ CSV</div>
                </button>

                {/* Export Stock */}
                <button
                  onClick={() => {
                    let csvContent = '\uFEFFID,ຊື່ສິນຄ້າ,ໝວດໝູ່,ຕົ້ນທຶນ,ລາຄາຂາຍ,ສະຕ໊ອກຍັງເຫຼືອ\n';
                    products.forEach((p) => {
                      csvContent += `"${p.id}","${p.name}","${p.category}",${p.costPrice},${p.salePrice},${p.stock}\n`;
                    });
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Inventory_Stock_${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                  }}
                  className="p-4 rounded-xl glass-card hover:border-cyan-500 text-left transition-all"
                >
                  <Package className="w-6 h-6 text-amber-400 mb-2" />
                  <div className="text-xs font-bold text-white">ດຶງປະຫວັດສະຕ໊ອກສິນຄ້າ</div>
                  <div className="text-[10px] text-slate-400 mt-1">ສົ່ງອອກສະຕ໊ອກປັດຈຸບັນ CSV</div>
                </button>
              </div>

              {/* Reset to initial database option */}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  ຣີເຊັດຂໍ້ມູນກັບຄືນຄ່າເລີ່ມຕົ້ນ (Default Demo Seed)
                </span>
                <button
                  onClick={() => {
                    showDarkSwal({
                      title: 'ຢືນຢັນການຣີເຊັດຖານຂໍ້ມູນ?',
                      text: 'ຂໍ້ມູນການຂາຍທັງໝົດຈະຖືກຣີເຊັດກັບຄືນຄ່າເລີ່ມຕົ້ນ',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonText: 'ຣີເຊັດດຽວນີ້',
                      cancelButtonText: 'ຍົກເລີກ',
                      confirmButtonColor: '#ef4444',
                    }).then((res) => {
                      if (res.isConfirmed) {
                        localStorage.clear();
                        setProducts(INITIAL_PRODUCTS);
                        setMembers(INITIAL_MEMBERS);
                        setSalesHistory([]);
                        setStockInHistory([]);
                        setSettings(INITIAL_SETTINGS);
                        showDarkSwal({
                          icon: 'success',
                          title: 'ຣີເຊັດຂໍ້ມູນສຳເລັດແລ້ວ! 🔄',
                          timer: 1500,
                          showConfirmButton: false,
                        });
                      }
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs font-semibold hover:bg-rose-900"
                >
                  ຣີເຊັດຖານຂໍ້ມູນ
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================== REAL PRINTABLE RECEIPT (80mm THERMAL RECEIPT) ==================== */}
      {lastReceipt && (
        <div id="printable-receipt" className="hidden">
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
              {settings.storeName}
            </h2>
            <p style={{ margin: '0', fontSize: '11px' }}>{settings.storeGreeting}</p>
            <p style={{ margin: '0', fontSize: '11px' }}>ໂທ: 020 5555 9999</p>
            <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>
          </div>

          <div style={{ fontSize: '11px', marginBottom: '8px' }}>
            <div>ເລກທີບິນ: <strong>{lastReceipt.id}</strong></div>
            <div>ວັນທີ: {lastReceipt.timestamp}</div>
            <div>ລູກຄ້າ: {lastReceipt.customerName} ({lastReceipt.customerTier})</div>
            <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>
          </div>

          <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000' }}>
                <th style={{ textAlign: 'left', paddingBottom: '4px' }}>ລາຍການ</th>
                <th style={{ textAlign: 'center', paddingBottom: '4px' }}>ຈຳນວນ</th>
                <th style={{ textAlign: 'right', paddingBottom: '4px' }}>ລວມ</th>
              </tr>
            </thead>
            <tbody>
              {lastReceipt.items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ paddingTop: '4px' }}>{item.productName}</td>
                  <td style={{ textAlign: 'center', paddingTop: '4px' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', paddingTop: '4px' }}>
                    {formatKip(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>

          <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>ຍອດລວມ:</span>
              <strong>{formatKip(lastReceipt.totalAmount)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>ຮັບເງິນມາ:</span>
              <span>{formatKip(lastReceipt.cashReceived)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>ເງິນທອນ:</span>
              <strong>{formatKip(lastReceipt.change)}</strong>
            </div>
          </div>

          <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>
          <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '8px' }}>
            <p style={{ margin: '0' }}>🙏 ຂອບໃຈທີ່ອຸດໜຸນສິນຄ້າ!</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '9px' }}>POS System v2.0</p>
          </div>
        </div>
      )}

      {/* ==================== RECEIPT PREVIEW MODAL ==================== */}
      {showReceiptModal && lastReceipt && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card-glow max-w-sm w-full rounded-2xl p-6 border border-cyan-500/40 animate-in fade-in zoom-in duration-200">
            <div className="text-center pb-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-full rainbow-logo-border mx-auto flex items-center justify-center text-xl bg-slate-900 mb-2">
                🛒
              </div>
              <h3 className="font-bold text-white text-base">{settings.storeName}</h3>
              <p className="text-xs text-slate-400">ໃບບິນຮັບເງິນ (Sales Receipt)</p>
            </div>

            <div className="py-3 text-xs space-y-1.5 text-slate-300 border-b border-slate-800">
              <div className="flex justify-between">
                <span>ເລກທີບິນ:</span>
                <span className="font-mono text-cyan-400 font-bold">{lastReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span>ວັນທີ:</span>
                <span>{lastReceipt.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span>ລູກຄ້າ:</span>
                <span className="text-white font-medium">{lastReceipt.customerName}</span>
              </div>
            </div>

            {/* Items summary */}
            <div className="py-3 max-h-40 overflow-y-auto space-y-1.5 text-xs border-b border-slate-800">
              {lastReceipt.items.map((i, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-300">
                  <span className="truncate pr-2">{i.productName} x{i.quantity}</span>
                  <span className="font-mono font-semibold text-emerald-400">{formatKip(i.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Receipt Totals */}
            <div className="py-3 text-xs space-y-1.5">
              <div className="flex justify-between text-sm font-bold text-white">
                <span>ຍອດລວມ:</span>
                <span className="text-emerald-400 font-mono">{formatKip(lastReceipt.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>ຮັບມາ:</span>
                <span className="font-mono text-white">{formatKip(lastReceipt.cashReceived)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>ເງິນທອນ:</span>
                <span className="font-mono text-amber-400 font-bold">{formatKip(lastReceipt.change)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center space-x-1 shadow-lg shadow-cyan-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ ພິມໃບບິນ</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                ປິດໜ້າຕ່າງ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
