import { motion } from 'framer-motion';
import { Calendar, Clock, CreditCard, ShieldCheck, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { apiClient } from '../../api/axios';
import { cn } from '../../lib/utils';
import { loadRazorpay } from '../../lib/razorpay';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: number;
    name?: string;
    skills?: string;
    hourly_rate: number;
    daily_rate?: number;
    image_url: string;
  };
  type: 'equipment' | 'labour';
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BookingModal({ isOpen, onClose, item, type }: BookingModalProps) {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalHours = (days * 24) + hours;
  const totalPrice = totalHours * item.hourly_rate;
  const advanceAmount = totalPrice * 0.3;

  const handleBooking = async () => {
    setIsProcessing(true);
    try {
      const res = await loadRazorpay();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + totalHours * 60 * 60 * 1000);

      const bookingRes = await apiClient.post('/user/bookings', {
        [type === 'equipment' ? 'equipment_id' : 'labour_id']: item.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      });

      const booking = bookingRes.data;

      const paymentRes = await apiClient.post(`/payments/booking/${booking.id}/advance`);
      const order = paymentRes.data;

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Agri-Tech Global",
        description: `Advance - ${item.name || 'Specialized Personnel'}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await apiClient.post('/payments/verify', {
              booking_id: booking.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            onClose();
            window.location.reload();
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
      console.error("Booking failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/60 backdrop-blur-xl"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="relative w-full max-w-xl glass border border-primary/20 rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.4)] overflow-hidden"
      >
        {/* Header Image with Glass Overlay */}
        <div className="h-56 relative bg-muted/50">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          <div className="absolute top-8 left-8 right-8 flex justify-between items-start">
             <div className="glass px-4 py-2 rounded-full flex items-center gap-2 border-white/10">
                <Zap size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Reservation Protocol</span>
             </div>
             <button
               onClick={onClose}
               className="p-3 glass rounded-full hover:bg-white/10 transition-colors border-white/10"
             >
               <X size={20} />
             </button>
          </div>
        </div>

        <div className="p-10 -mt-16 relative z-10 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black font-heading tracking-tighter italic">
              {item.name || "Specialized Personnel"}
            </h2>
            <div className="flex items-center justify-center gap-6 text-muted-foreground text-[10px] font-black uppercase tracking-widest italic">
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /> ₹{item.hourly_rate}/HR</span>
              {item.daily_rate && <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> ₹{item.daily_rate}/DAY</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Project Days</label>
              <div className="flex items-center justify-between bg-muted/10 p-3 rounded-[1.5rem] border border-border/50">
                <button onClick={() => setDays(Math.max(0, days - 1))} className="w-10 h-10 glass rounded-xl hover:bg-white/5 transition-all font-black">-</button>
                <div className="text-xl font-black italic">{days}</div>
                <button onClick={() => setDays(days + 1)} className="w-10 h-10 glass rounded-xl hover:bg-white/5 transition-all font-black">+</button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Extra Hours</label>
              <div className="flex items-center justify-between bg-muted/10 p-3 rounded-[1.5rem] border border-border/50">
                <button onClick={() => setHours(Math.max(0, hours - 1))} className="w-10 h-10 glass rounded-xl hover:bg-white/5 transition-all font-black">-</button>
                <div className="text-xl font-black italic">{hours}</div>
                <button onClick={() => setHours(Math.min(23, hours + 1))} className="w-10 h-10 glass rounded-xl hover:bg-white/5 transition-all font-black">+</button>
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="glass bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Initialization Deposit (30%)</p>
                <p className="text-5xl font-black font-heading tracking-tighter italic">₹{advanceAmount.toFixed(0)}</p>
              </div>
              <div className="text-right space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Total Estimate</p>
                 <p className="text-xl font-black text-muted-foreground/60 italic">₹{totalPrice.toFixed(0)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              disabled={isProcessing || (days === 0 && hours === 0)}
              onClick={handleBooking}
              className={cn(
                "w-full py-5 bg-primary text-primary-foreground font-black uppercase tracking-[0.4em] text-xs rounded-2xl shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50",
                isProcessing && "animate-pulse"
              )}
            >
              {isProcessing ? 'AUTHORIZING TRANSACTION...' : 'INITIALIZE RESERVATION'}
            </button>
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest italic opacity-60">
                  <ShieldCheck size={12} className="text-primary" /> End-to-End Encrypted
               </div>
               <div className="flex items-center gap-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest italic opacity-60">
                  <CreditCard size={12} /> Powered by Razorpay
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
