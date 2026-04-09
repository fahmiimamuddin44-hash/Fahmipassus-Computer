import * as Dialog from "@radix-ui/react-dialog";
import { X, ShoppingCart, Star, Share2, Printer, MessageCircle, Instagram, Copy, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  formatRupiah: (price: number) => string;
}

export function ProductDetailModal({ product, isOpen, onClose, onAddToCart, formatRupiah }: ProductDetailModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Fahmipassus Computer",
    storeAddress: "Jl. Contoh Alamat No. 123",
    storePhone: "0812-3456-7890",
    logoUrl: ""
  });

  useEffect(() => {
    if (isOpen) {
      const fetchSettings = async () => {
        try {
          const settingsDoc = await getDoc(doc(db, "settings", "general"));
          if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            setStoreSettings({
              storeName: data.storeName || "Fahmipassus Computer",
              storeAddress: data.storeAddress || "Jl. Contoh Alamat No. 123",
              storePhone: data.storePhone || "0812-3456-7890",
              logoUrl: data.logoUrl || ""
            });
          }
        } catch (error) {
          console.error("Error fetching settings:", error);
        }
      };
      fetchSettings();
    }
  }, [isOpen]);

  if (!product) return null;

  const productUrl = `${window.location.origin}/katalog?id=${product.id}`;
  const shareText = `Cek produk menarik ini di ${storeSettings.storeName}: ${product.name} - ${formatRupiah(product.price)}\n\nLihat detailnya di: ${productUrl}`;

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Pop-up diblokir! Silakan izinkan pop-up untuk mencetak brosur.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Promosi - ${product.name}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .a4-container {
              width: 210mm;
              height: 297mm;
              padding: 15mm;
              box-sizing: border-box;
              position: relative;
              overflow: hidden;
              background: #ffffff;
            }
            .gradient-bg {
              position: absolute;
              top: 0;
              right: 0;
              width: 100%;
              height: 100%;
              background: radial-gradient(circle at top right, #f0f9ff 0%, #ffffff 50%);
              z-index: -1;
            }
            .price-tag {
              background: #0ea5e9;
              color: white;
              padding: 1rem 2.5rem;
              border-radius: 1rem;
              font-weight: 800;
              box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.4);
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="a4-container">
            <div class="gradient-bg"></div>
            
            <!-- Header -->
            <div class="flex items-center justify-between mb-12 border-b-2 border-slate-100 pb-8">
              <div class="flex items-center gap-4">
                ${storeSettings.logoUrl ? `<img src="${storeSettings.logoUrl}" class="h-16 w-auto object-contain" />` : `<div class="w-12 h-12 bg-sky-500 rounded-xl"></div>`}
                <div>
                  <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">${storeSettings.storeName}</h1>
                  <p class="text-slate-500 font-semibold tracking-wide text-sm">PREMIUM COMPUTER SOLUTIONS</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sky-600 font-bold text-lg">PROMOSI TERBATAS</p>
                <p class="text-slate-400 text-sm font-medium">${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <!-- Main Content -->
            <div class="flex flex-col items-center">
              <div class="relative w-full mb-12 group">
                <div class="absolute -inset-4 bg-sky-100 rounded-[2rem] blur-2xl opacity-30"></div>
                <img src="${product.image}" class="relative w-full h-[400px] object-contain rounded-3xl" />
              </div>

              <div class="text-center max-w-3xl">
                <span class="inline-block px-4 py-1.5 bg-sky-50 text-sky-600 rounded-full text-sm font-bold mb-4 uppercase tracking-wider border border-sky-100">
                  ${product.category}
                </span>
                <h2 class="text-6xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tighter">
                  ${product.name}
                </h2>
                
                <div class="inline-block mb-10">
                  <div class="price-tag text-5xl">
                    ${formatRupiah(product.price)}
                  </div>
                </div>

                <p class="text-2xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-16 font-medium">
                  ${product.description || "Dapatkan performa maksimal dan kualitas terbaik hanya di toko kami. Stok terbatas, segera miliki sekarang!"}
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div class="absolute bottom-12 left-12 right-12">
              <div class="flex items-end justify-between bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <div class="flex gap-8 items-center">
                  <div class="p-3 bg-white rounded-2xl shadow-sm border border-slate-100" id="qrcode-container"></div>
                  <div>
                    <p class="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Scan untuk detail</p>
                    <p class="text-slate-900 font-bold text-sm">Lihat spesifikasi lengkap & testimoni</p>
                  </div>
                </div>
                
                <div class="text-right">
                  <div class="mb-4">
                    <p class="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Hubungi Kami</p>
                    <p class="text-2xl font-extrabold text-slate-900">${storeSettings.storePhone}</p>
                  </div>
                  <div>
                    <p class="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Lokasi Toko</p>
                    <p class="text-sm font-bold text-slate-700 max-w-[250px] leading-snug">${storeSettings.storeAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = () => {
              const qrContainer = document.getElementById('qrcode-container');
              qrContainer.innerHTML = \`<img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(productUrl)}" />\`;
              setTimeout(() => {
                window.print();
              }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[100] w-[90vw] max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <Dialog.Title className="text-xl font-bold text-white">{product.name}</Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-white">
              <X className="h-6 w-6" />
            </Dialog.Close>
          </div>
          
          <img
            src={product.image || "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=500"}
            alt={product.name}
            className="w-full h-64 object-cover rounded-xl mb-4"
            referrerPolicy="no-referrer"
          />
          
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-slate-800 px-2 py-1 rounded text-xs font-medium text-slate-300">{product.category}</span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="text-sm font-medium text-slate-300">{product.rating || "0.0"}</span>
            </div>
          </div>

          <p className="text-slate-400 mb-6 text-sm leading-relaxed">{product.description || "Tidak ada deskripsi tersedia."}</p>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {isCopied ? "Tersalin" : "Salin Link"}
            </button>
            <button
              onClick={handlePrint}
              className="col-span-2 flex items-center justify-center gap-2 py-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors text-sm font-medium"
            >
              <Printer className="h-4 w-4" />
              Cetak Brosur Promosi
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <span className="text-xl font-bold text-emerald-400">{formatRupiah(product.price)}</span>
            <button
              onClick={() => onAddToCart(product)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              Tambah ke Keranjang
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
