ນີ້ແມ່ນໂຄ້ດ **`src/pages/index.tsx` ສະບັບເຕັມ 100%** ທີ່ໄດ້ອັບເດດຊື່ຮ້ານເປັນ **"ຮ້ານ ແພງສອນ ຂາຍ Online (ຍິນດີຕ້ອນຮັບ)"** ໃນທຸກໆຈຸດຂອງລະບົບ (ຫົວເວັບ, Sidebar, ແຜງຄວບຄຸມ Dashboard, ໃບບິນ Receipt, ແລະ ໜ້າການຕັ້ງຄ່າ):

```tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import Head from "next/head";
import Swal from "sweetalert2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  LayoutDashboard,
  ShoppingCart,
  ShieldCheck,
  BarChart3,
  Settings,
  PlusCircle,
  Trash2,
  Edit,
  Printer,
  Search,
  UserPlus,
  ArrowDownCircle,
  Download,
  CheckCircle,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Radio,
  Store,
  Sparkles,
} from "lucide-react";

// ລົງທະບຽນ Chart.js Modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- Interface Types ---
interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellPrice: number;
  promoPrice: number;
  agentPrice: number;
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
  quantity: number;
  priceType: "normal" | "promo" | "agent";
  unitPrice: number;
  subtotal: number;
}

interface SaleRecord {
  id: string;
  date: string;
  timestamp: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    cost: number;
    subtotal: number;
  }[];
  memberId?: string;
  memberName?: string;
  totalAmount: number;
  totalCost: number;
  profit: number;
  cashReceived: number;
  change: number;
}

interface StockInRecord {
  id: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  note: string;
}

interface ShopSettings {
  shopName: string;
  adminPassword: string;
  textColor: string;
  numberColor: string;
}

export default function PhaengsonePOS() {
  // --- Active Tab State ---
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "pos" | "admin" | "reports" | "settings"
  >("dashboard");

  // --- Real-time Clock State ---
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentLaoDate, setCurrentLaoDate] = useState<string>("");

  // --- Shop Settings State (ຕັ້ງຊື່ຮ້ານໃໝ່) ---
  const [settings, setSettings] = useState<ShopSettings>({
    shopName: "ຮ້ານ ແພງສອນ ຂາຍ Online (ຍິນດີຕ້ອນຮັບ)",
    adminPassword: "11222",
    textColor: "#f1f5f9",
    numberColor: "#00f2fe",
  });

  // --- Core State Data (LocalStorage Persistent) ---
  const [products, setProducts] = useState<Product[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [stockIns, setStockIns] = useState<StockInRecord[]>([]);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);

  // --- POS Cashier State ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [productSearch, setProductSearch] = useState<string>("");
  const [memberSearch, setMemberSearch] = useState<string>("");
  const [cashReceived, setCashReceived] = useState<number | "">("");
  const [lastReceipt, setLastReceipt] = useState<SaleRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // --- Admin Forms State ---
  const [productForm, setProductForm] = useState<Product>({
    id: "",
    name: "",
    category: "ທົ່ວໄປ",
    costPrice: 0,
    sellPrice: 0,
    promoPrice: 0,
    agentPrice: 0,
    stock: 0,
  });
  const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
  const [productIdDuplicateError, setProductIdDuplicateError] = useState<boolean>(false);

  const [memberForm, setMemberForm] = useState<Member>({
    id: "",
    name: "",
    phone: "",
    address: "",
  });
  const [isEditingMember, setIsEditingMember] = useState<boolean>(false);
  const [memberIdDuplicateError, setMemberIdDuplicateError] = useState<boolean>(false);

  // Stock In Form
  const [stockInForm, setStockInForm] = useState({
    productId: "",
    quantity: 0,
    note: "ຮັບເຂົ້າປະຈຳວັນ",
  });

  // Reports Filter
  const [reportFilter, setReportFilter] = useState<"day" | "week" | "month" | "year">("day");

  // Cash Input Ref
  const cashInputRef = useRef<HTMLInputElement>(null);

  // --- Dark Mode SweetAlert2 Helper ---
  const Toast = Swal.mixin({
    background: "#0f172a",
    color: "#f8fafc",
    confirmButtonColor: "#06b6d4",
    cancelButtonColor: "#ef4444",
    customClass: {
      popup: "border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-xl",
    },
  });

  // --- 1. Load & Initialize LocalStorage Data ---
  useEffect(() => {
    const savedProducts = localStorage.getItem("phaengsone_products");
    const savedMembers = localStorage.getItem("phaengsone_members");
    const savedSales = localStorage.getItem("phaengsone_sales");
    const savedStockIns = localStorage.getItem("phaengsone_stockins");
    const savedSettings = localStorage.getItem("phaengsone_settings");

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      const initialProducts: Product[] = [
        {
          id: "P001",
          name: "ເສື້ອເຊີດແຂນຍາວ ສີດຳ",
          category: "ເຄື່ອງນຸ່ງ",
          costPrice: 45000,
          sellPrice: 85000,
          promoPrice: 75000,
          agentPrice: 65000,
          stock: 40,
        },
        {
          id: "P002",
          name: "ເກີບຜ້າໃບ Sneaker Sport",
          category: "ເກີບ",
          costPrice: 120000,
          sellPrice: 230000,
          promoPrice: 199000,
          agentPrice: 170000,
          stock: 25,
        },
        {
          id: "P003",
          name: "ກະເປົາສະພາຍຂ້າງ Luxury",
          category: "ກະເປົາ",
          costPrice: 80000,
          sellPrice: 165000,
          promoPrice: 145000,
          agentPrice: 120000,
          stock: 18,
        },
        {
          id: "P004",
          name: "ໂມງຂໍ້ມື Smartwatch V8",
          category: "ອຸປະກອນໄອທີ",
          costPrice: 150000,
          sellPrice: 320000,
          promoPrice: 280000,
          agentPrice: 240000,
          stock: 15,
        },
      ];
      setProducts(initialProducts);
      localStorage.setItem("phaengsone_products", JSON.stringify(initialProducts));
    }

    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    } else {
      const initialMembers: Member[] = [
        { id: "M001", name: "ທ້າວ ສົມສັກ ແກ້ວມະນີ", phone: "020 55512345", address: "ບ້ານ ໂພນສະອາດ, ນະຄອນຫຼວງ" },
        { id: "M002", name: "ນາງ ມະນີວອນ ຈັນທະລາ", phone: "020 99887766", address: "ບ້ານ ດົງໂດກ, ໄຊທານີ" },
      ];
      setMembers(initialMembers);
      localStorage.setItem("phaengsone_members", JSON.stringify(initialMembers));
    }

    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedStockIns) setStockIns(JSON.parse(savedStockIns));

    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // ອັບເດດຊື່ຮ້ານໃໝ່ໃຫ້ຕົງກັບທີ່ລະບຸ
      setSettings({
        ...parsed,
        shopName: parsed.shopName || "ຮ້ານ ແພງສອນ ຂາຍ Online (ຍິນດີຕ້ອນຮັບ)",
      });
    }
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (products.length > 0) localStorage.setItem("phaengsone_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (members.length > 0) localStorage.setItem("phaengsone_members", JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem("phaengsone_sales", JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem("phaengsone_stockins", JSON.stringify(stockIns));
  }, [stockIns]);

  useEffect(() => {
    localStorage.setItem("phaengsone_settings", JSON.stringify(settings));
  }, [settings]);

  // --- 2. Real-time Clock (Lao Format & Full Date) ---
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}:${seconds}`);

      const laoDays = [
        "ວັນອາທິດ",
        "ວັນຈັນ",
        "ວັນອັງຄານ",
        "ວັນພຸດ",
        "ວັນພະຫັດ",
        "ວັນສຸກ",
        "ວັນເສົາ",
      ];
      const laoMonths = [
        "ມັງກອນ",
        "ກຸມພາ",
        "ມີນາ",
        "ເມສາ",
        "ພຶດສະພາ",
        "ມິຖຸນາ",
        "ກໍລະກົດ",
        "ສິງຫາ",
        "ກັນຍາ",
        "ຕຸລາ",
        "ພະຈິກ",
        "ທັນວາ",
      ];
      const dayName = laoDays[now.getDay()];
      const day = now.getDate();
      const monthName = laoMonths[now.getMonth()];
      const year = now.getFullYear();
      setCurrentLaoDate(`${dayName} ທີ ${day} ${monthName} ${year}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 3. Format Currency Helper ---
  const formatKip = (val: number) => {
    return new Intl.NumberFormat("lo-LA").format(val) + " ₭";
  };

  // --- 4. Admin Security Guard ---
  const handleSelectAdminTab = async () => {
    if (isAdminUnlocked) {
      setActiveTab("admin");
      return;
    }

    const { value: enteredPass } = await Toast.fire({
      title: "🛡️ ລະບົບປ້ອງກັນ Admin Panel",
      text: "ກະລຸນາປ້ອນລະຫັດຜ່ານເພື່ອເຂົ້າສູ່ລະບົບຈັດການ:",
      input: "password",
      inputPlaceholder: "ປ້ອນລະຫັດຜ່ານ...",
      showCancelButton: true,
      confirmButtonText: "ຢືນຢັນ",
      cancelButtonText: "ຍົກເລີກ",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off",
      },
    });

    if (enteredPass === settings.adminPassword) {
      setIsAdminUnlocked(true);
      setActiveTab("admin");
      Toast.fire({
        icon: "success",
        title: "ເຂົ້າສູ່ລະບົບສຳເລັດ",
        timer: 1500,
        showConfirmButton: false,
      });
    } else if (enteredPass !== undefined) {
      Toast.fire({
        icon: "error",
        title: "ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ!",
        text: "ກະລຸນາກວດສອບລະຫັດຜ່ານຄືນໃໝ່ (ຄ່າເລີ່ມຕົ້ນ: 11222)",
      });
    }
  };

  // --- 5. POS Functionalities ---
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  const cartCostTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.costPrice * item.quantity, 0);
  }, [cart]);

  const changeAmount = useMemo(() => {
    if (cashReceived === "" || cashReceived < cartTotal) return 0;
    return Number(cashReceived) - cartTotal;
  }, [cashReceived, cartTotal]);

  const addToCart = (product: Product, priceType: "normal" | "promo" | "agent" = "normal") => {
    if (product.stock <= 0) {
      Toast.fire({
        icon: "warning",
        title: "ສິນຄ້າໝົດສະຕ໊ອກ!",
        text: `ສິນຄ້າ "${product.name}" ໝົດແລ້ວໃນຄັງ.`,
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.priceType === priceType);
      const currentPrice =
        priceType === "normal"
          ? product.sellPrice
          : priceType === "promo"
          ? product.promoPrice
          : product.agentPrice;

      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          Toast.fire({
            icon: "warning",
            title: "ສິນຄ້າບໍ່ພຽງພໍ",
            text: `ສິນຄ້າໃນຄັງມີພຽງ ${product.stock} ຊິ້ນ.`,
          });
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id && item.priceType === priceType
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            product,
            quantity: 1,
            priceType,
            unitPrice: currentPrice,
            subtotal: currentPrice,
          },
        ];
      }
    });
  };

  const updateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    const item = cart[index];
    if (newQty > item.product.stock) {
      Toast.fire({
        icon: "warning",
        title: "ເກີນຈຳນວນໃນສະຕ໊ອກ",
        text: `ມີສິນຄ້າພຽງ ${item.product.stock} ຊິ້ນ`,
      });
      return;
    }
    setCart((prev) =>
      prev.map((it, idx) =>
        idx === index
          ? {
              ...it,
              quantity: newQty,
              subtotal: newQty * it.unitPrice,
            }
          : it
      )
    );
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Toast.fire({ icon: "warning", title: "ກະຕ່າວ່າງເປົ່າ!", text: "ກະລຸນາເລືອກສິນຄ້າກ່ອນ." });
      return;
    }
    if (cashReceived === "" || Number(cashReceived) < cartTotal) {
      Toast.fire({
        icon: "error",
        title: "ເງິນທີ່ຮັບມາບໍ່ພຽງພໍ!",
        text: `ຍອດລວມແມ່ນ ${formatKip(cartTotal)}, ຮັບມາ ${formatKip(Number(cashReceived || 0))}`,
      });
      return;
    }

    // ຕັດສະຕ໊ອກສິນຄ້າທັນທີ
    const updatedProducts = products.map((prod) => {
      const soldItems = cart.filter((c) => c.product.id === prod.id);
      const totalSoldQty = soldItems.reduce((s, it) => s + it.quantity, 0);
      return {
        ...prod,
        stock: Math.max(0, prod.stock - totalSoldQty),
      };
    });
    setProducts(updatedProducts);

    // ບັນທຶກປະຫວັດການຂາຍ
    const newSaleRecord: SaleRecord = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString("lo-LA"),
      timestamp: Date.now(),
      items: cart.map((c) => ({
        id: c.product.id,
        name: c.product.name,
        quantity: c.quantity,
        price: c.unitPrice,
        cost: c.product.costPrice,
        subtotal: c.subtotal,
      })),
      memberId: selectedMember?.id,
      memberName: selectedMember?.name,
      totalAmount: cartTotal,
      totalCost: cartCostTotal,
      profit: cartTotal - cartCostTotal,
      cashReceived: Number(cashReceived),
      change: changeAmount,
    };

    setSales((prev) => [newSaleRecord, ...prev]);
    setLastReceipt(newSaleRecord);
    setIsReceiptModalOpen(true);

    // Reset POS Form
    setCart([]);
    setCashReceived("");
    setSelectedMember(null);

    Toast.fire({
      icon: "success",
      title: "ບັນທຶກການຂາຍ ແລະ ຕັດສະຕ໊ອກສຳເລັດ! 🎉",
      timer: 1800,
      showConfirmButton: false,
    });
  };

  // Keyboard Shortcuts: Spacebar (Exact Cash), Enter (Checkout)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== "pos") return;

      if (e.code === "Space" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        if (cartTotal > 0) {
          setCashReceived(cartTotal);
          Toast.fire({
            icon: "info",
            title: "ໃສ່ຈຳນວນເງິນພໍດີແລ້ວ!",
            timer: 1000,
            showConfirmButton: false,
          });
        }
      }

      if (e.key === "Enter" && cartTotal > 0 && Number(cashReceived) >= cartTotal) {
        e.preventDefault();
        handleCheckout();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, cartTotal, cashReceived, cart]);

  // --- 6. Admin Panel: Product CRUD & Validations ---
  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: ["costPrice", "sellPrice", "promoPrice", "agentPrice", "stock"].includes(name)
        ? Number(value)
        : value,
    }));

    if (name === "id" && !isEditingProduct) {
      const exists = products.some((p) => p.id.toLowerCase() === value.trim().toLowerCase());
      setProductIdDuplicateError(exists && value.trim() !== "");
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.id || !productForm.name) {
      Toast.fire({ icon: "warning", title: "ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບຖ້ວນ" });
      return;
    }

    if (!isEditingProduct && products.some((p) => p.id === productForm.id)) {
      setProductIdDuplicateError(true);
      Toast.fire({ icon: "error", title: "ລະຫັດ ID ນີ້ມີໃນລະບົບແລ້ວ!" });
      return;
    }

    if (isEditingProduct) {
      setProducts((prev) => prev.map((p) => (p.id === productForm.id ? productForm : p)));
      Toast.fire({ icon: "success", title: "ແກ້ໄຂສິນຄ້າສຳເລັດ!" });
    } else {
      setProducts((prev) => [...prev, productForm]);
      Toast.fire({ icon: "success", title: "ເພີ່ມສິນຄ້າໃໝ່ສຳເລັດ!" });
    }

    setProductForm({
      id: "",
      name: "",
      category: "ທົ່ວໄປ",
      costPrice: 0,
      sellPrice: 0,
      promoPrice: 0,
      agentPrice: 0,
      stock: 0,
    });
    setIsEditingProduct(false);
    setProductIdDuplicateError(false);
  };

  const handleEditProduct = (prod: Product) => {
    setProductForm(prod);
    setIsEditingProduct(true);
    setProductIdDuplicateError(false);
  };

  const handleDeleteProduct = (id: string) => {
    Toast.fire({
      title: "ຢືນຢັນການລົບ?",
      text: `ທ່ານຕ້ອງການລົບສິນຄ້າລະຫັດ ${id} ແທ້ບໍ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ລົບເລີຍ",
      cancelButtonText: "ຍົກເລີກ",
    }).then((result) => {
      if (result.isConfirmed) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        Toast.fire({ icon: "success", title: "ລົບສິນຄ້າສຳເລັດແລ້ວ" });
      }
    });
  };

  // --- 7. Admin Panel: Member CRUD & Validations ---
  const handleMemberFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMemberForm((prev) => ({ ...prev, [name]: value }));

    if (name === "id" && !isEditingMember) {
      const exists = members.some((m) => m.id.toLowerCase() === value.trim().toLowerCase());
      setMemberIdDuplicateError(exists && value.trim() !== "");
    }
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.id || !memberForm.name) {
      Toast.fire({ icon: "warning", title: "ກະລຸນາຕື່ມລະຫັດ ແລະ ຊື່ສະມາຊິກ" });
      return;
    }

    if (!isEditingMember && members.some((m) => m.id === memberForm.id)) {
      setMemberIdDuplicateError(true);
      Toast.fire({ icon: "error", title: "ລະຫັດສະມາຊິກຊໍ້າກັນ!" });
      return;
    }

    if (isEditingMember) {
      setMembers((prev) => prev.map((m) => (m.id === memberForm.id ? memberForm : m)));
      Toast.fire({ icon: "success", title: "ແກ້ໄຂຂໍ້ມູນສະມາຊິກສຳເລັດ!" });
    } else {
      setMembers((prev) => [...prev, memberForm]);
      Toast.fire({ icon: "success", title: "ເພີ່ມສະມາຊິກໃໝ່ສຳເລັດ!" });
    }

    setMemberForm({ id: "", name: "", phone: "", address: "" });
    setIsEditingMember(false);
    setMemberIdDuplicateError(false);
  };

  const handleDeleteMember = (id: string) => {
    Toast.fire({
      title: "ຢືນຢັນການລົບສະມາຊິກ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ລົບ",
      cancelButtonText: "ຍົກເລີກ",
    }).then((result) => {
      if (result.isConfirmed) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        Toast.fire({ icon: "success", title: "ລົບສະມາຊິກແລ້ວ" });
      }
    });
  };

  // --- 8. Admin Panel: Stock In System ---
  const handleStockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInForm.productId || stockInForm.quantity <= 0) {
      Toast.fire({ icon: "warning", title: "ກະລຸນາເລືອກສິນຄ້າ ແລະ ຈຳນວນທີ່ຖືກຕ້ອງ" });
      return;
    }

    const targetProduct = products.find((p) => p.id === stockInForm.productId);
    if (!targetProduct) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === stockInForm.productId
          ? { ...p, stock: p.stock + Number(stockInForm.quantity) }
          : p
      )
    );

    const newStockIn: StockInRecord = {
      id: `STK-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString("lo-LA"),
      productId: targetProduct.id,
      productName: targetProduct.name,
      quantity: Number(stockInForm.quantity),
      note: stockInForm.note,
    };
    setStockIns((prev) => [newStockIn, ...prev]);

    Toast.fire({
      icon: "success",
      title: `ຮັບສິນຄ້າເຂົ້າຄັງສຳເລັດ! (+${stockInForm.quantity} ຊິ້ນ)`,
    });

    setStockInForm({ productId: "", quantity: 0, note: "ຮັບເຂົ້າປະຈຳວັນ" });
  };

  // --- 9. Dashboard Calculations & Charts ---
  const dashboardStats = useMemo(() => {
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalCostOfStock = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);

    const todayStr = new Date().toLocaleDateString("lo-LA");
    const todaySales = sales
      .filter((s) => s.date.includes(todayStr) || new Date(s.timestamp).toDateString() === new Date().toDateString())
      .reduce((sum, s) => sum + s.totalAmount, 0);

    return {
      totalStock,
      todaySales,
      memberCount: members.length,
      totalCostOfStock,
      totalProfit,
      totalRevenue,
    };
  }, [products, sales, members]);

  // 7-Day Sales Bar Chart Data
  const barChartData = useMemo(() => {
    const days = ["6 ມື້ກ່ອນ", "5 ມື້ກ່ອນ", "4 ມື້ກ່ອນ", "3 ມື້ກ່ອນ", "2 ມື້ກ່ອນ", "ມື້ວານນີ້", "ມື້ນີ້"];
    const dailyTotals = [0, 0, 0, 0, 0, 0, 0];

    const now = new Date();
    sales.forEach((s) => {
      const diffDays = Math.floor((now.getTime() - s.timestamp) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        dailyTotals[6 - diffDays] += s.totalAmount;
      }
    });

    return {
      labels: days,
      datasets: [
        {
          label: "ຍອດຂາຍ (₭)",
          data: dailyTotals,
          backgroundColor: "rgba(0, 242, 254, 0.7)",
          borderColor: "#00f2fe",
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  }, [sales]);

  // Donut Chart: Product Category Distribution
  const donutChartData = useMemo(() => {
    const categories: Record<string, number> = {};
    products.forEach((p) => {
      categories[p.category] = (categories[p.category] || 0) + p.stock;
    });

    return {
      labels: Object.keys(categories).length ? Object.keys(categories) : ["ບໍ່ມີສິນຄ້າ"],
      datasets: [
        {
          data: Object.values(categories).length ? Object.values(categories) : [1],
          backgroundColor: [
            "rgba(0, 242, 254, 0.8)",
            "rgba(157, 78, 221, 0.8)",
            "rgba(255, 0, 127, 0.8)",
            "rgba(255, 234, 0, 0.8)",
            "rgba(0, 255, 136, 0.8)",
          ],
          borderColor: "#0b1120",
          borderWidth: 2,
        },
      ],
    };
  }, [products]);

  // --- 10. Reports & Exports ---
  const filteredReports = useMemo(() => {
    const now = new Date();
    return sales.filter((s) => {
      const sDate = new Date(s.timestamp);
      if (reportFilter === "day") {
        return sDate.toDateString() === now.toDateString();
      } else if (reportFilter === "week") {
        const diff = (now.getTime() - s.timestamp) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      } else if (reportFilter === "month") {
        return sDate.getMonth() === now.getMonth() && sDate.getFullYear() === now.getFullYear();
      } else {
        return sDate.getFullYear() === now.getFullYear();
      }
    });
  }, [sales, reportFilter]);

  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    sales.forEach((s) => {
      s.items.forEach((it) => {
        if (!map[it.id]) {
          map[it.id] = { name: it.name, qty: 0, revenue: 0 };
        }
        map[it.id].qty += it.quantity;
        map[it.id].revenue += it.subtotal;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 3);
  }, [sales]);

  const handleExportCSV = () => {
    if (sales.length === 0) {
      Toast.fire({ icon: "info", title: "ຍັງບໍ່ມີຂໍ້ມູນການຂາຍເພື່ອດາວໂຫຼດ" });
      return;
    }

    let csvContent = "\uFEFF";
    csvContent += "ເລກທີບິນ,ວັນທີ,ລູກຄ້າ,ຍອດຂາຍລວມ,ຕົ້ນທຶນລວມ,ກຳໄລ,ເງິນຮັບມາ,ເງິນທອນ\n";

    sales.forEach((s) => {
      csvContent += `"${s.id}","${s.date}","${s.memberName || "ລູກຄ້າທົ່ວໄປ"}","${s.totalAmount}","${s.totalCost}","${s.profit}","${s.cashReceived}","${s.change}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Toast.fire({ icon: "success", title: "ດາວໂຫຼດໄຟລ໌ Excel/CSV ສຳເລັດແລ້ວ! 📊" });
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <>
      <Head>
        <title>{settings.shopName} - POS Online System</title>
        <meta name="description" content="ລະບົບຂາຍໜ້າຮ້ານ POS ຮ້ານ ແພງສອນ ຂາຍ Online (ຍິນດີຕ້ອນຮັບ)" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className="min-h-screen flex flex-col md:flex-row bg-[#0b1120] text-slate-100 selection:bg-cyan-500 selection:text-black"
        style={{ color: settings.textColor }}
      >
        {/* ========================================================================= */}
        {/* SIDEBAR NAVIGATION                                                        */}
        {/* ========================================================================= */}
        <aside className="w-full md:w-64 bg-slate-900/80 backdrop-blur-xl border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between p-4 z-20">
          <div>
            {/* Store Header Banner */}
            <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-800/50 border border-slate-700/60 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h1 className="font-bold text-xs md:text-sm text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 truncate leading-tight">
                    {settings.shopName}
                  </h1>
                  <span className="inline-flex items-center text-[11px] text-emerald-400 font-medium mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5" />
                    ລະບົບພ້ອມໃຊ້ງານ
                  </span>
                </div>
              </div>
            </div>

            {/* Nav Menu Items */}
            <nav className="space-y-1.5 font-medium">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                  activeTab === "dashboard"
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <LayoutDashboard className="w-5 h-5 text-cyan-400" />
                <span>ແຜງຄວບຄຸມ (Dashboard)</span>
              </button>

              <button
                onClick={() => setActiveTab("pos")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                  activeTab === "pos"
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                <span>ໜ້າຂາຍສິນຄ້າ (POS)</span>
              </button>

              <button
                onClick={handleSelectAdminTab}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                  activeTab === "admin"
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>ຈັດການລະບົບ (Admin)</span>
              </button>

              <button
                onClick={() => setActiveTab("reports")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                  activeTab === "reports"
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <span>ລາຍງານຍອດຂາຍ (Reports)</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                  activeTab === "settings"
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Settings className="w-5 h-5 text-pink-400" />
                <span>ການຕັ້ງຄ່າ (Settings)</span>
              </button>
            </nav>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
            &copy; 2026 {settings.shopName}
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* MAIN CONTENT WRAPPER WITH TOP BAR                                         */}
        {/* ========================================================================= */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Bar Header */}
          <header className="glass-panel sticky top-0 z-10 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
            <div>
              <p className="text-xs text-slate-400 font-medium">ສະຖານະລະບົບ ແລະ ເວລາປະຈຸບັນ</p>
              <h2 className="text-sm md:text-base font-semibold text-slate-200">{currentLaoDate}</h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Real-time Large Digital Clock */}
              <div className="flex items-center space-x-2 bg-slate-950/80 px-4 py-1.5 rounded-xl border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span
                  className="font-mono text-xl md:text-2xl font-bold tracking-wider"
                  style={{ color: settings.numberColor }}
                >
                  {currentTime || "00:00:00"}
                </span>
              </div>

              {/* Online Green Status Badge */}
              <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-emerald-300 text-xs font-semibold">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Online</span>
              </div>
            </div>
          </header>

          {/* Page Content Container */}
          <div className="p-4 md:p-6 space-y-6">
            {/* ===================================================================== */}
            {/* 1. DASHBOARD TAB (ແຜງຄວບຄຸມ)                                          */}
            {/* ===================================================================== */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Greeting Banner */}
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-700/60 shadow-xl">
                  <div className="relative z-10">
                    <h2 className="text-xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-400">
                      {settings.shopName} 🏪
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm md:text-base">
                      ລະບົບຄຸ້ມຄອງການຂາຍ, ສະຕ໊ອກສິນຄ້າ ແລະ ລາຍງານຍອດຂາຍແບບ Real-time ຄົບວົງຈອນ.
                    </p>
                  </div>
                  <Sparkles className="absolute right-6 top-6 w-32 h-32 text-cyan-500/10 pointer-events-none" />
                </div>

                {/* 5 Real-time Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* 1. ຈຳນວນສິນຄ້າໃນຄັງ */}
                  <div className="glass-card p-4 rounded-2xl border-l-4 border-l-cyan-400 hover:border-cyan-400 transition-all">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400 font-medium">ສິນຄ້າໃນຄັງທັງໝົດ</p>
                      <Package className="w-5 h-5 text-cyan-400" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-2" style={{ color: settings.numberColor }}>
                      {dashboardStats.totalStock} <span className="text-xs text-slate-400 font-normal">ຊິ້ນ</span>
                    </p>
                  </div>

                  {/* 2. ຍອດຂາຍມື້ນີ້ */}
                  <div className="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-400 hover:border-emerald-400 transition-all">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400 font-medium">ຍອດຂາຍມື້ນີ້</p>
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-2 text-emerald-400">
                      {formatKip(dashboardStats.todaySales)}
                    </p>
                  </div>

                  {/* 3. ຈຳນວນລູກຄ້າສະມາຊິກ */}
                  <div className="glass-card p-4 rounded-2xl border-l-4 border-l-purple-400 hover:border-purple-400 transition-all">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400 font-medium">ລູກຄ້າສະມາຊິກ</p>
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-2" style={{ color: settings.numberColor }}>
                      {dashboardStats.memberCount} <span className="text-xs text-slate-400 font-normal">ຄົນ</span>
                    </p>
                  </div>

                  {/* 4. ຕົ້ນທຶນລວມ */}
                  <div className="glass-card p-4 rounded-2xl border-l-4 border-l-amber-400 hover:border-amber-400 transition-all">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400 font-medium">ຕົ້ນທຶນສິນຄ້າໃນຄັງ</p>
                      <ArrowDownCircle className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-2 text-amber-300">
                      {formatKip(dashboardStats.totalCostOfStock)}
                    </p>
                  </div>

                  {/* 5. ກຳໄລລວມ */}
                  <div className="glass-card p-4 rounded-2xl border-l-4 border-l-pink-400 hover:border-pink-400 transition-all">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400 font-medium">ກຳໄລສະສົມທັງໝົດ</p>
                      <TrendingUp className="w-5 h-5 text-pink-400" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-2 text-pink-400">
                      {formatKip(dashboardStats.totalProfit)}
                    </p>
                  </div>
                </div>

                {/* Visual Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 7-Day Bar Chart */}
                  <div className="glass-panel p-5 rounded-2xl lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-base text-cyan-300 flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>ສະຖິຕິຍອດຂາຍຍ້ອນຫຼັງ 7 ມື້ (Bar Chart)</span>
                    </h3>
                    <div className="h-64">
                      <Bar
                        data={barChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { labels: { color: "#94a3b8" } },
                          },
                          scales: {
                            x: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
                            y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Donut Chart */}
                  <div className="glass-panel p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                    <h3 className="font-bold text-base text-purple-300 flex items-center space-x-2">
                      <Radio className="w-5 h-5" />
                      <span>ສັດສ່ວນສິນຄ້າຕາມໝວດໝູ່ (Donut Chart)</span>
                    </h3>
                    <div className="h-60 flex items-center justify-center">
                      <Doughnut
                        data={donutChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: "bottom", labels: { color: "#94a3b8", boxWidth: 12 } },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* 2. POS CASHIER TAB (ໜ້າຂາຍຈຸດຊຳລະເງິນ)                                */}
            {/* ===================================================================== */}
            {activeTab === "pos" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Product Catalog & Search (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Search and Member Bar */}
                  <div className="glass-panel p-4 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Product Search */}
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="ຄົ້ນຫາສິນຄ້າ (ລະຫັດ ID, ຊື່ສິນຄ້າ)..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 text-sm"
                        />
                      </div>

                      {/* Member Selection / Search */}
                      <div className="relative flex-1">
                        <UserPlus className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="ຄົ້ນຫາສະມາຊິກ (ID, ຊື່, ເບີໂທ)..."
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl focus:outline-none focus:border-purple-400 text-sm"
                        />
                        {/* Member Search Suggestions Dropdown */}
                        {memberSearch && (
                          <div className="absolute left-0 right-0 top-12 bg-slate-900 border border-slate-700 rounded-xl max-h-48 overflow-y-auto shadow-2xl z-30">
                            {members
                              .filter(
                                (m) =>
                                  m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                                  m.id.toLowerCase().includes(memberSearch.toLowerCase()) ||
                                  m.phone.includes(memberSearch)
                              )
                              .map((m) => (
                                <div
                                  key={m.id}
                                  onClick={() => {
                                    setSelectedMember(m);
                                    setMemberSearch("");
                                  }}
                                  className="p-2.5 hover:bg-slate-800 cursor-pointer border-b border-slate-800 text-xs flex justify-between"
                                >
                                  <span>
                                    {m.name} ({m.id})
                                  </span>
                                  <span className="text-cyan-400">{m.phone}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Member Display */}
                    {selectedMember && (
                      <div className="flex items-center justify-between bg-purple-950/40 border border-purple-500/40 px-3 py-1.5 rounded-xl text-xs text-purple-200">
                        <span>
                          👤 ລູກຄ້າສະມາຊິກ: <strong>{selectedMember.name}</strong> ({selectedMember.phone})
                        </span>
                        <button
                          onClick={() => setSelectedMember(null)}
                          className="text-pink-400 hover:text-pink-300 font-bold"
                        >
                          ✕ ຍົກເລີກ
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Product Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto p-1">
                    {products
                      .filter(
                        (p) =>
                          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.id.toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .map((product) => (
                        <div
                          key={product.id}
                          className="glass-card p-3 rounded-2xl flex flex-col justify-between hover:border-cyan-400 transition-all group"
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-mono">
                                {product.id}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-md ${
                                  product.stock > 10
                                    ? "bg-emerald-950 text-emerald-400"
                                    : product.stock > 0
                                    ? "bg-amber-950 text-amber-400"
                                    : "bg-rose-950 text-rose-400"
                                }`}
                              >
                                ເຫຼືອ {product.stock}
                              </span>
                            </div>
                            <h4 className="font-semibold text-sm mt-2 line-clamp-2 text-slate-200 group-hover:text-cyan-300">
                              {product.name}
                            </h4>
                          </div>

                          <div className="mt-3">
                            <p className="text-base font-bold text-cyan-400">
                              {formatKip(product.sellPrice)}
                            </p>

                            {/* Price Tier Selection Buttons */}
                            <div className="grid grid-cols-3 gap-1 mt-2">
                              <button
                                onClick={() => addToCart(product, "normal")}
                                className="text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white py-1 rounded-lg"
                                title={`ລາຄາຂາຍ: ${formatKip(product.sellPrice)}`}
                              >
                                ປົກກະຕິ
                              </button>
                              <button
                                onClick={() => addToCart(product, "promo")}
                                className="text-[10px] bg-amber-600 hover:bg-amber-500 text-white py-1 rounded-lg"
                                title={`ລາຄາໂປຣ: ${formatKip(product.promoPrice)}`}
                              >
                                ໂປຣ
                              </button>
                              <button
                                onClick={() => addToCart(product, "agent")}
                                className="text-[10px] bg-purple-600 hover:bg-purple-500 text-white py-1 rounded-lg"
                                title={`ຕົວແທນ: ${formatKip(product.agentPrice)}`}
                              >
                                ຕົວແທນ
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Right Side: Cart & Payment (5 Cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="glass-panel p-4 rounded-2xl flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h3 className="font-bold text-base text-slate-200 flex items-center space-x-2">
                          <ShoppingCart className="w-5 h-5 text-emerald-400" />
                          <span>ກະຕ່າສິນຄ້າ ({cart.length} ລາຍການ)</span>
                        </h3>
                        {cart.length > 0 && (
                          <button
                            onClick={() => setCart([])}
                            className="text-xs text-rose-400 hover:text-rose-300"
                          >
                            ລ້າງກະຕ່າ
                          </button>
                        )}
                      </div>

                      {/* Cart Items List */}
                      <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto mt-2 pr-1">
                        {cart.length === 0 ? (
                          <div className="text-center py-10 text-slate-500 text-sm">
                            🛒 ຍັງບໍ່ມີສິນຄ້າໃນກະຕ່າ <br />
                            (ກົດເລືອກສິນຄ້າເພື່ອຂາຍ)
                          </div>
                        ) : (
                          cart.map((item, idx) => (
                            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                              <div className="flex-1 pr-2">
                                <p className="font-medium text-slate-200 truncate">{item.product.name}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-slate-400">{formatKip(item.unitPrice)}</span>
                                  <span className="text-[10px] bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded">
                                    {item.priceType === "normal"
                                      ? "ປົກກະຕິ"
                                      : item.priceType === "promo"
                                      ? "ໂປຣ"
                                      : "ຕົວແທນ"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700">
                                  <button
                                    onClick={() => updateCartQuantity(idx, item.quantity - 1)}
                                    className="px-2 py-0.5 text-slate-400 hover:text-white"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 font-bold text-cyan-300">{item.quantity}</span>
                                  <button
                                    onClick={() => updateCartQuantity(idx, item.quantity + 1)}
                                    className="px-2 py-0.5 text-slate-400 hover:text-white"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="w-16 text-right font-bold text-slate-200">
                                  {formatKip(item.subtotal)}
                                </span>
                                <button
                                  onClick={() => removeFromCart(idx)}
                                  className="text-rose-400 hover:text-rose-300 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Summary & Checkout Section */}
                    <div className="pt-4 border-t border-slate-800 space-y-3 mt-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">ຍອດລວມທັງໝົດ:</span>
                        <span className="text-2xl font-extrabold text-cyan-400">
                          {formatKip(cartTotal)}
                        </span>
                      </div>

                      {/* Cash Input */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 flex justify-between">
                          <span>ຈຳນວນເງິນທີ່ຮັບມາ:</span>
                          <span className="text-[10px] text-cyan-400">ກົດ Spacebar ເພື່ອໃສ່ພໍດີ</span>
                        </label>
                        <input
                          ref={cashInputRef}
                          type="number"
                          placeholder="0 ₭"
                          value={cashReceived}
                          onChange={(e) =>
                            setCashReceived(e.target.value === "" ? "" : Number(e.target.value))
                          }
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-right text-lg font-bold text-emerald-400 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      {/* Change Amount */}
                      <div className="flex justify-between items-center text-sm bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 font-medium">ເງິນທອນ:</span>
                        <span className="text-lg font-bold text-amber-400">
                          {formatKip(changeAmount)}
                        </span>
                      </div>

                      {/* Checkout Button */}
                      <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || cashReceived === "" || Number(cashReceived) < cartTotal}
                        className={`w-full py-3 rounded-xl font-bold text-base flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg ${
                          cart.length > 0 && Number(cashReceived) >= cartTotal
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30 cursor-pointer"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>ຢືນຢັນການຊຳລະເງິນ (Enter)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* 3. ADMIN PANEL TAB (ຈັດການຂໍ້ມູນສິນຄ້າ, ສະມາຊິກ ແລະ ຮັບສິນຄ້າ)         */}
            {/* ===================================================================== */}
            {activeTab === "admin" && (
              <div className="space-y-8">
                {/* 3.1 ຈັດການຂໍ້ມູນສິນຄ້າ */}
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <h3 className="text-base font-bold text-cyan-300 flex items-center space-x-2">
                    <Package className="w-5 h-5 text-cyan-400" />
                    <span>ຈັດການລາຍການສິນຄ້າ (ເພີ່ມ / ແກ້ໄຂ / ລົບ)</span>
                  </h3>

                  {/* Form ເພີ່ມ/ແກ້ໄຂສິນຄ້າ */}
                  <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-slate-400">ເລກທີ ID ສິນຄ້າ *</label>
                      <input
                        type="text"
                        name="id"
                        value={productForm.id}
                        onChange={handleProductFormChange}
                        disabled={isEditingProduct}
                        placeholder="ເຊັ່ນ: P005"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-cyan-400 focus:outline-none"
                      />
                      {productIdDuplicateError && (
                        <p className="text-xs text-rose-500 mt-1 font-semibold">
                          ⚠️ ລະຫັດ ID ນີ້ມີໃນລະບົບແລ້ວ!
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-400">ຊື່ສິນຄ້າ *</label>
                      <input
                        type="text"
                        name="name"
                        value={productForm.name}
                        onChange={handleProductFormChange}
                        placeholder="ຊື່ສິນຄ້າ..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400">ໝວດໝູ່</label>
                      <input
                        type="text"
                        name="category"
                        value={productForm.category}
                        onChange={handleProductFormChange}
                        placeholder="ເຊັ່ນ: ເຄື່ອງນຸ່ງ, ເກີບ..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400">ຕົ້ນທຶນ (₭) *</label>
                      <input
                        type="number"
                        name="costPrice"
                        value={productForm.costPrice}
                        onChange={handleProductFormChange}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400">ລາຄາຂາຍປົກກະຕິ (₭) *</label>
                      <input
                        type="number"
                        name="sellPrice"
                        value={productForm.sellPrice}
                        onChange={handleProductFormChange}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400">ລາຄາໂປຣໂມຊັ່ນ (₭)</label>
                      <input
                        type="number"
                        name="promoPrice"
                        value={productForm.promoPrice}
                        onChange={handleProductFormChange}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400">ລາຄາຕົວແທນ (₭)</label>
                      <input
                        type="number"
                        name="agentPrice"
                        value={productForm.agentPrice}
                        onChange={handleProductFormChange}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400">ຈຳນວນສະຕ໊ອກ</label>
                      <input
                        type="number"
                        name="stock"
                        value={productForm.stock}
                        onChange={handleProductFormChange}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-4 flex justify-end space-x-2 pt-2">
                      {isEditingProduct && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingProduct(false);
                            setProductForm({
                              id: "",
                              name: "",
                              category: "ທົ່ວໄປ",
                              costPrice: 0,
                              sellPrice: 0,
                              promoPrice: 0,
                              agentPrice: 0,
                              stock: 0,
                            });
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                        >
                          ຍົກເລີກ
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={productIdDuplicateError}
                        className={`px-5 py-2 rounded-xl text-xs font-bold text-slate-950 flex items-center space-x-1 ${
                          isEditingProduct
                            ? "bg-amber-400 hover:bg-amber-300"
                            : "bg-emerald-400 hover:bg-emerald-300"
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{isEditingProduct ? "ບັນທຶກການແກ້ໄຂ" : "ບັນທຶກສິນຄ້າໃໝ່"}</span>
                      </button>
                    </div>
                  </form>

                  {/* Table ສະແດງສິນຄ້າ */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">ID</th>
                          <th className="p-3">ຊື່ສິນຄ້າ</th>
                          <th className="p-3">ໝວດໝູ່</th>
                          <th className="p-3">ຕົ້ນທຶນ</th>
                          <th className="p-3">ລາຄາຂາຍ</th>
                          <th className="p-3">ລາຄາໂປຣ</th>
                          <th className="p-3">ລາຄາຕົວແທນ</th>
                          <th className="p-3">ສະຕ໊ອກ</th>
                          <th className="p-3 text-center">ຈັດການ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {products.map((prod) => (
                          <tr key={prod.id} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono text-cyan-400">{prod.id}</td>
                            <td className="p-3 font-semibold">{prod.name}</td>
                            <td className="p-3 text-slate-400">{prod.category}</td>
                            <td className="p-3">{formatKip(prod.costPrice)}</td>
                            <td className="p-3 text-cyan-400 font-bold">{formatKip(prod.sellPrice)}</td>
                            <td className="p-3 text-amber-400">{formatKip(prod.promoPrice)}</td>
                            <td className="p-3 text-purple-400">{formatKip(prod.agentPrice)}</td>
                            <td className="p-3 font-bold">{prod.stock}</td>
                            <td className="p-3 flex justify-center space-x-2">
                              <button
                                onClick={() => handleEditProduct(prod)}
                                className="p-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/40 rounded-lg"
                                title="ແກ້ໄຂ"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 rounded-lg"
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

                {/* 3.2 ຈັດການສະມາຊິກ */}
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <h3 className="text-base font-bold text-purple-300 flex items-center space-x-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span>ຈັດການຂໍ້ມູນລູກຄ້າສະມາຊິກ</span>
                  </h3>

                  <form onSubmit={handleSaveMember} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-slate-400">ເລກທີ ID ສະມາຊິກ *</label>
                      <input
                        type="text"
                        name="id"
                        value={memberForm.id}
                        onChange={handleMemberFormChange}
                        disabled={isEditingMember}
                        placeholder="ເຊັ່ນ: M003"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-purple-400 focus:outline-none"
                      />
                      {memberIdDuplicateError && (
                        <p className="text-xs text-rose-500 mt-1 font-semibold">
                          ⚠️ ລະຫັດສະມາຊິກຊໍ້າກັນ!
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-400">ຊື່ ແລະ ນາມສະກຸນ *</label>
                      <input
                        type="text"
                        name="name"
                        value={memberForm.name}
                        onChange={handleMemberFormChange}
                        placeholder="ຊື່ລູກຄ້າ..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400">ເບີໂທຕິດຕໍ່</label>
                      <input
                        type="text"
                        name="phone"
                        value={memberForm.phone}
                        onChange={handleMemberFormChange}
                        placeholder="020..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400">ທີ່ຢູ່</label>
                      <input
                        type="text"
                        name="address"
                        value={memberForm.address}
                        onChange={handleMemberFormChange}
                        placeholder="ບ້ານ, ເມືອງ, ແຂວງ..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-4 flex justify-end space-x-2">
                      <button
                        type="submit"
                        disabled={memberIdDuplicateError}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-purple-400 hover:bg-purple-300"
                      >
                        {isEditingMember ? "ບັນທຶກການແກ້ໄຂສະມາຊິກ" : "ເພີ່ມສະມາຊິກໃໝ່"}
                      </button>
                    </div>
                  </form>

                  {/* Member Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">ID ສະມາຊິກ</th>
                          <th className="p-3">ຊື່ລູກຄ້າ</th>
                          <th className="p-3">ເບີໂທ</th>
                          <th className="p-3">ທີ່ຢູ່</th>
                          <th className="p-3 text-center">ຈັດການ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {members.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono text-purple-400">{m.id}</td>
                            <td className="p-3 font-semibold">{m.name}</td>
                            <td className="p-3 text-slate-300">{m.phone}</td>
                            <td className="p-3 text-slate-400">{m.address}</td>
                            <td className="p-3 flex justify-center space-x-2">
                              <button
                                onClick={() => {
                                  setMemberForm(m);
                                  setIsEditingMember(true);
                                }}
                                className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMember(m.id)}
                                className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg"
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

                {/* 3.3 ລະບົບຈັດການຮັບສິນຄ້າເຂົ້າຄັງ */}
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <h3 className="text-base font-bold text-emerald-300 flex items-center space-x-2">
                    <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
                    <span>ລະບົບຮັບສິນຄ້າເຂົ້າຄັງ (Stock In)</span>
                  </h3>

                  <form onSubmit={handleStockInSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-400">ເລືອກສິນຄ້າ *</label>
                      <select
                        value={stockInForm.productId}
                        onChange={(e) => setStockInForm((prev) => ({ ...prev, productId: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-emerald-400 focus:outline-none"
                      >
                        <option value="">-- ເລືອກສິນຄ້າ --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (ຄັງປະຈຸບັນ: {p.stock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400">ຈຳນວນທີ່ຮັບເຂົ້າ *</label>
                      <input
                        type="number"
                        min="1"
                        value={stockInForm.quantity}
                        onChange={(e) =>
                          setStockInForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-emerald-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400">ໝາຍເຫດ / ຜູ້ສະໜອງ</label>
                      <input
                        type="text"
                        value={stockInForm.note}
                        onChange={(e) => setStockInForm((prev) => ({ ...prev, note: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-emerald-400 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300"
                      >
                        + ບັນທຶກຮັບສິນຄ້າເຂົ້າຄັງ
                      </button>
                    </div>
                  </form>

                  {/* Stock In Log History */}
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-slate-400 mb-2">ປະຫວັດການຮັບສິນຄ້າຫຼ້າສຸດ:</h4>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {stockIns.map((stk, index) => (
                        <div
                          key={index}
                          className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-xs flex justify-between items-center"
                        >
                          <div>
                            <span className="font-semibold text-slate-200">
                              ລາຍການທີ {index + 1}: {stk.productName}
                            </span>
                            <span className="text-slate-400 ml-2">({stk.date})</span>
                          </div>
                          <span className="text-emerald-400 font-bold">+{stk.quantity} ຊິ້ນ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* 4. SALES REPORT TAB (ລະບົບລາຍງານຍອດຂາຍ)                                */}
            {/* ===================================================================== */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                {/* Filter and Top 3 Summary */}
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-base font-bold text-purple-300 flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      <span>ລາຍງານຍອດຂາຍ & ກຳໄລ</span>
                    </h3>

                    {/* Filter Buttons */}
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
                      {(["day", "week", "month", "year"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setReportFilter(f)}
                          className={`px-3 py-1.5 rounded-lg transition-all ${
                            reportFilter === f
                              ? "bg-purple-600 text-white font-bold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {f === "day"
                            ? "ມື້ນີ້"
                            : f === "week"
                            ? "ອາທິດນີ້"
                            : f === "month"
                            ? "ເດືອນນີ້"
                            : "ທັງໝົດ/ປີ"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3 ອັນດັບສິນຄ້າຂາຍດີ */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {topProducts.map((p, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/70 p-3.5 rounded-2xl border border-purple-500/30 flex items-center space-x-3"
                      >
                        <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-base">
                          #{idx + 1}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-xs text-slate-200 truncate">{p.name}</p>
                          <p className="text-[11px] text-slate-400">
                            ຂາຍໄດ້: <strong className="text-cyan-400">{p.qty}</strong> ຊິ້ນ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sales Transactions Table */}
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-slate-200">ປະຫວັດການຂາຍທັງໝົດ</h4>
                    <span className="text-xs text-slate-400">
                      ທັງໝົດ {filteredReports.length} ບິນ
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">ເລກບິນ</th>
                          <th className="p-3">ວັນທີ/ເວລາ</th>
                          <th className="p-3">ລູກຄ້າ</th>
                          <th className="p-3">ຈຳນວນລາຍການ</th>
                          <th className="p-3">ຍອດຂາຍລວມ</th>
                          <th className="p-3">ຕົ້ນທຶນ</th>
                          <th className="p-3">ກຳໄລ</th>
                          <th className="p-3 text-center">ພິມໃບບິນ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredReports.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono text-cyan-400">{s.id}</td>
                            <td className="p-3 text-slate-400">{s.date}</td>
                            <td className="p-3 font-medium">{s.memberName || "ລູກຄ້າທົ່ວໄປ"}</td>
                            <td className="p-3">{s.items.length} ລາຍການ</td>
                            <td className="p-3 font-bold text-cyan-400">{formatKip(s.totalAmount)}</td>
                            <td className="p-3 text-amber-400">{formatKip(s.totalCost)}</td>
                            <td className="p-3 text-emerald-400 font-bold">{formatKip(s.profit)}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => {
                                  setLastReceipt(s);
                                  setIsReceiptModalOpen(true);
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
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

                  {/* Bottom Export Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                    <div className="flex space-x-3">
                      <button
                        onClick={handleExportPDF}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-2 shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                        <span>ດາວໂຫລດ PDF / ພິມລາຍງານ</span>
                      </button>

                      <button
                        onClick={handleExportCSV}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-2 shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                        <span>ດາວໂຫຼດ Excel/CSV</span>
                      </button>
                    </div>

                    <div className="text-right text-xs text-slate-400">
                      ກຳໄລລວມທັງໝົດ:{" "}
                      <strong className="text-emerald-400 text-sm">
                        {formatKip(filteredReports.reduce((s, r) => s + r.profit, 0))}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* 5. SETTINGS TAB (ການຕັ້ງຄ່າ)                                           */}
            {/* ===================================================================== */}
            {activeTab === "settings" && (
              <div className="glass-panel p-6 rounded-2xl max-w-2xl mx-auto space-y-6">
                <h3 className="text-base font-bold text-pink-300 flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-pink-400" />
                  <span>ຕັ້ງຄ່າລະບົບ & ຄວາມສວຍງາມ</span>
                </h3>

                <div className="space-y-4">
                  {/* Store Name */}
                  <div>
                    <label className="text-xs text-slate-400">ຊື່ຮ້ານຄ້າ</label>
                    <input
                      type="text"
                      value={settings.shopName}
                      onChange={(e) => setSettings((prev) => ({ ...prev, shopName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-pink-400 focus:outline-none"
                    />
                  </div>

                  {/* Admin Password */}
                  <div>
                    <label className="text-xs text-slate-400">ລະຫັດຜ່ານ Admin Panel</label>
                    <input
                      type="text"
                      value={settings.adminPassword}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, adminPassword: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm focus:border-pink-400 focus:outline-none"
                    />
                  </div>

                  {/* Color Adjustments */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400">ສີຕົວໜັງສືທົ່ວໄປ (Text Color)</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          type="color"
                          value={settings.textColor}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, textColor: e.target.value }))
                          }
                          className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                        />
                        <span className="text-xs font-mono">{settings.textColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400">ສີຕົວເລກ & ເວລາ (Number Highlight Color)</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          type="color"
                          value={settings.numberColor}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, numberColor: e.target.value }))
                          }
                          className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                        />
                        <span className="text-xs font-mono">{settings.numberColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() =>
                        Toast.fire({ icon: "success", title: "ບັນທຶກການຕັ້ງຄ່າສຳເລັດ!" })
                      }
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-400 hover:to-rose-300"
                    >
                      ບັນທຶກການຕັ້ງຄ່າ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ========================================================================= */}
        {/* PRINTABLE RECEIPT MODAL                                                   */}
        {/* ========================================================================= */}
        {isReceiptModalOpen && lastReceipt && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
              {/* Receipt Content (Ready for Print) */}
              <div id="printable-receipt" className="text-slate-100 text-xs font-mono space-y-3">
                <div className="text-center space-y-1">
                  <h2 className="text-base font-bold">{settings.shopName}</h2>
                  <p className="text-[10px] text-slate-400">ໃບຮັບເງິນ / ໃບບິນຂາຍ (Receipt)</p>
                  <p className="text-[10px] text-slate-400">ເລກບິນ: {lastReceipt.id}</p>
                  <p className="text-[10px] text-slate-400">ວັນທີ: {lastReceipt.date}</p>
                  {lastReceipt.memberName && (
                    <p className="text-[10px] text-cyan-400">ລູກຄ້າ: {lastReceipt.memberName}</p>
                  )}
                </div>

                <div className="border-t border-b border-dashed border-slate-700 py-2 space-y-1.5">
                  {lastReceipt.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {it.name} x{it.quantity}
                      </span>
                      <span>{formatKip(it.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-right">
                  <div className="flex justify-between font-bold text-sm">
                    <span>ຍອດລວມ:</span>
                    <span>{formatKip(lastReceipt.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>ເງິນຮັບມາ:</span>
                    <span>{formatKip(lastReceipt.cashReceived)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-amber-400 font-bold">
                    <span>ເງິນທອນ:</span>
                    <span>{formatKip(lastReceipt.change)}</span>
                  </div>
                </div>

                <div className="text-center pt-2 border-t border-dashed border-slate-700 text-[10px] text-slate-400">
                  ຂໍຂອບໃຈລູກຄ້າທຸກທ່ານທີ່ມາອຸດໜູນ! 🙏
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2 no-print">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1"
                >
                  <Printer className="w-4 h-4" />
                  <span>ພິມໃບບິນ</span>
                </button>
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  ປິດໜ້າຕ່າງ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
```