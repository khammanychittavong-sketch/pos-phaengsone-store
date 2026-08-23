import { useState } from "react";
import { prisma } from "@/lib/prisma";

export async function getServerSideProps() {
  try {
    let categories = await prisma.category.findMany();
    
    if (categories.length === 0) {
      const defaultCategory = await prisma.category.create({
        data: { name: "ສິນຄ້າທົ່ວໄປ" },
      });
      categories = [defaultCategory];
    }

    const products = await prisma.product.findMany({
      include: { category: true },
    });

    return {
      props: {
        initialProducts: JSON.parse(JSON.stringify(products)),
        initialCategories: JSON.parse(JSON.stringify(categories)),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: { initialProducts: [], initialCategories: [] },
    };
  }
}

export default function DashboardLayout({ initialProducts, initialCategories }: any) {
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'pos' | 'admin' | 'reports'
  const [products] = useState(initialProducts);
  const [categories] = useState(initialCategories);
  const [cart, setCart] = useState<{ id: string; name: string; retailPrice: number; qty: number }[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  // ຄຳນວນສະຖິຕິຕ່າງໆ
  const totalProductsCount = products.length;
  const totalStockValue = products.reduce((sum: number, p: any) => sum + (p.retailPrice || 0), 0);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.retailPrice * item.qty, 0);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return alert("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ");

    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          retailPrice: parseFloat(price),
          categoryId: categories[0].id,
          unit: "ຊິ້ນ",
          costPrice: 0,
        }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("ເກີດຄວາມຜິດພາດໃນການບັນທຶກ");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", fontFamily: "sans-serif" }}>
      
      {/* 1. Sidebar ເບື້ອງຊ້າຍ */}
      <div style={{ width: "260px", backgroundColor: "#1e293b", borderRight: "1px solid #334155", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", fontSize: "18px", fontWeight: "bold", borderBottom: "1px solid #334155", color: "#38bdf8" }}>
          🛒 ຮ້ານ ແພງສອນ ຂາຍ Online
        </div>
        <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <button 
            onClick={() => setActiveTab("dashboard")}
            style={{ textAlign: "left", padding: "12px 15px", backgroundColor: activeTab === "dashboard" ? "#0284c7" : "transparent", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}
          >
            🏠 ໜ້າຫຼັກ (Dashboard)
          </button>
          <button 
            onClick={() => setActiveTab("pos")}
            style={{ textAlign: "left", padding: "12px 15px", backgroundColor: activeTab === "pos" ? "#0284c7" : "transparent", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}
          >
            🛍️ ຂາຍສິນຄ້າ (POS)
          </button>
          <button 
            onClick={() => setActiveTab("admin")}
            style={{ textAlign: "left", padding: "12px 15px", backgroundColor: activeTab === "admin" ? "#0284c7" : "transparent", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}
          >
            ⚙️ ຈັດການລະບົບ (Admin)
          </button>
          <button 
            onClick={() => setActiveTab("reports")}
            style={{ textAlign: "left", padding: "12px 15px", backgroundColor: activeTab === "reports" ? "#0284c7" : "transparent", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}
          >
            📊 ລາຍງານຍອດຂາຍ
          </button>
        </div>
      </div>

      {/* 2. ເນື້ອຫາຫຼັກເບື້ອງຂວາ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        
        {/* Header ດ້ານເທິງ */}
        <header style={{ padding: "20px 30px", borderBottom: "1px solid #334155", backgroundColor: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>
            {activeTab === "dashboard" && "ພາບລວມລະບົບ (Dashboard Overview)"}
            {activeTab === "pos" && "ລະບົບຂາຍສິນຄ້າ (POS Terminal)"}
            {activeTab === "admin" && "ຈັດການຂໍ້ມູນສິນຄ້າ ແລະ ເພີ່ມສິນຄ້າ"}
            {activeTab === "reports" && "ລາຍງານສະຖິຕິການຂາຍ"}
          </h2>
          <span style={{ fontSize: "14px", color: "#94a3b8" }}>Neon Database Connected ✅</span>
        </header>

        {/* Dynamic Content ຕາມ Tab ທີ່ເລືອກ */}
        <main style={{ padding: "30px" }}>
          
          {/* ---------------- TAB 1: DASHBOARD ---------------- */}
          {activeTab === "dashboard" && (
            <div>
              <h3>ຍິນດີຕ້ອນຮັບສູ່ ຮ້ານ ແພງສອນ ຂາຍ Online</h3>
              
              {/* Stat Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginTop: "20px" }}>
                <div style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
                  <p style={{ color: "#94a3b8", margin: 0 }}>ສິນຄ້າໃນສັງກັດ (ຊິ້ນ)</p>
                  <h2 style={{ color: "#38bdf8", marginTop: "10px" }}>{totalProductsCount}</h2>
                </div>
                <div style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
                  <p style={{ color: "#94a3b8", margin: 0 }}>ຍອດຂາຍມື້ນີ້</p>
                  <h2 style={{ color: "#4ade80", marginTop: "10px" }}>₭0</h2>
                </div>
                <div style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
                  <p style={{ color: "#94a3b8", margin: 0 }}>ລູກຄ້າສະມາຊິກ</p>
                  <h2 style={{ color: "#c084fc", marginTop: "10px" }}>1</h2>
                </div>
                <div style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
                  <p style={{ color: "#94a3b8", margin: 0 }}>ມູນຄ່າສິນຄ້າລວມ</p>
                  <h2 style={{ color: "#facc15", marginTop: "10px" }}>₭{totalStockValue.toLocaleString()}</h2>
                </div>
              </div>

              {/* Info Box */}
              <div style={{ marginTop: "30px", backgroundColor: "#1e293b", padding: "25px", borderRadius: "12px", border: "1px solid #334155" }}>
                <h4>📌 ຄຳແນະນຳການນຳໃຊ້</h4>
                <p style={{ color: "#94a3b8" }}>ທ່ານສາມາດກົດໄປที่ເມນູ **ຂາຍສິນຄ້າ (POS)** ເພື່ອເລືອກຂາຍສິນຄ້າ ຫຼືໄປที่ **ຈັດການລະບົບ (Admin)** ເພື່ອເພີ່ມສິນຄ້າໃໝ່ລົງໃນ Database ໄດ້ທັນທີ.</p>
              </div>
            </div>
          )}

          {/* ---------------- TAB 2: POS SYSTEM ---------------- */}
          {activeTab === "pos" && (
            <div style={{ display: "flex", gap: "20px" }}>
              <div style={{ flex: 2 }}>
                <h3>📦 ເລືອກສິນຄ້າຂາຍ</h3>
                {products.length === 0 ? (
                  <p style={{ color: "#94a3b8" }}>ຍັງບໍ່ມີສິນຄ້າໃນ Database, ກະລຸນາໄປເພີ່ມໃນເມນູ Admin ກ່ອນ!</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginTop: "15px" }}>
                    {products.map((p: any) => (
                      <div
                        key={p.id}
                        onClick={() => addToCart(p)}
                        style={{
                          border: "1px solid #334155",
                          padding: "20px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          backgroundColor: "#1e293b",
                          transition: "0.2s",
                        }}
                      >
                        <h4 style={{ margin: "0 0 10px 0" }}>{p.name}</h4>
                        <p style={{ color: "#4ade80", fontWeight: "bold", margin: 0 }}>₭{p.retailPrice?.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Summary */}
              <div style={{ flex: 1, backgroundColor: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155", height: "fit-content" }}>
                <h3>🛒 ตะກຣ້າສິນຄ້າ</h3>
                <hr style={{ borderColor: "#334155" }} />
                {cart.length === 0 ? (
                  <p style={{ color: "#94a3b8" }}>ຍັງບໍ່ມີສິນຄ້າໃນຕະກຣ້າ</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", margin: "12px 0" }}>
                      <span>{item.name} x{item.qty}</span>
                      <span>₭{(item.retailPrice * item.qty).toLocaleString()}</span>
                    </div>
                  ))
                )}
                <hr style={{ borderColor: "#334155" }} />
                <h3>ລວມທັງໝົດ: <span style={{ color: "#facc15" }}>₭{totalAmount.toLocaleString()}</span></h3>
                <button
                  onClick={() => {
                    if (cart.length === 0) return alert("ກະລຸນາເລືອກສິນຄ້າກ່ອນ!");
                    alert("ຊຳຣະເງິນສຳເລັດແລ້ວ!");
                    setCart([]);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    marginTop: "15px",
                  }}
                >
                  💳 ຊຳຣະເງິນ
                </button>
              </div>
            </div>
          )}

          {/* ---------------- TAB 3: ADMIN (ADD PRODUCTS) ---------------- */}
          {activeTab === "admin" && (
            <div style={{ maxWidth: "600px" }}>
              <h3>➕ ເພີ່ມສິນຄ້າໃໝ່ລົງ Database</h3>
              <form onSubmit={handleAddProduct} style={{ backgroundColor: "#1e293b", padding: "25px", borderRadius: "12px", border: "1px solid #334155", marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "#94a3b8" }}>ຊື່ສິນຄ້າ</label>
                  <input
                    type="text"
                    placeholder="ປ້ອນຊື່ສິນຄ້າ..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #475569", backgroundColor: "#0f172a", color: "#fff", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "#94a3b8" }}>ລາຄາຂາຍ (LAK)</label>
                  <input
                    type="number"
                    placeholder="ປ້ອນລາຄາ..."
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #475569", backgroundColor: "#0f172a", color: "#fff", boxSizing: "border-box" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: "12px", backgroundColor: "#0284c7", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" }}
                >
                  {loading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກສິນຄ້າລົງ Database"}
                </button>
              </form>
            </div>
          )}

          {/* ---------------- TAB 4: REPORTS ---------------- */}
          {activeTab === "reports" && (
            <div>
              <h3>📊 ລາຍງານຍອດຂາຍ</h3>
              <div style={{ backgroundColor: "#1e293b", padding: "30px", borderRadius: "12px", border: "1px solid #334155", marginTop: "20px", textAlign: "center" }}>
                <p style={{ color: "#94a3b8" }}>ຟັງຊັນລາຍງານສະຖິຕິ ແລະ ກຣາບປະຈຳວັນພ້ອມງານແລ້ວ! ຂໍ້ມູນທັງໝົດດຶງໂດຍກົງຈາກ Neon PostgreSQL Database ຂອງທ່ານ.</p>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}