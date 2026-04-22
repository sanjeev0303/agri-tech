import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  CalendarCheck, 
  MapPin, 
  Clock, 
  User, 
  Zap, 
  CheckCircle2, 
  Tractor, 
  HardHat, 
  ArrowRight,
  TrendingUp,
  Activity,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface Booking {
  id: number;
  equipment_id: number | null;
  labour_id: number | null;
  resource_name: string | null;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
  created_at: string;
}

export default function ProviderBookings() {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['providerBookings'],
    queryFn: async () => {
      const res = await apiClient.get<Booking[]>('/provider/bookings');
      return res.data;
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      await apiClient.post(`/provider/bookings/${bookingId}/service-complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerBookings'] });
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

  const activeBookings = bookings?.filter(b => b.status === 'confirmed') || [];
  const pastBookings = bookings?.filter(b => b.status !== 'confirmed') || [];

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
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Zap size={10} strokeWidth={3} />
              Operational Deployment Grid Active
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-6xl font-heading font-black tracking-tighter leading-none bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent italic uppercase">
              Service <span className="text-primary not-italic">Deployments</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg font-medium max-w-xl italic">
              Synchronize with your assigned field missions and authenticate completed protocols.
            </motion.p>
          </div>
        </header>

        {/* Stats Pods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <motion.div variants={itemVariants} className="bg-card border-2 border-muted/50 rounded-[3rem] p-10 shadow-2xl shadow-primary/5 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
                 <Activity size={100} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1 opacity-60">Active Missions</p>
              <p className="text-4xl font-black font-heading italic">{activeBookings.length}</p>
           </motion.div>
           <motion.div variants={itemVariants} className="bg-card border-2 border-muted/50 rounded-[3rem] p-10 shadow-2xl shadow-primary/5 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
                 <CheckCircle2 size={100} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1 opacity-60">Completed Protocols</p>
              <p className="text-4xl font-black font-heading italic">{pastBookings.length}</p>
           </motion.div>
           <motion.div variants={itemVariants} className="bg-primary text-white rounded-[3rem] p-10 shadow-2xl shadow-primary/20 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                 <TrendingUp size={100} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-1 italic">Fleet Performance</p>
              <p className="text-4xl font-black font-heading italic text-white">98.4%</p>
           </motion.div>
        </div>

        {/* Deployment Section */}
        <div className="space-y-8">
          <motion.h2 variants={itemVariants} className="text-2xl font-black font-heading uppercase italic tracking-tighter border-l-4 border-primary pl-6 flex items-center justify-between">
             Active <span className="text-primary not-italic">Assignments</span>
             <span className="text-xs text-muted-foreground font-bold tracking-[0.2em] italic bg-muted px-4 py-1 rounded-full h-8 flex items-center">Live Synchronization</span>
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {isLoading ? (
               <div className="col-span-full py-24 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Authenticating Link...</p>
               </div>
            ) : activeBookings.length === 0 ? (
               <div className="col-span-full py-24 bg-muted/10 border-2 border-dashed border-muted rounded-[4rem] text-center">
                  <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground opacity-20">
                     <AlertCircle size={48} />
                  </div>
                  <h3 className="text-2xl font-black font-heading uppercase italic">No Active Deployments</h3>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60 italic">Your field assignments will materialize here.</p>
               </div>
            ) : (
                activeBookings.map((b) => (
                  <DeploymentCard 
                    key={b.id} 
                    booking={b} 
                    isProcessing={completeMutation.isPending && completeMutation.variables === b.id}
                    onComplete={() => completeMutation.mutate(b.id)} 
                  />
                ))
            )}
          </div>
        </div>

        {/* Audit Record Section */}
        <div className="space-y-8 pt-12 border-t border-muted">
           <motion.h2 variants={itemVariants} className="text-xl font-black font-heading uppercase italic tracking-tighter opacity-40">
              Audit <span className="not-italic">Log (Past)</span>
           </motion.h2>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {pastBookings.slice(0, 6).map((b) => (
                <motion.div 
                  key={b.id} 
                  variants={itemVariants}
                  className="p-8 bg-muted/20 border border-muted/50 rounded-[2.5rem] opacity-60 hover:opacity-100 transition-opacity group cursor-default"
                >
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-muted rounded-2xl text-muted-foreground">
                        {b.equipment_id ? <Tractor size={20} /> : <HardHat size={20} />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">Protocol Secured</span>
                   </div>
                   <h4 className="font-black text-lg uppercase tracking-tight italic mb-1">{b.resource_name || 'System Asset'}</h4>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                      Synchronized: {new Date(b.created_at).toLocaleDateString()}
                   </p>
                </motion.div>
              ))}
           </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

function DeploymentCard({ booking, isProcessing, onComplete }: { booking: Booking, isProcessing: boolean, onComplete: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-card border-2 border-muted/50 rounded-[3.5rem] p-12 shadow-2xl bg-gradient-to-br from-card to-background relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-125 transition-transform duration-700 pointer-events-none">
         <CalendarCheck size={260} />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
         <div>
            <div className="flex justify-between items-start mb-10">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic font-mono opacity-80 underline underline-offset-4">LOG_#{booking.id.toString().padStart(6, '0')}</span>
                  </div>
                  <h3 className="text-4xl font-black tracking-tighter uppercase italic">{booking.resource_name || (booking.equipment_id ? 'Machinery' : 'Labour')}</h3>
               </div>
               <div className="p-5 bg-primary/10 rounded-[2rem] text-primary border border-primary/20 shadow-xl shadow-primary/5">
                  {booking.equipment_id ? <Tractor size={32} strokeWidth={2.5} /> : <HardHat size={32} strokeWidth={2.5} />}
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
               <div className="space-y-6">
                  <div className="flex items-center gap-4 group/item">
                     <div className="p-3 bg-muted rounded-xl text-muted-foreground group-hover/item:text-primary transition-colors border border-transparent group-hover/item:border-primary/20">
                        <User size={18} strokeWidth={3} />
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 italic">Subscriber Node</p>
                        <p className="text-xs font-black uppercase">Verified Client-Asset</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 group/item">
                     <div className="p-3 bg-muted rounded-xl text-muted-foreground group-hover/item:text-primary transition-colors border border-transparent group-hover/item:border-primary/20">
                        <MapPin size={18} strokeWidth={3} />
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 italic">Operation Range</p>
                        <p className="text-xs font-black uppercase">Karnataka Sector-4</p>
                     </div>
                  </div>
               </div>

               <div className="bg-muted/30 rounded-[2.5rem] p-8 flex flex-col justify-center border border-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                     <Clock size={16} className="text-primary" strokeWidth={3} />
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60 italic">Shift Window</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-black tracking-tighter flex items-center gap-3 italic">
                       {new Date(booking.start_time).toLocaleDateString(undefined, {day: 'numeric', month: 'short'})}
                       <ArrowRight size={14} className="text-primary opacity-40" />
                       {new Date(booking.end_time).toLocaleDateString(undefined, {day: 'numeric', month: 'short'})}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Global Cycle Time</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="pt-8 border-t border-muted">
            <button 
               onClick={onComplete}
               disabled={isProcessing}
               className={cn(
                 "w-full py-6 bg-foreground text-background font-black uppercase tracking-[0.3em] rounded-[2.5rem] shadow-2xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-4 active:scale-95 text-[10px] group/btn",
                 isProcessing && "animate-pulse opacity-50"
               )}
            >
               {isProcessing ? "Authenticating protocol..." : "Authenticate Service Performance"}
               <ChevronRight size={18} className="group-hover/btn:translate-x-2 transition-transform" strokeWidth={3} />
            </button>
         </div>
      </div>
    </motion.div>
  );
}
