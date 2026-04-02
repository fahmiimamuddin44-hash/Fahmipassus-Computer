import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, CheckCircle2, Clock, Wrench, Package, AlertCircle } from "lucide-react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";

const steps = [
  { id: 0, title: "Diterima", icon: Package },
  { id: 1, title: "Pengecekan", icon: Search },
  { id: 2, title: "Menunggu Part", icon: Clock },
  { id: 3, title: "Selesai", icon: CheckCircle2 },
];

export function ServiceStatus() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [ticket, setTicket] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({
    receiptPrefix: "SRV"
  });

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "general"));
        if (settingsDoc.exists()) {
          setSettings(prev => ({...prev, ...settingsDoc.data()}));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError("");
    setTicket(null);

    try {
      const ticketsRef = collection(db, "service_tickets");
      
      // Try searching by ticketId first
      let q = query(ticketsRef, where("ticketId", "==", searchQuery.trim().toUpperCase()));
      let querySnapshot = await getDocs(q);

      // If not found, try searching by phone
      if (querySnapshot.empty) {
        q = query(ticketsRef, where("phone", "==", searchQuery.trim()));
        querySnapshot = await getDocs(q);
      }

      if (!querySnapshot.empty) {
        // Get the first matching ticket
        const docData = querySnapshot.docs[0].data();
        setTicket({
          id: docData.ticketId,
          customer: docData.customer,
          device: docData.device,
          issue: docData.issue,
          estimatedCost: docData.estimatedCost ? `Rp ${docData.estimatedCost.toLocaleString("id-ID")}` : "Menunggu Pengecekan",
          currentStatus: docData.status,
          updates: docData.updates || [],
          finalCost: docData.finalCost,
          finalDetails: docData.finalDetails
        });
      } else {
        setError("Nomor resi atau nomor HP tidak ditemukan. Silakan periksa kembali.");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "service_tickets");
      setError("Terjadi kesalahan saat mencari data. Silakan coba lagi.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Cek Status Servis</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Pantau progres perbaikan perangkat Anda secara real-time. Masukkan nomor resi (contoh: {settings.receiptPrefix}-2026-0384) atau nomor HP yang terdaftar saat booking.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border-0 bg-slate-950 py-4 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-lg"
              placeholder="Masukkan Nomor Resi / No. HP..."
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <span className="flex items-center gap-2">
                <Wrench className="h-5 w-5 animate-spin" />
                Mencari...
              </span>
            ) : (
              "Cek Status"
            )}
          </button>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}
      </div>

      {/* Results */}
      {ticket && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
        >
          {/* Header Info */}
          <div className="p-6 md:p-8 border-b border-slate-800 bg-slate-900/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-sky-400 mb-1">Nomor Resi</p>
                <h2 className="text-2xl font-bold text-white tracking-tight">{ticket.id}</h2>
              </div>
              <div className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400 border border-emerald-500/20 w-fit">
                Status: {steps[ticket.currentStatus].title}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pelanggan</p>
                <p className="font-medium text-slate-200">{ticket.customer}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Perangkat</p>
                <p className="font-medium text-slate-200">{ticket.device}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-slate-500 mb-1">Keluhan</p>
                <p className="font-medium text-slate-200">{ticket.issue}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-slate-500 mb-1">Estimasi Biaya</p>
                <p className="font-medium text-amber-400">{ticket.estimatedCost}</p>
              </div>
              {ticket.currentStatus === 3 && ticket.finalCost !== undefined && (
                <>
                  <div className="sm:col-span-2 border-t border-slate-800 pt-4 mt-2">
                    <p className="text-sm text-slate-500 mb-1">Biaya Akhir</p>
                    <p className="font-medium text-emerald-400 text-lg">Rp {ticket.finalCost.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-slate-500 mb-1">Rincian Perbaikan</p>
                    <p className="font-medium text-slate-200 whitespace-pre-wrap">{ticket.finalDetails}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 md:p-8">
            <h3 className="text-lg font-semibold text-white mb-8">Progres Perbaikan</h3>
            
            {/* Stepper (Desktop) */}
            <div className="hidden md:block mb-12 relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 rounded-full" />
              <div 
                className="absolute top-1/2 left-0 h-1 bg-sky-500 -translate-y-1/2 rounded-full transition-all duration-500"
                style={{ width: `${(ticket.currentStatus / (steps.length - 1)) * 100}%` }}
              />
              
              <div className="relative flex justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index <= ticket.currentStatus;
                  const isCurrent = index === ticket.currentStatus;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-slate-900 relative z-10 transition-colors duration-300 ${
                          isActive ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-500"
                        } ${isCurrent ? "ring-4 ring-sky-500/30" : ""}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className={`mt-3 text-sm font-medium ${isActive ? "text-slate-200" : "text-slate-500"}`}>
                        {step.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Updates List */}
            <div className="relative border-l-2 border-slate-800 ml-3 md:ml-6 space-y-8 mt-12">
              {ticket.updates.map((update, index) => (
                <div key={index} className="relative pl-8">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-sky-500 ring-4 ring-slate-900" />
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-slate-200">{update.status}</h4>
                      <time className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-md w-fit">{update.date}</time>
                    </div>
                    <p className="text-sm text-slate-400">{update.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
