import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { Plus, Trash2, Settings, ShieldCheck, Laptop, Wrench, Cpu, HardDrive, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ICON_OPTIONS = [
  { id: "settings", name: "Settings", icon: Settings },
  { id: "shield", name: "Shield", icon: ShieldCheck },
  { id: "laptop", name: "Laptop", icon: Laptop },
  { id: "wrench", name: "Wrench", icon: Wrench },
  { id: "cpu", name: "CPU", icon: Cpu },
  { id: "harddrive", name: "Storage", icon: HardDrive },
];

const COLOR_OPTIONS = [
  { id: "blue", name: "Blue", color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "emerald", name: "Emerald", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "purple", name: "Purple", color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "amber", name: "Amber", color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "sky", name: "Sky", color: "text-sky-500", bg: "bg-sky-500/10" },
  { id: "rose", name: "Rose", color: "text-rose-500", bg: "bg-rose-500/10" },
];

export function AdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Custom UI states
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<{id: string, title: string} | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    iconId: "settings",
    colorId: "blue",
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchServices = async () => {
    try {
      const snap = await getDocs(collection(db, "services"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "services");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const selectedColor = COLOR_OPTIONS.find(c => c.id === formData.colorId) || COLOR_OPTIONS[0];
      
      await addDoc(collection(db, "services"), {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        iconId: formData.iconId,
        color: selectedColor.color,
        bg: selectedColor.bg,
        createdAt: new Date().toISOString()
      });
      setFormData({ title: "", description: "", price: "", iconId: "settings", colorId: "blue" });
      fetchServices();
      showToast("Layanan berhasil ditambahkan!", "success");
    } catch (error: any) {
      console.error("Error creating service:", error);
      showToast(`Gagal membuat layanan: ${error.message || "Terjadi kesalahan"}`, "error");
    } finally {
      setIsAdding(false);
    }
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteDoc(doc(db, "services", serviceToDelete.id));
      fetchServices();
      showToast("Layanan berhasil dihapus!", "success");
    } catch (error: any) {
      console.error("Error deleting service:", error);
      showToast(`Gagal menghapus layanan: ${error.message || "Terjadi kesalahan"}`, "error");
    } finally {
      setServiceToDelete(null);
    }
  };

  return (
    <div className="relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {serviceToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center gap-3 text-red-400 mb-4">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Konfirmasi Hapus</h3>
              </div>
              <p className="text-slate-300 mb-6">
                Apakah Anda yakin ingin menghapus layanan <span className="font-semibold text-white">"{serviceToDelete.title}"</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setServiceToDelete(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  Ya, Hapus Layanan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Manajemen Layanan Servis</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Tambah Layanan */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-sky-500" />
              Tambah Layanan
            </h2>
            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nama Layanan</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                  placeholder="Contoh: Instalasi OS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Deskripsi</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500 resize-none"
                  placeholder="Deskripsi singkat layanan..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Estimasi Biaya</label>
                <input
                  type="text"
                  required
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                  placeholder="Contoh: Mulai Rp 100.000"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Ikon</label>
                  <select
                    value={formData.iconId}
                    onChange={e => setFormData({...formData, iconId: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                  >
                    {ICON_OPTIONS.map(icon => (
                      <option key={icon.id} value={icon.id}>{icon.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Warna Tema</label>
                  <select
                    value={formData.colorId}
                    onChange={e => setFormData({...formData, colorId: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                  >
                    {COLOR_OPTIONS.map(color => (
                      <option key={color.id} value={color.id}>{color.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 mt-4"
              >
                {isAdding ? "Menyimpan..." : "Simpan Layanan"}
              </button>
            </form>
          </div>
        </div>

        {/* Daftar Layanan */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">Memuat data layanan...</div>
            ) : services.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Belum ada layanan servis.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-medium">Layanan</th>
                      <th className="px-6 py-4 font-medium">Estimasi Biaya</th>
                      <th className="px-6 py-4 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {services.map((service) => {
                      const iconOption = ICON_OPTIONS.find(i => i.id === service.iconId) || ICON_OPTIONS[0];
                      const Icon = iconOption.icon;
                      
                      return (
                        <tr key={service.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-lg ${service.bg} flex items-center justify-center shrink-0`}>
                                <Icon className={`w-5 h-5 ${service.color}`} />
                              </div>
                              <div>
                                <div className="font-medium text-white">{service.title}</div>
                                <div className="text-xs text-slate-500 mt-1 line-clamp-1">{service.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sky-400 font-medium whitespace-nowrap">
                            {service.price}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setServiceToDelete({ id: service.id, title: service.title })}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
