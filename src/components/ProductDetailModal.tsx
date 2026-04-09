import * as Dialog from "@radix-ui/react-dialog";
import { X, ShoppingCart, Star, Share2, Printer, MessageCircle, Instagram, Copy, Check } from "lucide-react";
import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

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
  const printRef = useRef<HTMLDivElement>(null);

  if (!product) return null;

  const productUrl = `${window.location.origin}/katalog?id=${product.id}`;
  const shareText = `Cek produk menarik ini di Fahmipassus Computer: ${product.name} - ${formatRupiah(product.price)}\n\nLihat detailnya di: ${productUrl}`;

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
          <style>
            @media print {
              body { padding: 0; margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body class="p-8 bg-white text-black">
          <div class="max-w-2xl mx-auto border-4 border-black p-8 rounded-3xl">
            <div class="text-center mb-8">
              <h1 class="text-4xl font-black mb-2 uppercase tracking-tighter">Fahmipassus Computer</h1>
              <p class="text-xl font-bold text-gray-600">Solusi Kebutuhan IT Anda</p>
            </div>
            
            <div class="flex flex-col items-center gap-8">
              <img src="${product.image}" class="w-full h-80 object-contain rounded-2xl shadow-lg" />
              
              <div class="text-center w-full">
                <h2 class="text-5xl font-black mb-4 leading-tight">${product.name}</h2>
                <div class="inline-block bg-black text-white px-8 py-4 rounded-full text-4xl font-black mb-6">
                  ${formatRupiah(product.price)}
                </div>
                <p class="text-2xl text-gray-700 mb-8 max-w-lg mx-auto leading-relaxed">
                  ${product.description || "Performa terbaik untuk produktivitas Anda."}
                </p>
              </div>

              <div class="flex items-center justify-between w-full border-t-4 border-dashed border-gray-300 pt-8">
                <div class="text-left">
                  <p class="text-xl font-bold mb-2">Scan untuk Detail:</p>
                  <div id="qrcode-container"></div>
                </div>
                <div class="text-right">
                  <p class="text-xl font-bold">Hubungi Kami:</p>
                  <p class="text-3xl font-black">0812-3456-7890</p>
                  <p class="text-lg text-gray-500 mt-2">Jl. Contoh Alamat No. 123</p>
                </div>
              </div>
            </div>
          </div>
          <script>
            // We need to wait for images and then print
            window.onload = () => {
              // Copy the QR code SVG from the parent window if possible or just use the URL
              const qrContainer = document.getElementById('qrcode-container');
              qrContainer.innerHTML = \`<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(productUrl)}" />\`;
              setTimeout(() => {
                window.print();
                // window.close();
              }, 500);
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
