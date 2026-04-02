import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { Settings, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function AdminSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [settings, setSettings] = useState({
    storeName: "Fahmipassus Computer",
    storeAddress: "Jl. Contoh Alamat No. 123, Kota, Provinsi",
    storePhone: "0812-3456-7890",
    storeEmail: "info@fahmipassus.com",
    storeDescription: "Toko komputer terpercaya untuk rakit PC, servis, dan aksesoris.",
    heroTitle: "Tingkatkan Performa Tanpa Batas",
    heroSubtitle: "Temukan komponen PC terbaik, laptop gaming terbaru, atau rakit PC impianmu. Kami juga menyediakan layanan servis profesional untuk menjaga perangkatmu tetap prima.",
    heroPromo: "Diskon 15% untuk Rakitan PC Custom",
    logoUrl: "",
    mapCoordinates: "-7.182232, 108.365349",
    openingHoursEveryday: "08:00 - 20:00",
    openingHoursThursday: "08:00 - 17:00",
    receiptPrefix: "SRV",
    receiptNotes: "Garansi servis berlaku 30 hari sejak tanggal pengambilan dengan menyertakan nota ini."
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setSettings(prev => ({...prev, ...docSnap.data()}));
        }
      } catch (error) {
        // It's okay if settings don't exist yet, we'll use defaults
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await setDoc(doc(db, "settings", "general"), settings);
      showToast("Pengaturan berhasil disimpan!", "success");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      showToast(`Gagal menyimpan pengaturan: ${error.message || "Terjadi kesalahan"}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
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

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-sky-500/10 rounded-xl">
          <Settings className="w-6 h-6 text-sky-500" />
        </div>
        <h1 className="text-2xl font-bold text-white">Pengaturan Sistem</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Tampilan Website</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">URL Logo Toko</label>
              <input
                type="text"
                value={settings.logoUrl || ""}
                onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Judul Hero</label>
              <input
                type="text"
                value={settings.heroTitle || ""}
                onChange={(e) => setSettings({...settings, heroTitle: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Deskripsi Hero</label>
              <textarea
                value={settings.heroSubtitle || ""}
                onChange={(e) => setSettings({...settings, heroSubtitle: e.target.value})}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Promo Hero</label>
              <input
                type="text"
                value={settings.heroPromo || ""}
                onChange={(e) => setSettings({...settings, heroPromo: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Informasi Toko</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nama Toko</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Deskripsi Singkat Toko</label>
              <textarea
                value={settings.storeDescription}
                onChange={(e) => setSettings({...settings, storeDescription: e.target.value})}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Alamat Toko</label>
              <textarea
                value={settings.storeAddress}
                onChange={(e) => setSettings({...settings, storeAddress: e.target.value})}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">No. Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={settings.storePhone}
                  onChange={(e) => setSettings({...settings, storePhone: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email Toko</label>
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => setSettings({...settings, storeEmail: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Jam Operasional</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Buka Setiap Hari</label>
              <input
                type="text"
                value={settings.openingHoursEveryday || ""}
                onChange={(e) => setSettings({...settings, openingHoursEveryday: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
                placeholder="08:00 - 20:00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Kecuali Kamis</label>
              <input
                type="text"
                value={settings.openingHoursThursday || ""}
                onChange={(e) => setSettings({...settings, openingHoursThursday: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
                placeholder="08:00 - 17:00"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Pengaturan Peta Lokasi</h2>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Koordinat Google Maps (Latitude, Longitude)</label>
            <input
              type="text"
              value={settings.mapCoordinates || ""}
              onChange={(e) => setSettings({...settings, mapCoordinates: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
              placeholder="-7.182232, 108.365349"
            />
            <div className="flex gap-2 mt-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${settings.mapCoordinates || "-7.182232,108.365349"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md transition-colors"
              >
                Pilih Lokasi di Google Maps
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-1">Gunakan format latitude dan longitude dipisahkan koma. Contoh: -7.182232, 108.365349</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Format Nota Servis</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Prefix No. Resi</label>
              <input
                type="text"
                value={settings.receiptPrefix}
                onChange={(e) => setSettings({...settings, receiptPrefix: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
                placeholder="Contoh: SRV"
              />
              <p className="text-xs text-slate-500 mt-1">Format resi: [PREFIX]-[TANGGAL]-[KODE UNIK]</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Catatan Kaki Nota</label>
              <textarea
                value={settings.receiptNotes}
                onChange={(e) => setSettings({...settings, receiptNotes: e.target.value})}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 resize-none"
                placeholder="Syarat dan ketentuan garansi..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
