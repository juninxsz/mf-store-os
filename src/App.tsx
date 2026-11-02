import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, ShoppingBag, PackageSearch, Plus, Trash2, 
  ShoppingCart, CheckCircle2, TrendingUp, Tag, AlertCircle, X,
  CreditCard, Banknote, Smartphone, Search, User, Percent,
  Camera, ImagePlus, Save, Target, BarChart3, TrendingDown, Sparkles,
  ToggleLeft, ToggleRight, History, Globe, Lock, Unlock, 
  MessageCircle, Printer, Store, Clock, ShieldCheck, FileText, Send, QrCode,
  Wallet, Award, Key, Calculator, RefreshCw, Briefcase, Undo2, Receipt, ArrowLeftRight,
  Users, Trophy, Layers, Sparkle, SplitSquareVertical, MessageSquare
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

// --- FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: "AIzaSyDsAB2ft4lawPqbY_3U-YHJfUFIYJ3lVA0",
  authDomain: "controle-de-estoque-c59f1.firebaseapp.com",
  projectId: "controle-de-estoque-c59f1",
  storageBucket: "controle-de-estoque-c59f1.firebasestorage.app",
  messagingSenderId: "201083695622",
  appId: "1:201083695622:web:e38955796a2e5599870987",
  measurementId: "G-MP1TX35SLK"
};

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
  @keyframes scaleIn {
    0% { opacity: 0; transform: scale(0.92) translateY(15px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-slide-in-right { animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  .animate-pulse-soft { animation: pulseSoft 2s infinite ease-in-out; }
  .animate-modal { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  
  .btn-press { transition: all 0.15s ease; }
  .btn-press:active { transform: scale(0.94); }
  .hover-lift { transition: all 0.3s ease; }
  .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
  
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
  const [splitPayment, setSplitPayment] = useState({ method1: 'pix', amount1: '', method2: 'credito' });

  // Combos / Looks States
  const [looks, setLooks] = useState([{
    id: 'look-1', name: 'Look Streetwear Completo', discountPercent: 12, itemNames: ['Camiseta Oversized Heavy', 'Calça Cargo Streetwear']
  }]);
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

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) { console.error("Auth error:", error); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // ATUALIZAÇÃO: Removido o 'users', user.uid para globalizar a base de dados
    const productsRef = collection(db, 'artifacts', appId, 'products');
    const salesRef = collection(db, 'artifacts', appId, 'sales');
    const auditsRef = collection(db, 'artifacts', appId, 'audits');
    const registerRef = collection(db, 'artifacts', appId, 'register_events');
    const expensesRef = collection(db, 'artifacts', appId, 'expenses');
    const vouchersRef = collection(db, 'artifacts', appId, 'vouchers');
    const condicionaisRef = collection(db, 'artifacts', appId, 'condicionais');
    
    const unsubProducts = onSnapshot(productsRef, (snapshot) => setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubSales = onSnapshot(salesRef, (snapshot) => {
      const sls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      sls.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setSales(sls);
    });
    const unsubAudits = onSnapshot(auditsRef, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setAuditLogs(logs.slice(0, 50));
    });
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
    });
    const unsubExpenses = onSnapshot(expensesRef, (snapshot) => {
      const exps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      exps.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setExpenses(exps);
    });
    const unsubVouchers = onSnapshot(vouchersRef, (snapshot) => {
      const vchs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      vchs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setVouchers(vchs);
    });
    const unsubCondicionais = onSnapshot(condicionaisRef, (snapshot) => {
      const conds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      conds.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setCondicionais(conds);
    });
    return () => { unsubProducts(); unsubSales(); unsubAudits(); unsubRegister(); unsubExpenses(); unsubVouchers(); unsubCondicionais(); };
  }, [user]);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  const formatTime = (ts) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 4000); };

  const logAudit = async (action, details, severity = 'info') => {
    if (!user) return;
    try { await addDoc(collection(db, 'artifacts', appId, 'audits'), { action, details, severity, timestamp: Date.now() }); } catch (e) {}
  };

  const requestPin = (action) => { setPinAction(() => action); setIsPinModalOpen(true); };
  const handleConfirmPin = (e) => {
    e.preventDefault();
    if (pinInput === '1234') { 
      if (pinAction) pinAction();
      setIsPinModalOpen(false); setPinInput(''); setPinAction(null);
    } else {
      showToast('Senha do gerente incorreta!', 'error');
      logAudit('Tentativa de Fraude', 'Senha de gerente incorreta inserida.', 'error');
    }
  };

  const handleOpenRegister = async (e) => {
    e.preventDefault();
    const amount = parseFloat(openRegisterAmount) || 0;
    const ts = Date.now();
    await addDoc(collection(db, 'artifacts', appId, 'register_events'), { type: 'OPEN', amount, currentBalance: amount, timestamp: ts, openedAt: ts });
    logAudit('Caixa Aberto', `Saldo inicial informado: ${formatCurrency(amount)}`, 'success');
    setOpenRegisterAmount(''); showToast('Caixa aberto com sucesso!');
  };

  const handleCloseRegister = async () => {
    await addDoc(collection(db, 'artifacts', appId, 'register_events'), { type: 'CLOSE', amount: register.balance, currentBalance: 0, timestamp: Date.now() });
    logAudit('Caixa Fechado', `Saldo final em gaveta: ${formatCurrency(register.balance)}`, 'warning');
    showToast('Caixa fechado com segurança.', 'success');
  };

  const handleSangria = async (e) => {
    e.preventDefault();
    const amount = parseFloat(sangriaAmount);
    if (amount > register.balance) { showToast('Valor da sangria maior que o saldo em caixa!', 'error'); return; }
    requestPin(async () => {
      const newBalance = register.balance - amount;
      await addDoc(collection(db, 'artifacts', appId, 'register_events'), { type: 'SANGRIA', amount, reason: sangriaReason, currentBalance: newBalance, timestamp: Date.now(), openedAt: register.openedAt });
      logAudit('Sangria Realizada', `Retirada de ${formatCurrency(amount)}. Motivo: ${sangriaReason}`, 'warning');
      setIsSangriaModalOpen(false); setSangriaAmount(''); setSangriaReason(''); showToast('Sangria registrada com sucesso.');
    });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'expenses'), { description: newExpense.description, amount: parseFloat(newExpense.amount), type: newExpense.type, timestamp: Date.now() });
      setNewExpense({ description: '', amount: '', type: 'Fixa' });
      showToast('Despesa registrada com sucesso!');
      logAudit('Despesa Adicionada', `Nova despesa ${newExpense.type}: ${newExpense.description} - ${formatCurrency(newExpense.amount)}`, 'info');
    } catch (e) { showToast('Erro ao registrar despesa.', 'error'); }
  };

  const handleDeleteExpense = (id, desc) => {
    requestPin(async () => {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'expenses', id));
        showToast('Despesa removida.'); logAudit('Despesa Removida', `Despesa excluída: ${desc}`, 'warning');
      } catch(e) {}
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_W = 400, MAX_H = 400; // Compressed to save Firestore limits
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX_W) { h *= MAX_W / w; w = MAX_W; } } else { if (h > MAX_H) { w *= MAX_H / h; h = MAX_H; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        setNewProduct(prev => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.5) })); // Reduced quality for base64 optimization
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
        if (sizesToCreate.length === 0) { showToast('Informe a quantidade de pelo menos 1 tamanho na grade!', 'error'); return; }
        for (const [sz, qty] of sizesToCreate) {
          await addDoc(collection(db, 'artifacts', appId, 'products'), {
            name: newProduct.name, category: newProduct.category, price: parseFloat(newProduct.price), cost: parseFloat(newProduct.cost),
            size: sz, stock: parseInt(qty), image: newProduct.image || null, isVitrine: newProduct.isVitrine, createdAt: Date.now()
          });
        }
        showToast(`Grade criada com ${sizesToCreate.length} tamanhos!`);
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'products'), {
          name: newProduct.name, category: newProduct.category, price: parseFloat(newProduct.price), cost: parseFloat(newProduct.cost),
          size: newProduct.size, stock: parseInt(newProduct.stock), image: newProduct.image || null, isVitrine: newProduct.isVitrine, createdAt: Date.now()
        });
        showToast('Produto adicionado ao catálogo!');
      }
      setIsProductModalOpen(false);
      setNewProduct({ name: '', category: 'Camisetas', price: '', cost: '', size: 'M', stock: 10, image: null, isVitrine: true });
    } catch (e) { showToast('Erro ao cadastrar.', 'error'); }
  };

  const handleDeleteProduct = (id, name) => {
    requestPin(async () => {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'products', id));
        logAudit('Produto Excluído', `A peça "${name}" foi removida do sistema.`, 'warning'); showToast('Produto removido.');
      } catch (e) {}
    });
  };

  const toggleVitrine = async (product) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'products', product.id), { isVitrine: !product.isVitrine });
      showToast(`Produto ${!product.isVitrine ? 'adicionado à' : 'removido da'} vitrine digital.`);
    } catch (e) {}
  };

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

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCost = cart.reduce((acc, item) => acc + (item.cost * item.quantity), 0);
  const discountValue = cartSubtotal * (parseFloat(discountPercent || 0) / 100);
  const voucherDiscount = appliedVoucher ? Math.min(appliedVoucher.amount, cartSubtotal - discountValue) : 0;
  const cartTotal = Math.max(0, cartSubtotal - discountValue - voucherDiscount);

  const handleApplyVoucher = () => {
    if (!voucherCodeInput.trim()) return;
    const found = vouchers.find(v => v.code.toUpperCase() === voucherCodeInput.trim().toUpperCase() && !v.used);
    if (!found) { showToast('Vale-troca inválido ou já utilizado!', 'error'); return; }
    setAppliedVoucher(found); setVoucherCodeInput(''); showToast(`Vale-troca de ${formatCurrency(found.amount)} aplicado!`);
  };

  const handleCreateCondicional = async () => {
    if (!user || cart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) { showToast('Preencha Nome e WhatsApp do cliente!', 'error'); return; }
    try {
      const deadline = Date.now() + (48 * 60 * 60 * 1000);
      await addDoc(collection(db, 'artifacts', appId, 'condicionais'), {
        customerName, customerPhone, items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, cost: i.cost, quantity: i.quantity, size: i.size, image: i.image || null })),
        totalValue: cartSubtotal, status: 'PENDENTE', createdAt: Date.now(), deadline
      });
      for (const item of cart) {
        await updateDoc(doc(db, 'artifacts', appId, 'products', item.id), { stock: Math.max(0, item.stock - item.quantity) });
      }
      logAudit('Malinha Enviada', `Cliente: ${customerName} (${cart.length} itens)`, 'info');
      setCart([]); setCustomerName(''); setCustomerPhone('');
      showToast('Malinha condicional registrada e estoque reservado!'); setActiveTab('condicional');
    } catch (e) { showToast('Erro ao criar condicional.', 'error'); }
  };

  const handleReturnCondicional = async (cond) => {
    if (!user) return;
    try {
      for (const item of cond.items) {
        const prod = products.find(p => p.id === item.id);
        if (prod) await updateDoc(doc(db, 'artifacts', appId, 'products', item.id), { stock: (prod.stock || 0) + item.quantity });
      }
      await updateDoc(doc(db, 'artifacts', appId, 'condicionais', cond.id), { status: 'DEVOLVIDO' });
      showToast('Peças devolvidas ao estoque com sucesso!');
    } catch (e) { showToast('Erro ao devolver condicional.', 'error'); }
  };

  const handleConvertCondicionalToSale = async (cond) => {
    if (!user) return;
    try {
      for (const item of cond.items) {
        const prod = products.find(p => p.id === item.id);
        if (prod) await updateDoc(doc(db, 'artifacts', appId, 'products', item.id), { stock: (prod.stock || 0) + item.quantity });
      }
      await updateDoc(doc(db, 'artifacts', appId, 'condicionais', cond.id), { status: 'CONVERTIDO' });
      setCustomerName(cond.customerName); setCustomerPhone(cond.customerPhone);
      setCart(cond.items.map(i => {
        const currentProd = products.find(p => p.id === i.id);
        return { ...i, stock: (currentProd?.stock || 0) + i.quantity };
      }));
      setActiveTab('pos'); showToast('Malinha carregada na sacola! Finalize o pagamento.');
    } catch (e) { showToast('Erro ao carregar malinha no PDV.', 'error'); }
  };

  const getCondicionalWhatsAppLink = (cond) => {
    const cleanPhone = cond.customerPhone.replace(/\D/g, '');
    let msg = `🛍️ *MF Store - Sua Malinha Chegou!* 🛍️

Olá ${cond.customerName}!
Separamos as seguintes peças para você provar no conforto de casa:

`;
    cond.items.forEach(i => { msg += `• ${i.quantity}x ${i.name} (Tam: ${i.size}) - ${formatCurrency(i.price * i.quantity)}
`; });
    msg += `
*Valor Total da Malinha:* ${formatCurrency(cond.totalValue)}
`;
    msg += `*Prazo de Devolução:* ${new Date(cond.deadline).toLocaleDateString('pt-BR')} às ${new Date(cond.deadline).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}

`;
    msg += `Qualquer dúvida, estamos à disposição! ✨`;
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const handleGenerateVoucherFromSale = async (sale, itemIndex) => {
    if (!user) return;
    const item = sale.items[itemIndex];
    if (!item || item.exchanged) return;
    try {
      const prod = products.find(p => p.id === item.id);
      if (prod) await updateDoc(doc(db, 'artifacts', appId, 'products', item.id), { stock: (prod.stock || 0) + 1 });
      const code = `TROCA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      await addDoc(collection(db, 'artifacts', appId, 'vouchers'), { code, customerName: sale.customerName, itemName: item.name, amount: item.price, used: false, createdAt: Date.now() });
      const updatedItems = sale.items.map((it, idx) => idx === itemIndex ? { ...it, exchanged: true } : it);
      await updateDoc(doc(db, 'artifacts', appId, 'sales', sale.id), { items: updatedItems });
      showToast(`Vale-Troca ${code} gerado e peça devolvida ao estoque!`);
    } catch (e) { showToast('Erro ao gerar vale-troca.', 'error'); }
  };

  const handleRefundSale = (sale) => {
    requestPin(async () => {
      try {
        for (const item of sale.items) {
          if (!item.exchanged) {
            const prod = products.find(p => p.id === item.id);
            if (prod) await updateDoc(doc(db, 'artifacts', appId, 'products', item.id), { stock: (prod.stock || 0) + item.quantity });
          }
        }
        await deleteDoc(doc(db, 'artifacts', appId, 'sales', sale.id));
        showToast('Venda estornada e peças devolvidas ao estoque.');
      } catch (e) { showToast('Erro ao estornar venda.', 'error'); }
    });
  };

  const handleCheckoutProcess = (paymentMethod) => {
    if (!user || cart.length === 0) return;
    if (paymentMethod === 'pix' && selectedPaymentMethod !== 'pix') { setSelectedPaymentMethod('pix'); return; }
    if (paymentMethod === 'misto' && selectedPaymentMethod !== 'misto') {
      setSelectedPaymentMethod('misto'); setSplitPayment({ method1: 'pix', amount1: (cartTotal / 2).toFixed(2), method2: 'credito' }); return;
    }
    const executeSale = async () => {
      try {
        const activeSellerObj = sellers.find(s => `${s.name} (${s.rate}%)` === selectedSeller) || sellers[0] || { name: 'Loja', rate: 5 };
        const commissionValue = cartTotal * ((activeSellerObj.rate || 0) / 100);
        const amt1 = parseFloat(splitPayment.amount1) || 0;
        const amt2 = Math.max(0, cartTotal - amt1);
        const formattedMethod = paymentMethod === 'misto' ? `Misto (${splitPayment.method1.toUpperCase()} ${formatCurrency(amt1)} + ${splitPayment.method2.toUpperCase()} ${formatCurrency(amt2)})` : paymentMethod;
        const saleObj = {
          customerName: customerName || 'Cliente Balcão', customerPhone: customerPhone || '', sellerName: activeSellerObj.name, sellerRate: activeSellerObj.rate,
          commissionValue, items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, cost: i.cost, quantity: i.quantity, size: i.size })),
          subtotal: cartSubtotal, totalCost: cartCost, discountPercent: parseFloat(discountPercent || 0), discountValue,
          voucherCode: appliedVoucher ? appliedVoucher.code : null, voucherDiscount, total: cartTotal, paymentMethod: formattedMethod, timestamp: Date.now()
        };
        await addDoc(collection(db, 'artifacts', appId, 'sales'), saleObj);
        if (appliedVoucher) await updateDoc(doc(db, 'artifacts', appId, 'vouchers', appliedVoucher.id), { used: true, usedAt: Date.now() });
        for (const item of cart) await updateDoc(doc(db, 'artifacts', appId, 'products', item.id), { stock: Math.max(0, item.stock - item.quantity) });
        const cashReceived = paymentMethod === 'dinheiro' ? cartTotal : (paymentMethod === 'misto' ? ((splitPayment.method1 === 'dinheiro' ? amt1 : 0) + (splitPayment.method2 === 'dinheiro' ? amt2 : 0)) : 0);
        if (cashReceived > 0 && register.isOpen) await addDoc(collection(db, 'artifacts', appId, 'register_events'), { type: 'SALE', amount: cashReceived, currentBalance: register.balance + cashReceived, timestamp: Date.now(), openedAt: register.openedAt });
        
        setLastSaleData(saleObj); setCart([]); setCustomerName(''); setCustomerPhone(''); setDiscountPercent(''); setAppliedVoucher(null); setSelectedPaymentMethod(null);
        setIsCheckoutModalOpen(false); setIsReceiptModalOpen(true);
      } catch (error) { showToast('Erro ao processar venda.', 'error'); }
    };

    if (parseFloat(discountPercent || 0) > 10) { setIsCheckoutModalOpen(false); requestPin(executeSale); } else { executeSale(); }
  };

  const getWhatsAppLink = (sale) => {
    if (!sale || !sale.customerPhone) return '#';
    const cleanPhone = sale.customerPhone.replace(/\D/g, '');
    const cashback = sale.total * 0.05; 
    let msg = `🛍️ *MF Store - Recibo Digital* 🛍️

Olá ${sale.customerName}! Muito obrigado pela preferência.

*Resumo da sua compra:*
`;
    sale.items.forEach(i => { msg += `- ${i.quantity}x ${i.name} (Tam: ${i.size}) : ${formatCurrency(i.price * i.quantity)}
`; });
    if (sale.discountValue > 0) msg += `
Desconto: - ${formatCurrency(sale.discountValue)}`;
    msg += `
*TOTAL: ${formatCurrency(sale.total)}*

🎁 *Você ganhou ${formatCurrency(cashback)} de CASHBACK* para usar na sua próxima compra!

Volte sempre! ✨`;
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const getDirectChatLink = (phone) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/55${cleanPhone}`;
  };

  // Derived Data
  const dashboardStats = useMemo(() => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    const monthSales = sales.filter(s => s.timestamp >= startOfMonth);
    const monthlyRevenue = monthSales.reduce((acc, s) => acc + s.total, 0);
    const monthlyCost = monthSales.reduce((acc, s) => acc + (s.totalCost || 0), 0);
    const monthExpenses = expenses.filter(e => e.timestamp >= startOfMonth);
    const totalExpenses = monthExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = monthlyRevenue - monthlyCost - totalExpenses;
    const goalProgress = Math.min((monthlyRevenue / 50000) * 100, 100);
    const chart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const nextDay = new Date(d); nextDay.setDate(nextDay.getDate() + 1);
      const daySales = sales.filter(s => s.timestamp >= d.getTime() && s.timestamp < nextDay.getTime());
      chart.push({ name: d.toLocaleDateString('pt-BR', { weekday: 'short' }), Faturamento: daySales.reduce((a, s) => a + s.total, 0) });
    }
    return { monthlyRevenue, netProfit, totalExpenses, goalProgress, chartData: chart };
  }, [sales, expenses]);

  const filteredPosProducts = products.filter(p => p.name.toLowerCase().includes(posSearchQuery.toLowerCase()) && (posCategoryFilter === 'Todas' || p.category === posCategoryFilter));
  const filteredInventoryProducts = products.filter(p => p.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()));
  const vitrineProducts = products.filter(p => p.isVitrine && p.stock > 0);

  const crmData = useMemo(() => {
    if (!customerPhone || customerPhone.length < 10) return null;
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const customerSales = sales.filter(s => s.customerPhone && s.customerPhone.replace(/\D/g, '') === cleanPhone);
    if (customerSales.length === 0) return null;
    const totalSpent = customerSales.reduce((acc, s) => acc + s.total, 0);
    return { visits: customerSales.length, totalSpent, cashbackAvailable: totalSpent * 0.05 };
  }, [customerPhone, sales]);

  const sellerStats = useMemo(() => {
    return sellers.map(seller => {
      const sellerSales = sales.filter(s => (s.sellerName || 'Ana Clara') === seller.name);
      const totalRevenue = sellerSales.reduce((acc, s) => acc + (s.total || 0), 0);
      const totalCommission = sellerSales.reduce((acc, s) => acc + (s.commissionValue !== undefined ? s.commissionValue : (s.total * (seller.rate / 100))), 0);
      const totalItems = sellerSales.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0), 0);
      return { ...seller, salesCount: sellerSales.length, totalRevenue, totalCommission, totalItems, pa: sellerSales.length > 0 ? (totalItems / sellerSales.length).toFixed(1) : '0.0' };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [sellers, sales]);

  const handleAddSeller = (e) => {
    e.preventDefault();
    if (!newSeller.name.trim()) return;
    const created = { id: `seller-${Date.now()}`, name: newSeller.name.trim(), rate: parseFloat(newSeller.rate) || 5 };
    setSellers(prev => [...prev, created]); setSelectedSeller(`${created.name} (${created.rate}%)`); setNewSeller({ name: '', rate: 5 }); showToast(`Vendedora ${created.name} cadastrada!`);
  };

  const addToVitrineCart = (product) => {
    setVitrineCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) {
        if (exists.quantity >= product.stock) { showToast('Estoque atingido!', 'error'); return prev; }
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };
  const vitrineTotal = vitrineCart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const getVitrineOrderWhatsAppLink = () => {
    const cleanPhone = storeWhatsapp.replace(/\D/g, '');
    let msg = `🛍️ *Novo Pedido - Vitrine Digital MF Store*

*Cliente:* ${vitrineCustomerName || 'Cliente Instagram'}

*Peças escolhidas:*
`;
    vitrineCart.forEach(i => { msg += `• ${i.quantity}x ${i.name} (Tam: ${i.size}) - ${formatCurrency(i.price * i.quantity)}
`; });
    msg += `
*Total do Pedido: ${formatCurrency(vitrineTotal)}*

Podemos confirmar a disponibilidade? ✨`;
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };
  const sendVitrineOrderToPOS = () => {
    if (vitrineCart.length === 0) return;
    setCart(vitrineCart); if (vitrineCustomerName) setCustomerName(vitrineCustomerName); setVitrineCart([]); setVitrineCustomerName(''); setActiveTab('pos'); showToast('Pedido importado!');
  };

  const renderSidebarItem = (id, icon, label) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium ${
        activeTab === id ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30 transform scale-[1.02]' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black hover-lift'
      }`}>
      {icon}<span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-zinc-900 flex overflow-hidden selection:bg-pink-200">
      <style>{customStyles}</style>

      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-zinc-200 flex flex-col p-6 z-20 hidden lg:flex shadow-2xl shadow-zinc-200/50">
        <div className="flex items-center space-x-3 mb-10 pl-2">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-pink-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-500/30 hover-lift cursor-pointer">
            <Sparkles size={24} className="animate-pulse-soft" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">MF Store<span className="text-pink-600">.</span></h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Premium OS</p>
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
          <div className="pt-4 pb-2"><p className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-4">Gestão</p></div>
          {renderSidebarItem('finance', <Lock size={20} />, 'Caixa (Gaveta)')}
          {renderSidebarItem('expenses', <TrendingDown size={20} />, 'Despesas (DRE)')}
          {renderSidebarItem('audit', <ShieldCheck size={20} />, 'Auditoria')}
          <div className="pt-4 pb-2"><p className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-4">Digital</p></div>
          {renderSidebarItem('vitrine', <Smartphone size={20} />, 'Vitrine Digital')}
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="lg:hidden glass-panel p-3 border-b border-zinc-200 flex flex-col gap-2 sticky top-0 z-20">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center">
              <Sparkles size={18} className="text-pink-600 mr-2" />
              <h1 className="text-lg font-black tracking-tight text-black">MF Store<span className="text-pink-600">.</span></h1>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-pink-50 text-pink-600 px-2.5 py-1 rounded-full">Premium OS</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 px-1">
            {[
              { id: 'dashboard', label: 'Visão Geral', icon: <LayoutDashboard size={14} /> },
              { id: 'pos', label: 'PDV', icon: <ShoppingBag size={14} /> },
              { id: 'inventory', label: 'Estoque', icon: <PackageSearch size={14} /> },
              { id: 'sales_history', label: 'Trocas', icon: <ArrowLeftRight size={14} /> },
              { id: 'condicional', label: 'Malinhas', icon: <Briefcase size={14} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-pink-600 text-white shadow-sm' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pb-28 lg:pb-10 custom-scrollbar relative">
          
          {toast && (
            <div className={`fixed top-6 right-6 px-6 py-4 rounded-2xl shadow-2xl z-[100] flex items-center space-x-3 animate-fade-in-up border ${
              toast.type === 'error' ? 'bg-red-900 text-white border-red-700' : 'bg-black text-white border-zinc-700'
            }`}>
              {toast.type === 'error' ? <AlertCircle size={20} className="text-red-400" /> : <CheckCircle2 size={20} className="text-emerald-400" />}
              <span className="font-semibold">{toast.message}</span>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black">Dashboard</h2>
                  <p className="text-zinc-500 font-medium">Resumo financeiro e progresso mensal.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200 hover-lift">
                  <p className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Faturamento Mensal</p>
                  <h3 className="text-2xl font-black text-black">{formatCurrency(dashboardStats.monthlyRevenue)}</h3>
                  <div className="mt-4 w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 transition-all duration-1000" style={{ width: `${dashboardStats.goalProgress}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200 hover-lift">
                  <p className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Despesas (Saídas)</p>
                  <h3 className="text-2xl font-black text-red-500">{formatCurrency(dashboardStats.totalExpenses)}</h3>
                  <p className="text-[10px] text-zinc-400 mt-2 uppercase font-bold">Fixas e Variáveis</p>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-3xl shadow-lg border border-zinc-700 text-white col-span-1 md:col-span-2 hover-lift">
                  <p className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide flex items-center gap-2"><Award size={14}/> Lucro Real (DRE)</p>
                  <h3 className="text-3xl font-black text-emerald-400">{formatCurrency(dashboardStats.netProfit)}</h3>
                  <p className="text-xs text-zinc-400 mt-2">Faturamento - (Custo das Peças + Despesas da Loja)</p>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
                <h3 className="text-xl font-bold text-black mb-6">Receita (Últimos 7 dias)</h3>
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

          {activeTab === 'pos' && (
            <div className="h-full flex flex-col xl:flex-row gap-6 animate-fade-in-up">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex flex-col gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-zinc-400" size={18} />
                    <input type="text" placeholder="Buscar peça ou usar leitor de código de barras..." value={posSearchQuery} onChange={(e) => setPosSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-pink-500 shadow-sm font-medium transition-shadow" />
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                    {['Todas', 'Camisetas', 'Calças', 'Casacos', 'Vestidos', 'Acessórios'].map(cat => (
                      <button key={cat} onClick={() => setPosCategoryFilter(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap btn-press ${posCategoryFilter === cat ? 'bg-black text-white shadow-sm' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPosProducts.map((p) => (
                      <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock <= 0}
                        className={`text-left bg-white rounded-3xl border border-zinc-200 overflow-hidden hover:shadow-xl hover:-tranzinc-y-1 transition-all btn-press flex flex-col ${p.stock <= 0 ? 'opacity-50 grayscale' : 'group'}`}>
                        <div className="h-32 w-full bg-zinc-100 relative overflow-hidden">
                          {p.image ? <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <Tag className="w-full h-full p-8 text-zinc-300" />}
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-black text-zinc-900">{p.size}</div>
                        </div>
                        <div className="p-3 flex-1 flex flex-col">
                          <p className="font-bold text-black text-sm leading-tight mb-2 line-clamp-2">{p.name}</p>
                          <div className="mt-auto flex justify-between items-end">
                            <span className="font-black text-black">{formatCurrency(p.price)}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.stock <= 3 ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-500'}`}>{p.stock} est.</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-full xl:w-[400px] bg-white rounded-3xl shadow-xl border border-zinc-200 flex flex-col flex-shrink-0 animate-slide-in-right h-[650px] xl:h-auto">
                <div className="p-5 bg-black text-white rounded-t-3xl relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-2"><ShoppingCart size={24}/> Sacola</h3>
                    <select value={selectedSeller} onChange={(e) => setSelectedSeller(e.target.value)} className="bg-pink-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-pink-400/40 focus:outline-none">
                      {sellers.map(s => (<option key={s.id} value={`${s.name} (${s.rate}%)`}>Vend: {s.name}</option>))}
                    </select>
                  </div>
                  <div className="mt-4 space-y-3 relative z-10">
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-zinc-400" size={16} />
                      <input type="text" placeholder="Nome do Cliente" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm focus:border-pink-400 text-white placeholder-zinc-400 transition-colors" />
                    </div>
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <MessageCircle className="absolute left-3 top-3 text-zinc-400" size={16} />
                        <input type="tel" placeholder="WhatsApp (ex: 11999999999)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm focus:border-pink-400 text-white placeholder-zinc-400 transition-colors" />
                      </div>
                      {customerPhone && customerPhone.length > 9 && (
                        <a href={getDirectChatLink(customerPhone)} target="_blank" rel="noreferrer" className="bg-emerald-500 hover:bg-emerald-600 p-2.5 rounded-xl text-white transition-colors" title="Chamar no WhatsApp">
                          <MessageSquare size={18} />
                        </a>
                      )}
                    </div>
                    {crmData && (
                      <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-between animate-fade-in">
                         <div>
                            <p className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">Fidelidade</p>
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
                    <div key={item.id} className="flex items-center bg-white p-3 rounded-2xl shadow-sm border border-zinc-100 animate-fade-in">
                      <div className="w-12 h-12 bg-zinc-100 rounded-xl overflow-hidden mr-3">
                        {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Tag className="w-full h-full p-3 text-zinc-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-black text-sm truncate">{item.name}</p>
                        <p className="text-xs font-bold text-pink-600">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-zinc-50 rounded-xl p-1 border border-zinc-100">
                        <span className="font-black text-zinc-700 px-2 text-sm">x{item.quantity}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-zinc-300 hover:text-red-500 p-1.5 rounded-lg btn-press"><X size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 bg-white border-t border-zinc-100">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="relative">
                      <Percent className="absolute left-3 top-3 text-zinc-400" size={15} />
                      <input type="number" placeholder="Desc (%)" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} disabled={cart.length === 0}
                        className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-pink-500" />
                    </div>
                    <div className="flex gap-1">
                      <input type="text" placeholder="Vale-Troca" value={voucherCodeInput} onChange={(e) => setVoucherCodeInput(e.target.value)} disabled={cart.length === 0}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold uppercase focus:ring-2 focus:ring-pink-500" />
                      <button type="button" onClick={handleApplyVoucher} disabled={cart.length === 0} className="px-3 py-2 bg-pink-50 text-pink-600 rounded-xl text-xs font-black hover:bg-pink-100 btn-press">OK</button>
                    </div>
                  </div>
                  {appliedVoucher && (
                    <div className="mb-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center text-xs font-bold text-emerald-700 animate-fade-in">
                      <span>Vale {appliedVoucher.code}: -{formatCurrency(voucherDiscount)}</span>
                      <button onClick={() => setAppliedVoucher(null)} className="text-emerald-700 hover:text-red-500"><X size={14}/></button>
                    </div>
                  )}
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-zinc-500 font-bold uppercase text-xs">Total a Pagar</span>
                    <span className="text-3xl font-black text-black">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCreateCondicional} disabled={cart.length === 0} title="Reservar peças e enviar Malinha"
                      className={`px-4 py-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center btn-press border ${cart.length > 0 ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed'}`}>
                      <Briefcase size={18} /><span className="mt-0.5">Malinha</span>
                    </button>
                    <button onClick={() => setIsCheckoutModalOpen(true)} disabled={cart.length === 0}
                      className={`flex-1 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 btn-press ${cart.length > 0 ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}>
                      <span>Cobrar</span><CheckCircle2 size={22} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="animate-fade-in-up">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-black text-black">Estoque</h2>
                  <p className="text-zinc-500 font-medium">Controle de peças, preços e etiquetas.</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3.5 top-3.5 text-zinc-400" size={18} />
                    <input type="text" placeholder="Buscar no estoque..." value={inventorySearchQuery} onChange={(e) => setInventorySearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-pink-500" />
                  </div>
                  <button onClick={() => setIsLabelModalOpen(true)} className="bg-zinc-900 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-700 btn-press">
                    <Printer size={18} /><span>Etiquetas</span>
                  </button>
                  <button onClick={() => setIsProductModalOpen(true)} className="bg-pink-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-pink-700 shadow-lg shadow-pink-600/30 btn-press">
                    <Plus size={18} /><span>Nova Peça</span>
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-50 border-b border-zinc-200 sticky top-0 z-10">
                      <tr className="text-zinc-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold">Produto</th><th className="p-4 font-bold">Tamanho</th><th className="p-4 font-bold">Custo / Venda</th>
                        <th className="p-4 font-bold">Estoque</th><th className="p-4 font-bold text-center">Vitrine</th><th className="p-4 font-bold text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredInventoryProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50 transition-colors group">
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0">
                              {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <Tag className="w-full h-full p-2 text-zinc-300" />}
                            </div>
                            <div>
                              <p className="font-bold text-black text-sm truncate">{p.name}</p>
                              <p className="text-[11px] font-medium text-zinc-400">{p.category}</p>
                            </div>
                          </td>
                          <td className="p-4"><span className="bg-zinc-100 px-2.5 py-1 rounded-md text-xs font-black text-zinc-700">{p.size}</span></td>
                          <td className="p-4">
                            <p className="font-bold text-black">{formatCurrency(p.price)}</p>
                            <p className="text-[11px] text-zinc-400">Custo: {formatCurrency(p.cost)}</p>
                          </td>
                          <td className="p-4"><span className={`font-black ${p.stock <= 3 ? 'text-red-600' : 'text-emerald-600'}`}>{p.stock} un.</span></td>
                          <td className="p-4 text-center">
                            <button onClick={() => toggleVitrine(p)} className="text-zinc-400 hover:text-pink-600 transition-colors btn-press">
                              {p.isVitrine ? <ToggleRight size={28} className="text-pink-600" /> : <ToggleLeft size={28} />}
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => handleDeleteProduct(p.id, p.name)} className="text-zinc-300 hover:text-red-600 transition-colors btn-press"><Trash2 size={18}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'looks' && (
            <div className="animate-fade-in-up space-y-8">
              <div>
                <h2 className="text-3xl font-black text-black flex items-center gap-3"><Layers className="text-pink-600" size={32} /> Montador de Looks & Combos</h2>
                <p className="text-zinc-500 font-medium">Combine peças que casam entre si, aplique um desconto automático e aumente o Ticket Médio.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 h-fit">
                  <h3 className="text-lg font-black text-black mb-4">Criar Novo Look</h3>
                  <form onSubmit={handleCreateLook} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nome do Look / Kit</label>
                      <input required type="text" placeholder="Ex: Combo Noite Streetwear" value={newLook.name} onChange={e => setNewLook({ ...newLook, name: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Desconto do Combo (%)</label>
                      <input required type="number" min="1" max="50" value={newLook.discountPercent} onChange={e => setNewLook({ ...newLook, discountPercent: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Selecione as Peças ({newLook.selectedProductIds.length})</label>
                      <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1.5 border border-zinc-200 rounded-2xl p-2.5 bg-zinc-50">
                        {products.map(p => {
                          const checked = newLook.selectedProductIds.includes(p.id);
                          return (
                            <label key={p.id} className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs font-bold transition-colors ${checked ? 'bg-pink-600 text-white' : 'bg-white text-zinc-700 hover:bg-zinc-100'}`}>
                              <div className="flex items-center gap-2 truncate">
                                <input type="checkbox" checked={checked} onChange={() => setNewLook(prev => ({ ...prev, selectedProductIds: checked ? prev.selectedProductIds.filter(id => id !== p.id) : [...prev.selectedProductIds, p.id] }))} className="hidden" />
                                <span className="truncate">{p.name} ({p.size})</span>
                              </div>
                              <span className="ml-2 font-black">{formatCurrency(p.price)}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-xl shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2 btn-press"><Plus size={18} /> Salvar Look Promocional</button>
                  </form>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
                  {looks.map(look => (
                    <div key={look.id} className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 flex flex-col justify-between hover-lift">
                      <div>
                        <span className="bg-pink-50 text-pink-600 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg mb-3 inline-block">Combo -{look.discountPercent}% OFF</span>
                        <h4 className="text-xl font-black text-black mb-3">{look.name}</h4>
                        <div className="space-y-1.5 bg-zinc-50 p-3 rounded-2xl border border-zinc-100 mb-6">
                          {look.itemNames.map((item, i) => (<p key={i} className="text-xs font-bold text-zinc-700 flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> {item}</p>))}
                        </div>
                      </div>
                      <button onClick={() => handleApplyLookToPOS(look)} className="w-full py-3.5 bg-black hover:bg-pink-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 btn-press shadow-md"><ShoppingBag size={16} /> Lançar no PDV</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sales_history' && (
            <div className="animate-fade-in-up space-y-8">
              <div>
                <h2 className="text-3xl font-black text-black">Histórico de Vendas & Trocas</h2>
                <p className="text-zinc-500 font-medium">Gere Vales-Troca instantâneos, reenvie recibos ou estorne vendas com segurança.</p>
              </div>
              {vouchers.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2"><Receipt size={16} className="text-pink-600" /> Vales-Troca Emitidos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vouchers.map(v => (
                      <div key={v.id} className={`p-4 rounded-2xl border flex justify-between items-center ${v.used ? 'bg-zinc-50 border-zinc-200 opacity-60' : 'bg-pink-50/50 border-pink-200 hover-lift'}`}>
                        <div>
                          <span className="text-xs font-black bg-pink-600 text-white px-2.5 py-1 rounded-lg tracking-wider">{v.code}</span>
                          <p className="text-sm font-bold text-black mt-2">{v.customerName}</p>
                          <p className="text-xs text-zinc-500">Peça: {v.itemName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-pink-600">{formatCurrency(v.amount)}</p>
                          <span className={`text-[10px] font-black uppercase ${v.used ? 'text-zinc-400' : 'text-emerald-600'}`}>{v.used ? 'Utilizado' : 'Disponível'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {sales.length === 0 ? (<div className="bg-white rounded-3xl p-12 text-center border border-zinc-200 text-zinc-400 font-medium">Nenhuma venda realizada.</div>) : (
                  sales.map(sale => (
                    <div key={sale.id} className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 flex flex-col lg:flex-row justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-3 py-1 bg-black text-white rounded-xl text-xs font-black uppercase">{sale.paymentMethod}</span>
                          <h4 className="font-black text-lg text-black">{sale.customerName}</h4>
                          <span className="text-xs font-bold text-zinc-400">{new Date(sale.timestamp).toLocaleString('pt-BR')}</span>
                          {sale.voucherCode && (<span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg">Usou Vale: {sale.voucherCode}</span>)}
                        </div>
                        <div className="divide-y divide-zinc-100 bg-zinc-50 rounded-2xl p-3 border border-zinc-100">
                          {sale.items.map((item, idx) => (
                            <div key={idx} className="py-2 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                              <div>
                                <span className={`text-sm font-bold ${item.exchanged ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>{item.quantity}x {item.name} ({item.size})</span>
                                <span className="text-xs font-bold text-pink-600 ml-2">{formatCurrency(item.price)}</span>
                              </div>
                              {item.exchanged ? (<span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">Trocada</span>) : (
                                <button onClick={() => handleGenerateVoucherFromSale(sale, idx)} className="text-xs font-bold text-pink-600 hover:bg-pink-50 px-3 py-1.5 rounded-xl border border-pink-200 btn-press flex items-center gap-1.5"><ArrowLeftRight size={14} /> Gerar Vale-Troca</button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-row lg:flex-col justify-between items-end border-t lg:border-t-0 lg:border-l border-zinc-100 pt-4 lg:pt-0 lg:pl-6 min-w-[180px]">
                        <div className="text-left lg:text-right">
                          <p className="text-xs font-bold text-zinc-400 uppercase">Total Pago</p><p className="text-2xl font-black text-black">{formatCurrency(sale.total)}</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                          {sale.customerPhone && (<a href={getWhatsAppLink(sale)} target="_blank" rel="noreferrer" className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl font-bold text-xs flex items-center gap-1 btn-press" title="Reenviar Recibo no WhatsApp"><MessageCircle size={16} /> Recibo</a>)}
                          <button onClick={() => handleRefundSale(sale)} className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-xs flex items-center gap-1 btn-press" title="Estornar Venda (Requer PIN)"><Undo2 size={16} /> Estornar</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'condicional' && (
            <div className="animate-fade-in-up space-y-8">
              <div>
                <h2 className="text-3xl font-black text-black">Malinhas em Condicional</h2>
                <p className="text-zinc-500 font-medium">Acompanhe peças enviadas para clientes provarem em casa (Prazo padrão: 48h).</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {condicionais.length === 0 ? (<div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-zinc-200 text-zinc-400 font-medium">Nenhuma malinha condicional enviada.</div>) : (
                  condicionais.map(cond => {
                    const isOverdue = cond.status === 'PENDENTE' && Date.now() > cond.deadline;
                    return (
                      <div key={cond.id} className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 flex flex-col justify-between hover-lift">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${cond.status === 'PENDENTE' ? (isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700') : cond.status === 'CONVERTIDO' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
                                {cond.status === 'PENDENTE' ? (isOverdue ? 'Prazo Vencido' : 'Com a Cliente') : cond.status}
                              </span>
                              <h3 className="text-xl font-black text-black mt-2">{cond.customerName}</h3>
                              <p className="text-xs font-bold text-zinc-400">{cond.customerPhone}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-zinc-400 uppercase">Valor Reservado</p>
                              <p className="text-xl font-black text-pink-600">{formatCurrency(cond.totalValue)}</p>
                              <p className="text-[11px] text-zinc-400 mt-1">Até {new Date(cond.deadline).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="bg-zinc-50 rounded-2xl p-3 space-y-2 border border-zinc-100 mb-6">
                            {cond.items.map((item, i) => (<div key={i} className="flex justify-between text-xs font-bold text-zinc-700"><span>{item.quantity}x {item.name} ({item.size})</span><span>{formatCurrency(item.price * item.quantity)}</span></div>))}
                          </div>
                        </div>
                        {cond.status === 'PENDENTE' && (
                          <div className="flex flex-col gap-2">
                            <a href={getCondicionalWhatsAppLink(cond)} target="_blank" rel="noreferrer" className="w-full py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all btn-press">
                              <MessageCircle size={16} /> Enviar Mensagem via WhatsApp
                            </a>
                            <div className="flex gap-2">
                              <button onClick={() => handleReturnCondicional(cond)} className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 btn-press"><Undo2 size={16} /> Devolver ao Estoque</button>
                              <button onClick={() => handleConvertCondicionalToSale(cond)} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 btn-press"><ShoppingBag size={16} /> Cobrar no PDV</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'commissions' && (
            <div className="animate-fade-in-up space-y-8">
              <div><h2 className="text-3xl font-black text-black flex items-center gap-3"><Trophy className="text-amber-500" size={32} /> Ranking de Vendedoras & Comissões</h2></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 h-fit">
                  <h3 className="text-lg font-black text-black mb-4 flex items-center gap-2"><Users size={18} className="text-pink-600" /> Cadastrar Vendedora</h3>
                  <form onSubmit={handleAddSeller} className="space-y-4">
                    <div><label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nome</label><input required type="text" placeholder="Ex: Juliana" value={newSeller.name} onChange={e => setNewSeller({ ...newSeller, name: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold" /></div>
                    <div><label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Comissão (%)</label><input required type="number" step="0.5" value={newSeller.rate} onChange={e => setNewSeller({ ...newSeller, rate: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold" /></div>
                    <button type="submit" className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-xl shadow-lg btn-press flex items-center justify-center gap-2"><Plus size={18} /> Adicionar à Equipe</button>
                  </form>
                </div>
                <div className="lg:col-span-2 space-y-4">
                  {sellerStats.map((st, index) => (
                    <div key={st.id} className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 flex flex-col sm:flex-row justify-between gap-4 hover-lift">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-zinc-200 text-zinc-700' : 'bg-orange-50 text-orange-600'}`}>#{index + 1}</div>
                        <div>
                          <div className="flex items-center gap-2"><h4 className="font-black text-lg text-black">{st.name}</h4><span className="text-[10px] font-black uppercase bg-pink-50 text-pink-600 px-2 py-0.5 rounded-md">{st.rate}% Comissão</span></div>
                          <div className="flex flex-wrap gap-4 mt-1 text-xs font-bold text-zinc-400"><span>{st.salesCount} vendas</span><span>•</span><span>{st.totalItems} peças</span><span>•</span><span className="text-pink-600">P.A.: {st.pa} peças/venda</span></div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col justify-between w-full sm:w-auto sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100">
                        <div><p className="text-[10px] font-bold uppercase text-zinc-400">Total Vendido</p><p className="text-lg font-black text-black">{formatCurrency(st.totalRevenue)}</p></div>
                        <div className="sm:mt-1"><p className="text-[10px] font-bold uppercase text-emerald-600">Comissão a Pagar</p><p className="text-xl font-black text-emerald-600">{formatCurrency(st.totalCommission)}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="max-w-4xl mx-auto animate-fade-in-up space-y-8">
              <div className="flex items-center gap-4 border-b border-zinc-200 pb-6">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center"><Lock size={24} /></div>
                <div><h2 className="text-3xl font-black text-black">Gestão de Caixa</h2><p className="text-zinc-500 font-medium">Controle de abertura, sangria e fechamento.</p></div>
              </div>
              {!register.isOpen ? (
                <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm text-center">
                  <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6"><Lock size={32} className="text-zinc-400" /></div>
                  <h3 className="text-2xl font-black text-black mb-2">Caixa Fechado</h3>
                  <form onSubmit={handleOpenRegister} className="max-w-sm mx-auto space-y-4 mt-8">
                    <input required type="number" step="0.01" placeholder="Fundo de Troco (R$)" value={openRegisterAmount} onChange={e => setOpenRegisterAmount(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-center text-xl font-bold focus:ring-2 focus:ring-emerald-500" />
                    <button type="submit" className="w-full py-4 rounded-xl font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg btn-press flex items-center justify-center gap-2"><Unlock size={20} /> Abrir Caixa</button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                    <ShieldCheck size={120} className="absolute right-[-20px] top-[-20px] opacity-10" />
                    <div className="relative z-10"><p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Status: Caixa Aberto</p><h3 className="text-5xl font-black mb-6">{formatCurrency(register.balance)}</h3><p className="text-sm font-medium opacity-90">Aberto às {formatTime(register.openedAt)}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <button onClick={() => setIsSangriaModalOpen(true)} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover-lift flex flex-col items-center justify-center text-amber-600"><div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4"><Banknote size={32} /></div><span className="font-black text-lg">Registrar Sangria</span></button>
                    <button onClick={handleCloseRegister} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover-lift flex flex-col items-center justify-center text-red-600"><div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4"><Lock size={32} /></div><span className="font-black text-lg">Fechar Caixa</span></button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-4 border-b border-zinc-200 pb-6 mb-8">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center"><Calculator size={24} /></div>
                <div><h2 className="text-3xl font-black text-black">Gestão de Despesas</h2><p className="text-zinc-500 font-medium">Controle seus custos fixos e variáveis para o DRE.</p></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
                    <h3 className="text-lg font-black text-black mb-4">Lançar Despesa</h3>
                    <form onSubmit={handleAddExpense} className="space-y-4">
                      <div><label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Descrição</label><input required type="text" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Valor</label><input required type="number" step="0.01" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold" /></div>
                        <div><label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Tipo</label><select value={newExpense.type} onChange={e => setNewExpense({...newExpense, type: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold"><option>Fixa</option><option>Variável</option></select></div>
                      </div>
                      <button type="submit" className="w-full py-3 mt-2 rounded-xl font-black text-white bg-black hover:bg-zinc-900 shadow-lg btn-press flex items-center justify-center gap-2"><Plus size={18}/> Adicionar</button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-2">
                   <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
                     <table className="w-full text-left border-collapse">
                       <thead className="bg-zinc-50 border-b border-zinc-200"><tr className="text-zinc-500 text-xs uppercase tracking-wider"><th className="p-4 font-bold">Data</th><th className="p-4 font-bold">Descrição</th><th className="p-4 font-bold">Tipo</th><th className="p-4 font-bold">Valor</th><th className="p-4 font-bold text-center">Ações</th></tr></thead>
                       <tbody className="divide-y divide-zinc-100">
                         {expenses.length === 0 ? (<tr><td colSpan="5" className="p-8 text-center text-zinc-400 font-medium">Nenhuma despesa registrada.</td></tr>) : (
                           expenses.map(exp => (<tr key={exp.id} className="hover:bg-zinc-50"><td className="p-4 text-sm font-medium text-zinc-500">{new Date(exp.timestamp).toLocaleDateString('pt-BR')}</td><td className="p-4 text-sm font-bold text-black">{exp.description}</td><td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${exp.type === 'Fixa' ? 'bg-zinc-100 text-zinc-600' : 'bg-rose-50 text-rose-600'}`}>{exp.type}</span></td><td className="p-4 text-sm font-black text-rose-500">{formatCurrency(exp.amount)}</td><td className="p-4 text-center"><button onClick={() => handleDeleteExpense(exp.id, exp.description)} className="text-zinc-300 hover:text-red-500 btn-press"><Trash2 size={16}/></button></td></tr>))
                         )}
                       </tbody>
                     </table>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="max-w-4xl mx-auto animate-fade-in-up">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-6 mb-8">
                <div><h2 className="text-3xl font-black text-black">Auditoria do Sistema</h2><p className="text-zinc-500 font-medium">Timeline de eventos críticos de segurança.</p></div>
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center"><History size={24} /></div>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-8">
                {auditLogs.length === 0 ? (<p className="text-center text-zinc-400 py-10 font-medium">Nenhum registro encontrado.</p>) : (
                  <div className="relative border-l-2 border-zinc-100 ml-4 space-y-8">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="relative pl-8">
                        <div className={`absolute -left-[13px] top-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${log.severity === 'warning' ? 'bg-amber-500' : log.severity === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        <div><div className="flex items-center gap-3 mb-1"><span className="text-xs font-bold text-zinc-400 flex items-center gap-1"><Clock size={12}/> {new Date(log.timestamp).toLocaleString()}</span><span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${log.severity === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-zinc-100 text-zinc-600'}`}>{log.action}</span></div><p className="text-sm font-bold text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-100 inline-block mt-1">{log.details}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'vitrine' && (
            <div className="animate-fade-in-up flex flex-col items-center pb-10">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-black flex items-center justify-center gap-2"><Globe className="text-pink-500"/> Vitrine Digital Interativa</h2>
                <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-zinc-200 shadow-sm"><MessageCircle size={16} className="text-emerald-500" /><span className="text-xs font-bold text-zinc-500">WhatsApp da Loja:</span><input type="text" value={storeWhatsapp} onChange={e => setStoreWhatsapp(e.target.value)} className="text-xs font-black text-black bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200 w-32" /></div>
              </div>
              <div className="w-full max-w-[370px] h-[740px] bg-white rounded-[3rem] border-[10px] border-black shadow-2xl relative overflow-hidden flex flex-col hover-lift">
                <div className="absolute top-0 inset-x-0 h-6 bg-black rounded-b-3xl w-40 mx-auto z-50"></div>
                <div className="pt-10 pb-4 px-6 bg-black text-white text-center"><div className="w-14 h-14 bg-pink-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-2 shadow-lg"><Store size={26} /></div><h3 className="font-black text-lg">MF Store</h3></div>
                <div className="flex-1 overflow-y-auto p-3.5 bg-[#F8FAFC] custom-scrollbar">
                  <div className="grid grid-cols-2 gap-3">
                    {vitrineProducts.map(p => {
                      const inBag = vitrineCart.find(i => i.id === p.id);
                      return (
                        <div key={p.id} onClick={() => addToVitrineCart(p)} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 flex flex-col cursor-pointer hover:border-pink-400 transition-all relative group btn-press">
                          <div className="h-32 bg-zinc-100 relative">{p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <Tag className="w-full h-full p-6 text-zinc-300 mx-auto" />}<span className="absolute top-2 left-2 bg-black/80 text-white text-[10px] font-black px-2 py-0.5 rounded-md">{p.size}</span>{inBag && (<span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">{inBag.quantity}x</span>)}</div>
                          <div className="p-2.5 flex-1 flex flex-col"><p className="text-xs font-bold text-zinc-900 line-clamp-1 mb-1">{p.name}</p><div className="mt-auto flex items-center justify-between"><span className="text-xs font-black text-pink-600">{formatCurrency(p.price)}</span><span className="text-[10px] font-bold bg-pink-50 text-pink-600 px-2 py-0.5 rounded-lg group-hover:bg-pink-600 group-hover:text-white transition-colors">+ Sacola</span></div></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="p-4 bg-white border-t border-zinc-200 space-y-2.5">
                  {vitrineCart.length > 0 && (<div className="space-y-2 animate-fade-in"><div className="flex justify-between items-center text-xs"><span className="font-bold text-zinc-600">{vitrineCart.reduce((a, i) => a + i.quantity, 0)} peças</span><div className="flex items-center gap-2"><span className="font-black text-black">{formatCurrency(vitrineTotal)}</span><button onClick={() => setVitrineCart([])} className="text-[10px] text-red-500 font-bold">Limpar</button></div></div><input type="text" placeholder="Seu nome..." value={vitrineCustomerName} onChange={e => setVitrineCustomerName(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold" /></div>)}
                  <div className="flex gap-2">
                    <a href={vitrineCart.length > 0 ? getVitrineOrderWhatsAppLink() : '#'} target={vitrineCart.length > 0 ? "_blank" : undefined} rel="noreferrer" onClick={e => { if (vitrineCart.length === 0) { e.preventDefault(); showToast('Adicione peças!', 'error'); } }} className={`flex-1 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md btn-press ${vitrineCart.length > 0 ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-400'}`}><MessageCircle size={15} /> Pedir no WhatsApp</a>
                    {vitrineCart.length > 0 && (<button onClick={sendVitrineOrderToPOS} className="px-3 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-black btn-press flex items-center gap-1"><ShoppingBag size={14} /> PDV</button>)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl animate-modal border border-zinc-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 rounded-t-[2rem]">
              <h3 className="text-2xl font-black text-black">Cadastro de Peça</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-zinc-200 rounded-full btn-press"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6">
              <div className="mb-6 flex flex-col items-center">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                <div onClick={() => fileInputRef.current.click()} className={`w-32 h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group btn-press ${newProduct.image ? 'border-pink-500' : 'border-zinc-300 hover:border-pink-400'}`}>
                  {newProduct.image ? <img src={newProduct.image} className="w-full h-full object-cover" /> : <div className="text-zinc-400 group-hover:text-pink-500 flex flex-col items-center"><ImagePlus size={24} /><span className="text-[10px] font-bold mt-2">Add Foto</span></div>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nome</label><input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold" /></div>
                <div>
                  <div className="flex justify-between items-center mb-1"><label className="block text-xs font-bold text-zinc-500 uppercase">Tamanho</label><button type="button" onClick={() => setIsGridMode(!isGridMode)} className="text-[10px] font-black px-2 py-0.5 rounded-md bg-pink-100 text-pink-700 btn-press">{isGridMode ? 'Grade Ativa' : 'Ativar Grade'}</button></div>
                  {!isGridMode ? (<select value={newProduct.size} onChange={e => setNewProduct({...newProduct, size: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold"><option>U</option><option>PP</option><option>P</option><option>M</option><option>G</option><option>GG</option></select>) : (
                    <div className="grid grid-cols-5 gap-1.5 bg-pink-50/60 p-2 rounded-xl border border-pink-200">{Object.keys(gridStocks).map(sz => (<div key={sz} className="text-center"><span className="text-[10px] font-black text-pink-700 block mb-0.5">{sz}</span><input type="number" min="0" value={gridStocks[sz]} onChange={e => setGridStocks({ ...gridStocks, [sz]: e.target.value })} className="w-full bg-white border border-pink-200 rounded-lg py-1 text-center text-xs font-black text-black" /></div>))}</div>
                  )}
                </div>
                <div><label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Custo (R$)</label><input required type="number" step="0.01" value={newProduct.cost} onChange={e => setNewProduct({...newProduct, cost: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold" /></div>
                <div>
                  <div className="flex justify-between items-center mb-1"><label className="block text-xs font-bold text-zinc-500 uppercase">Venda (R$)</label>
                    {parseFloat(newProduct.cost) > 0 && (<div className="flex gap-1">{[{ label: '+100%', m: 2 }, { label: '+150%', m: 2.5 }, { label: '+200%', m: 3 }].map(m => (<button key={m.label} type="button" onClick={() => setNewProduct({ ...newProduct, price: (parseFloat(newProduct.cost) * m.m).toFixed(2) })} className="text-[10px] font-black bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded btn-press">{m.label}</button>))}</div>)}
                  </div>
                  <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold" />
                </div>
                {!isGridMode && (<div><label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Estoque</label><input required type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold" /></div>)}
                <div className="flex items-center gap-3 pt-6"><input type="checkbox" id="vitrine" checked={newProduct.isVitrine} onChange={e => setNewProduct({...newProduct, isVitrine: e.target.checked})} className="w-5 h-5 rounded text-pink-600" /><label htmlFor="vitrine" className="text-sm font-bold text-zinc-700 cursor-pointer">Mostrar na Vitrine Digital</label></div>
              </div>
              <button type="submit" disabled={isProcessingImage} className="w-full py-4 mt-4 rounded-xl font-black text-white bg-pink-600 hover:bg-pink-700 shadow-lg btn-press">Salvar Produto</button>
            </form>
          </div>
        </div>
      )}

      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-modal border border-zinc-200 overflow-hidden">
            <div className="p-8 text-center bg-black"><p className="text-emerald-400 font-bold mb-2 uppercase text-xs">Total</p><h3 className="text-5xl font-black text-white tracking-tight">{formatCurrency(cartTotal)}</h3></div>
            <div className="p-6">
              {selectedPaymentMethod === 'pix' ? (
                <div className="text-center animate-fade-in">
                  <p className="text-sm font-bold text-zinc-500 mb-4 uppercase">Escaneie o QR Code</p>
                  <div className="w-48 h-48 mx-auto bg-white border-2 border-dashed border-zinc-300 rounded-2xl flex items-center justify-center mb-6"><QrCode size={100} className="text-zinc-900" /></div>
                  <button onClick={() => handleCheckoutProcess('pix')} className="w-full py-4 rounded-xl font-black text-white bg-emerald-500 shadow-lg btn-press">Confirmar PIX</button>
                </div>
              ) : selectedPaymentMethod === 'misto' ? (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs font-black text-pink-600 uppercase tracking-wider text-center">Dividir Pagamento (2 Formas)</p>
                  <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 space-y-3">
                    <div className="flex gap-2"><select value={splitPayment.method1} onChange={e => setSplitPayment({ ...splitPayment, method1: e.target.value })} className="bg-white border rounded-xl px-3 py-2 text-xs font-black uppercase"><option value="pix">PIX</option><option value="dinheiro">Dinheiro</option><option value="credito">Cartão</option></select><input type="number" step="0.01" value={splitPayment.amount1} onChange={e => setSplitPayment({ ...splitPayment, amount1: e.target.value })} className="flex-1 bg-white border rounded-xl px-3 py-2 text-sm font-black text-right" /></div>
                    <div className="flex items-center justify-between pt-2 border-t"><select value={splitPayment.method2} onChange={e => setSplitPayment({ ...splitPayment, method2: e.target.value })} className="bg-white border rounded-xl px-3 py-2 text-xs font-black uppercase"><option value="credito">Cartão</option><option value="pix">PIX</option><option value="dinheiro">Dinheiro</option></select><div className="text-right"><span className="text-[10px] font-bold text-zinc-400 block">Restante Automático</span><span className="text-base font-black text-emerald-600">{formatCurrency(Math.max(0, cartTotal - (parseFloat(splitPayment.amount1) || 0)))}</span></div></div>
                  </div>
                  <button onClick={() => handleCheckoutProcess('misto')} className="w-full py-4 rounded-xl font-black text-white bg-pink-600 shadow-lg btn-press">Concluir Pagamento Misto</button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-zinc-400 mb-3 uppercase tracking-widest">Pagamento</p>
                  {[{ id: 'pix', label: 'Pix (QR Code)', icon: <Smartphone className="text-emerald-500" /> }, { id: 'credito', label: 'Cartão de Crédito', icon: <CreditCard className="text-pink-500" /> }, { id: 'dinheiro', label: 'Dinheiro (Espécie)', icon: <Banknote className="text-amber-500" /> }, { id: 'misto', label: 'Pagamento Misto', icon: <SplitSquareVertical className="text-purple-500" /> }].map((m) => (
                    <button key={m.id} onClick={() => handleCheckoutProcess(m.id)} className="w-full flex items-center p-3.5 rounded-2xl border border-zinc-200 hover:border-pink-500 transition-all btn-press group"><div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-100 mr-4">{m.icon}</div><span className="font-bold text-base text-zinc-700">{m.label}</span></button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 bg-zinc-50"><button onClick={() => {setIsCheckoutModalOpen(false); setSelectedPaymentMethod(null)}} className="w-full py-3 rounded-xl font-bold text-zinc-500 hover:bg-zinc-200 btn-press">Cancelar</button></div>
          </div>
        </div>
      )}

      {isReceiptModalOpen && lastSaleData && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-emerald-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl animate-modal text-center p-8">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
            <h3 className="text-2xl font-black text-black mb-2">Venda Concluída!</h3><p className="text-zinc-500 font-medium mb-8">Enviar recibo digital para o cliente?</p>
            <a href={getWhatsAppLink(lastSaleData)} target="_blank" rel="noreferrer" onClick={() => setIsReceiptModalOpen(false)} className="w-full py-4 rounded-xl font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg flex items-center justify-center gap-2 mb-3 btn-press"><Send size={20} /> Enviar via WhatsApp</a>
            <button onClick={() => setIsReceiptModalOpen(false)} className="w-full py-3 rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 btn-press">Pular</button>
          </div>
        </div>
      )}

      {isLabelModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl animate-modal">
            <div className="p-6 border-b flex justify-between items-center bg-zinc-50 rounded-t-[2rem]">
              <div className="flex items-center gap-3"><Printer className="text-zinc-600"/><h3 className="text-2xl font-black">Etiquetas</h3></div>
              <button onClick={() => setIsLabelModalOpen(false)} className="p-2 hover:bg-zinc-200 rounded-full btn-press"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-zinc-200/50 custom-scrollbar">
              <div className="bg-white p-8 mx-auto shadow-sm max-w-2xl min-h-[500px]">
                <div className="grid grid-cols-3 gap-4">
                  {products.slice(0, 15).map(p => (
                    <div key={p.id} className="border-2 border-zinc-900 p-3 flex flex-col items-center justify-center text-center"><p className="text-[10px] font-black uppercase mb-1 leading-tight line-clamp-1">{p.name}</p><p className="text-[10px] font-bold text-zinc-500 mb-2">Tam: {p.size} | {formatCurrency(p.price)}</p><div className="w-full h-8 barcode-mock mb-1 opacity-80"></div><p className="text-[8px] font-mono font-bold tracking-widest">{p.id.substring(0,8).toUpperCase()}</p></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t text-right bg-white rounded-b-[2rem]">
              <button onClick={() => showToast('Impressão iniciada!')} className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-900 btn-press flex items-center gap-2 inline-flex"><Printer size={18} /> Imprimir PDF</button>
            </div>
          </div>
        </div>
      )}

      {isSangriaModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl animate-modal p-8">
            <h3 className="text-2xl font-black text-black mb-2">Registrar Sangria</h3><p className="text-zinc-500 text-sm mb-6">Retirada de dinheiro da gaveta.</p>
            <form onSubmit={handleSangria} className="space-y-4">
              <div><label className="block text-xs font-bold mb-1">Valor (R$)</label><input required type="number" step="0.01" value={sangriaAmount} onChange={e => setSangriaAmount(e.target.value)} className="w-full bg-zinc-50 border rounded-xl px-4 py-3 font-bold" /></div>
              <div><label className="block text-xs font-bold mb-1">Motivo</label><input required type="text" value={sangriaReason} onChange={e => setSangriaReason(e.target.value)} className="w-full bg-zinc-50 border rounded-xl px-4 py-3 font-bold" /></div>
              <div className="flex gap-3 pt-4"><button type="button" onClick={() => setIsSangriaModalOpen(false)} className="flex-1 py-3 font-bold bg-zinc-100 rounded-xl btn-press">Cancelar</button><button type="submit" className="flex-1 py-3 font-black text-white bg-amber-500 rounded-xl shadow-lg btn-press">Registrar</button></div>
            </form>
          </div>
        </div>
      )}

      {isPinModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl animate-modal text-center p-8 border border-zinc-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Key size={32} /></div>
            <h3 className="text-2xl font-black text-black mb-2">Acesso Restrito</h3><p className="text-zinc-500 font-medium mb-6 text-sm">Insira a senha de gerente.</p>
            <form onSubmit={handleConfirmPin}>
              <input type="password" autoFocus placeholder="****" maxLength={4} value={pinInput} onChange={e => setPinInput(e.target.value)} className="w-full text-center text-3xl tracking-[1em] font-black bg-zinc-50 border rounded-xl py-4 mb-4" />
              <div className="flex gap-3"><button type="button" onClick={() => { setIsPinModalOpen(false); setPinInput(''); setPinAction(null); }} className="flex-1 py-3 rounded-xl font-bold bg-zinc-100 btn-press">Cancelar</button><button type="submit" className="flex-1 py-3 rounded-xl font-black text-white bg-rose-600 shadow-lg btn-press">Liberar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
