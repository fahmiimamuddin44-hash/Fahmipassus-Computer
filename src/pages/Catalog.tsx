import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Search, Filter, ShoppingCart, Star, SlidersHorizontal, PackageOpen } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { useCartStore } from "@/lib/store";

const categories = ["Semua", "Laptop", "PC Rakitan", "Prosesor", "Motherboard", "VGA", "RAM", "Storage", "Monitor", "PSU", "Case"];

export function Catalog() {
  const [searchParams] = useSearchParams();
  const initialCategoryParam = searchParams.get("kategori");
  const { addItem } = useCartStore();
  
  // Map URL parameter back to category name
  const initialCategory = useMemo(() => {
    if (!initialCategoryParam) return "Semua";
    const found = categories.find(c => c.toLowerCase().replace(" ", "-") === initialCategoryParam);
    return found || "Semua";
  }, [initialCategoryParam]);

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        if (!snap.empty) {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "products");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Format ke Rupiah
  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Filter produk berdasarkan kategori dan pencarian
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = selectedCategory === "Semua" || product.category === selectedCategory;
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=200",
      category: product.category,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Katalog Produk</h1>
        <p className="text-slate-400">Temukan komponen dan perangkat terbaik untuk kebutuhan Anda.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border-0 bg-slate-900 py-2.5 pl-10 pr-4 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm"
              placeholder="Cari produk..."
            />
          </div>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center justify-center p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Filters */}
        <aside className={`lg:w-64 shrink-0 ${showMobileFilters ? "block" : "hidden lg:block"}`}>
          <div className="sticky top-24 space-y-8">
            {/* Search (Desktop) */}
            <div className="hidden lg:block relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border-0 bg-slate-900 py-2.5 pl-10 pr-4 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm"
                placeholder="Cari produk..."
              />
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-sky-500" />
                <h3 className="text-lg font-semibold text-white">Kategori</h3>
              </div>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category
                        ? "bg-sky-500/10 text-sky-400 font-medium"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-slate-400 text-sm">
              Menampilkan <span className="font-medium text-white">{filteredProducts.length}</span> produk
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-sky-500/50 transition-colors"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-800">
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
                    <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-slate-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-emerald-400">{formatRupiah(product.price)}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          Stok: {product.stock || 0}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.stock || product.stock <= 0}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-sky-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800 disabled:hover:text-slate-300"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {product.stock > 0 ? "Tambah ke Keranjang" : "Stok Habis"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
              {products.length === 0 ? (
                <>
                  <PackageOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-1">Belum Ada Produk</h3>
                  <p className="text-slate-400">Admin belum menambahkan produk ke dalam katalog.</p>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-1">Produk tidak ditemukan</h3>
                  <p className="text-slate-400">Coba gunakan kata kunci pencarian yang berbeda atau ubah kategori.</p>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("Semua");
                    }}
                    className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Reset Pencarian
                  </button>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
