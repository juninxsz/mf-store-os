import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, ShoppingBag, PackageSearch, Plus, Trash2, 
  ShoppingCart, CheckCircle2, TrendingUp, Tag, AlertCircle, X,
  CreditCard, Banknote, Smartphone, Search, User, Percent,
  Camera, ImagePlus, Save, Target, BarChart3, TrendingDown, Sparkles,
  ToggleLeft, ToggleRight, History, Globe, Lock, Unlock, 
  MessageCircle, Printer, Store, Clock, ShieldCheck, FileText, Send, QrCode,
  Wallet, Award, Key, Calculator, RefreshCw, Briefcase, Undo2, Receipt, ArrowLeftRight,
  Users, Trophy, Layers, Sparkle, SplitSquareVertical
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

// --- FIREBASE SETUP ---
// 👇 COLE AS SUAS CHAVES DO FIREBASE AQUI DENTRO 👇
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_AUTH_DOMAIN_AQUI",
  projectId: "SEU_PROJECT_ID_AQUI",
  storageBucket: "SEU_STORAGE_BUCKET_AQUI",
  messagingSenderId: "SEU_SENDER_ID_AQUI",
  appId: "SEU_APP_ID_AQUI"
};
// 👆 ========================================= 👆

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mf-store-os-premium';

// --- CUSTOM STYLES & MOTION DESIGN ---
const customStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; backdrop-filter: blur(0px); }
    to { opacity: 1; backdrop-filter: blur(12px); }
  }
  @keyframes pulseSoft {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-slide-in-right { animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  .animate-pulse-soft { animation: pulseSoft 2s infinite ease-in-out; }
  
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
  
  .glass-panel {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }
  
  /* Mock Barcode lines for Label Generator */
  .barcode-mock {
    background-image: repeating-linear-gradient(
      90deg,
      #0f172a, #0f172a 2px,
      transparent 2px, transparent 4px,
      #0f172a 4px, #0f172a 5px,
      transparent 5px, transparent 8px,
      #0f172a 8px, #0f172a 12px,
      transparent 12px, transparent 15px
    );
  }
`;

export default function MFStoreOS() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [condicionais, setCondicionais] = useState([]);
  const [register, setRegister] = useState({ isOpen: false, balance: 0, openedAt: null });
  
  // Modals & UI
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isSangriaModalOpen, setIsSangriaModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  
  // Checkout & POS States
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [posCategoryFilter, setPosCategoryFilter] = useState('Todas');
  const [selectedSeller, setSelectedSeller] = useState('Ana Clara (5%)');
  const [sellers, setSellers] = useState([
    { id: 'default-1', name: 'Ana Clara', rate: 5 },
    { id: 'default-2', name: 'Beatriz Silva', rate: 5 },
    { id: 'default-3', name: 'Camila Santos', rate: 4 }
  ]);
  const [newSeller, setNewSeller] = useState({ name: '', rate: 5 });
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [lastSaleData, setLastSaleData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [splitPayment, setSplitPayment] = useState({
    method1: 'pix',
    amount1: '',
    method2: 'credito'
  });

  // Combos / Looks States
  const [looks, setLooks] = useState([
    {
      id: 'look-1',
      name: 'Look Streetwear Completo',
      discountPercent: 12,
      itemNames: ['Camiseta Oversized Heavy', 'Calça Cargo Streetwear']
    }
  ]);
  const [newLook, setNewLook] = useState({ name: '', discountPercent: 10, selectedProductIds: [] });

  // Vitrine Digital Interactive States
  const [vitrineCart, setVitrineCart] = useState([]);
  const [vitrineCustomerName, setVitrineCustomerName] = useState('');
  const [storeWhatsapp, setStoreWhatsapp] = useState('14999999999');

  // Inventory States
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');

  // Form States
  const [newProduct, setNewProduct] = useState({
    name: '', category: 'Camisetas', price: '', cost: '', size: 'M', stock: 10, image: null, isVitrine: true
  });
  const [isGridMode, setIsGridMode] = useState(false);
  const [gridStocks, setGridStocks] = useState({ PP: 0, P: 3, M: 5, G: 4, GG: 2 });
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [sangriaAmount, setSangriaAmount] = useState('');
  const [sangriaReason, setSangriaReason] = useState('');
  const [openRegisterAmount, setOpenRegisterAmount] = useState('');
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', type: 'Fixa' });
  const [pinInput, setPinInput] = useState('');
  const [pinAction, setPinAction] = useState(null);

  // --- AUTHENTICATION ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) { console.error("Auth error:", error); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!user) return;
    
    const productsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'products');
    const salesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'sales');
    const auditsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'audits');
    const registerRef = collection(db, 'artifacts', appId, 'users', user.uid, 'register_events');
    const expensesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'expenses');
    const vouchersRef = collection(db, 'artifacts', appId, 'users', user.uid, 'vouchers');
    const condicionaisRef = collection(db, 'artifacts', appId, 'users', user.uid, 'condicionais');
    
    // Products
    const unsubProducts = onSnapshot(productsRef, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error("Erro ao carregar produtos:", error));

    // Sales
    const unsubSales = onSnapshot(salesRef, (snapshot) => {
      const sls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      sls.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setSales(sls);
    }, (error) => console.error("Erro ao carregar vendas:", error));

    // Audit Logs
    const unsubAudits = onSnapshot(auditsRef, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setAuditLogs(logs.slice(0, 50));
    }, (error) => console.error("Erro ao carregar auditoria:", error));

    // Register State
    const unsubRegister = onSnapshot(registerRef, (snapshot) => {
      if (!snapshot.empty) {
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        events.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        const lastEvent = events[0];
        if (lastEvent.type === 'OPEN' || lastEvent.type === 'SANGRIA' || lastEvent.type === 'SALE') {
          setRegister({ isOpen: true, balance: lastEvent.currentBalance || 0, openedAt: lastEvent.openedAt || lastEvent.timestamp });
        } else if (lastEvent.type === 'CLOSE') {
          setRegister({ isOpen: false, balance: 0, openedAt: null });
        }
      }
    }, (error) => console.error("Erro ao carregar caixa:", error));

    // Expenses
    const unsubExpenses = onSnapshot(expensesRef, (snapshot) => {
      const exps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      exps.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setExpenses(exps);
    }, (error) => console.error("Erro ao carregar despesas:", error));

    // Vouchers (Vale-Troca)
    const unsubVouchers = onSnapshot(vouchersRef, (snapshot) => {
      const vchs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      vchs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setVouchers(vchs);
    }, (error) => console.error("Erro ao carregar vales-troca:", error));

    // Condicionais (Malinhas)
    const unsubCondicionais = onSnapshot(condicionaisRef, (snapshot) => {
      const conds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      conds.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setCondicionais(conds);
    }, (error) => console.error("Erro ao carregar condicionais:", error));

    return () => { unsubProducts(); unsubSales(); unsubAudits(); unsubRegister(); unsubExpenses(); unsubVouchers(); unsubCondicionais(); };
  }, [user]);

  // --- UTILS ---
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  const formatTime = (ts) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 4000); };

  // --- AUDIT LOGGER ---
  const logAudit = async (action, details, severity = 'info') => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'audits'), {
        action, details, severity, timestamp: Date.now()
      });
    } catch (e) { console.error("Audit log failed", e); }
  };

  // --- SECURITY PIN ---
  const requestPin = (action) => {
    setPinAction(() => action);
    setIsPinModalOpen(true);
  };

  const handleConfirmPin = (e) => {
    e.preventDefault();
    if (pinInput === '1234') { // Senha master hardcoded para demonstração
      if (pinAction) pinAction();
      setIsPinModalOpen(false);
      setPinInput('');
      setPinAction(null);
    } else {
      showToast('Senha do gerente incorreta!', 'error');
      logAudit('Tentativa de Fraude', 'Senha de gerente incorreta inserida.', 'error');
    }
  };

  // --- REGISTER (CAIXA) ACTIONS ---
  const handleOpenRegister = async (e) => {
    e.preventDefault();
    const amount = parseFloat(openRegisterAmount) || 0;
    const ts = Date.now();
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'register_events'), {
      type: 'OPEN', amount, currentBalance: amount, timestamp: ts, openedAt: ts
    });
    logAudit('Caixa Aberto', `Saldo inicial informado: ${formatCurrency(amount)}`, 'success');
    setOpenRegisterAmount('');
    showToast('Caixa aberto com sucesso!');
  };

  const handleCloseRegister = async () => {
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'register_events'), {
      type: 'CLOSE', amount: register.balance, currentBalance: 0, timestamp: Date.now()
    });
    logAudit('Caixa Fechado', `Saldo final em gaveta: ${formatCurrency(register.balance)}`, 'warning');
    showToast('Caixa fechado com segurança.', 'success');
  };

  const handleSangria = async (e) => {
    e.preventDefault();
    const amount = parseFloat(sangriaAmount);
    if (amount > register.balance) {
      showToast('Valor da sangria maior que o saldo em caixa!', 'error');
      return;
    }
    
    requestPin(async () => {
      const newBalance = register.balance - amount;
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'register_events'), {
        type: 'SANGRIA', amount, reason: sangriaReason, currentBalance: newBalance, timestamp: Date.now(), openedAt: register.openedAt
      });
      logAudit('Sangria Realizada', `Retirada de ${formatCurrency(amount)}. Motivo: ${sangriaReason}`, 'warning');
      setIsSangriaModalOpen(false);
      setSangriaAmount('');
      setSangriaReason('');
      showToast('Sangria registrada com sucesso.');
    });
  };

  // --- EXPENSE MANAGEMENT (DRE) ---
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'expenses'), {
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        type: newExpense.type,
        timestamp: Date.now()
      });
      setNewExpense({ description: '', amount: '', type: 'Fixa' });
      showToast('Despesa registrada com sucesso!');
      logAudit('Despesa Adicionada', `Nova despesa ${newExpense.type}: ${newExpense.description} - ${formatCurrency(newExpense.amount)}`, 'info');
    } catch (e) { showToast('Erro ao registrar despesa.', 'error'); }
  };

  const handleDeleteExpense = (id, desc) => {
    requestPin(async () => {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'expenses', id));
        showToast('Despesa removida.');
        logAudit('Despesa Removida', `Despesa excluída: ${desc}`, 'warning');
      } catch(e) {}
    });
  };

  // --- PRODUCT MANAGEMENT ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_W = 500, MAX_H = 500;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX_W) { h *= MAX_W / w; w = MAX_W; } } 
        else { if (h > MAX_H) { w *= MAX_H / h; h = MAX_H; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        setNewProduct(prev => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.7) }));
        setIsProcessingImage(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (isGridMode) {
        const sizesToCreate = Object.entries(gridStocks).filter(([, qty]) => parseInt(qty) > 0);
        if (sizesToCreate.length === 0) {
          showToast('Informe a quantidade de pelo menos 1 tamanho na grade!', 'error');
          return;
        }
        for (const [sz, qty] of sizesToCreate) {
          await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'products'), {
            name: newProduct.name,
            category: newProduct.category,
            price: parseFloat(newProduct.price),
            cost: parseFloat(newProduct.cost),
            size: sz,
            stock: parseInt(qty),
            image: newProduct.image || null,
            isVitrine: newProduct.isVitrine,
            createdAt: Date.now()
          });
        }
        showToast(`Grade criada com ${sizesToCreate.length} tamanhos!`);
        logAudit('Grade Cadastrada', `Peça "${newProduct.name}" criada nos tamanhos: ${sizesToCreate.map(s => s[0]).join(', ')}.`);
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'products'), {
          name: newProduct.name, category: newProduct.category,
          price: parseFloat(newProduct.price), cost: parseFloat(newProduct.cost),
          size: newProduct.size, stock: parseInt(newProduct.stock),
          image: newProduct.image || null, isVitrine: newProduct.isVitrine,
          createdAt: Date.now()
        });
        showToast('Produto adicionado ao catálogo!');
        logAudit('Produto Cadastrado', `Nova peça: ${newProduct.name} adicionada.`);
      }
      setIsProductModalOpen(false);
      setNewProduct({ name: '', category: 'Camisetas', price: '', cost: '', size: 'M', stock: 10, image: null, isVitrine: true });
    } catch (e) { showToast('Erro ao cadastrar.', 'error'); }
  };

  const handleDeleteProduct = (id, name) => {
    requestPin(async () => {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'products', id));
        logAudit('Produto Excluído', `A peça "${name}" foi removida do sistema.`, 'warning');
        showToast('Produto removido.');
      } catch (e) { console.error(e); }
    });
  };

  const toggleVitrine = async (product) => {
    try {
      const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'products', product.id);
      await updateDoc(ref, { isVitrine: !product.isVitrine });
      showToast(`Produto ${!product.isVitrine ? 'adicionado à' : 'removido da'} vitrine digital.`);
    } catch (e) { console.error(e); }
  };

  // --- POS CART LOGIC ---
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) { showToast('Estoque insuficiente!', 'error'); return prev; }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (product.stock <= 0) { showToast('Produto esgotado!', 'error'); return prev; }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleLoadSampleProducts = async () => {
    if (!user) return;
    const samples = [
      { name: 'Camiseta Oversized Heavy', category: 'Camisetas', price: 119.90, cost: 45.00, size: 'G', stock: 12, isVitrine: true, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60' },
      { name: 'Calça Cargo Streetwear', category: 'Calças', price: 189.90, cost: 75.00, size: 'M', stock: 8, isVitrine: true, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60' },
      { name: 'Moletom Canguru Premium', category: 'Casacos', price: 249.90, cost: 95.00, size: 'GG', stock: 3, isVitrine: true, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60' },
      { name: 'Conjunto Fitness Sculpt', category: 'Vestidos', price: 159.90, cost: 60.00, size: 'P', stock: 15, isVitrine: true, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=60' }
    ];
    try {
      for (const item of samples) {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'products'), {
          ...item,
          createdAt: Date.now()
        });
      }
      showToast('Catálogo de exemplo carregado!');
      logAudit('Catálogo Inicial', 'Peças de exemplo adicionadas ao estoque.');
    } catch (e) {
      showToast('Erro ao gerar exemplos.', 'error');
    }
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCost = cart.reduce((acc, item) => acc + (item.cost * item.quantity), 0);
  const discountValue = cartSubtotal * (parseFloat(discountPercent || 0) / 100);
  const voucherDiscount = appliedVoucher ? Math.min(appliedVoucher.amount, cartSubtotal - discountValue) : 0;
  const cartTotal = Math.max(0, cartSubtotal - discountValue - voucherDiscount);

  const handleApplyVoucher = () => {
    if (!voucherCodeInput.trim()) return;
    const found = vouchers.find(v => v.code.toUpperCase() === voucherCodeInput.trim().toUpperCase() && !v.used);
    if (!found) {
      showToast('Vale-troca inválido ou já utilizado!', 'error');
      return;
    }
    setAppliedVoucher(found);
    setVoucherCodeInput('');
    showToast(`Vale-troca de ${formatCurrency(found.amount)} aplicado!`);
  };

  const handleCreateCondicional = async () => {
    if (!user || cart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('Preencha Nome e WhatsApp do cliente para enviar Condicional!', 'error');
      return;
    }
    try {
      const deadline = Date.now() + (48 * 60 * 60 * 1000); // 48 hours
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'condicionais'), {
        customerName,
        customerPhone,
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, cost: i.cost, quantity: i.quantity, size: i.size, image: i.image || null })),
        totalValue: cartSubtotal,
        status: 'PENDENTE',
        createdAt: Date.now(),
        deadline
      });

      for (const item of cart) {
        const productRef = doc(db, 'artifacts', appId, 'users', user.uid, 'products', item.id);
        await updateDoc(productRef, { stock: Math.max(0, item.stock - item.quantity) });
      }

      logAudit('Malinha / Condicional Enviada', `Cliente: ${customerName} (${cart.length} itens - ${formatCurrency(cartSubtotal)})`, 'info');
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      showToast('Malinha condicional registrada e estoque reservado!');
      setActiveTab('condicional');
    } catch (e) {
      showToast('Erro ao criar condicional.', 'error');
    }
  };

  const handleReturnCondicional = async (cond) => {
    if (!user) return;
    try {
      for (const item of cond.items) {
        const prod = products.find(p => p.id === item.id);
        if (prod) {
          await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'products', item.id), {
            stock: (prod.stock || 0) + item.quantity
          });
        }
      }
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'condicionais', cond.id), {
        status: 'DEVOLVIDO'
      });
      logAudit('Condicional Devolvida', `Peças da malinha de ${cond.customerName} retornaram ao estoque.`, 'info');
      showToast('Peças devolvidas ao estoque com sucesso!');
    } catch (e) {
      showToast('Erro ao devolver condicional.', 'error');
    }
  };

  const handleConvertCondicionalToSale = async (cond) => {
    if (!user) return;
    try {
      // Restore stock first so POS checkout deducts cleanly
      for (const item of cond.items) {
        const prod = products.find(p => p.id === item.id);
        if (prod) {
          await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'products', item.id), {
            stock: (prod.stock || 0) + item.quantity
          });
        }
      }
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'condicionais', cond.id), {
        status: 'CONVERTIDO'
      });
      setCustomerName(cond.customerName);
      setCustomerPhone(cond.customerPhone);
      setCart(cond.items.map(i => {
        const currentProd = products.find(p => p.id === i.id);
        return { ...i, stock: (currentProd?.stock || 0) + i.quantity };
      }));
      setActiveTab('pos');
      showToast('Malinha carregada na sacola! Finalize o pagamento.');
    } catch (e) {
      showToast('Erro ao carregar malinha no PDV.', 'error');
    }
  };

  const handleGenerateVoucherFromSale = async (sale, itemIndex) => {
    if (!user) return;
    const item = sale.items[itemIndex];
    if (!item || item.exchanged) return;

    try {
      // 1. Return 1 quantity to stock
      const prod = products.find(p => p.id === item.id);
      if (prod) {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'products', item.id), {
          stock: (prod.stock || 0) + 1
        });
      }

      // 2. Generate Voucher Code
      const code = `TROCA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'vouchers'), {
        code,
        customerName: sale.customerName,
        itemName: item.name,
        amount: item.price,
        used: false,
        createdAt: Date.now()
      });

      // 3. Mark item as exchanged in sale
      const updatedItems = sale.items.map((it, idx) => idx === itemIndex ? { ...it, exchanged: true } : it);
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'sales', sale.id), {
        items: updatedItems
      });

      logAudit('Vale-Troca Gerado', `Código ${code} (${formatCurrency(item.price)}) gerado para ${sale.customerName}. Peça "${item.name}" voltou ao estoque.`, 'warning');
      showToast(`Vale-Troca ${code} gerado e peça devolvida ao estoque!`);
    } catch (e) {
      showToast('Erro ao gerar vale-troca.', 'error');
    }
  };

  const handleRefundSale = (sale) => {
    requestPin(async () => {
      try {
        for (const item of sale.items) {
          if (!item.exchanged) {
            const prod = products.find(p => p.id === item.id);
            if (prod) {
              await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'products', item.id), {
                stock: (prod.stock || 0) + item.quantity
              });
            }
          }
        }
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'sales', sale.id));
        logAudit('Venda Estornada', `Estorno total da venda de ${sale.customerName} (${formatCurrency(sale.total)}). Estoque restaurado.`, 'error');
        showToast('Venda estornada e peças devolvidas ao estoque.');
      } catch (e) {
        showToast('Erro ao estornar venda.', 'error');
      }
    });
  };

  const handleCheckoutProcess = (paymentMethod) => {
    if (!user || cart.length === 0) return;
    
    // Simulate PIX QR Code journey
    if (paymentMethod === 'pix' && selectedPaymentMethod !== 'pix') {
      setSelectedPaymentMethod('pix');
      return; // Stop here to show QR code UI
    }

    // Open Split Payment UI
    if (paymentMethod === 'misto' && selectedPaymentMethod !== 'misto') {
      setSelectedPaymentMethod('misto');
      setSplitPayment({
        method1: 'pix',
        amount1: (cartTotal / 2).toFixed(2),
        method2: 'credito'
      });
      return;
    }

    const executeSale = async () => {
      try {
        const activeSellerObj = sellers.find(s => `${s.name} (${s.rate}%)` === selectedSeller) || sellers[0] || { name: 'Loja', rate: 5 };
        const commissionValue = cartTotal * ((activeSellerObj.rate || 0) / 100);
        const amt1 = parseFloat(splitPayment.amount1) || 0;
        const amt2 = Math.max(0, cartTotal - amt1);
        const formattedMethod = paymentMethod === 'misto'
          ? `Misto (${splitPayment.method1.toUpperCase()} ${formatCurrency(amt1)} + ${splitPayment.method2.toUpperCase()} ${formatCurrency(amt2)})`
          : paymentMethod;

        const saleObj = {
          customerName: customerName || 'Cliente Balcão',
          customerPhone: customerPhone || '',
          sellerName: activeSellerObj.name,
          sellerRate: activeSellerObj.rate,
          commissionValue,
          items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, cost: i.cost, quantity: i.quantity, size: i.size })),
          subtotal: cartSubtotal, totalCost: cartCost,
          discountPercent: parseFloat(discountPercent || 0), discountValue,
          voucherCode: appliedVoucher ? appliedVoucher.code : null,
          voucherDiscount,
          total: cartTotal, paymentMethod: formattedMethod, timestamp: Date.now()
        };

        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'sales'), saleObj);

        if (appliedVoucher) {
          await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'vouchers', appliedVoucher.id), {
            used: true,
            usedAt: Date.now()
          });
        }

        // Update Stock
        for (const item of cart) {
          const productRef = doc(db, 'artifacts', appId, 'users', user.uid, 'products', item.id);
          await updateDoc(productRef, { stock: Math.max(0, item.stock - item.quantity) });
        }

        // Update Register if cash payment
        const cashReceived = paymentMethod === 'dinheiro'
          ? cartTotal
          : (paymentMethod === 'misto'
              ? ((splitPayment.method1 === 'dinheiro' ? amt1 : 0) + (splitPayment.method2 === 'dinheiro' ? amt2 : 0))
              : 0);

        if (cashReceived > 0 && register.isOpen) {
          await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'register_events'), {
            type: 'SALE', amount: cashReceived, currentBalance: register.balance + cashReceived, timestamp: Date.now(), openedAt: register.openedAt
          });
        }

        // Audits
        if (parseFloat(discountPercent) >= 15) {
          logAudit('Alto Desconto Aplicado', `Desconto de ${discountPercent}% na venda de ${formatCurrency(cartTotal)}. Cliente: ${saleObj.customerName}`, 'warning');
        }

        // Prepare Success Modal
        setLastSaleData(saleObj);
        setCart([]); setCustomerName(''); setCustomerPhone(''); setDiscountPercent(''); setAppliedVoucher(null); setSelectedPaymentMethod(null);
        setIsCheckoutModalOpen(false);
        setIsReceiptModalOpen(true);

      } catch (error) { showToast('Erro ao processar venda.', 'error'); }
    };

    // Require PIN for discounts higher than 10%
    if (parseFloat(discountPercent || 0) > 10) {
      setIsCheckoutModalOpen(false); // Hide checkout modal temporarily
      requestPin(executeSale);
    } else {
      executeSale();
    }
  };

  const handleCreateLook = (e) => {
    e.preventDefault();
    if (!newLook.name.trim() || newLook.selectedProductIds.length < 2) {
      showToast('Selecione pelo menos 2 peças para montar um Look!', 'error');
      return;
    }
    const chosenProducts = products.filter(p => newLook.selectedProductIds.includes(p.id));
    const created = {
      id: `look-${Date.now()}`,
      name: newLook.name.trim(),
      discountPercent: parseFloat(newLook.discountPercent) || 10,
      itemNames: chosenProducts.map(p => `${p.name} (${p.size})`),
      productIds: newLook.selectedProductIds
    };
    setLooks(prev => [created, ...prev]);
    setNewLook({ name: '', discountPercent: 10, selectedProductIds: [] });
    showToast('Look Completo criado com sucesso!');
  };

  const handleApplyLookToPOS = (look) => {
    const matchedProducts = products.filter(p =>
      (look.productIds && look.productIds.includes(p.id)) ||
      (look.itemNames && look.itemNames.some(n => p.name.toLowerCase().includes(n.toLowerCase())))
    ).filter(p => p.stock > 0);

    if (matchedProducts.length === 0) {
      showToast('Peças deste Look não encontradas ou sem estoque!', 'error');
      return;
    }

    matchedProducts.forEach(p => addToCart(p));
    setDiscountPercent(String(look.discountPercent));
    setActiveTab('pos');
    showToast(`Look "${look.name}" adicionado com ${look.discountPercent}% OFF!`);
  };

  const getWhatsAppLink = (sale) => {
    if (!sale || !sale.customerPhone) return '#';
    const cleanPhone = sale.customerPhone.replace(/\D/g, '');
    const cashback = sale.total * 0.05; // 5% cashback simulado
    let msg = `🛍️ *MF Store* 🛍️\n\nOlá ${sale.customerName}! Muito obrigado pela preferência.\n\n*Resumo da sua compra:*\n`;
    sale.items.forEach(i => { msg += `- ${i.quantity}x ${i.name} (Tam: ${i.size}) : ${formatCurrency(i.price * i.quantity)}\n`; });
    if (sale.discountValue > 0) msg += `\nDesconto: - ${formatCurrency(sale.discountValue)}`;
    msg += `\n*TOTAL: ${formatCurrency(sale.total)}*\n\n`;
    msg += `🎁 *Você ganhou ${formatCurrency(cashback)} de CASHBACK* para usar na sua próxima compra!\n\nVolte sempre! ✨`;
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  // --- DERIVED DATA ---
  const dashboardStats = useMemo(() => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    
    const monthSales = sales.filter(s => s.timestamp >= startOfMonth);
    const monthlyRevenue = monthSales.reduce((acc, s) => acc + s.total, 0);
    const monthlyCost = monthSales.reduce((acc, s) => acc + (s.totalCost || 0), 0);
    
    const monthExpenses = expenses.filter(e => e.timestamp >= startOfMonth);
    const totalExpenses = monthExpenses.reduce((acc, e) => acc + e.amount, 0);

    const netProfit = monthlyRevenue - monthlyCost - totalExpenses; // REAL PROFIT
    const itemsSold = monthSales.reduce((acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0), 0);
    const goalProgress = Math.min((monthlyRevenue / 50000) * 100, 100);

    const chart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const nextDay = new Date(d); nextDay.setDate(nextDay.getDate() + 1);
      const daySales = sales.filter(s => s.timestamp >= d.getTime() && s.timestamp < nextDay.getTime());
      chart.push({ name: d.toLocaleDateString('pt-BR', { weekday: 'short' }), Faturamento: daySales.reduce((a, s) => a + s.total, 0) });
    }
    return { monthlyRevenue, netProfit, itemsSold, totalExpenses, goalProgress, chartData: chart };
  }, [sales, expenses]);

  const filteredPosProducts = products.filter(p => 
    p.name.toLowerCase().includes(posSearchQuery.toLowerCase()) && 
    (posCategoryFilter === 'Todas' || p.category === posCategoryFilter)
  );

  const filteredInventoryProducts = products.filter(p => p.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()));
  const vitrineProducts = products.filter(p => p.isVitrine && p.stock > 0);

  // Compute CRM Data for active customer
  const crmData = useMemo(() => {
    if (!customerPhone || customerPhone.length < 10) return null;
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const customerSales = sales.filter(s => s.customerPhone && s.customerPhone.replace(/\D/g, '') === cleanPhone);
    if (customerSales.length === 0) return null;
    
    const totalSpent = customerSales.reduce((acc, s) => acc + s.total, 0);
    const cashbackAvailable = totalSpent * 0.05; // Simulate 5% accumulated
    return { visits: customerSales.length, totalSpent, cashbackAvailable };
  }, [customerPhone, sales]);

  // Compute Ranking & Commissions by Seller
  const sellerStats = useMemo(() => {
    return sellers.map(seller => {
      const sellerSales = sales.filter(s => (s.sellerName || 'Ana Clara') === seller.name);
      const totalRevenue = sellerSales.reduce((acc, s) => acc + (s.total || 0), 0);
      const totalCommission = sellerSales.reduce((acc, s) => acc + (s.commissionValue !== undefined ? s.commissionValue : (s.total * (seller.rate / 100))), 0);
      const totalItems = sellerSales.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0), 0);
      const pa = sellerSales.length > 0 ? (totalItems / sellerSales.length).toFixed(1) : '0.0';
      return {
        ...seller,
        salesCount: sellerSales.length,
        totalRevenue,
        totalCommission,
        totalItems,
        pa
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [sellers, sales]);

  const handleAddSeller = (e) => {
    e.preventDefault();
    if (!newSeller.name.trim()) return;
    const created = { id: `seller-${Date.now()}`, name: newSeller.name.trim(), rate: parseFloat(newSeller.rate) || 5 };
    setSellers(prev => [...prev, created]);
    setSelectedSeller(`${created.name} (${created.rate}%)`);
    setNewSeller({ name: '', rate: 5 });
    showToast(`Vendedora ${created.name} cadastrada!`);
  };

  // Vitrine Digital Cart Helpers
  const addToVitrineCart = (product) => {
    setVitrineCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) {
        if (exists.quantity >= product.stock) {
          showToast('Quantidade máxima em estoque atingida!', 'error');
          return prev;
        }
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const vitrineTotal = vitrineCart.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  const getVitrineOrderWhatsAppLink = () => {
    const cleanPhone = storeWhatsapp.replace(/\D/g, '');
    let msg = `🛍️ *Novo Pedido - Vitrine Digital MF Store*\n\n`;
    msg += `*Cliente:* ${vitrineCustomerName || 'Cliente Instagram'}\n\n*Peças escolhidas:*\n`;
    vitrineCart.forEach(i => {
      msg += `• ${i.quantity}x ${i.name} (Tam: ${i.size}) - ${formatCurrency(i.price * i.quantity)}\n`;
    });
    msg += `\n*Total do Pedido: ${formatCurrency(vitrineTotal)}*\n\nPodemos confirmar a disponibilidade? ✨`;
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const sendVitrineOrderToPOS = () => {
    if (vitrineCart.length === 0) return;
    setCart(vitrineCart);
    if (vitrineCustomerName) setCustomerName(vitrineCustomerName);
    setVitrineCart([]);
    setVitrineCustomerName('');
    setActiveTab('pos');
    showToast('Pedido da Vitrine importado direto para a Sacola do PDV!');
  };

  // --- RENDER HELPERS ---
  const renderSidebarItem = (id, icon, label) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium ${
        activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transform scale-[1.02]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}>
      {icon}<span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-800 flex overflow-hidden selection:bg-indigo-200">
      <style>{customStyles}</style>

      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 z-20 hidden lg:flex shadow-2xl shadow-slate-200/50">
        <div className="flex items-center space-x-3 mb-10 pl-2">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles size={24} className="animate-pulse-soft" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">MF Store<span className="text-indigo-600">.</span></h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Premium OS</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
          {renderSidebarItem('dashboard', <LayoutDashboard size={20} />, 'Visão Geral')}
          {renderSidebarItem('pos', <ShoppingBag size={20} />, 'Caixa (PDV)')}
          {renderSidebarItem('inventory', <PackageSearch size={20} />, 'Estoque')}
          {renderSidebarItem('looks', <Layers size={20} />, 'Looks & Combos')}
          {renderSidebarItem('sales_history', <ArrowLeftRight size={20} />, 'Vendas & Trocas')}
          {renderSidebarItem('condicional', <Briefcase size={20} />, 'Malinhas (Cond.)')}
          {renderSidebarItem('commissions', <Trophy size={20} />, 'Equipe & Comissões')}
          <div className="pt-4 pb-2"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-4">Gestão</p></div>
          {renderSidebarItem('finance', <Lock size={20} />, 'Caixa (Gaveta)')}
          {renderSidebarItem('expenses', <TrendingDown size={20} />, 'Despesas (DRE)')}
          {renderSidebarItem('audit', <ShieldCheck size={20} />, 'Auditoria')}
          <div className="pt-4 pb-2"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-4">Digital</p></div>
          {renderSidebarItem('vitrine', <Smartphone size={20} />, 'Vitrine Digital')}
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Mobile & Tablet Header / Navigation */}
        <header className="lg:hidden glass-panel p-3 border-b border-slate-200 flex flex-col gap-2 sticky top-0 z-20">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center">
              <Sparkles size={18} className="text-indigo-600 mr-2" />
              <h1 className="text-lg font-black tracking-tight text-slate-900">MF Store<span className="text-indigo-600">.</span></h1>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">Premium OS</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 px-1">
            {[
              { id: 'dashboard', label: 'Visão Geral', icon: <LayoutDashboard size={14} /> },
              { id: 'pos', label: 'PDV', icon: <ShoppingBag size={14} /> },
              { id: 'inventory', label: 'Estoque', icon: <PackageSearch size={14} /> },
              { id: 'looks', label: 'Looks', icon: <Layers size={14} /> },
              { id: 'sales_history', label: 'Trocas', icon: <ArrowLeftRight size={14} /> },
              { id: 'condicional', label: 'Malinhas', icon: <Briefcase size={14} /> },
              { id: 'commissions', label: 'Comissões', icon: <Trophy size={14} /> },
              { id: 'finance', label: 'Caixa', icon: <Lock size={14} /> },
              { id: 'expenses', label: 'DRE', icon: <TrendingDown size={14} /> },
              { id: 'audit', label: 'Auditoria', icon: <ShieldCheck size={14} /> },
              { id: 'vitrine', label: 'Vitrine', icon: <Smartphone size={14} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pb-28 lg:pb-10 custom-scrollbar relative">
          
          {/* TOAST ALERTS */}
          {toast && (
            <div className={`fixed top-6 right-6 px-6 py-4 rounded-2xl shadow-2xl z-[100] flex items-center space-x-3 animate-fade-in-up border ${
              toast.type === 'error' ? 'bg-red-900 text-white border-red-700' : 'bg-slate-900 text-white border-slate-700'
            }`}>
              {toast.type === 'error' ? <AlertCircle size={20} className="text-red-400" /> : <CheckCircle2 size={20} className="text-emerald-400" />}
              <span className="font-semibold">{toast.message}</span>
            </div>
          )}

          {/* ==========================================
              TAB 1: DASHBOARD
          ========================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Dashboard</h2>
                  <p className="text-slate-500 font-medium">Resumo financeiro e progresso mensal.</p>
                </div>
                {products.length === 0 && (
                  <button
                    onClick={handleLoadSampleProducts}
                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all self-start sm:self-auto"
                  >
                    <Sparkles size={16} />
                    <span>Carregar Peças de Exemplo</span>
                  </button>
                )}
              </div>

              {/* METRICS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Faturamento Mensal</p>
                  <h3 className="text-2xl font-black text-slate-900">{formatCurrency(dashboardStats.monthlyRevenue)}</h3>
                  <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${dashboardStats.goalProgress}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Despesas (Saídas)</p>
                  <h3 className="text-2xl font-black text-red-500">{formatCurrency(dashboardStats.totalExpenses)}</h3>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold">Fixas e Variáveis</p>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-lg border border-slate-700 text-white col-span-1 md:col-span-2">
                  <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-2"><Award size={14}/> Lucro Real (DRE)</p>
                  <h3 className="text-3xl font-black text-emerald-400">{formatCurrency(dashboardStats.netProfit)}</h3>
                  <p className="text-xs text-slate-400 mt-2">Faturamento - (Custo das Peças + Despesas da Loja)</p>
                </div>
              </div>

              {/* CHART */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Receita (Últimos 7 dias)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardStats.chartData}>
                      <defs>
                        <linearGradient id="colorInd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#94a3b8" fontSize={12} fontWeight={600} dy={10} />
                      <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" fontSize={12} fontWeight={600} tickFormatter={(val) => `R$ ${val}`} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(val) => [formatCurrency(val), "Faturamento"]} />
                      <Area type="monotone" dataKey="Faturamento" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorInd)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: CAIXA (PDV)
          ========================================== */}
          {activeTab === 'pos' && (
            <div className="h-full flex flex-col xl:flex-row gap-6 animate-fade-in-up">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex flex-col gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input type="text" placeholder="Buscar peça por nome..." value={posSearchQuery} onChange={(e) => setPosSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium" />
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                    {['Todas', 'Camisetas', 'Calças', 'Casacos', 'Vestidos', 'Acessórios'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setPosCategoryFilter(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          posCategoryFilter === cat
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPosProducts.map((p) => (
                      <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock <= 0}
                        className={`text-left bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col ${p.stock <= 0 ? 'opacity-50 grayscale' : 'group'}`}>
                        <div className="h-32 w-full bg-slate-100 relative overflow-hidden">
                          {p.image ? <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <Tag className="w-full h-full p-8 text-slate-300" />}
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-black text-slate-800">{p.size}</div>
                        </div>
                        <div className="p-3 flex-1 flex flex-col">
                          <p className="font-bold text-slate-900 text-sm leading-tight mb-2 line-clamp-2">{p.name}</p>
                          <div className="mt-auto flex justify-between items-end">
                            <span className="font-black text-slate-900">{formatCurrency(p.price)}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.stock <= 3 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{p.stock} est.</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cart & Mini-CRM */}
              <div className="w-full xl:w-[400px] bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col flex-shrink-0 animate-slide-in-right h-[650px] xl:h-auto">
                <div className="p-5 bg-slate-900 text-white rounded-t-3xl relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-2"><ShoppingCart size={24}/> Sacola</h3>
                    <select
                      value={selectedSeller}
                      onChange={(e) => setSelectedSeller(e.target.value)}
                      className="bg-indigo-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-400/40 focus:outline-none"
                      title="Vendedora Responsável"
                    >
                      {sellers.map(s => (
                        <option key={s.id} value={`${s.name} (${s.rate}%)`}>Vend: {s.name} ({s.rate}%)</option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-4 space-y-3 relative z-10">
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-slate-400" size={16} />
                      <input type="text" placeholder="Nome do Cliente" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm focus:border-indigo-400 text-white placeholder-slate-400" />
                    </div>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-3 text-slate-400" size={16} />
                      <input type="tel" placeholder="WhatsApp (ex: 11999999999)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm focus:border-indigo-400 text-white placeholder-slate-400" />
                    </div>
                    
                    {/* CRM Mini Dashboard */}
                    {crmData && (
                      <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-between animate-fade-in">
                         <div>
                            <p className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">Cliente Fidelidade</p>
                            <p className="text-sm font-bold text-white">{crmData.visits} visitas</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">Cashback Disp.</p>
                            <p className="text-sm font-black text-emerald-400">{formatCurrency(crmData.cashbackAvailable)}</p>
                         </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden mr-3">
                        {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Tag className="w-full h-full p-3 text-slate-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                        <p className="text-xs font-bold text-indigo-600">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-100">
                        <span className="font-black text-slate-700 px-2 text-sm">x{item.quantity}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg"><X size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 bg-white border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="relative">
                      <Percent className="absolute left-3 top-3 text-slate-400" size={15} />
                      <input type="number" placeholder="Desc (%)" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} disabled={cart.length === 0}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="flex gap-1">
                      <input type="text" placeholder="Vale-Troca" value={voucherCodeInput} onChange={(e) => setVoucherCodeInput(e.target.value)} disabled={cart.length === 0}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase focus:ring-2 focus:ring-indigo-500" />
                      <button type="button" onClick={handleApplyVoucher} disabled={cart.length === 0}
                        className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100">OK</button>
                    </div>
                  </div>

                  {appliedVoucher && (
                    <div className="mb-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center text-xs font-bold text-emerald-700">
                      <span>Vale {appliedVoucher.code}: -{formatCurrency(voucherDiscount)}</span>
                      <button onClick={() => setAppliedVoucher(null)} className="text-emerald-700 hover:text-red-500"><X size={14}/></button>
                    </div>
                  )}

                  <div className="flex justify-between items-end mb-4">
                    <span className="text-slate-500 font-bold uppercase text-xs">Total a Pagar</span>
                    <span className="text-3xl font-black text-slate-900">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCreateCondicional} disabled={cart.length === 0}
                      title="Reservar peças e enviar Malinha Condicional"
                      className={`px-4 py-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center transition-all border ${
                        cart.length > 0 ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      }`}>
                      <Briefcase size={18} />
                      <span className="mt-0.5">Malinha</span>
                    </button>
                    <button onClick={() => setIsCheckoutModalOpen(true)} disabled={cart.length === 0}
                      className={`flex-1 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
                        cart.length > 0 ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}>
                      <span>Cobrar</span><CheckCircle2 size={22} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3: ESTOQUE E GERADOR DE ETIQUETAS
          ========================================== */}
          {activeTab === 'inventory' && (
            <div className="animate-fade-in-up">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Estoque</h2>
                  <p className="text-slate-500 font-medium">Controle de peças, preços e etiquetas.</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar no estoque..."
                      value={inventorySearchQuery}
                      onChange={(e) => setInventorySearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button onClick={() => setIsLabelModalOpen(true)} className="bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-all">
                    <Printer size={18} /><span>Etiquetas</span>
                  </button>
                  <button onClick={() => setIsProductModalOpen(true)} className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all">
                    <Plus size={18} /><span>Nova Peça</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                      <tr className="text-slate-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold">Produto</th>
                        <th className="p-4 font-bold">Tamanho</th>
                        <th className="p-4 font-bold">Custo / Venda</th>
                        <th className="p-4 font-bold">Estoque</th>
                        <th className="p-4 font-bold text-center">Vitrine</th>
                        <th className="p-4 font-bold text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInventoryProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                              {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <Tag className="w-full h-full p-2 text-slate-300" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm truncate">{p.name}</p>
                              <p className="text-[11px] font-medium text-slate-400">{p.category}</p>
                            </div>
                          </td>
                          <td className="p-4"><span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-black text-slate-700">{p.size}</span></td>
                          <td className="p-4">
                            <p className="font-bold text-slate-900">{formatCurrency(p.price)}</p>
                            <p className="text-[11px] text-slate-400">Custo: {formatCurrency(p.cost)}</p>
                          </td>
                          <td className="p-4"><span className={`font-black ${p.stock <= 3 ? 'text-red-600' : 'text-emerald-600'}`}>{p.stock} un.</span></td>
                          <td className="p-4 text-center">
                            <button onClick={() => toggleVitrine(p)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                              {p.isVitrine ? <ToggleRight size={28} className="text-indigo-600" /> : <ToggleLeft size={28} />}
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => handleDeleteProduct(p.id, p.name)} className="text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3.2: MONTADOR DE LOOKS & COMBOS
          ========================================== */}
          {activeTab === 'looks' && (
            <div className="animate-fade-in-up space-y-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                  <Layers className="text-indigo-600" size={32} /> Montador de Looks & Combos
                </h2>
                <p className="text-slate-500 font-medium">Combine peças que casam entre si, aplique um desconto automático e aumente o Ticket Médio no balcão.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Criar Novo Look */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-fit">
                  <h3 className="text-lg font-black text-slate-900 mb-4">Criar Novo Look</h3>
                  <form onSubmit={handleCreateLook} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Look / Kit</label>
                      <input
                        required
                        type="text"
                        placeholder="Ex: Combo Noite Streetwear"
                        value={newLook.name}
                        onChange={e => setNewLook({ ...newLook, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Desconto do Combo (%)</label>
                      <input
                        required
                        type="number"
                        min="1"
                        max="50"
                        value={newLook.discountPercent}
                        onChange={e => setNewLook({ ...newLook, discountPercent: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Selecione as Peças ({newLook.selectedProductIds.length})</label>
                      <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1.5 border border-slate-200 rounded-2xl p-2.5 bg-slate-50">
                        {products.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4">Cadastre peças no estoque primeiro.</p>
                        ) : (
                          products.map(p => {
                            const checked = newLook.selectedProductIds.includes(p.id);
                            return (
                              <label key={p.id} className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs font-bold transition-colors ${checked ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>
                                <div className="flex items-center gap-2 truncate">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      setNewLook(prev => ({
                                        ...prev,
                                        selectedProductIds: checked
                                          ? prev.selectedProductIds.filter(id => id !== p.id)
                                          : [...prev.selectedProductIds, p.id]
                                      }));
                                    }}
                                    className="hidden"
                                  />
                                  <span className="truncate">{p.name} ({p.size})</span>
                                </div>
                                <span className="ml-2 font-black">{formatCurrency(p.price)}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                      <Plus size={18} /> Salvar Look Promocional
                    </button>
                  </form>
                </div>

                {/* Cards de Looks Prontos */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
                  {looks.map(look => (
                    <div key={look.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                            Combo -{look.discountPercent}% OFF
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-3">{look.name}</h4>
                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-6">
                          {look.itemNames.map((item, i) => (
                            <p key={i} className="text-xs font-bold text-slate-700 flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" /> {item}
                            </p>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleApplyLookToPOS(look)}
                        className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        <ShoppingBag size={16} /> Lançar Look Completo no PDV
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3.5: VENDAS & TROCAS (VALE-TROCA)
          ========================================== */}
          {activeTab === 'sales_history' && (
            <div className="animate-fade-in-up space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Histórico de Vendas & Trocas</h2>
                  <p className="text-slate-500 font-medium">Gere Vales-Troca instantâneos, reenvie recibos ou estorne vendas com segurança.</p>
                </div>
              </div>

              {/* Vales-Troca Ativos */}
              {vouchers.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <Receipt size={16} className="text-indigo-600" /> Vales-Troca Emitidos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vouchers.map(v => (
                      <div key={v.id} className={`p-4 rounded-2xl border flex justify-between items-center ${v.used ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-indigo-50/50 border-indigo-200'}`}>
                        <div>
                          <span className="text-xs font-black bg-indigo-600 text-white px-2.5 py-1 rounded-lg tracking-wider">{v.code}</span>
                          <p className="text-sm font-bold text-slate-900 mt-2">{v.customerName}</p>
                          <p className="text-xs text-slate-500">Peça devolvida: {v.itemName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-indigo-600">{formatCurrency(v.amount)}</p>
                          <span className={`text-[10px] font-black uppercase ${v.used ? 'text-slate-400' : 'text-emerald-600'}`}>
                            {v.used ? 'Já Utilizado' : 'Disponível'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de Vendas */}
              <div className="space-y-4">
                {sales.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 font-medium">
                    Nenhuma venda realizada ainda.
                  </div>
                ) : (
                  sales.map(sale => (
                    <div key={sale.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-3 py-1 bg-slate-900 text-white rounded-xl text-xs font-black uppercase">{sale.paymentMethod}</span>
                          <h4 className="font-black text-lg text-slate-900">{sale.customerName}</h4>
                          <span className="text-xs font-bold text-slate-400">{new Date(sale.timestamp).toLocaleString('pt-BR')}</span>
                          {sale.voucherCode && (
                            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg">Usou Vale: {sale.voucherCode}</span>
                          )}
                        </div>

                        <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                          {sale.items.map((item, idx) => (
                            <div key={idx} className="py-2 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                              <div>
                                <span className={`text-sm font-bold ${item.exchanged ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                  {item.quantity}x {item.name} ({item.size})
                                </span>
                                <span className="text-xs font-bold text-indigo-600 ml-2">{formatCurrency(item.price)}</span>
                              </div>
                              {item.exchanged ? (
                                <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">Peça Trocada</span>
                              ) : (
                                <button
                                  onClick={() => handleGenerateVoucherFromSale(sale, idx)}
                                  className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5"
                                >
                                  <ArrowLeftRight size={14} /> Gerar Vale-Troca
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-row lg:flex-col justify-between items-end border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 min-w-[180px]">
                        <div className="text-left lg:text-right">
                          <p className="text-xs font-bold text-slate-400 uppercase">Total Pago</p>
                          <p className="text-2xl font-black text-slate-900">{formatCurrency(sale.total)}</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                          {sale.customerPhone && (
                            <a
                              href={getWhatsAppLink(sale)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl font-bold text-xs flex items-center gap-1"
                              title="Reenviar Recibo no WhatsApp"
                            >
                              <MessageCircle size={16} /> Recibo
                            </a>
                          )}
                          <button
                            onClick={() => handleRefundSale(sale)}
                            className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-xs flex items-center gap-1"
                            title="Estornar Venda (Requer PIN)"
                          >
                            <Undo2 size={16} /> Estornar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3.8: MALINHAS / CONDICIONAL
          ========================================== */}
          {activeTab === 'condicional' && (
            <div className="animate-fade-in-up space-y-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Malinhas em Condicional</h2>
                <p className="text-slate-500 font-medium">Acompanhe peças enviadas para clientes provarem em casa (Prazo padrão: 48h).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {condicionais.length === 0 ? (
                  <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 font-medium">
                    Nenhuma malinha condicional enviada. Adicione peças na sacola do PDV e clique em "Malinha" para criar!
                  </div>
                ) : (
                  condicionais.map(cond => {
                    const isOverdue = cond.status === 'PENDENTE' && Date.now() > cond.deadline;
                    return (
                      <div key={cond.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                                cond.status === 'PENDENTE'
                                  ? (isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')
                                  : cond.status === 'CONVERTIDO'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {cond.status === 'PENDENTE' ? (isOverdue ? 'Prazo Vencido' : 'Com a Cliente') : cond.status}
                              </span>
                              <h3 className="text-xl font-black text-slate-900 mt-2">{cond.customerName}</h3>
                              <p className="text-xs font-bold text-slate-400">{cond.customerPhone}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-slate-400 uppercase">Valor Reservado</p>
                              <p className="text-xl font-black text-indigo-600">{formatCurrency(cond.totalValue)}</p>
                              <p className="text-[11px] text-slate-400 mt-1">Até {new Date(cond.deadline).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-2xl p-3 space-y-2 border border-slate-100 mb-6">
                            {cond.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-xs font-bold text-slate-700">
                                <span>{item.quantity}x {item.name} ({item.size})</span>
                                <span>{formatCurrency(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {cond.status === 'PENDENTE' && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleReturnCondicional(cond)}
                              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Undo2 size={16} /> Devolver ao Estoque
                            </button>
                            <button
                              onClick={() => handleConvertCondicionalToSale(cond)}
                              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                            >
                              <ShoppingBag size={16} /> Cobrar no PDV
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3.9: EQUIPE & COMISSÕES (RANKING)
          ========================================== */}
          {activeTab === 'commissions' && (
            <div className="animate-fade-in-up space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    <Trophy className="text-amber-500" size={32} /> Ranking de Vendedoras & Comissões
                  </h2>
                  <p className="text-slate-500 font-medium">Acompanhe metas, P.A. (Peças por Atendimento) e comissões a pagar.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulário Nova Vendedora */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-fit">
                  <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Users size={18} className="text-indigo-600" /> Cadastrar Vendedora
                  </h3>
                  <form onSubmit={handleAddSeller} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Vendedora</label>
                      <input
                        required
                        type="text"
                        placeholder="Ex: Juliana Costa"
                        value={newSeller.name}
                        onChange={e => setNewSeller({ ...newSeller, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Comissão (%)</label>
                      <input
                        required
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={newSeller.rate}
                        onChange={e => setNewSeller({ ...newSeller, rate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                      />
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                      <Plus size={18} /> Adicionar à Equipe
                    </button>
                  </form>
                </div>

                {/* Pódio e Tabela de Comissões */}
                <div className="lg:col-span-2 space-y-4">
                  {sellerStats.map((st, index) => (
                    <div key={st.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                          index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-200 text-slate-700' : 'bg-orange-50 text-orange-600'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-lg text-slate-900">{st.name}</h4>
                            <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                              {st.rate}% Comissão
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-1 text-xs font-bold text-slate-400">
                            <span>{st.salesCount} vendas</span>
                            <span>•</span>
                            <span>{st.totalItems} peças vendidas</span>
                            <span>•</span>
                            <span className="text-indigo-600">P.A.: {st.pa} peças/venda</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col justify-between w-full sm:w-auto sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Total Vendido</p>
                          <p className="text-lg font-black text-slate-900">{formatCurrency(st.totalRevenue)}</p>
                        </div>
                        <div className="sm:mt-1">
                          <p className="text-[10px] font-bold uppercase text-emerald-600">Comissão a Pagar</p>
                          <p className="text-xl font-black text-emerald-600">{formatCurrency(st.totalCommission)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 4: CAIXA (FINANCEIRO)
          ========================================== */}
          {activeTab === 'finance' && (
            <div className="max-w-4xl mx-auto animate-fade-in-up space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center"><Lock size={24} /></div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Gestão de Caixa</h2>
                  <p className="text-slate-500 font-medium">Controle de abertura, sangria e fechamento.</p>
                </div>
              </div>

              {!register.isOpen ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6"><Lock size={32} className="text-slate-400" /></div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Caixa Fechado</h3>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto">Para iniciar as vendas do dia no dinheiro, informe o saldo inicial (fundo de troco) presente na gaveta.</p>
                  
                  <form onSubmit={handleOpenRegister} className="max-w-sm mx-auto space-y-4">
                    <input required type="number" step="0.01" placeholder="Fundo de Troco (R$)" value={openRegisterAmount} onChange={e => setOpenRegisterAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-center text-xl font-bold focus:ring-2 focus:ring-emerald-500" />
                    <button type="submit" className="w-full py-4 rounded-xl font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all">
                      <Unlock size={20} /> Abrir Caixa
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                    <ShieldCheck size={120} className="absolute right-[-20px] top-[-20px] opacity-10" />
                    <div className="relative z-10">
                      <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Status: Caixa Aberto</p>
                      <h3 className="text-5xl font-black mb-6">{formatCurrency(register.balance)}</h3>
                      <p className="text-sm font-medium opacity-90">Aberto às {formatTime(register.openedAt)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <button onClick={() => setIsSangriaModalOpen(true)} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col items-center justify-center text-amber-600 group">
                      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Banknote size={32} /></div>
                      <span className="font-black text-lg">Registrar Sangria</span>
                      <span className="text-xs text-slate-400 mt-1">Retirada de dinheiro</span>
                    </button>
                    <button onClick={handleCloseRegister} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all flex flex-col items-center justify-center text-red-600 group">
                      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Lock size={32} /></div>
                      <span className="font-black text-lg">Fechar Caixa</span>
                      <span className="text-xs text-slate-400 mt-1">Encerrar o dia</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* ==========================================
              TAB 5: DESPESAS (DRE)
          ========================================== */}
          {activeTab === 'expenses' && (
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-6 mb-8">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center"><Calculator size={24} /></div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Gestão de Despesas</h2>
                  <p className="text-slate-500 font-medium">Controle seus custos fixos e variáveis para o DRE.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-black text-slate-900 mb-4">Lançar Despesa</h3>
                    <form onSubmit={handleAddExpense} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                        <input required type="text" placeholder="Ex: Aluguel, Luz, Embalagens" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-rose-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                          <input required type="number" step="0.01" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-rose-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                          <select value={newExpense.type} onChange={e => setNewExpense({...newExpense, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-rose-500">
                            <option>Fixa</option>
                            <option>Variável</option>
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="w-full py-3 mt-2 rounded-xl font-black text-white bg-slate-900 hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2">
                        <Plus size={18}/> Adicionar
                      </button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-2">
                   <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                     <table className="w-full text-left border-collapse">
                       <thead className="bg-slate-50 border-b border-slate-200">
                         <tr className="text-slate-500 text-xs uppercase tracking-wider">
                           <th className="p-4 font-bold">Data</th>
                           <th className="p-4 font-bold">Descrição</th>
                           <th className="p-4 font-bold">Tipo</th>
                           <th className="p-4 font-bold">Valor</th>
                           <th className="p-4 font-bold text-center">Ações</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {expenses.length === 0 ? (
                           <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-medium">Nenhuma despesa registrada.</td></tr>
                         ) : (
                           expenses.sort((a,b) => b.timestamp - a.timestamp).map(exp => (
                             <tr key={exp.id} className="hover:bg-slate-50">
                               <td className="p-4 text-sm font-medium text-slate-500">{new Date(exp.timestamp).toLocaleDateString('pt-BR')}</td>
                               <td className="p-4 text-sm font-bold text-slate-900">{exp.description}</td>
                               <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${exp.type === 'Fixa' ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-600'}`}>{exp.type}</span></td>
                               <td className="p-4 text-sm font-black text-rose-500">{formatCurrency(exp.amount)}</td>
                               <td className="p-4 text-center">
                                 <button onClick={() => handleDeleteExpense(exp.id, exp.description)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                               </td>
                             </tr>
                           ))
                         )}
                       </tbody>
                     </table>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 6: AUDITORIA (LOGS)
          ========================================== */}
          {activeTab === 'audit' && (
            <div className="max-w-4xl mx-auto animate-fade-in-up">
              <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Auditoria do Sistema</h2>
                  <p className="text-slate-500 font-medium">Timeline de eventos críticos de segurança.</p>
                </div>
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center"><History size={24} /></div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                {auditLogs.length === 0 ? (
                  <p className="text-center text-slate-400 py-10 font-medium">Nenhum registro encontrado.</p>
                ) : (
                  <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="relative pl-8">
                        <div className={`absolute -left-[13px] top-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${
                          log.severity === 'warning' ? 'bg-amber-500' : log.severity === 'error' ? 'bg-red-500' : 'bg-emerald-500'
                        }`}></div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Clock size={12}/> {new Date(log.timestamp).toLocaleString()}</span>
                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                              log.severity === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                            }`}>{log.action}</span>
                          </div>
                          <p className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block mt-1">{log.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 7: VITRINE (Link in bio Mockup)
          ========================================== */}
          {activeTab === 'vitrine' && (
            <div className="animate-fade-in-up flex flex-col items-center pb-10">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-slate-900 flex items-center justify-center gap-2"><Globe className="text-indigo-500"/> Vitrine Digital Interativa</h2>
                <p className="text-slate-500 font-medium mt-2 max-w-lg mx-auto">Clique nas peças dentro do celular abaixo para testar a experiência do seu cliente montando o pedido e enviando direto para o WhatsApp da loja.</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                  <MessageCircle size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold text-slate-500">WhatsApp da Loja:</span>
                  <input
                    type="text"
                    value={storeWhatsapp}
                    onChange={e => setStoreWhatsapp(e.target.value)}
                    className="text-xs font-black text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 w-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="11999999999"
                  />
                </div>
              </div>

              {/* Mobile Phone Mockup */}
              <div className="w-full max-w-[370px] h-[740px] bg-white rounded-[3rem] border-[10px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col">
                {/* iPhone Notch */}
                <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-3xl w-40 mx-auto z-50"></div>
                
                {/* Header */}
                <div className="pt-10 pb-4 px-6 bg-slate-900 text-white text-center">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-2 shadow-lg">
                    <Store size={26} />
                  </div>
                  <h3 className="font-black text-lg">MF Store</h3>
                  <p className="text-[11px] text-slate-300 font-medium">Catálogo Online • Toque para adicionar</p>
                </div>
                
                {/* Products Grid */}
                <div className="flex-1 overflow-y-auto p-3.5 bg-[#F8FAFC] custom-scrollbar">
                  <div className="grid grid-cols-2 gap-3">
                    {vitrineProducts.length === 0 ? (
                      <div className="col-span-2 text-center py-10 text-slate-400 text-sm">
                        Nenhum produto destacado para a vitrine.
                      </div>
                    ) : (
                      vitrineProducts.map(p => {
                        const inBag = vitrineCart.find(i => i.id === p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => addToVitrineCart(p)}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col cursor-pointer hover:border-indigo-400 transition-all relative group"
                          >
                            <div className="h-32 bg-slate-100 relative">
                              {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <Tag className="w-full h-full p-6 text-slate-300 mx-auto" />}
                              <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                                {p.size}
                              </span>
                              {inBag && (
                                <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                                  {inBag.quantity}x
                                </span>
                              )}
                            </div>
                            <div className="p-2.5 flex-1 flex flex-col">
                              <p className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">{p.name}</p>
                              <div className="mt-auto flex items-center justify-between">
                                <span className="text-xs font-black text-indigo-600">{formatCurrency(p.price)}</span>
                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                  + Sacola
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Interactive Checkout Footer inside Phone */}
                <div className="p-4 bg-white border-t border-slate-200 space-y-2.5">
                  {vitrineCart.length > 0 && (
                    <div className="space-y-2 animate-fade-in">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-600">{vitrineCart.reduce((a, i) => a + i.quantity, 0)} peças na sacola</span>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900">{formatCurrency(vitrineTotal)}</span>
                          <button onClick={() => setVitrineCart([])} className="text-[10px] text-red-500 font-bold hover:underline">Limpar</button>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Seu nome para o pedido..."
                        value={vitrineCustomerName}
                        onChange={e => setVitrineCustomerName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <a
                      href={vitrineCart.length > 0 ? getVitrineOrderWhatsAppLink() : '#'}
                      target={vitrineCart.length > 0 ? "_blank" : undefined}
                      rel="noreferrer"
                      onClick={e => { if (vitrineCart.length === 0) { e.preventDefault(); showToast('Toque nas peças acima para montar o pedido!', 'error'); } }}
                      className={`flex-1 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all ${
                        vitrineCart.length > 0 ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <MessageCircle size={15} /> Pedir no WhatsApp
                    </a>
                    {vitrineCart.length > 0 && (
                      <button
                        onClick={sendVitrineOrderToPOS}
                        title="Importar pedido direto para o Caixa (PDV)"
                        className="px-3 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1"
                      >
                        <ShoppingBag size={14} /> PDV
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ==========================================
          MODALS
      ========================================== */}
      
      {/* ADD PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl animate-fade-in-up border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[2rem]">
              <h3 className="text-2xl font-black text-slate-900">Cadastro de Peça</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6">
              <div className="mb-6 flex flex-col items-center">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                <div onClick={() => fileInputRef.current.click()} className={`w-32 h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group ${newProduct.image ? 'border-indigo-500' : 'border-slate-300 hover:border-indigo-400'}`}>
                  {newProduct.image ? <img src={newProduct.image} className="w-full h-full object-cover" /> : <div className="text-slate-400 group-hover:text-indigo-500 flex flex-col items-center"><ImagePlus size={24} /><span className="text-[10px] font-bold mt-2">Add Foto</span></div>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
                  <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Tamanho / Grade</label>
                    <button
                      type="button"
                      onClick={() => setIsGridMode(!isGridMode)}
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md transition-colors ${
                        isGridMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isGridMode ? 'Grade Completa Ativa' : 'Ativar Grade (P ao GG)'}
                    </button>
                  </div>
                  {!isGridMode ? (
                    <select value={newProduct.size} onChange={e => setNewProduct({...newProduct, size: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold">
                      <option>U</option><option>PP</option><option>P</option><option>M</option><option>G</option><option>GG</option>
                    </select>
                  ) : (
                    <div className="grid grid-cols-5 gap-1.5 bg-indigo-50/60 p-2 rounded-xl border border-indigo-200">
                      {Object.keys(gridStocks).map(sz => (
                        <div key={sz} className="text-center">
                          <span className="text-[10px] font-black text-indigo-700 block mb-0.5">{sz}</span>
                          <input
                            type="number"
                            min="0"
                            value={gridStocks[sz]}
                            onChange={e => setGridStocks({ ...gridStocks, [sz]: e.target.value })}
                            className="w-full bg-white border border-indigo-200 rounded-lg py-1 text-center text-xs font-black text-slate-900"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custo (R$)</label>
                  <input required type="number" step="0.01" value={newProduct.cost} onChange={e => setNewProduct({...newProduct, cost: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Venda (R$)</label>
                    {parseFloat(newProduct.cost) > 0 && (
                      <div className="flex gap-1">
                        {[
                          { label: '+100%', mult: 2 },
                          { label: '+150%', mult: 2.5 },
                          { label: '+200%', mult: 3 }
                        ].map(m => (
                          <button
                            key={m.label}
                            type="button"
                            onClick={() => setNewProduct({ ...newProduct, price: (parseFloat(newProduct.cost) * m.mult).toFixed(2) })}
                            className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded hover:bg-indigo-100"
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" />
                </div>

                {/* Termômetro de Lucro em Tempo Real */}
                {parseFloat(newProduct.price) > 0 && parseFloat(newProduct.cost) >= 0 && (
                  <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">Termômetro de Margem</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        Lucro por peça: <span className="text-emerald-600 font-black">{formatCurrency(parseFloat(newProduct.price) - parseFloat(newProduct.cost))}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      {(() => {
                        const margin = ((parseFloat(newProduct.price) - parseFloat(newProduct.cost)) / parseFloat(newProduct.price)) * 100;
                        const color = margin < 25 ? 'bg-red-100 text-red-700' : margin < 45 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
                        return (
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-black ${color}`}>
                            Margem: {margin.toFixed(0)}%
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {!isGridMode && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estoque</label>
                    <input required type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" />
                  </div>
                )}
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="vitrine" checked={newProduct.isVitrine} onChange={e => setNewProduct({...newProduct, isVitrine: e.target.checked})} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" />
                  <label htmlFor="vitrine" className="text-sm font-bold text-slate-700">Mostrar na Vitrine Digital</label>
                </div>
              </div>
              <button type="submit" disabled={isProcessingImage} className="w-full py-4 mt-4 rounded-xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg">Salvar Produto</button>
            </form>
          </div>
        </div>
      )}

      {/* CHECKOUT & PIX MODAL */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-fade-in-up border border-slate-200 overflow-hidden">
            <div className="p-8 text-center bg-slate-900">
              <p className="text-emerald-400 font-bold mb-2 uppercase text-xs">Total</p>
              <h3 className="text-5xl font-black text-white tracking-tight">{formatCurrency(cartTotal)}</h3>
            </div>
            
            <div className="p-6">
              {selectedPaymentMethod === 'pix' ? (
                <div className="text-center animate-fade-in">
                  <p className="text-sm font-bold text-slate-500 mb-4 uppercase">Escaneie o QR Code</p>
                  <div className="w-48 h-48 mx-auto bg-white border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center mb-6">
                    <QrCode size={100} className="text-slate-800" />
                  </div>
                  <button onClick={() => handleCheckoutProcess('pix')} className="w-full py-4 rounded-xl font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30">Confirmar Pagamento PIX</button>
                </div>
              ) : selectedPaymentMethod === 'misto' ? (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-wider text-center">Dividir Pagamento (2 Formas)</p>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex gap-2">
                      <select
                        value={splitPayment.method1}
                        onChange={e => setSplitPayment({ ...splitPayment, method1: e.target.value })}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black uppercase"
                      >
                        <option value="pix">PIX</option>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="credito">Cartão</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={splitPayment.amount1}
                        onChange={e => setSplitPayment({ ...splitPayment, amount1: e.target.value })}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-right"
                        placeholder="Valor 1"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <select
                        value={splitPayment.method2}
                        onChange={e => setSplitPayment({ ...splitPayment, method2: e.target.value })}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black uppercase"
                      >
                        <option value="credito">Cartão</option>
                        <option value="pix">PIX</option>
                        <option value="dinheiro">Dinheiro</option>
                      </select>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block">Restante Automático</span>
                        <span className="text-base font-black text-emerald-600">
                          {formatCurrency(Math.max(0, cartTotal - (parseFloat(splitPayment.amount1) || 0)))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCheckoutProcess('misto')}
                    className="w-full py-4 rounded-xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30"
                  >
                    Concluir Pagamento Misto
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Pagamento</p>
                  {[
                    { id: 'pix', label: 'Pix (QR Code)', icon: <Smartphone size={22} className="text-emerald-500" /> },
                    { id: 'credito', label: 'Cartão de Crédito / Débito', icon: <CreditCard size={22} className="text-indigo-500" /> },
                    { id: 'dinheiro', label: 'Dinheiro (Espécie)', icon: <Banknote size={22} className="text-amber-500" /> },
                    { id: 'misto', label: 'Pagamento Misto (2 Formas)', icon: <SplitSquareVertical size={22} className="text-purple-500" /> }
                  ].map((method) => (
                    <button key={method.id} onClick={() => handleCheckoutProcess(method.id)} className="w-full flex items-center p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-500 transition-all group">
                      <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 mr-4">{method.icon}</div>
                      <span className="font-bold text-base text-slate-700">{method.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50"><button onClick={() => {setIsCheckoutModalOpen(false); setSelectedPaymentMethod(null)}} className="w-full py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200">Cancelar</button></div>
          </div>
        </div>
      )}

      {/* WHATSAPP RECEIPT MODAL */}
      {isReceiptModalOpen && lastSaleData && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-emerald-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl animate-fade-in-up text-center p-8">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Venda Concluída!</h3>
            <p className="text-slate-500 font-medium mb-8">Deseja enviar o recibo digital para o cliente?</p>
            
            <a href={getWhatsAppLink(lastSaleData)} target="_blank" rel="noreferrer" onClick={() => setIsReceiptModalOpen(false)}
               className="w-full py-4 rounded-xl font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg flex items-center justify-center gap-2 mb-3">
              <Send size={20} /> Enviar via WhatsApp
            </a>
            <button onClick={() => setIsReceiptModalOpen(false)} className="w-full py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">
              Pular / Novo Cliente
            </button>
          </div>
        </div>
      )}

      {/* LABEL GENERATOR MODAL */}
      {isLabelModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[2rem]">
              <div className="flex items-center gap-3"><Printer className="text-slate-600"/><h3 className="text-2xl font-black text-slate-900">Impressão de Etiquetas</h3></div>
              <button onClick={() => setIsLabelModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-slate-200/50 custom-scrollbar">
              <div className="bg-white p-8 mx-auto shadow-sm max-w-2xl min-h-[500px]">
                <div className="grid grid-cols-3 gap-4">
                  {products.slice(0, 15).map(p => (
                    <div key={p.id} className="border-2 border-slate-800 p-3 flex flex-col items-center justify-center text-center">
                      <p className="text-[10px] font-black uppercase text-slate-900 mb-1 leading-tight line-clamp-1">{p.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 mb-2">Tam: {p.size} | {formatCurrency(p.price)}</p>
                      <div className="w-full h-8 barcode-mock mb-1 opacity-80"></div>
                      <p className="text-[8px] font-mono font-bold tracking-widest text-slate-600">{p.id.substring(0,8).toUpperCase()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-white rounded-b-[2rem] text-right">
              <button onClick={() => showToast('Simulação de impressão iniciada!')} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-md flex items-center gap-2 inline-flex">
                <Printer size={18} /> Imprimir PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SANGRIA MODAL */}
      {isSangriaModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl animate-fade-in-up p-8">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Registrar Sangria</h3>
            <p className="text-slate-500 text-sm mb-6">Retirada de dinheiro da gaveta do caixa.</p>
            <form onSubmit={handleSangria} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Valor (R$)</label>
                <input required type="number" step="0.01" value={sangriaAmount} onChange={e => setSangriaAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Motivo / Justificativa</label>
                <input required type="text" placeholder="Ex: Pagamento fornecedor" value={sangriaReason} onChange={e => setSangriaReason(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsSangriaModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200">Cancelar</button>
                <button type="submit" className="flex-1 py-3 font-black text-white bg-amber-500 rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-500/30">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIN MODAL (GERENTE) */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl animate-fade-in-up text-center p-8 border border-slate-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Key size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Acesso Restrito</h3>
            <p className="text-slate-500 font-medium mb-6 text-sm">Esta ação exige autorização. Insira a senha de gerente. (Dica: 1234)</p>
            
            <form onSubmit={handleConfirmPin}>
              <input 
                type="password" 
                autoFocus
                placeholder="****" 
                maxLength={4}
                value={pinInput} 
                onChange={e => setPinInput(e.target.value)}
                className="w-full text-center text-3xl tracking-[1em] font-black bg-slate-50 border border-slate-200 rounded-xl py-4 mb-4 focus:ring-2 focus:ring-rose-500 outline-none text-slate-700" 
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setIsPinModalOpen(false); setPinInput(''); setPinAction(null); }} className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-black text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30">
                  Liberar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}