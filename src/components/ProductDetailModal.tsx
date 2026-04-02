import * as Dialog from "@radix-ui/react-dialog";
import { X, ShoppingCart, Star } from "lucide-react";

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
  if (!product) return null;

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
