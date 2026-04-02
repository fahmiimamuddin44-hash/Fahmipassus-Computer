import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MapPin, Navigation, Clock, Phone } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function Location() {
  const [settings, setSettings] = useState({
    storeName: "Fahmipassus Computer",
    storeAddress: "Jl. Contoh Alamat No. 123, Kota, Provinsi",
    storePhone: "0812-3456-7890",
    storeEmail: "info@fahmipassus.com",
    storeDescription: "Kunjungi toko fisik kami untuk melihat langsung produk, berkonsultasi mengenai rakit PC, atau membawa perangkat Anda yang ingin diservis.",
    mapCoordinates: "-7.182232, 108.365349",
    openingHoursEveryday: "08:00 - 20:00",
    openingHoursThursday: "08:00 - 17:00",
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
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">Lokasi Toko Kami</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {settings.storeDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info Panel */}
          <div className="md:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-sky-500/10 rounded-xl shrink-0">
                  <MapPin className="w-6 h-6 text-sky-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Alamat</h3>
                  <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                    <span className="font-semibold text-slate-300 block mb-1">{settings.storeName}</span>
                    {settings.storeAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-xl shrink-0">
                  <Clock className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Jam Buka</h3>
                  <ul className="text-slate-400 text-sm space-y-1">
                    <li className="flex justify-between gap-4"><span>Buka Setiap Hari:</span> <span className="text-right">{settings.openingHoursEveryday}</span></li>
                    <li className="flex justify-between gap-4"><span>Kecuali Kamis:</span> <span className="text-right">{settings.openingHoursThursday}</span></li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl shrink-0">
                  <Phone className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Kontak</h3>
                  <p className="text-slate-400 text-sm">
                    Telp/WA: {settings.storePhone}<br />
                    Email: {settings.storeEmail}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              href={`https://www.google.com/maps/dir/?api=1&destination=${settings.mapCoordinates?.replace(/\s/g, '') || "-7.182232,108.365349"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors font-semibold"
            >
              <Navigation className="w-5 h-5" />
              Petunjuk Arah
            </motion.a>
          </div>

          {/* Map Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[400px]"
          >
            <iframe
              title="Lokasi Toko"
              src={`https://maps.google.com/maps?q=${settings.mapCoordinates?.replace(/\s/g, '') || "-7.182232,108.365349"}&z=15&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "400px" }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            ></iframe>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
