import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { Image as ImageIcon, Plus, Trash2, Loader2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GalleryImage {
  id: string;
  title?: string;
  imageUrl: string;
  createdAt: any;
}

export function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImage, setNewImage] = useState({ title: "", imageUrl: "" });

  const fetchImages = async () => {
    try {
      const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
      setImages(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "gallery");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage.imageUrl) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "gallery"), {
        ...newImage,
        createdAt: serverTimestamp(),
      });
      setNewImage({ title: "", imageUrl: "" });
      fetchImages();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "gallery");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus gambar ini dari galeri?")) return;

    try {
      await deleteDoc(doc(db, "gallery", id));
      setImages(images.filter(img => img.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "gallery");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Manajemen Galeri</h1>
          <p className="text-slate-400 text-sm">Kelola foto-foto toko dan aktivitas untuk ditampilkan di dashboard.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Add Image */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-500" />
              Tambah Gambar Baru
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">URL Gambar</label>
                <input
                  type="url"
                  required
                  value={newImage.imageUrl}
                  onChange={(e) => setNewImage({ ...newImage, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                />
                <p className="text-[10px] text-slate-500 mt-1">Gunakan URL gambar dari Unsplash atau hosting gambar lainnya.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Judul / Keterangan (Opsional)</label>
                <input
                  type="text"
                  value={newImage.title}
                  onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                  placeholder="Contoh: Suasana Toko"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                />
              </div>

              {newImage.imageUrl && (
                <div className="mt-4 rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-950 flex items-center justify-center">
                  <img 
                    src={newImage.imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=URL+Gambar+Tidak+Valid")}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !newImage.imageUrl}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                Simpan ke Galeri
              </button>
            </form>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {images.map((image) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative aspect-video bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-white font-medium text-sm truncate mb-2">{image.title || "Tanpa Judul"}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(image.id)}
                          className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                          title="Hapus Gambar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <a
                          href={image.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-all"
                          title="Lihat Gambar Asli"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl">
              <ImageIcon className="w-12 h-12 text-slate-700 mb-4" />
              <p className="text-slate-400">Belum ada gambar di galeri.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
