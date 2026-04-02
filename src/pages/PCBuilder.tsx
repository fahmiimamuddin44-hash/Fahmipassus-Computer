import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cpu, 
  CircuitBoard, 
  HardDrive, 
  Zap, 
  Box, 
  Monitor, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ShoppingCart,
  AlertCircle,
  X
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";

const initialComponentsData: Record<string, any[]> = {
  processor: [],
  motherboard: [],
  ram: [],
  vga: [],
  storage: [],
  psu: [],
  case: []
};

const categories = [
  { id: "processor", name: "Prosesor (CPU)", icon: Cpu },
  { id: "motherboard", name: "Motherboard", icon: CircuitBoard },
  { id: "ram", name: "Memory (RAM)", icon: HardDrive },
  { id: "vga", name: "Kartu Grafis (VGA)", icon: Monitor },
  { id: "storage", name: "Penyimpanan (SSD/HDD)", icon: HardDrive },
  { id: "psu", name: "Power Supply (PSU)", icon: Zap },
  { id: "case", name: "Casing PC", icon: Box },
];

export function PCBuilder() {
  const [componentsData, setComponentsData] = useState<Record<string, any[]>>(initialComponentsData);
  const [selectedParts, setSelectedParts] = useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const newComponentsData: Record<string, any[]> = {
          processor: [],
          motherboard: [],
          ram: [],
          vga: [],
          storage: [],
          psu: [],
          case: []
        };

        if (!snap.empty) {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          data.forEach(product => {
            const cat = (product as any).category.toLowerCase();
            if (cat === "prosesor") newComponentsData.processor.push(product);
            else if (cat === "motherboard") newComponentsData.motherboard.push(product);
            else if (cat === "ram") newComponentsData.ram.push(product);
            else if (cat === "vga") newComponentsData.vga.push(product);
            else if (cat === "storage") newComponentsData.storage.push(product);
            else if (cat === "psu") newComponentsData.psu.push(product);
            else if (cat === "case" || cat === "casing pc") newComponentsData.case.push(product);
          });
        }
        
        setComponentsData(newComponentsData);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "products");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalPrice = useMemo(() => {
    return Object.values(selectedParts).reduce((total, part) => total + ((part as any)?.price || 0), 0);
  }, [selectedParts]);

  const handleSelectPart = (categoryId: string, part: any) => {
    setSelectedParts((prev) => {
      const newParts = { ...prev, [categoryId]: part };
      
      // Auto-remove incompatible parts
      if (categoryId === "processor") {
        if (newParts.motherboard && newParts.motherboard.socket !== part.socket) {
          delete newParts.motherboard;
          delete newParts.ram; // RAM might be incompatible with new motherboard
        }
      } else if (categoryId === "motherboard") {
        if (newParts.processor && newParts.processor.socket !== part.socket) {
          delete newParts.processor;
        }
        if (newParts.ram && newParts.ram.memory !== part.memory) {
          delete newParts.ram;
        }
      }
      
      return newParts;
    });
    setActiveCategory(null); // Close modal
  };

  const handleRemovePart = (categoryId: string) => {
    setSelectedParts((prev) => {
      const newParts = { ...prev };
      delete newParts[categoryId];
      return newParts;
    });
  };

  // Filter parts based on compatibility with currently selected parts
  const getCompatibleParts = (categoryId: string) => {
    let parts = componentsData[categoryId as keyof typeof componentsData] || [];
    
    if (categoryId === "motherboard" && selectedParts.processor) {
      parts = parts.filter((p: any) => p.socket === selectedParts.processor.socket);
    } else if (categoryId === "processor" && selectedParts.motherboard) {
      parts = parts.filter((p: any) => p.socket === selectedParts.motherboard.socket);
    } else if (categoryId === "ram" && selectedParts.motherboard) {
      parts = parts.filter((p: any) => p.memory === selectedParts.motherboard.memory);
    }
    
    return parts;
  };

  const isBuildComplete = categories.every(cat => selectedParts[cat.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Simulasi Rakit PC</h1>
        <p className="text-slate-400">Pilih komponen yang kompatibel untuk merakit PC impian Anda. Sistem otomatis mengecek kecocokan antar komponen.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Component Selection */}
        <div className="lg:col-span-2 space-y-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const selected = selectedParts[category.id];
            
            return (
              <div 
                key={category.id} 
                className={`bg-slate-900 border rounded-2xl p-4 transition-colors ${
                  selected ? "border-emerald-500/50" : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-xl ${selected ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-800 text-slate-400"}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-slate-400 mb-1">{category.name}</h3>
                      {selected ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <p className="text-base font-semibold text-white">{selected.name}</p>
                          <p className="text-emerald-400 font-bold whitespace-nowrap">{formatRupiah(selected.price)}</p>
                        </div>
                      ) : (
                        <p className="text-base font-medium text-slate-600">Belum dipilih</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-2">
                    {selected ? (
                      <>
                        <button 
                          onClick={() => setActiveCategory(category.id)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
                        >
                          Ubah
                        </button>
                        <button 
                          onClick={() => handleRemovePart(category.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setActiveCategory(category.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors font-medium text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        Pilih
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">Ringkasan Rakitan</h2>
            
            <div className="space-y-4 mb-6">
              {categories.map((cat) => {
                const part = selectedParts[cat.id];
                if (!part) return null;
                return (
                  <div key={cat.id} className="flex justify-between text-sm">
                    <span className="text-slate-400 truncate pr-4">{part.name}</span>
                    <span className="text-slate-200 font-medium whitespace-nowrap">{formatRupiah(part.price)}</span>
                  </div>
                );
              })}
              
              {Object.keys(selectedParts).length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Belum ada komponen yang dipilih.
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 font-medium">Total Estimasi</span>
                <span className="text-2xl font-bold text-emerald-400">{formatRupiah(totalPrice)}</span>
              </div>
              <p className="text-xs text-slate-500 text-right">*Harga dapat berubah sewaktu-waktu</p>
            </div>

            {isBuildComplete ? (
              <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-400">Semua komponen lengkap dan kompatibel! PC siap dirakit.</p>
              </div>
            ) : (
              <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-400">Pilih semua komponen wajib untuk menyelesaikan rakitan.</p>
              </div>
            )}

            <button 
              disabled={Object.keys(selectedParts).length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-colors font-semibold"
            >
              <ShoppingCart className="h-5 w-5" />
              Masukkan Keranjang
            </button>
          </div>
        </div>
      </div>

      {/* Modal for selecting parts */}
      <AnimatePresence>
        {activeCategory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCategory(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <h3 className="text-lg font-bold text-white">
                  Pilih {categories.find(c => c.id === activeCategory)?.name}
                </h3>
                <button 
                  onClick={() => setActiveCategory(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto flex-1">
                <div className="space-y-3">
                  {getCompatibleParts(activeCategory).length > 0 ? (
                    getCompatibleParts(activeCategory).map((part: any) => (
                      <div 
                        key={part.id}
                        onClick={() => {
                          if (part.stock > 0) handleSelectPart(activeCategory, part);
                        }}
                        className={`flex items-center gap-4 p-3 rounded-xl border transition-all group ${part.stock > 0 ? 'border-slate-800 hover:border-sky-500 hover:bg-slate-800/50 cursor-pointer' : 'border-slate-800/50 bg-slate-900/50 opacity-50 cursor-not-allowed'}`}
                      >
                        <div className="w-16 h-16 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                          <img src={part.image} alt={part.name} className={`w-full h-full object-cover ${part.stock <= 0 ? 'grayscale' : ''}`} referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold transition-colors ${part.stock > 0 ? 'text-slate-200 group-hover:text-sky-400' : 'text-slate-400'}`}>{part.name}</h4>
                          <div className="flex gap-2 mt-1 items-center">
                            {part.socket && <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{part.socket}</span>}
                            {part.memory && <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{part.memory}</span>}
                            <span className={`text-xs px-2 py-0.5 rounded border ${part.stock > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                              Stok: {part.stock || 0}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${part.stock > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>{formatRupiah(part.price)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-3 opacity-50" />
                      <p className="text-slate-300 font-medium">Tidak ada komponen yang kompatibel.</p>
                      <p className="text-slate-500 text-sm mt-1">Silakan sesuaikan pilihan komponen sebelumnya.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
