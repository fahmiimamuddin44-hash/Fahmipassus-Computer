import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { BarChart3, TrendingUp, Calendar, DollarSign, Wrench, Package, List } from "lucide-react";
import { motion } from "motion/react";

export function AdminReports() {
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    completedServices: 0,
    activeServices: 0,
    totalProducts: 0,
    monthlyRevenue: [] as { month: string; revenue: number }[],
    serviceTypes: {} as Record<string, number>,
    recentCompleted: [] as any[],
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [ticketsSnap, productsSnap] = await Promise.all([
          getDocs(collection(db, "service_tickets")),
          getDocs(collection(db, "products"))
        ]);
        
        const tickets = ticketsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const totalProducts = productsSnap.size;

        let totalRevenue = 0;
        let completedServices = 0;
        let activeServices = 0;
        const revenueByMonth: Record<string, number> = {};
        const serviceTypesCount: Record<string, number> = {};
        const completedTickets: any[] = [];

        tickets.forEach(ticket => {
          const type = (ticket as any).serviceType || "Lainnya";
          serviceTypesCount[type] = (serviceTypesCount[type] || 0) + 1;

          if ((ticket as any).status === 3) {
            completedServices++;
            const cost = Number((ticket as any).finalCost) || 0;
            totalRevenue += cost;
            completedTickets.push(ticket);

            // Group by month
            if ((ticket as any).createdAt) {
              const date = new Date((ticket as any).createdAt);
              const monthYear = `${date.toLocaleString('id-ID', { month: 'short' })} ${date.getFullYear()}`;
              revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + cost;
            }
          } else {
            activeServices++;
          }
        });

        const monthlyRevenue = Object.entries(revenueByMonth).map(([month, revenue]) => ({
          month,
          revenue
        })).sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()); // Sort newest first

        // Sort recent completed tickets
        completedTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setReportData({
          totalRevenue,
          completedServices,
          activeServices,
          totalProducts,
          monthlyRevenue,
          serviceTypes: serviceTypesCount,
          recentCompleted: completedTickets.slice(0, 5) // Top 5 recent
        });

      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "reports");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Laporan & Statistik</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-emerald-500 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Total Pendapatan
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1 truncate">
            Rp {reportData.totalRevenue.toLocaleString('id-ID')}
          </h3>
          <p className="text-sm text-slate-400">Dari servis selesai</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-sky-500/10 rounded-xl">
              <Wrench className="w-6 h-6 text-sky-500" />
            </div>
            <span className="text-sm font-medium text-sky-500">
              Servis Selesai
            </span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">
            {reportData.completedServices}
          </h3>
          <p className="text-sm text-slate-400">Tiket berhasil diselesaikan</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <BarChart3 className="w-6 h-6 text-amber-500" />
            </div>
            <span className="text-sm font-medium text-amber-500">
              Servis Aktif
            </span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">
            {reportData.activeServices}
          </h3>
          <p className="text-sm text-slate-400">Tiket sedang diproses</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Package className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-sm font-medium text-purple-500">
              Katalog Produk
            </span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">
            {reportData.totalProducts}
          </h3>
          <p className="text-sm text-slate-400">Total produk terdaftar</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-500" />
            Pendapatan per Bulan
          </h2>
          
          {reportData.monthlyRevenue.length > 0 ? (
            <div className="space-y-4">
              {reportData.monthlyRevenue.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-medium text-slate-300">{item.month}</span>
                  <span className="font-bold text-emerald-400">Rp {item.revenue.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              Belum ada data pendapatan.
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <List className="w-5 h-5 text-sky-500" />
            Distribusi Jenis Servis
          </h2>
          
          {Object.keys(reportData.serviceTypes).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(reportData.serviceTypes).map(([type, count], index) => {
                const total = reportData.completedServices + reportData.activeServices;
                const percentage = total > 0 ? Math.round(((count as number) / total) * 100) : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{type}</span>
                      <span className="text-slate-400">{count} tiket ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2">
                      <div 
                        className="bg-sky-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              Belum ada data jenis servis.
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-sky-500" />
          Servis Selesai Terbaru
        </h2>
        
        {reportData.recentCompleted.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">No. Resi</th>
                  <th className="px-4 py-3 font-medium">Pelanggan</th>
                  <th className="px-4 py-3 font-medium">Perangkat</th>
                  <th className="px-4 py-3 font-medium text-right">Biaya Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reportData.recentCompleted.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-sky-400">{ticket.ticketId}</td>
                    <td className="px-4 py-3">{ticket.customer}</td>
                    <td className="px-4 py-3">{ticket.device}</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-medium">
                      Rp {Number(ticket.finalCost).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            Belum ada servis yang selesai.
          </div>
        )}
      </div>
    </div>
  );
}
