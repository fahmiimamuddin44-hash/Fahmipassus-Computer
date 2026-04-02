import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Monitor, Cpu, Wrench, HardDrive, ArrowRight, Star, ShoppingCart, PackageOpen } from "lucide-react";
import { collection, getDocs, query, limit, doc, getDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { useCartStore } from "@/lib/store";

const categories = [
  { name: "Laptop", icon: Monitor, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "PC Rakitan", icon: Cpu, color: "text-purple-500", bg: "bg-purple-500/10" },
  { name: "Komponen", icon: HardDrive, color: "text-amber-500", bg: "bg-amber-500/10" },
  { name: "Servis", icon: Wrench, color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

export function Home() {
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const { addItem } = useCartStore();
  const [heroSettings, setHeroSettings] = useState({
    heroTitle: "Tingkatkan Performa Tanpa Batas",
    heroSubtitle: "Temukan komponen PC terbaik, laptop gaming terbaru, atau rakit PC impianmu. Kami juga menyediakan layanan servis profesional untuk menjaga perangkatmu tetap prima.",
    heroPromo: "Diskon 15% untuk Rakitan PC Custom"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings
        const settingsDoc = await getDoc(doc(db, "settings", "general"));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setHeroSettings({
            heroTitle: data.heroTitle || "Tingkatkan Performa Tanpa Batas",
            heroSubtitle: data.heroSubtitle || "Temukan komponen PC terbaik, laptop gaming terbaru, atau rakit PC impianmu. Kami juga menyediakan layanan servis profesional untuk menjaga perangkatmu tetap prima.",
            heroPromo: data.heroPromo || "Diskon 15% untuk Rakitan PC Custom"
          });
        }

        // Fetch products
        const q = query(collection(db, "products"), limit(4));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBestSellers(data);
        } else {
          setBestSellers([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=200",
      category: product.category,
    });
    setSelectedProduct(null);
  };

  return (
    <div className="flex flex-col gap-16 pb-16">
      <ProductDetailModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        formatRupiah={formatRupiah}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 pt-6 md:pt-10 lg:pt-12 pb-8 lg:pb-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 via-slate-950/50 to-slate-950" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 blur-[100px] bg-sky-500 rounded-full pointer-events-none" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
                {heroSettings.heroTitle.split(' ').slice(0, -2).join(' ')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
                  {heroSettings.heroTitle.split(' ').slice(-2).join(' ')}
                </span>
              </h1>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                {heroSettings.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/rakit-pc"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                >
                  Mulai Rakit PC
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/servis"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  Pesan Layanan Servis
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block lg:-translate-y-6"
            >
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=800"
                  alt="High-end Gaming PC"
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 p-4 rounded-xl">
                    <p className="text-sky-400 font-medium text-sm mb-1">Promo Bulan Ini</p>
                    <p className="text-white font-bold text-lg">{heroSettings.heroPromo}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  to={`/katalog?kategori=${category.name.toLowerCase().replace(" ", "-")}`}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all group"
                >
                  <div className={`p-4 rounded-full ${category.bg} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-8 w-8 ${category.color}`} />
                  </div>
                  <h3 className="text-slate-200 font-medium">{category.name}</h3>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Produk Terlaris</h2>
            <p className="text-slate-400">Pilihan favorit pelanggan kami minggu ini.</p>
          </div>
          <Link to="/katalog" className="hidden md:flex items-center text-sky-400 hover:text-sky-300 font-medium">
            Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
          </div>
        ) : bestSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-sky-500/50 transition-colors"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-800 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                  <img
                    src={product.image || "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=500"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-slate-300">
                    {product.category}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-medium text-slate-300">{product.rating || "0.0"}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2 group-hover:text-sky-400 transition-colors">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-800/50">
                    <span className="text-lg font-bold text-emerald-400">{formatRupiah(product.price)}</span>
                    <button onClick={() => addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image || "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=200",
                      category: product.category,
                    })} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-sky-500 hover:text-white transition-colors">
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
            <PackageOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-medium text-white mb-1">Belum Ada Produk</h3>
            <p className="text-sm text-slate-400">Katalog produk saat ini masih kosong.</p>
          </div>
        )}
        
        <div className="mt-6 text-center md:hidden">
          <Link to="/katalog" className="inline-flex items-center text-sky-400 hover:text-sky-300 font-medium">
            Lihat Semua Produk <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Service CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 to-slate-900" />
          <div className="relative p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                PC atau Laptop Bermasalah?
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                Teknisi ahli kami siap membantu. Mulai dari pembersihan total, upgrade komponen, hingga perbaikan mati total. Cek status perbaikan secara real-time.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/servis"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
                >
                  Booking Servis
                </Link>
                <Link
                  to="/cek-status"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  Cek Status Perbaikan
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <Wrench className="w-48 h-48 text-emerald-500/20" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
