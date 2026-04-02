import React, { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { collection, getDocs, doc, updateDoc, arrayUnion, addDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { Wrench, CheckCircle2, Clock, Search, Edit2, Plus, X, AlertCircle, Trash2, Printer } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const steps = [
  { id: 0, title: "Diterima" },
  { id: 1, title: "Pengecekan" },
  { id: 2, title: "Menunggu Part" },
  { id: 3, title: "Selesai" },
];

export function AdminTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [updateNote, setUpdateNote] = useState("");
  const [newStatus, setNewStatus] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [finalCost, setFinalCost] = useState("");
  const [finalDetails, setFinalDetails] = useState("");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Delete states
  const [ticketToDelete, setTicketToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Print states
  const [ticketToPrint, setTicketToPrint] = useState<any | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Settings State
  const [settings, setSettings] = useState({
    storeName: "Fahmipassus Computer",
    storeAddress: "Jl. Contoh Alamat No. 123, Kota, Provinsi",
    storePhone: "0812-3456-7890",
    receiptPrefix: "SRV",
    receiptNotes: "Garansi servis berlaku 30 hari sejak tanggal pengambilan dengan menyertakan nota ini."
  });
  
  // Add Ticket State
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer: "",
    phone: "",
    device: "",
    issue: "",
    serviceType: "Servis Umum",
    estimatedCost: "Menunggu pengecekan",
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTickets = async () => {
    try {
      // Fetch settings first
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "general"));
        if (settingsDoc.exists()) {
          setSettings(prev => ({...prev, ...settingsDoc.data()}));
        }
      } catch (settingsError) {
        console.error("Error fetching settings:", settingsError);
      }

      const snap = await getDocs(collection(db, "service_tickets"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by newest first (assuming ticketId has year or date, or we can sort by createdAt if available)
      data.sort((a, b) => new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime());
      setTickets(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "service_tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setIsUpdating(true);

    const updateData = {
      date: new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) + " WIB",
      status: steps[newStatus].title,
      note: updateNote,
    };

    const docUpdate: any = {
      status: newStatus,
      updates: arrayUnion(updateData)
    };

    if (newStatus === 3) {
      docUpdate.finalCost = Number(finalCost);
      docUpdate.finalDetails = finalDetails;
    }

    try {
      const ticketRef = doc(db, "service_tickets", selectedTicket.id);
      await updateDoc(ticketRef, docUpdate);
      
      setUpdateNote("");
      setFinalCost("");
      setFinalDetails("");
      setSelectedTicket(null);
      fetchTickets();
      showToast("Status tiket berhasil diperbarui!", "success");
    } catch (error: any) {
      console.error("Error updating ticket:", error);
      showToast(`Gagal memperbarui tiket: ${error.message || "Terjadi kesalahan"}`, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Generate Ticket ID
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const ticketId = `${settings.receiptPrefix}-${dateStr}-${randomStr}`;

    const newTicket = {
      ticketId,
      customer: formData.customer,
      phone: formData.phone,
      device: formData.device,
      issue: formData.issue,
      serviceType: formData.serviceType,
      estimatedCost: formData.estimatedCost,
      status: 0,
      date: date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      createdAt: date.toISOString(),
      updates: [
        {
          date: date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) + " WIB",
          status: "Diterima",
          note: "Barang diterima dan sedang dalam antrean pengecekan.",
        },
      ],
    };

    try {
      await addDoc(collection(db, "service_tickets"), newTicket);
      setIsAdding(false);
      setFormData({
        customer: "",
        phone: "",
        device: "",
        issue: "",
        serviceType: "Servis Umum",
        estimatedCost: "Menunggu pengecekan",
      });
      fetchTickets();
      showToast("Data servis berhasil ditambahkan!", "success");
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      showToast(`Gagal membuat tiket: ${error.message || "Terjadi kesalahan"}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "service_tickets", ticketToDelete.id));
      setTicketToDelete(null);
      fetchTickets();
      showToast("Data servis berhasil dihapus!", "success");
    } catch (error: any) {
      console.error("Error deleting ticket:", error);
      showToast(`Gagal menghapus tiket: ${error.message || "Terjadi kesalahan"}`, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrintTicket = (ticket: any) => {
    flushSync(() => {
      setTicketToPrint(ticket);
    });
    window.print();
  };

  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (ticket.ticketId?.toLowerCase() || "").includes(searchLower) ||
      (ticket.customer?.toLowerCase() || "").includes(searchLower) ||
      (ticket.phone?.toString() || "").includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || ticket.status?.toString() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="relative">
      <div className="print:hidden">
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

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-white">Manajemen Tiket Servis</h1>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari resi, nama, no HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Semua Status</option>
            {steps.map((step) => (
              <option key={step.id} value={step.id}>{step.title}</option>
            ))}
          </select>
          <button
            onClick={() => setIsAdding(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors font-medium text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Tambah Data
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Memuat data tiket...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Tidak ada tiket yang sesuai dengan pencarian.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">No. Resi</th>
                  <th className="px-6 py-4 font-medium">Pelanggan</th>
                  <th className="px-6 py-4 font-medium">Perangkat</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-sky-400">{ticket.ticketId}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{ticket.customer}</div>
                      <div className="text-xs text-slate-500">{ticket.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300 line-clamp-1">{ticket.device}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{ticket.issue}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        ticket.status === 3 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {steps[ticket.status]?.title || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePrintTicket(ticket)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Cetak Nota"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setNewStatus(ticket.status);
                            setFinalCost(ticket.finalCost ? ticket.finalCost.toString() : "");
                            setFinalDetails(ticket.finalDetails || "");
                          }}
                          className="p-2 text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                          title="Edit Status"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTicketToDelete(ticket)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Hapus Tiket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Update Status */}
      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                <h3 className="text-lg font-bold text-white">Update Status Servis</h3>
                <p className="text-sm text-sky-400 font-medium mt-1">{selectedTicket.ticketId}</p>
              </div>
              
              <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Status Baru</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
                  >
                    {steps.map((step) => (
                      <option key={step.id} value={step.id}>{step.title}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Catatan Update</label>
                  <textarea
                    required
                    rows={3}
                    value={updateNote}
                    onChange={(e) => setUpdateNote(e.target.value)}
                    placeholder="Contoh: Pengecekan selesai, IC power rusak dan perlu diganti..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 resize-none"
                  />
                </div>

                {newStatus === 3 && (
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Harga Akhir (Rp)</label>
                      <input
                        type="number"
                        required
                        value={finalCost}
                        onChange={(e) => setFinalCost(e.target.value)}
                        placeholder="Contoh: 150000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Rincian Perbaikan</label>
                      <textarea
                        required
                        rows={3}
                        value={finalDetails}
                        onChange={(e) => setFinalDetails(e.target.value)}
                        placeholder="Contoh: Ganti IC Power, Pembersihan Kipas..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 resize-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
                  >
                    {isUpdating ? "Menyimpan..." : "Simpan Update"}
                  </button>
                </div>
                {newStatus === 3 && selectedTicket && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const message = `Halo ${selectedTicket.customer},\n\nServis perangkat Anda (${selectedTicket.device}) dengan nomor resi *${selectedTicket.ticketId}* telah selesai.\n\nBiaya akhir: Rp ${Number(finalCost).toLocaleString("id-ID")}\nRincian: ${finalDetails}\n\nSilakan ambil perangkat Anda di toko kami. Terima kasih!`;
                        const encodedMessage = encodeURIComponent(message);
                        let phone = selectedTicket.phone;
                        if (phone.startsWith('0')) {
                          phone = '62' + phone.substring(1);
                        }
                        window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
                      }}
                      className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      Kirim Pesan via WhatsApp
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </>
        )}

        {/* Modal Tambah Tiket */}
        {isAdding && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white">Tambah Data Servis (Barang Masuk)</h3>
                  <p className="text-sm text-slate-400 mt-1">Buat tiket servis baru untuk pelanggan.</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="add-ticket-form" onSubmit={handleAddTicket} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Nama Pelanggan</label>
                      <input
                        type="text"
                        required
                        value={formData.customer}
                        onChange={(e) => setFormData({...formData, customer: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
                        placeholder="Nama Lengkap"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">No. HP / WhatsApp</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
                        placeholder="081234567890"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Nama Perangkat</label>
                      <input
                        type="text"
                        required
                        value={formData.device}
                        onChange={(e) => setFormData({...formData, device: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
                        placeholder="Contoh: Laptop ASUS ROG Strix"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Jenis Layanan</label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="Servis Umum">Servis Umum</option>
                        <option value="Pembersihan">Pembersihan</option>
                        <option value="Ganti Part">Ganti Part</option>
                        <option value="Instalasi OS">Instalasi OS</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Keluhan / Kerusakan</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.issue}
                      onChange={(e) => setFormData({...formData, issue: e.target.value})}
                      placeholder="Jelaskan secara detail keluhan atau kerusakan perangkat..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Estimasi Biaya (Opsional)</label>
                    <input
                      type="text"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500"
                      placeholder="Contoh: Rp 150.000 atau Menunggu pengecekan"
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="add-ticket-form"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Data Servis"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>

      {/* Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {ticketToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Hapus Tiket</h3>
              </div>
              <p className="text-slate-400 mb-6">
                Apakah Anda yakin ingin menghapus tiket <span className="text-white font-medium">{ticketToDelete.ticketId}</span>? Data yang dihapus tidak dapat dikembalikan.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setTicketToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteTicket}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Layout (Hidden on screen, visible on print) */}
      <div className="hidden print:block absolute top-0 left-0 w-full h-auto min-h-screen z-[100] bg-white text-black p-4 print-content" ref={printRef}>
        {ticketToPrint && (
          <div className="w-full mx-auto">
            <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
              <div>
                <h1 className="text-xl font-bold text-black">{settings.storeName.toUpperCase()}</h1>
                <p className="text-[11pt]">{settings.storeAddress}</p>
                <p className="text-[11pt]">Telp/WA: {settings.storePhone}</p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold text-black">NOTA SERVIS</h2>
                <p className="text-[11pt] font-medium">No. Resi: {ticketToPrint.ticketId}</p>
                <p className="text-[11pt]">Tanggal: {ticketToPrint.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <h3 className="font-bold text-[11pt] mb-1 border-b border-gray-300">Data Pelanggan</h3>
                <table className="w-full text-[11pt]">
                  <tbody>
                    <tr>
                      <td className="py-0.5 text-gray-700 w-20">Nama</td>
                      <td className="py-0.5 font-medium">: {ticketToPrint.customer}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 text-gray-700">No. HP</td>
                      <td className="py-0.5 font-medium">: {ticketToPrint.phone}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="font-bold text-[11pt] mb-1 border-b border-gray-300">Data Perangkat</h3>
                <table className="w-full text-[11pt]">
                  <tbody>
                    <tr>
                      <td className="py-0.5 text-gray-700 w-20">Perangkat</td>
                      <td className="py-0.5 font-medium">: {ticketToPrint.device}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 text-gray-700">Layanan</td>
                      <td className="py-0.5 font-medium">: {ticketToPrint.serviceType}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-2">
              <h3 className="font-bold text-[11pt] mb-1 border-b border-gray-300">Detail Perbaikan</h3>
              <div className="bg-gray-50 p-2 rounded border border-gray-200 text-[11pt]">
                <p><span className="font-medium">Keluhan:</span> {ticketToPrint.issue} {ticketToPrint.status === 3 && ticketToPrint.finalDetails && `| Rincian: ${ticketToPrint.finalDetails}`}</p>
              </div>
            </div>

            <div className="flex justify-end mb-2">
              <div className="w-64">
                <table className="w-full text-[11pt]">
                  <tbody>
                    <tr>
                      <td className="py-1 font-bold">Total Biaya</td>
                      <td className="py-1 font-bold text-right">
                        {ticketToPrint.status === 3 && ticketToPrint.finalCost 
                          ? `Rp ${ticketToPrint.finalCost.toLocaleString('id-ID')}` 
                          : ticketToPrint.estimatedCost}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between mt-2 pt-2 text-center text-[11pt]">
              <div>
                <p className="mb-8">Hormat Kami,</p>
                <p className="font-bold border-t border-black pt-1 inline-block px-4">{settings.storeName}</p>
              </div>
              <div>
                <p className="mb-8">Pelanggan,</p>
                <p className="font-bold border-t border-black pt-1 inline-block px-4">{ticketToPrint.customer}</p>
              </div>
            </div>
            
            <div className="mt-2 text-[9pt] text-gray-600 text-center border-t border-gray-200 pt-2">
              <p>Terima kasih telah mempercayakan perbaikan perangkat Anda kepada kami.</p>
              <p>{settings.receiptNotes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
