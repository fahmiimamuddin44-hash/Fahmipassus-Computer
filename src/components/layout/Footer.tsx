import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Clock, Cpu } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function Footer() {
  const [settings, setSettings] = useState({
    storeName: "Fahmipassus Computer",
    storeAddress: "Jl. Teknologi No. 123, Cyber District, Jakarta Selatan 12345",
    storePhone: "0812-9456-0135",
    storeEmail: "support@fahmipassus.com",
    storeDescription: "Solusi lengkap untuk kebutuhan teknologi Anda. Dari PC rakitan high-end hingga layanan servis profesional terpercaya.",
    openingHoursEveryday: "08:00 - 20:00 WIB",
    openingHoursThursday: "08:00 - 17:00 WIB",
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
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-300">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-8 w-8 text-sky-500" />
              <span className="text-xl font-bold tracking-tight text-white">
                {settings.storeName.split(' ')[0]} <span className="text-sky-500">{settings.storeName.split(' ').slice(1).join(' ')}</span>
              </span>
            </div>
            <p className="text-sm text-slate-400">
              {settings.storeDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Layanan Kami</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/katalog" className="hover:text-sky-400 transition-colors">Katalog Produk</a></li>
              <li><a href="/rakit-pc" className="hover:text-sky-400 transition-colors">PC Builder</a></li>
              <li><a href="/servis" className="hover:text-sky-400 transition-colors">Servis Hardware</a></li>
              <li><a href="/lokasi" className="hover:text-sky-400 transition-colors">Lokasi Toko</a></li>
              <li><a href="/cek-status" className="hover:text-sky-400 transition-colors">Cek Status Servis</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-sky-500 shrink-0" />
                <span>{settings.storeAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-sky-500 shrink-0" />
                <span>{settings.storePhone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-sky-500 shrink-0" />
                <span>{settings.storeEmail}</span>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Jam Operasional</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-sky-500 shrink-0" />
                <div>
                  <p className="font-medium text-white">Buka Setiap Hari</p>
                  <p className="text-slate-400">{settings.openingHoursEveryday}</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-slate-600 shrink-0" />
                <div>
                  <p className="font-medium text-white">Kecuali Kamis</p>
                  <p className="text-slate-400">{settings.openingHoursThursday}</p>
                </div>
              </li>
            </ul>
            <div className="mt-6">
              <a
                href={`https://wa.me/${settings.storePhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all"
              >
                Chat WhatsApp Admin
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} {settings.storeName}. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
