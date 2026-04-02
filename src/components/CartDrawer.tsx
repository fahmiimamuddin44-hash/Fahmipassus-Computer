import React, { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { motion, AnimatePresence } from "motion/react";
import { X, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [adminPhone, setAdminPhone] = useState("6281294560135");
  const [storeName, setStoreName] = useState("FAHMIPASSUS COMPUTER");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.storePhone) {
            setAdminPhone(data.storePhone.replace(/\D/g, ''));
          }
          if (data.storeName) {
            setStoreName(data.storeName.toUpperCase());
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format message for WhatsApp
    let message = `*PESANAN BARU - ${storeName}*\n\n`;
    message += `*Data Pemesan:*\n`;
    message += `Nama: ${formData.name}\n`;
    message += `No. WhatsApp: ${formData.phone}\n`;
    message += `Alamat: ${formData.address}\n\n`;
    
    message += `*Daftar Pesanan:*\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   ${item.quantity}x @ ${formatRupiah(item.price)} = ${formatRupiah(item.price * item.quantity)}\n`;
    });
    
    message += `\n*Total Harga: ${formatRupiah(totalPrice())}*\n\n`;
    message += `Mohon segera diproses. Terima kasih.`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp
    window.open(`https://wa.me/${adminPhone}?text=${encodedMessage}`, "_blank");
    
    // Clear cart and close drawer
    clearCart();
    setIsCheckingOut(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/10 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-sky-500" />
                </div>
                <h2 className="text-lg font-bold text-white">Keranjang Belanja</h2>
                <span className="bg-slate-800 text-slate-300 text-xs font-medium px-2 py-1 rounded-full">
                  {totalItems()}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">Keranjang Kosong</h3>
                    <p className="text-slate-400 text-sm">Belum ada produk yang ditambahkan.</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors text-sm font-medium mt-4"
                  >
                    Mulai Belanja
                  </button>
                </div>
              ) : isCheckingOut ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">Informasi Pengiriman</h3>
                    <p className="text-slate-400 text-sm">Lengkapi data diri Anda untuk proses pemesanan.</p>
                  </div>

                  <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">No. WhatsApp</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
                        placeholder="081234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Alamat Lengkap</label>
                      <textarea
                        required
                        rows={3}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 resize-none"
                        placeholder="Detail alamat pengiriman..."
                      />
                    </div>
                  </form>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=200"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className="text-sm font-medium text-white line-clamp-2">{item.name}</h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mb-auto">{item.category}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-sky-400">{formatRupiah(item.price)}</span>
                          <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-800">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-slate-400 hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-medium text-white w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-slate-400 hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-slate-800 bg-slate-950 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400">Total Pembayaran</span>
                  <span className="text-xl font-bold text-white">{formatRupiah(totalPrice())}</span>
                </div>
                
                {isCheckingOut ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsCheckingOut(false)}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      form="checkout-form"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl transition-colors"
                    >
                      Kirim Pesanan
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl transition-colors"
                  >
                    Lanjut ke Pembayaran
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
