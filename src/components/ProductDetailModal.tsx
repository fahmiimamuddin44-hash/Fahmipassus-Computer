import * as Dialog from "@radix-ui/react-dialog";
import { X, ShoppingCart, Star, Share2, Printer, MessageCircle, Instagram, Copy, Check, FileDown, Image as ImageIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

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
  const [isExporting, setIsExporting] = useState(false);
  const brochureRef = useRef<HTMLDivElement>(null);
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
            @page { size: A4; margin: 0; }
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: white;
              margin: 0;
              padding: 0;
            }
            .a4-page {
              width: 210mm;
              height: 297mm;
              padding: 8mm;
              box-sizing: border-box;
              background: white;
              overflow: hidden;
            }
            .border-container {
              border: 6px solid #0ea5e9;
              height: 100%;
              border-radius: 30px;
              padding: 10mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              position: relative;
              overflow: hidden;
            }
            .price-box {
              background: #0ea5e9;
              color: white;
              padding: 12px 35px;
              border-radius: 18px;
              font-weight: 800;
              font-size: 38px;
              display: inline-block;
              box-shadow: 0 15px 35px rgba(14, 165, 233, 0.2);
            }
          </style>
        </head>
        <body>
          <div class="a4-page">
            <div class="border-container">
              <!-- Header -->
              <div class="flex items-center justify-between mb-6 border-b-2 border-slate-100 pb-6">
                <div class="flex items-center gap-5">
                  ${storeSettings.logoUrl ? `<img src="${storeSettings.logoUrl}" class="h-14 w-auto object-contain" />` : `<div class="w-10 h-10 bg-sky-500 rounded-xl"></div>`}
                  <div>
                    <h1 class="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">${storeSettings.storeName}</h1>
                    <p class="text-slate-500 font-bold tracking-[0.2em] text-[9px]">SALES • SERVIS • MAINTENANCE</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sky-600 font-black text-base">PROMOSI TERBATAS</p>
                  <p class="text-slate-400 text-[10px] font-bold">${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 flex flex-col items-center justify-center py-4 overflow-hidden">
                <div class="w-full h-[400px] mb-8 bg-slate-50 rounded-[25px] flex items-center justify-center p-6">
                  <img src="${product.image}" class="max-w-full max-h-full object-contain" />
                </div>

                <div class="text-center w-full px-4">
                  <span class="inline-block px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black mb-3 uppercase tracking-widest border-2 border-sky-100">
                    ${product.category}
                  </span>
                  
                  <h2 class="text-3xl font-black text-slate-900 mb-2 leading-tight tracking-tighter">
                    ${product.name}
                  </h2>
                  
                  <p class="text-[12px] text-slate-500 leading-relaxed max-w-2xl mx-auto mb-6 font-bold">
                    ${product.description || "Dapatkan kualitas terbaik hanya di toko kami. Stok terbatas!"}
                  </p>
                  
                  <div class="price-box">
                    ${formatRupiah(product.price)}
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="mt-auto flex items-center justify-between bg-slate-50 p-6 rounded-[25px] border-2 border-slate-100">
                <div class="flex gap-6 items-center">
                  <div class="p-2.5 bg-white rounded-xl shadow-sm border-2 border-slate-100" id="qrcode-container"></div>
                  <div>
                    <p class="text-slate-400 font-black text-[9px] uppercase tracking-[0.2em] mb-1">Scan untuk detail</p>
                    <p class="text-slate-900 font-black text-xs">Lihat spesifikasi lengkap</p>
                  </div>
                </div>
                
                <div class="text-right">
                  <div class="mb-3">
                    <p class="text-slate-400 font-black text-[9px] uppercase tracking-[0.2em] mb-1">Hubungi Kami</p>
                    <p class="text-xl font-black text-slate-900">${storeSettings.storePhone}</p>
                  </div>
                  <div>
                    <p class="text-slate-400 font-black text-[9px] uppercase tracking-[0.2em] mb-1">Lokasi Toko</p>
                    <p class="text-[9px] font-black text-slate-700 max-w-[220px] leading-tight ml-auto">${storeSettings.storeAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = () => {
              const qrContainer = document.getElementById('qrcode-container');
              qrContainer.innerHTML = \`<img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(productUrl)}" />\`;
              setTimeout(() => { window.print(); }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportImage = async () => {
    if (!brochureRef.current) return;
    setIsExporting(true);
    try {
      // Use a more robust approach for html-to-image
      const dataUrl = await toPng(brochureRef.current, {
        cacheBust: true,
        width: 794,
        height: 1123,
        pixelRatio: 2, // Higher quality
        style: {
          visibility: 'visible',
          position: 'static',
          left: '0',
          top: '0'
        }
      });
      
      const link = document.createElement('a');
      link.download = `Brosur-${product.name.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exporting image:', err);
      alert("Gagal menyimpan gambar. Silakan gunakan fitur 'Cetak PDF' sebagai alternatif.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[100] w-[95vw] max-w-lg max-h-[90vh] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
          {/* Fixed Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900 z-10">
            <Dialog.Title className="text-xl font-bold text-white pr-8 truncate">{product.name}</Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </Dialog.Close>
          </div>
          
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
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
                <Share2 className="h-4 w-4" />
                Bagikan
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
                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors text-sm font-medium"
              >
                <FileDown className="h-4 w-4" />
                Cetak PDF
              </button>
              <button
                onClick={handleExportImage}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <ImageIcon className="h-4 w-4" />
                {isExporting ? "Memproses..." : "Simpan Gambar"}
              </button>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="p-6 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
            <span className="text-xl font-bold text-emerald-400">{formatRupiah(product.price)}</span>
            <button
              onClick={() => onAddToCart(product)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20"
            >
              <ShoppingCart className="h-5 w-5" />
              Tambah ke Keranjang
            </button>
          </div>

          {/* Hidden Brochure for Image Export - Redesigned for consistency */}
          <div className="fixed -left-[9999px] top-0 pointer-events-none">
            <div 
              ref={brochureRef}
              style={{ width: '794px', height: '1123px' }}
              className="bg-white p-6 relative font-['Plus_Jakarta_Sans']"
            >
              <div className="border-[6px] border-sky-500 h-full p-8 rounded-[35px] relative flex flex-col box-border overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 border-b-2 border-slate-100 pb-6">
                  <div className="flex items-center gap-5">
                    {storeSettings.logoUrl ? (
                      <img src={storeSettings.logoUrl} className="h-16 w-auto object-contain" />
                    ) : (
                      <div className="w-12 h-12 bg-sky-500 rounded-xl"></div>
                    )}
                    <div>
                      <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">{storeSettings.storeName}</h1>
                      <p className="text-slate-500 font-bold tracking-[0.2em] text-[10px]">SALES • SERVIS • MAINTENANCE</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sky-600 font-black text-lg">PROMOSI TERBATAS</p>
                    <p className="text-slate-400 text-xs font-bold">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center py-2">
                  <div className="w-full h-[380px] mb-8 bg-slate-50 rounded-[30px] flex items-center justify-center p-6">
                    <img src={product.image} className="max-w-full max-h-full object-contain" />
                  </div>

                  <div className="text-center w-full px-8">
                    <span className="inline-block px-4 py-1.5 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black mb-3 uppercase tracking-widest border-2 border-sky-100">
                      {product.category}
                    </span>
                    
                    <h2 className="text-4xl font-black text-slate-900 mb-2 leading-tight tracking-tighter">
                      {product.name}
                    </h2>
                    
                    <p className="text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto mb-6 font-bold">
                      {product.description || "Dapatkan kualitas terbaik hanya di toko kami. Stok terbatas!"}
                    </p>
                    
                    <div className="bg-sky-500 text-white px-10 py-4 rounded-2xl font-black text-4xl inline-block shadow-2xl shadow-sky-200">
                      {formatRupiah(product.price)}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between bg-slate-50 p-8 rounded-[30px] border-2 border-slate-100">
                  <div className="flex gap-6 items-center">
                    <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-slate-100">
                      <QRCodeSVG value={productUrl} size={100} />
                    </div>
                    <div>
                      <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Scan untuk detail</p>
                      <p className="text-slate-900 font-black text-base">Lihat spesifikasi lengkap</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="mb-4">
                      <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Hubungi Kami</p>
                      <p className="text-3xl font-black text-slate-900">{storeSettings.storePhone}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Lokasi Toko</p>
                      <p className="text-[10px] font-black text-slate-700 max-w-[250px] leading-tight ml-auto">{storeSettings.storeAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
