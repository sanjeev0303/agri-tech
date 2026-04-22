import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Calendar, 
  ArrowRight, 
  Tractor, 
  HardHat, 
  Sprout,
  Zap,
  Activity,
  ChevronRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface UserAnalytics {
  my_bookings: number;
}

interface Booking {
  id: number;
  equipment_id: number | null;
  labour_id: number | null;
  resource_name: string | null;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
}

export default function UserDashboard() {

  // Analytics
  const { data: analytics } = useQuery({
    queryKey: ['userAnalytics'],
    queryFn: async () => {
      const res = await apiClient.get<UserAnalytics>('/analytics/user');
      return res.data;
    }
  });

  // Fetch Bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['userBookings'],
    queryFn: async () => {
      const res = await apiClient.get<Booking[]>('/user/bookings');
      return res.data;
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <DashboardLayout>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-[1600px] mx-auto space-y-12 pb-20 px-6 sm:px-10"
      >
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <Sprout size={10} strokeWidth={3} />
              Field Operations Node Active
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-6xl font-heading font-black tracking-tight leading-none bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent italic uppercase">
              Farmer <span className="text-emerald-600 dark:text-emerald-400 not-italic">Command</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg font-medium max-w-xl">
              Monitor your capitalized land resources and manage high-velocity field deployments.
            </motion.p>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
          
          {/* Main Hero Summary Card */}
          <motion.div 
            variants={itemVariants}
            className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-3 bg-emerald-600 text-white rounded-[3.5rem] p-12 relative overflow-hidden group shadow-2xl shadow-emerald-500/30"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
               <Sprout size={280} />
            </div>
            
            <div className="relative z-10 flex flex-col justify-between h-full">
               <div>
                  <div className="flex justify-between items-start mb-10">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                      <TrendingUp size={24} strokeWidth={2.5} />
                    </div>
                    <div className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                      Fleet Overview
                    </div>
                  </div>
                  
                  <p className="text-[11px] font-black text-white/60 uppercase tracking-[0.4em] mb-2 font-mono italic">Operational Utilization</p>
                  <h2 className="text-7xl font-black font-heading tracking-tighter mb-4 italic">
                    {analytics?.my_bookings ?? 0} <span className="text-3xl text-white/40 not-italic tracking-normal">Cycles</span>
                  </h2>
                  <p className="text-xs font-bold text-white/70 max-w-[280px] leading-relaxed italic border-l-2 border-white/20 pl-4">
                    Total successful field deployments across equipment and labour services to date.
                  </p>
               </div>

               <div className="mt-12 flex gap-8">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Synchronized</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <Activity className="text-emerald-300" size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Uptime: 99.8%</span>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Quick Access Marketplaces (Bento Spares) */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-3 bg-card border-2 border-muted/50 rounded-[3.5rem] p-12 shadow-2xl shadow-primary/5 relative overflow-hidden group cursor-pointer"
          >
             <Link to="/equipment" className="absolute inset-0 z-20" />
             <div className="absolute inset-0 z-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none p-12">
                <Tractor size={240} className="absolute bottom-0 right-0 -mr-10 -mb-10 rotate-12" />
             </div>
             
             <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                   <h3 className="text-3xl font-black font-heading tracking-tight mb-3">Machinery <span className="text-emerald-500 italic">Vault</span></h3>
                   <p className="text-sm text-muted-foreground font-medium max-w-xs italic mb-8">Access the newest planetary equipment for high-yield operations.</p>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex -space-x-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-muted border-2 border-card" />
                      ))}
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 group-hover:translate-x-2 transition-transform">
                      Enter Marketplace <ArrowRight size={14} />
                   </div>
                </div>
             </div>
          </motion.div>

          {/* Activity Feed / Recent Bookings */}
          <motion.div 
            variants={itemVariants} 
            className="col-span-1 md:col-span-2 lg:col-span-4 xl:col-span-6 bg-card border-2 border-muted/50 rounded-[4rem] p-12 shadow-2xl shadow-primary/5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-2xl font-black font-heading tracking-tight flex items-center gap-4 italic uppercase">
                    Throughput <span className="text-emerald-500 not-italic">Feed</span>
                    <div className="px-3 py-1 bg-muted rounded-full text-[9px] font-black tracking-[0.2em] text-muted-foreground border border-muted-foreground/10 not-italic">Active Logs</div>
                  </h3>
                  <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest italic opacity-60">Status synchronization of active field deployments</p>
               </div>
               <Link to="/dashboard/user/bookings" className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:underline">
                  View Full History <ChevronRight size={14} />
               </Link>
            </div>

            <div className="space-y-6">
              {bookingsLoading ? (
                 <div className="space-y-4">
                    {[...Array(2)].map((_, i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-[2.5rem]" />)}
                 </div>
              ) : bookings?.length ? (
                bookings.slice(0, 4).map((b) => (
                  <motion.div 
                    key={b.id} 
                    whileHover={{ scale: 1.01, x: 5 }}
                    className="p-8 bg-muted/20 border-2 border-transparent hover:border-emerald-500/20 rounded-[3rem] transition-all cursor-pointer group/item flex flex-col sm:flex-row items-start sm:items-center justify-between relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 transform -translate-x-full group-hover/item:translate-x-0 transition-transform" />
                    
                    <div className="flex items-center gap-8 mb-6 sm:mb-0">
                      <div className={cn(
                        "w-20 h-20 rounded-3xl flex items-center justify-center border-2 shadow-2xl",
                        b.status === 'confirmed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                      )}>
                        {b.equipment_id ? <Tractor size={30} /> : <HardHat size={30} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-1">
                          <p className="font-black text-lg uppercase tracking-tight italic">
                            {b.resource_name || (b.equipment_id ? 'Machinery Hire' : 'Personnel Service')}
                          </p>
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border",
                            b.status === 'confirmed' ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"
                          )}>
                            {b.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                           <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(b.start_time).toLocaleDateString()}</span>
                           <span className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full" />
                           <span className="flex items-center gap-1.5"><MapPin size={12} /> Certified Node</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-10 self-end sm:self-auto">
                       <div className="text-right">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1 opacity-50 font-mono italic">Allocation</p>
                          <p className="text-3xl font-black text-emerald-500 tracking-tighter">₹{b.total_price.toLocaleString()}</p>
                       </div>
                       <div className="p-4 bg-muted/50 rounded-2xl text-muted-foreground group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all">
                          <ArrowRight size={22} strokeWidth={3} />
                       </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-24 text-center space-y-6 bg-muted/10 rounded-[4rem] border-2 border-dashed border-muted">
                   <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground opacity-30">
                      <Zap size={36} />
                   </div>
                   <div className="space-y-2">
                      <p className="font-black uppercase tracking-[0.3em] text-[11px] text-muted-foreground italic">Market signals are zero</p>
                      <p className="text-xs text-muted-foreground/50 font-medium">Initiate your first land deployment via the marketplace.</p>
                   </div>
                   <Link to="/equipment" className="inline-flex items-center gap-3 bg-foreground text-background py-4 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all shadow-xl">
                      Broadcast Requests <ArrowRight size={14} />
                   </Link>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
}
