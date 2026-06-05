import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// API Placeholders & Routing logic
// ------------------------------------
let customProductsCache: any[] = [];
let localOrders: any[] = [
  {
    id: "ord-110",
    userEmail: "mrflop786@gmail.com",
    userName: "mrflop786",
    totalAmount: 49,
    paymentStatus: "paid",
    downloadStatus: "completed",
    transactionId: "TX-EP-09251",
    method: "EasyPaisa",
    payNumber: "03214567891",
    date: "2026-05-30T14:22:10Z",
    items: [{ id: "prod-01", title: "Aether Dashboard Template (React & Tailwind)", price: 49 }]
  },
  {
    id: "ord-111",
    userEmail: "developer-pro@code.net",
    userName: "devpro_aether",
    totalAmount: 35,
    paymentStatus: "pending",
    downloadStatus: "pending",
    transactionId: "TX-JC-77561",
    method: "JazzCash",
    payNumber: "03001234567",
    date: "2026-06-01T05:10:00Z",
    items: [{ id: "prod-02", title: "VividUI - Premium Design System & Figma UI Kit", price: 35 }]
  },
  {
    id: "ord-112",
    userEmail: "crypto-enthusiast@vault.io",
    userName: "cryptoman",
    totalAmount: 110,
    paymentStatus: "paid",
    downloadStatus: "pending",
    transactionId: "0x8fae32bc117a78e5ab",
    method: "Cryptocurrency",
    payNumber: "USDT-TRC20",
    date: "2026-06-01T07:44:32Z",
    items: [
      { id: "prod-02", title: "VividUI - Premium System Figma UI Kit", price: 35 },
      { id: "prod-03", title: "Stripe Python Backend Core Gateway", price: 75 }
    ]
  }
];

let localCoupons: any[] = [
  { code: "AETHER50", discountType: "percent", discountValue: 50, expiryDate: "2026-12-31", active: true },
  { code: "FLAT15", discountType: "fixed", discountValue: 15, expiryDate: "2026-08-30", active: true },
  { code: "FREEPASS", discountType: "percent", discountValue: 100, expiryDate: "2026-06-30", active: false }
];

let localUsers: any[] = [
  { email: "mrflop786@gmail.com", name: "mrflop786", role: "admin", blocked: false, dateJoined: "2026-04-10" },
  { email: "developer-pro@code.net", name: "devpro_aether", role: "user", blocked: false, dateJoined: "2026-05-12" },
  { email: "crypto-enthusiast@vault.io", name: "cryptoman", role: "user", blocked: false, dateJoined: "2026-05-28" },
  { email: "guest_blocked_user@test.net", name: "BlockedAccount", role: "user", blocked: true, dateJoined: "2026-05-15" }
];

let localCategories: any[] = [
  { name: "Web Templates", count: 12, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150&h=150" },
  { name: "UI Kits", count: 8, image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=150&h=150" },
  { name: "Scripts", count: 15, image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=150&h=150" },
  { name: "Plugins", count: 5, image: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=150&h=150" },
  { name: "Graphics", count: 20, image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=150&h=150" },
  { name: "SaaS Tools", count: 4, image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=150&h=150" },
  { name: "AI Prompts", count: 32, image: "https://images.unsplash.com/photo-1675557009875-436f09780264?auto=format&fit=crop&q=80&w=150&h=150" }
];

// Backend API routing setup
// 1. Analytics endpoint
app.get('/api/analytics', (req, res) => {
  const totalRevenue = localOrders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalOrders = localOrders.length;
  const totalUsers = localUsers.length;
  const pendingOrdersCount = localOrders.filter(o => o.paymentStatus === 'pending').length;
  const completedOrdersCount = localOrders.filter(o => o.paymentStatus === 'paid').length;
  const todaySales = localOrders
    .filter(o => o.date.startsWith(new Date().toISOString().split('T')[0]) && o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Sales by Category calculations
  const salesByCategory = {
    "Web Templates": 0,
    "UI Kits": 0,
    "Scripts": 0,
    "Plugins": 0,
    "Graphics": 0,
    "SaaS Tools": 0,
    "AI Prompts": 0
  };

  localOrders.forEach(order => {
    if (order.paymentStatus === 'paid') {
      order.items?.forEach((item: any) => {
        // Mock category lookup
        if (item.id === 'prod-01') salesByCategory["Web Templates"] += item.price;
        else if (item.id === 'prod-02') salesByCategory["UI Kits"] += item.price;
        else if (item.id === 'prod-03') salesByCategory["Scripts"] += item.price;
        else salesByCategory["Graphics"] += item.price;
      });
    }
  });

  res.json({
    summary: {
      totalRevenue,
      totalOrders,
      totalProducts: 8, // Hardcoded initial products count
      totalUsers,
      pendingOrders: pendingOrdersCount,
      completedOrders: completedOrdersCount,
      todaySales: todaySales || 110 // fallback metric
    },
    salesByCategory,
    dailyRevenue: [
      { day: "Mon", revenue: 140 },
      { day: "Tue", revenue: 220 },
      { day: "Wed", revenue: 190 },
      { day: "Thu", revenue: 310 },
      { day: "Fri", revenue: 290 },
      { day: "Sat", revenue: 420 },
      { day: "Sun", revenue: totalRevenue }
    ],
    mostSold: [
      { title: "Aether Dashboard Template", sold: 14, revenue: 686 },
      { title: "VividUI Premium Figma UI Kit", sold: 11, revenue: 385 },
      { title: "Stripe Payment Core Script", sold: 8, revenue: 600 }
    ]
  });
});

// 2. Coupon Management
app.get('/api/coupons', (req, res) => {
  res.json(localCoupons);
});

app.post('/api/coupons', (req, res) => {
  const { code, discountType, discountValue, expiryDate, active } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }
  const coupon = {
    code: code.trim().toUpperCase(),
    discountType: discountType || 'percent',
    discountValue: Number(discountValue) || 10,
    expiryDate: expiryDate || '2026-12-31',
    active: active !== undefined ? active : true
  };
  localCoupons = localCoupons.filter(c => c.code !== coupon.code);
  localCoupons.push(coupon);
  res.json({ success: true, coupon });
});

app.delete('/api/coupons/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  localCoupons = localCoupons.filter(c => c.code !== code);
  res.json({ success: true });
});

// 3. User operations
app.get('/api/users', (req, res) => {
  res.json(localUsers);
});

app.put('/api/users/:email/role', (req, res) => {
  const { role } = req.body;
  localUsers = localUsers.map(u => u.email === req.params.email ? { ...u, role } : u);
  res.json({ success: true });
});

app.put('/api/users/:email/block', (req, res) => {
  const { blocked } = req.body;
  localUsers = localUsers.map(u => u.email === req.params.email ? { ...u, blocked } : u);
  res.json({ success: true });
});

// 4. Order operations
app.get('/api/orders', (req, res) => {
  res.json(localOrders);
});

app.post('/api/orders', (req, res) => {
  const ord = {
    id: `ord-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString(),
    ...req.body
  };
  localOrders.unshift(ord);
  res.json({ success: true, order: ord });
});

app.put('/api/orders/:id', (req, res) => {
  const { paymentStatus, downloadStatus } = req.body;
  localOrders = localOrders.map(o => {
    if (o.id === req.params.id) {
      return {
        ...o,
        paymentStatus: paymentStatus !== undefined ? paymentStatus : o.paymentStatus,
        downloadStatus: downloadStatus !== undefined ? downloadStatus : o.downloadStatus
      };
    }
    return o;
  });
  res.json({ success: true });
});

// 5. Category operations
app.get('/api/categories', (req, res) => {
  res.json(localCategories);
});

app.post('/api/categories', (req, res) => {
  const { name, image } = req.body;
  const newCat = {
    name,
    image: image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150&h=150",
    count: 0
  };
  localCategories = localCategories.filter(c => c.name !== name);
  localCategories.push(newCat);
  res.json({ success: true, category: newCat });
});

app.delete('/api/categories/:name', (req, res) => {
  localCategories = localCategories.filter(c => c.name !== req.params.name);
  res.json({ success: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-stack Backend] Server running on http://localhost:${PORT}`);
  });
}

startServer();
