import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Plus, 
  Tractor, 
  HardHat, 
  TrendingUp, 
  CalendarCheck, 
  IndianRupee, 
  Wallet, 
  Zap, 
  Layers,
  Search,
  ChevronRight,
  Clock,
  MoreVertical
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface ProviderAnalytics {
  active_equipment: number;
  active_labour: number;
  pending_bookings: number;
  total_earnings: number;
  advance_earnings: number;
  final_earnings: number;
  recent_transactions: any[];
}

interface Booking {
  id: number;
  equipment_id: number | null;
  labour_id: number | null;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
}

export default function ProviderDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const queryClient = useQueryClient();
  const [showEqForm, setShowEqForm] = useState(false);
  const [eqFormData, setEqFormData] = useState({ name: '', type: 'Tractor', image_url: '', hourly_rate: '', daily_rate: '' });

  // Analytics
  const { data: analytics } = useQuery({
    queryKey: ['providerAnalytics'],
    queryFn: async () => {
      const res = await apiClient.get<ProviderAnalytics>('/analytics/provider');
      return res.data;
    }
  });

  // Bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['providerBookings'],
    queryFn: async () => {
      const res = await apiClient.get<Booking[]>('/provider/bookings');
      return res.data;
    }
  });

  // Add Equipment Mutation
  const addEqMutation = useMutation({
    mutationFn: async (data: typeof eqFormData) => {
      await apiClient.post('/provider/equipment', {
        ...data,
        hourly_rate: Number(data.hourly_rate),
        daily_rate: Number(data.daily_rate)
      });
    },
    onSuccess: () => {
      setEqFormData({ name: '', type: 'Tractor', image_url: '', hourly_rate: '', daily_rate: '' });
      setShowEqForm(false);
      queryClient.invalidateQueries({ queryKey: ['providerAnalytics'] });
    }
  });

  function handleAddSequence(e: React.FormEvent) {
    e.preventDefault();
    addEqMutation.mutate(eqFormData);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-[1600px] mx-auto space-y-10 pb-20"
      >
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Zap size={10} strokeWidth={3} />
              Provider Intelligence Active
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-6xl font-heading font-black tracking-tight leading-none bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
              Operations <span className="text-primary italic">Console</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg font-medium max-w-xl">
              Real-time asset management and financial throughput for <span className="text-foreground font-black border-b-2 border-primary/30">{user?.email}</span>.
            </motion.p>
          </div>
          
          <motion.div variants={itemVariants} className="flex gap-4">
             <button 
                onClick={() => setShowEqForm(true)}
                className="group relative px-8 py-4 bg-primary text-primary-foreground font-black rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
             >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="relative flex items-center gap-2 uppercase tracking-widest text-[11px]">
                  <Plus size={16} strokeWidth={3} />
                  Assemble New Asset
                </div>
             </button>
          </motion.div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          
          {/* Main Financial Card (Large) */}
          <motion.div 
            variants={itemVariants}
            className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-3 row-span-2 bg-card border-2 border-muted/50 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl shadow-primary/5"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
               <Wallet size={280} />
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/10">
                    <IndianRupee size={24} strokeWidth={2.5} />
                  </div>
                  <div className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-1.5 h-1.5 rounded-full bg-green-500" 
                    />
                    Live Balance
                  </div>
                </div>
                
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2 font-mono">Net Settled Earnings</p>
                <h2 className="text-7xl font-black font-heading tracking-tighter mb-4">
                  ₹{analytics?.total_earnings?.toLocaleString() || '0'}
                </h2>
                <div className="flex gap-10">
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-50">Advance Vault</p>
                    <p className="text-lg font-black text-foreground">₹{analytics?.advance_earnings?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-50">Finalized High</p>
                    <p className="text-lg font-black text-foreground">₹{analytics?.final_earnings?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>

              {/* Mini Chart Area */}
              <div className="h-[120px] w-full mt-10 -mx-10 rounded-b-[3rem] overflow-hidden opacity-50">
                <ResponsiveContainer width="100%" height="100%" minHeight={120}>
                  <AreaChart data={[
                    {v: 40}, {v: 70}, {v: 45}, {v: 90}, {v: 65}, {v: 110}, {v: 85}
                  ]}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={4} fill="url(#colorEarnings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Asset Split (Medium) */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-3 bg-white dark:bg-card border-2 border-slate-100 dark:border-muted/20 rounded-[3rem] p-10 shadow-xl shadow-primary/5 flex flex-col justify-between group">
             <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black font-heading tracking-tight">Resource Footprint</h3>
                  <Layers className="text-muted-foreground opacity-30" size={24} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-8 bg-muted/30 rounded-[2.5rem] border border-muted-foreground/5 hover:border-primary/20 transition-all cursor-default relative overflow-hidden group/sub">
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Machinery</p>
                      <p className="text-5xl font-black font-heading mb-1">{analytics?.active_equipment || 0}</p>
                      <p className="text-[9px] font-bold text-primary italic uppercase">Verified Units</p>
                    </div>
                    <Tractor className="absolute -bottom-4 -right-4 text-primary opacity-[0.03] group-hover/sub:scale-125 transition-transform duration-500" size={100} />
                  </div>
                  <div className="p-8 bg-muted/30 rounded-[2.5rem] border border-muted-foreground/5 hover:border-blue-500/20 transition-all cursor-default relative overflow-hidden group/sub">
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Personnel</p>
                      <p className="text-5xl font-black font-heading mb-1">{analytics?.active_labour || 0}</p>
                      <p className="text-[9px] font-bold text-blue-500 italic uppercase">Active Skills</p>
                    </div>
                    <HardHat className="absolute -bottom-4 -right-4 text-blue-500 opacity-[0.03] group-hover/sub:scale-125 transition-transform duration-500" size={100} />
                  </div>
                </div>
             </div>
          </motion.div>

          {/* Pending Queue (Compact) */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 xl:col-span-2 bg-primary dark:bg-primary/90 text-primary-foreground rounded-[3rem] p-10 shadow-2xl shadow-primary/30 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col justify-between h-full">
               <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Queue Status</p>
                    <h3 className="text-2xl font-black font-heading leading-tight uppercase">Reservation<br/>Backlog</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                     <TrendingUp size={20} strokeWidth={3} />
                  </div>
               </div>
               <div>
                  <div className="text-6xl font-black font-heading tracking-tighter mb-2">{analytics?.pending_bookings || 0}</div>
                  <p className="text-xs font-bold italic opacity-80 uppercase tracking-tighter">New service requests awaiting your confirmation</p>
               </div>
               <button className="mt-8 py-3 bg-white text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-all">
                  Process Queue
               </button>
            </div>
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700 -mr-10 -mt-10">
              <CalendarCheck size={280} />
            </div>
          </motion.div>

          {/* Order Feed (Sidebar-like long card) */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 xl:col-span-4 bg-white dark:bg-card border-2 border-slate-100 dark:border-muted/20 rounded-[3.5rem] p-10 shadow-2xl shadow-primary/5 flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div>
                 <h3 className="text-xl font-black font-heading tracking-tight flex items-center gap-3">
                   Throughput Feed
                   <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-muted-foreground/10">Real-time</span>
                 </h3>
                 <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest italic">Monitoring global booking ingress</p>
               </div>
               <div className="flex gap-2">
                 <div className="p-2.5 bg-muted/50 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer"><Search size={18} /></div>
                 <div className="p-2.5 bg-muted/50 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer"><MoreVertical size={18} /></div>
               </div>
            </div>

            <div className="flex-1 space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {bookingsLoading ? (
                 <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-[2rem]" />)}
                 </div>
              ) : bookings?.length ? (
                bookings.map((b) => (
                  <motion.div 
                    key={b.id} 
                    whileHover={{ scale: 1.01, x: 5 }}
                    className="p-8 bg-muted/20 border-2 border-transparent hover:border-primary/20 rounded-[2.5rem] transition-all cursor-pointer group/item flex items-center justify-between relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary transform -translate-x-full group-hover/item:translate-x-0 transition-transform" />
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center border-2",
                        b.status === 'confirmed' ? "bg-green-50 border-green-100 text-green-600" : "bg-amber-50 border-amber-100 text-amber-600"
                      )}>
                        {b.equipment_id ? <Tractor size={24} /> : <HardHat size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-sm uppercase tracking-tight">Order #{b.id.toString().padStart(4, '0')}</p>
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border",
                            b.status === 'confirmed' ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"
                          )}>
                            {b.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                           <span className="flex items-center gap-1"><Clock size={10} /> {new Date(b.start_time).toLocaleDateString()}</span>
                           <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                           <span>{b.equipment_id ? 'Machinery Hire' : 'Labour Service'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                       <div className="text-right">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-50">Contract Value</p>
                          <p className="text-xl font-black text-primary tracking-tighter">₹{b.total_price.toLocaleString()}</p>
                       </div>
                       <div className="p-3 bg-muted/50 rounded-xl text-muted-foreground group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-all">
                          <ChevronRight size={18} />
                       </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center space-y-4 bg-muted/10 rounded-[3rem] border-2 border-dashed border-muted">
                   <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground opacity-30">
                      <Zap size={30} />
                   </div>
                   <p className="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground italic">Waiting for market signals...</p>
                </div>
              )}
            </div>
          </motion.div>

        </div>

        {/* Action Portal Modal (Replacing the inline form for a more "focused" premium experience) */}
        <AnimatePresence>
          {showEqForm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setShowEqForm(false)}
                 className="absolute inset-0 bg-background/60 backdrop-blur-2xl" 
               />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0, y: 20 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 0.9, opacity: 0, y: 20 }}
                 className="relative w-full max-w-2xl bg-card border-2 border-muted rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] p-12 overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-20 opacity-[0.02] text-primary rotate-12 -mr-10 -mt-10">
                    <Tractor size={300} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h2 className="text-4xl font-black font-heading tracking-tight mb-2 uppercase">Asset Setup</h2>
                        <p className="text-muted-foreground font-medium italic">Configure your machinery for the global market</p>
                      </div>
                      <button 
                        onClick={() => setShowEqForm(false)}
                        className="p-4 bg-muted/50 hover:bg-muted rounded-2xl text-muted-foreground transition-all hover:rotate-90"
                      >
                         <Plus size={24} className="rotate-45" />
                      </button>
                    </div>

                    <form onSubmit={handleAddSequence} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Friendly Name</label>
                           <input 
                             required 
                             placeholder="e.g. Thunder-Cat 9000"
                             className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background rounded-2xl p-5 outline-none transition-all font-bold placeholder:opacity-30"
                             value={eqFormData.name} onChange={e => setEqFormData({...eqFormData, name: e.target.value})} 
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">System Classification</label>
                           <select 
                             className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background rounded-2xl p-5 outline-none transition-all font-black appearance-none"
                             value={eqFormData.type} onChange={e => setEqFormData({...eqFormData, type: e.target.value})}
                           >
                             <option>Tractor</option><option>Harvester</option><option>Plow</option><option>Seeder</option><option>Sprayer</option><option>Baler</option>
                           </select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Visual Asset URL</label>
                        <input 
                          required 
                          placeholder="https://images.pexels.com/..."
                          className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background rounded-2xl p-5 outline-none transition-all font-bold"
                          value={eqFormData.image_url} onChange={e => setEqFormData({...eqFormData, image_url: e.target.value})} 
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Hourly Revenue (₹)</label>
                          <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary">₹</span>
                            <input required type="number" step="0.01" className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background rounded-2xl p-5 pl-12 outline-none transition-all font-black" 
                              value={eqFormData.hourly_rate} onChange={e => setEqFormData({...eqFormData, hourly_rate: e.target.value})} />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Full-Day Lease (₹)</label>
                          <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary">₹</span>
                            <input required type="number" step="0.01" className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background rounded-2xl p-5 pl-12 outline-none transition-all font-black" 
                              value={eqFormData.daily_rate} onChange={e => setEqFormData({...eqFormData, daily_rate: e.target.value})} />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button 
                          type="submit" 
                          disabled={addEqMutation.isPending}
                          className="flex-1 bg-primary text-primary-foreground py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          {addEqMutation.isPending ? 'Syncing...' : 'Broadcast Assets'}
                        </button>
                      </div>
                    </form>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </DashboardLayout>
  );
}
