import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  CalendarCheck, 
  MapPin, 
  Receipt, 
  Wallet, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { loadRazorpay } from '../../lib/razorpay';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    Razorpay: any;
  }
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
  advance_amount: number;
  remaining_amount: number;
  payment_status: string;
  created_at: string;
}

export default function UserBookings() {
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  const { data: bookings, isPending, refetch } = useQuery({
    queryKey: ['userBookings'],
    queryFn: async () => {
      const res = await apiClient.get<Booking[]>('/user/bookings');
      return res.data;
    }
  });

  const handleSettlement = async (booking: Booking) => {
    setIsProcessing(booking.id);
    try {
      const res = await loadRazorpay();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }

      const endpoint = booking.payment_status === 'pending' 
        ? `/payments/booking/${booking.id}/advance` 
        : `/payments/booking/${booking.id}/final`;

      const paymentRes = await apiClient.post(endpoint);
      const order = paymentRes.data;

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Agri-Tech Global",
        description: `${booking.payment_status === 'pending' ? 'Advance' : 'Final'} Settlement - Booking #${booking.id}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await apiClient.post('/payments/verify', {
              booking_id: booking.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            refetch();
          } catch (err) {
            console.error("Verification failed", err);
          }
        },
        prefill: {
          name: "Verified Farmer",
          email: "user@agritech.com",
        },
        theme: {
          color: "hsl(var(--primary))",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Settlement failed", error);
    } finally {
      setIsProcessing(null);
    }
  };

  const calculateTotals = () => {
    if (!bookings) return { total: 0, pending: 0 };
    return bookings.reduce((acc, b) => ({
      total: acc.total + b.total_price,
      pending: acc.pending + (b.status !== 'cancelled' ? b.remaining_amount : 0)
    }), { total: 0, pending: 0 });
  };

  const { total, pending } = calculateTotals();

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
        className="max-w-7xl mx-auto space-y-12 pb-20 px-6 sm:px-10"
      >
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <Receipt size={10} strokeWidth={3} />
              Financial Signal Authenticated
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-6xl font-heading font-black tracking-tight leading-none bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent italic uppercase">
               Field <span className="text-amber-600 dark:text-amber-400 not-italic">History</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg font-medium italic">
               Aggregate audit of all capitalized field services and resource deployments.
            </motion.p>
          </div>
        </header>

        {/* Financial Pulse Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="bg-card border-2 border-muted/50 rounded-[3rem] p-10 shadow-2xl shadow-primary/5 flex items-center justify-between relative overflow-hidden group">
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1 opacity-60">Total Hired Capital</p>
                <div className="flex items-baseline gap-2">
                   <p className="text-4xl font-black font-heading tracking-tighter italic">₹{total.toLocaleString()}</p>
                   <ArrowUpRight size={16} className="text-emerald-500 mb-1" strokeWidth={3} />
                </div>
             </div>
             <TrendingUp size={60} className="text-emerald-500/10 absolute right-0 bottom-0 -mb-2 -mr-2 group-hover:scale-110 transition-transform" strokeWidth={3} />
          </motion.div>

          <motion.div variants={itemVariants} className="bg-card border-2 border-muted/50 rounded-[3rem] p-10 shadow-2xl shadow-primary/5 flex items-center justify-between relative overflow-hidden group">
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1 opacity-60">Settlement Balance</p>
                <p className="text-4xl font-black font-heading tracking-tighter italic text-amber-500">₹{pending.toLocaleString()}</p>
             </div>
             <Wallet size={60} className="text-amber-500/10 absolute right-0 bottom-0 -mb-2 -mr-2 group-hover:scale-110 transition-transform" strokeWidth={3} />
          </motion.div>

          <motion.div variants={itemVariants} className="hidden lg:flex bg-emerald-600 text-white rounded-[3rem] p-10 shadow-2xl shadow-emerald-500/20 items-center justify-between relative overflow-hidden group">
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-1 italic">Verified Node Status</p>
                <div className="flex items-center gap-3">
                   <ShieldCheck size={28} strokeWidth={2.5} />
                   <p className="text-xl font-black uppercase tracking-tight">Active Trust</p>
                </div>
             </div>
             <Activity size={80} className="text-white/10 absolute right-0 bottom-0 animate-pulse" />
          </motion.div>
        </div>

        {/* Reservations Feed */}
        <div className="space-y-10">
          <motion.h2 variants={itemVariants} className="text-2xl font-black font-heading uppercase italic tracking-tighter border-l-[3px] border-amber-500 pl-6 h-8 flex items-center">
             Audit Trail <span className="text-muted-foreground text-xs ml-4 font-bold opacity-30 tracking-widest uppercase not-italic">Global Chain Records</span>
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {isPending && !bookings ? (
               <div className="col-span-full py-24 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Synchronizing Records...</p>
               </div>
            ) : bookings?.length === 0 ? (
               <div className="col-span-full py-24 bg-muted/5 border-2 border-dashed border-muted/50 rounded-[4rem] text-center">
                  <div className="w-20 h-20 bg-muted/20 border border-muted-foreground/10 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground/30">
                     <CalendarCheck size={40} />
                  </div>
                  <h3 className="text-2xl font-black font-heading italic uppercase">Static Airflow</h3>
                  <p className="text-xs text-muted-foreground/50 font-bold uppercase tracking-widest mt-2">Zero field deployments detected in global history.</p>
               </div>
            ) : (
               bookings?.map((b) => (
                <BookingCard 
                  key={b.id} 
                  booking={b} 
                  isProcessing={isProcessing === b.id} 
                  onSettlement={() => handleSettlement(b)} 
                />
              ))
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

function BookingCard({ booking, isProcessing, onSettlement }: { booking: Booking, isProcessing: boolean, onSettlement: () => void }) {
  const isCancelled = booking.status === 'cancelled';
  const isCompleted = booking.status === 'completed';
  
  // Calculate Progress
  let progress = 0;
  if (booking.payment_status === 'fully_paid' || booking.status === 'completed') progress = 100;
  else if (booking.payment_status === 'partially_paid') progress = 30;
  else if (booking.payment_status === 'pending') progress = 0;

  const showSettlement = (!isCancelled && (
    (booking.payment_status === 'pending') || 
    (booking.payment_status === 'partially_paid' && booking.status === 'awaiting_final_payment')
  ));

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-card border-2 border-muted/50 rounded-[3.5rem] p-12 shadow-2xl shadow-primary/5 group relative overflow-hidden flex flex-col justify-between h-full"
    >
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-125 transition-transform pointer-events-none">
         <Receipt size={240} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
         <div className="flex justify-between items-start mb-10">
            <div>
               <div className="flex items-center gap-3 mb-1">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    isCancelled ? "bg-red-500" : isCompleted ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                  )} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60 italic font-mono">
                    ID: {booking.id.toString().padStart(6, '0')}
                  </span>
               </div>
               <h3 className="text-2xl font-black tracking-tighter uppercase italic truncate max-w-[200px]">
                 {booking.resource_name || (booking.equipment_id ? 'Machinery' : 'Labour')}
               </h3>
            </div>
            <div className={cn(
              "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-xl transition-all",
              isCancelled ? "bg-red-500/10 border-red-500/20 text-red-500" : 
              isCompleted ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : 
              "bg-amber-500/10 border-amber-500/20 text-amber-600 group-hover:bg-amber-500 group-hover:text-white"
            )}>
               {booking.status}
            </div>
         </div>

         <div className="grid grid-cols-2 gap-10 mb-10">
            <div className="space-y-6">
               <div className="space-y-2">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Schedule Spectrum</p>
                  <div className="flex items-center gap-2 font-black text-xs">
                     <span>{new Date(booking.start_time).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                     <ArrowRight size={14} className="text-muted-foreground opacity-30" />
                     <span>{new Date(booking.end_time).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Network Node</p>
                  <div className="flex items-center gap-2 font-black text-xs">
                     <MapPin size={14} className="text-amber-500" />
                     <span>Karnataka Global (R-4)</span>
                  </div>
               </div>
            </div>
            <div className="bg-muted/10 rounded-[2.5rem] p-6 border border-muted-foreground/5 flex flex-col justify-center">
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1 italic">Gross Invoice</p>
               <p className="text-3xl font-black text-foreground tracking-tighter truncate italic">₹{booking.total_price.toLocaleString()}</p>
            </div>
         </div>

         <div className="space-y-4 mb-10">
            <div className="flex justify-between items-end">
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Settlement Progress</p>
               <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{progress}%</span>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-muted-foreground/5">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 transition={{ duration: 1.5, ease: "circOut" }}
                 className={cn(
                   "h-full rounded-full shadow-lg transition-colors",
                   progress === 100 ? "bg-emerald-500" : "bg-amber-500"
                 )} 
               />
            </div>
            <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-30 px-1">
               <span>Origin</span>
               <span>Advance (30%)</span>
               <span>Final (100%)</span>
            </div>
         </div>

         <AnimatePresence>
            {showSettlement && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                disabled={isProcessing}
                onClick={onSettlement}
                className={cn(
                  "w-full py-5 bg-foreground text-background rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-3 group/btn relative overflow-hidden active:scale-95 disabled:opacity-50",
                  isProcessing && "animate-pulse"
                )}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                {isProcessing ? (
                  <>AUTHORIZING TRANSACTION...</>
                ) : (
                  <>
                    AUTHORIZE SETTLEMENT
                    <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </>
                )}
              </motion.button>
            )}
         </AnimatePresence>
      </div>
    </motion.div>
  );
}
