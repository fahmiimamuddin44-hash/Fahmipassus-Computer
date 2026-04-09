import { useEffect, useState } from "react";
import { collection, getDocs, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { Link } from "react-router-dom";
import { Package, Wrench, Users, DollarSign, BarChart3, Settings, Activity } from "lucide-react";
import { motion } from "motion/react";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    services: 0,
    tickets: 0,
    activeTickets: 0,
    activeUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for active users (last 5 minutes)
    const fiveMinutesAgo = new Timestamp(Timestamp.now().seconds - 300, 0);
    const activeUsersQuery = query(
      collection(db, "active_sessions"),
      where("lastSeen", ">=", fiveMinutesAgo)
    );

    const unsubscribeUsers = onSnapshot(activeUsersQuery, (snapshot) => {
      setStats(prev => ({ ...prev, activeUsers: snapshot.size }));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "active_sessions");
    });

    const fetchStats = async () => {
      try {
        const productsSnap = await getDocs(collection(db, "products"));
        const servicesSnap = await getDocs(collection(db, "services"));
        const ticketsSnap = await getDocs(collection(db, "service_tickets"));
        
        const activeTickets = ticketsSnap.docs.filter(doc => doc.data().status < 3).length;

        setStats(prev => ({
          ...prev,
          products: productsSnap.size,
          services: servicesSnap.size,
          tickets: ticketsSnap.size,
          activeTickets,
        }));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "products/services/service_tickets");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    return () => unsubscribeUsers();
  }, []);

  const statCards = [
    { name: "User Online", value: stats.activeUsers, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Total Produk", value: stats.products, icon: Package, color: "text-sky-500", bg: "bg-sky-500/10" },
    { name: "Total Tiket Servis", value: stats.tickets, icon: Wrench, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Servis Aktif", value: stats.activeTickets, icon: Wrench, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-xl ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Selamat Datang di Admin Panel</h2>
          <p className="text-slate-400 mb-6">
            Gunakan menu di sebelah kiri untuk mengelola produk katalog dan tiket servis pelanggan.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/admin/tickets" className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors font-medium text-sm">
              Kelola Tiket Servis
            </Link>
            <Link to="/admin/products" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium text-sm">
              Kelola Produk
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Akses Cepat</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/reports" className="flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800 rounded-xl hover:border-sky-500/50 hover:bg-sky-500/5 transition-all group">
              <div className="p-3 bg-sky-500/10 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-sky-500" />
              </div>
              <span className="font-medium text-slate-300 group-hover:text-white">Laporan</span>
            </Link>
            <Link to="/admin/settings" className="flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800 rounded-xl hover:border-sky-500/50 hover:bg-sky-500/5 transition-all group">
              <div className="p-3 bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-slate-400 group-hover:text-white" />
              </div>
              <span className="font-medium text-slate-300 group-hover:text-white">Pengaturan</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
