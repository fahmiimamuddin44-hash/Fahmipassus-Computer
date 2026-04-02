import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Wrench, 
  Laptop, 
  Settings, 
  ShieldCheck, 
  Calendar, 
  Send,
  CheckCircle2,
  Clock,
  MapPin,
  Cpu,
  HardDrive
} from "lucide-react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";

const ICON_MAP: Record<string, any> = {
  settings: Settings,
  shield: ShieldCheck,
  laptop: Laptop,
  wrench: Wrench,
  cpu: Cpu,
  harddrive: HardDrive,
};

export function Service() {
  const [services, setServices] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    device: "",
    issue: "",
    date: "",
    serviceType: "dropoff" // dropoff or pickup
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const snap = await getDocs(collection(db, "services"));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "services");
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const ticketId = `SRV-${Math.floor(100000 + Math.random() * 900000)}`;
      
      await addDoc(collection(db, "service_tickets"), {
        ticketId,
        customer: formData.name,
        phone: formData.phone,
        device: formData.device,
        issue: formData.issue,
        date: formData.date,
        serviceType: formData.serviceType,
        status: 0, // 0: Diterima
        estimatedCost: 0,
        updates: [
          {
            date: new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) + " WIB",
            status: "Diterima",
            note: "Tiket servis berhasil dibuat dan menunggu pengecekan teknisi."
          }
        ],
        createdAt: new Date().toISOString()
      });

      setGeneratedTicketId(ticketId);
      setIsSuccess(true);
      setFormData({
        name: "",
        phone: "",
        device: "",
        issue: "",
        date: "",
        serviceType: "dropoff"
      });
      
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "service_tickets");
      alert("Terjadi kesalahan saat membuat tiket servis. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Layanan Servis Profesional</h1>
        <p className="text-slate-400 text-lg">
          Percayakan perbaikan PC dan Laptop Anda kepada teknisi berpengalaman kami. Pengerjaan cepat, transparan, dan bergaransi.
        </p>
      </div>

      {/* Services Grid */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-white mb-8">Daftar Layanan & Estimasi Biaya</h2>
        {isLoadingServices ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-slate-400">Belum ada layanan yang tersedia saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = ICON_MAP[service.iconId] || Settings;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-sky-500/50 transition-colors flex flex-col"
                >
                  <div className={`w-12 h-12 rounded-xl ${service.bg} flex items-center justify-center mb-6`}>
                    <Icon className={`h-6 w-6 ${service.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 flex-1">{service.description}</p>
                  <div className="pt-4 border-t border-slate-800 mt-auto">
                    <p className="text-sky-400 font-semibold">{service.price}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Booking Servis Sekarang</h2>
            <p className="text-slate-400">
              Isi formulir di samping untuk menjadwalkan perbaikan. Tim kami akan segera menghubungi Anda untuk konfirmasi.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-sky-500/10 rounded-lg shrink-0">
                <Clock className="h-6 w-6 text-sky-500" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Proses Cepat</h4>
                <p className="text-sm text-slate-400">Pengecekan awal langsung dilakukan saat unit diterima.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg shrink-0">
                <ShieldCheck className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Garansi Servis</h4>
                <p className="text-sm text-slate-400">Garansi perbaikan hingga 30 hari untuk kerusakan yang sama.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg shrink-0">
                <MapPin className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Layanan Pickup</h4>
                <p className="text-sm text-slate-400">Tersedia layanan antar-jemput unit untuk area tertentu.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            {isSuccess && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Booking Berhasil!</h3>
                <p className="text-slate-300 mb-2">
                  Terima kasih. Tim kami akan segera menghubungi Anda melalui WhatsApp untuk konfirmasi jadwal.
                </p>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6 w-full max-w-sm">
                  <p className="text-sm text-slate-400 mb-1">Nomor Resi Servis Anda:</p>
                  <p className="text-2xl font-mono font-bold text-sky-400">{generatedTicketId}</p>
                  <p className="text-xs text-slate-500 mt-2">Simpan nomor ini untuk mengecek status servis.</p>
                </div>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-slate-300">Nama Lengkap</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    placeholder="Masukkan nama Anda"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-slate-300">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    placeholder="0812xxxxxxx"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="device" className="text-sm font-medium text-slate-300">Jenis & Merk Perangkat</label>
                <input
                  type="text"
                  id="device"
                  name="device"
                  required
                  value={formData.device}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  placeholder="Contoh: Laptop ASUS ROG Zephyrus G14"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="issue" className="text-sm font-medium text-slate-300">Keluhan / Masalah</label>
                <textarea
                  id="issue"
                  name="issue"
                  required
                  rows={4}
                  value={formData.issue}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none"
                  placeholder="Jelaskan masalah yang dialami perangkat Anda secara singkat..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="date" className="text-sm font-medium text-slate-300">Rencana Tanggal</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="serviceType" className="text-sm font-medium text-slate-300">Metode Penyerahan</label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  >
                    <option value="dropoff">Bawa ke Toko (Drop-off)</option>
                    <option value="pickup">Jemput ke Rumah (Pickup)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Wrench className="h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Kirim Permintaan Booking
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
