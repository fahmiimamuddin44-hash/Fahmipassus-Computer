import { Link, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, Cpu, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface NavbarProps {
  onOpenCart?: () => void;
}

export function Navbar({ onOpenCart }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCartStore();
  const [storeName, setStoreName] = useState("Fahmipassus Computer");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().storeName) {
          setStoreName(docSnap.data().storeName);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const links = [
    { name: "Beranda", path: "/" },
    { name: "Katalog", path: "/katalog" },
    { name: "Servis", path: "/servis" },
    { name: "Rakit PC", path: "/rakit-pc" },
    { name: "Lokasi", path: "/lokasi" },
    { name: "Cek Status", path: "/cek-status" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Cpu className="h-8 w-8 text-sky-500" />
              <span className="text-xl font-bold tracking-tight text-white">
                {storeName.split(' ')[0]} <span className="text-sky-500">{storeName.split(' ').slice(1).join(' ')}</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    location.pathname === link.path
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Search & Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-full border-0 bg-slate-800 py-1.5 pl-10 pr-4 text-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6"
                placeholder="Cari produk..."
              />
            </div>
            <button 
              onClick={onOpenCart}
              className="relative text-slate-300 hover:text-white transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-sky-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {totalItems()}
                </span>
              )}
            </button>
            <button className="text-slate-300 hover:text-white transition-colors">
              <User className="h-5 w-5" />
            </button>
            <Link to="/admin" className="text-slate-300 hover:text-sky-400 transition-colors ml-2" title="Admin Dashboard">
              <Shield className="h-5 w-5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-4">
            <button 
              onClick={onOpenCart}
              className="relative text-slate-300 hover:text-white transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-sky-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {totalItems()}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  location.pathname === link.path
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/admin"
              className="block rounded-md px-3 py-2 text-base font-medium text-sky-400 hover:bg-slate-800 hover:text-sky-300"
              onClick={() => setIsOpen(false)}
            >
              Admin Dashboard
            </Link>
            <div className="mt-4 px-3">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-md border-0 bg-slate-800 py-2 pl-10 pr-4 text-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm"
                  placeholder="Cari produk..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
