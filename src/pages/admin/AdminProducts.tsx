import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { Plus, Trash2, Package, Image as ImageIcon, Edit2, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("Semua");
  
  // Custom UI states
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [productToDelete, setProductToDelete] = useState<{id: string, name: string} | null>(null);
  
  const initialFormState = {
    name: "",
    category: "Laptop",
    price: "",
    image: "",
    brand: "", // Added brand for Motherboard/Processor
    socket: "",
    memory: "",
    description: "",
    stock: "0",
  };
  
  const [formData, setFormData] = useState(initialFormState);

  const categories = ["Laptop", "PC Rakitan", "Prosesor", "Motherboard", "VGA", "RAM", "Storage", "Monitor", "PSU", "Case"];
  
  // Socket options based on brand
  const intelSockets = ["LGA 775", "LGA 1156", "LGA 1155", "LGA 1150", "LGA 1151", "LGA 1200", "LGA 1700", "LGA 1851"];
  const amdSockets = ["AM2", "AM2+", "AM3", "AM3+", "FM1", "FM2", "FM2+", "AM4", "AM5"];

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset socket when brand changes
  useEffect(() => {
    if (formData.category === "Prosesor" || formData.category === "Motherboard") {
      if (formData.brand === "Intel" && !intelSockets.includes(formData.socket)) {
        setFormData(prev => ({ ...prev, socket: "" }));
      } else if (formData.brand === "AMD" && !amdSockets.includes(formData.socket)) {
        setFormData(prev => ({ ...prev, socket: "" }));
      }
    }
  }, [formData.brand, formData.category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    const productData = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      image: formData.image || "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=500",
      brand: formData.brand || null,
      socket: formData.socket || null,
      memory: formData.memory || null,
      description: formData.description || null,
      stock: Number(formData.stock) || 0,
    };

    try {
      if (editingId) {
        // Update existing product
        await updateDoc(doc(db, "products", editingId), productData);
        showToast("Produk berhasil diperbarui!", "success");
      } else {
        // Add new product
        await addDoc(collection(db, "products"), {
          ...productData,
          rating: 5.0, // Default rating for new products
          createdAt: new Date().toISOString()
        });
        showToast("Produk berhasil ditambahkan!", "success");
      }
      
      setFormData(initialFormState);
      setEditingId(null);
      fetchProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      showToast(`Gagal menyimpan produk: ${error.message || "Terjadi kesalahan"}`, "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      image: product.image || "",
      brand: product.brand || "",
      socket: product.socket || "",
      memory: product.memory || "",
      description: product.description || "",
      stock: product.stock !== undefined ? product.stock.toString() : "0",
    });
    setEditingId(product.id);
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteDoc(doc(db, "products", productToDelete.id));
      if (editingId === productToDelete.id) {
        cancelEdit();
      }
      fetchProducts();
      showToast("Produk berhasil dihapus!", "success");
    } catch (error: any) {
      console.error("Error deleting product:", error);
      showToast(`Gagal menghapus produk: ${error.message || "Terjadi kesalahan"}`, "error");
    } finally {
      setProductToDelete(null);
    }
  };

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProducts = filterCategory === "Semua" 
    ? products 
    : products.filter(p => p.category === filterCategory);

  return (
    <div className="relative">
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center gap-3 text-red-400 mb-4">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Konfirmasi Hapus</h3>
              </div>
              <p className="text-slate-300 mb-6">
                Apakah Anda yakin ingin menghapus produk <span className="font-semibold text-white">"{productToDelete.name}"</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setProductToDelete(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  Ya, Hapus Produk
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Manajemen Produk</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Tambah/Edit Produk */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                {editingId ? (
                  <>
                    <Edit2 className="h-5 w-5 text-sky-500" />
                    Edit Produk
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 text-sky-500" />
                    Tambah Produk Baru
                  </>
                )}
              </h2>
              {editingId && (
                <button 
                  onClick={cancelEdit}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Batal Edit"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Kategori</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Harga (Rp)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Stok</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">URL Gambar</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Deskripsi Produk (Opsional)</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Detail fitur produk..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>
              
              {(formData.category === "Prosesor" || formData.category === "Motherboard") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Brand</label>
                    <select
                      value={formData.brand}
                      onChange={e => setFormData({...formData, brand: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">Pilih Brand</option>
                      <option value="Intel">Intel</option>
                      <option value="AMD">AMD</option>
                    </select>
                  </div>
                  
                  {formData.brand && (
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Socket</label>
                      <select
                        value={formData.socket}
                        onChange={e => setFormData({...formData, socket: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">Pilih Socket</option>
                        {formData.brand === "Intel" && intelSockets.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        {formData.brand === "AMD" && amdSockets.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
              
              {(formData.category === "RAM" || formData.category === "Motherboard") && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Tipe Memori (Opsional)</label>
                  <input
                    type="text"
                    value={formData.memory}
                    onChange={e => setFormData({...formData, memory: e.target.value})}
                    placeholder="DDR4, DDR5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isAdding}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isAdding ? "Menyimpan..." : (editingId ? "Update Produk" : "Simpan Produk")}
              </button>
            </form>
          </div>
        </div>

        {/* Daftar Produk */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50">
              <h3 className="text-lg font-medium text-white">Daftar Produk</h3>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-sky-500 w-full sm:w-auto"
              >
                <option value="Semua">Semua Kategori</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">Memuat data produk...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                {products.length === 0 ? "Belum ada produk." : "Tidak ada produk dalam kategori ini."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-medium">Produk</th>
                      <th className="px-6 py-4 font-medium">Kategori</th>
                      <th className="px-6 py-4 font-medium">Stok</th>
                      <th className="px-6 py-4 font-medium">Harga</th>
                      <th className="px-6 py-4 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className={`hover:bg-slate-800/50 transition-colors ${editingId === product.id ? 'bg-slate-800/30' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <ImageIcon className="w-5 h-5 m-2.5 text-slate-500" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-white">{product.name}</span>
                              {(product.brand || product.socket) && (
                                <span className="text-xs text-slate-500">
                                  {[product.brand, product.socket].filter(Boolean).join(" - ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {product.stock || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-emerald-400 font-medium">
                          {formatRupiah(product.price)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                              title="Edit Produk"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setProductToDelete({ id: product.id, name: product.name })}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Hapus Produk"
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
        </div>
      </div>
    </div>
  );
}
