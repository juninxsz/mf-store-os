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
  const [newLook, setNewLook] = useState({ name: '', discountPercent