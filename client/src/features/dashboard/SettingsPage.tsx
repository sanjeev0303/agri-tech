import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Bell, 
  Shield, 
  Eye, 
  Moon, 
  Globe, 
  Smartphone,
  ChevronRight,
  Zap,
  Activity,
  LogOut,
  AppWindow,
  Lock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useTheme } from '../../components/ThemeProvider';

export default function SettingsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme, setTheme } = useTheme();
  const [paymentMode, setPaymentMode] = useState<'razorpay' | 'stripe'>('razorpay');

  const isAdmin = user?.role === 'superadmin';

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
        className="max-w-5xl mx-auto py-16 px-6 sm:px-10 space-y-12"
      >
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-3">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <AppWindow size={10} strokeWidth={3} />
              Central Configuration Node
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-6xl font-heading font-black tracking-tighter leading-none bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent italic uppercase">
              System <span className="text-primary not-italic">Control</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg font-medium max-w-xl">
              Optimize your marketplace interface, security protocols, and operational preferences.
            </motion.p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-12">
            {/* Admin Infrastructure Override */}
            {isAdmin && (
              <motion.div variants={itemVariants}>
                 <SettingsSection title="Platform Infrastructure">
                    <SettingsItem 
                      icon={Zap} 
                      label="Payment Processor" 
                      description="Switch global transaction carrier" 
                      action={
                        <div className="flex bg-muted/50 rounded-2xl p-1.5 gap-1.5 border border-muted-foreground/10">
                           <button 
                             onClick={() => setPaymentMode('razorpay')}
                             className={cn(
                               "px-6 py-2 text-[10px] font-black uppercase rounded-xl transition-all", 
                               paymentMode === 'razorpay' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "hover:bg-background/80 opacity-40 hover:opacity-100"
                             )}
                           >
                             Razorpay
                           </button>
                           <button 
                             onClick={() => setPaymentMode('stripe')}
                             className={cn(
                               "px-6 py-2 text-[10px] font-black uppercase rounded-xl transition-all", 
                               paymentMode === 'stripe' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "hover:bg-background/80 opacity-40 hover:opacity-100"
                             )}
                           >
                             Stripe
                           </button>
                        </div>
                      } 
                    />
                 </SettingsSection>
              </motion.div>
            )}

            {/* Core Preferences */}
            <motion.div variants={itemVariants}>
              <SettingsSection title="Interface Preferences">
                  <SettingsItem 
                    icon={Moon} 
                    label="Luminous Mode" 
                    description="Adaptive light/dark synchronization" 
                    action={
                      <button 
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className={cn(
                          "w-14 h-8 rounded-full p-1 relative transition-colors duration-500 flex items-center",
                          theme === 'dark' ? "bg-primary" : "bg-muted"
                        )}
                      >
                        <motion.div 
                          layout
                          animate={{ 
                            x: theme === 'dark' ? 24 : 0,
                          }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="w-6 h-6 bg-white rounded-full shadow-lg relative z-10" 
                        />
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    } 
                  />
                 <SettingsItem icon={Globe} label="Universal Language" description="Select your locale interface" value="English (Global)" />
              </SettingsSection>
            </motion.div>

            {/* Security Protocol */}
            <motion.div variants={itemVariants}>
              <SettingsSection title="Security & Credentials">
                 <SettingsItem 
                    icon={Lock} 
                    label="Uplink Verification" 
                    description="Current account health status" 
                    action={
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20 text-[10px] font-black tracking-widest uppercase italic">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                         Encrypted
                      </div>
                    } 
                 />
                 <SettingsItem 
                    icon={Smartphone} 
                    label="Biometric & MFA" 
                    description="Multi-factor authentication layers" 
                    action={
                      <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest italic decoration-2 underline-offset-4">
                        Initialize
                      </button>
                    } 
                  />
                 <SettingsItem icon={Shield} label="Privacy Shield" description="Manage visibility and metadata access" />
              </SettingsSection>
            </motion.div>

            {/* Signal Management */}
            <motion.div variants={itemVariants}>
              <SettingsSection title="Signal Notifications">
                 <SettingsItem 
                    icon={Bell} 
                    label="Broadcast Alerts" 
                    description="Push notifications for new bookings" 
                    action={
                      <input type="checkbox" defaultChecked className="accent-primary w-6 h-6 cursor-pointer opacity-80" />
                    } 
                 />
                 <SettingsItem icon={Eye} label="Visibility Index" description="Configure global profile discoverability" />
              </SettingsSection>
            </motion.div>

            {/* Identity & Deactivation */}
            <motion.div variants={itemVariants} className="space-y-6">
               <div className="p-10 bg-red-500/5 dark:bg-red-500/10 border-2 border-red-500/20 rounded-[3.5rem] flex flex-col sm:flex-row items-center justify-between gap-8 group cursor-pointer hover:bg-red-500/10 transition-all duration-500">
                  <div className="flex items-center gap-8">
                     <div className="p-5 bg-red-500/10 text-red-500 rounded-3xl group-hover:scale-110 transition-transform shadow-xl shadow-red-500/10">
                        <LogOut size={28} strokeWidth={3} />
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-2xl font-black font-heading uppercase tracking-tight text-red-500 italic">Terminate <span className="not-italic">Identity</span></h4>
                        <p className="text-xs text-red-500/70 font-bold uppercase tracking-widest">Permanent account deconstruction</p>
                     </div>
                  </div>
                  <ChevronRight size={24} className="text-red-300 group-hover:translate-x-4 transition-transform" />
               </div>
               
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30">Agri-tech Systems Configuration v4.8.2-Elite</p>
               </div>
            </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

function SettingsSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-card border-2 border-muted/50 rounded-[4rem] p-12 shadow-2xl shadow-primary/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 text-primary opacity-[0.02] group-hover:scale-110 transition-transform pointer-events-none">
         <Activity size={200} />
      </div>
      
      <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-12 flex items-center gap-4">
         <div className="w-10 h-[2px] bg-primary/30" />
         {title}
      </h3>
      
      <div className="space-y-2">
         {children}
      </div>
    </div>
  );
}

function SettingsItem({ icon: Icon, label, description, value, action }: { icon: any, label: string, description: string, value?: string, action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 group cursor-pointer border-b border-muted/30 last:border-0 hover:bg-primary/5 -mx-6 px-6 rounded-3xl transition-all">
      <div className="flex items-center gap-6 mb-4 sm:mb-0">
         <div className="p-4 bg-muted/50 rounded-2xl text-muted-foreground group-hover:text-primary group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all border border-transparent group-hover:border-primary/20">
            <Icon size={20} strokeWidth={2.5} />
         </div>
         <div>
            <h4 className="font-black text-lg tracking-tight uppercase italic">{label}</h4>
            <p className="text-xs text-muted-foreground font-bold tracking-widest">{description}</p>
         </div>
      </div>
      <div className="flex items-center gap-6 self-end sm:self-auto">
         {value && <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{value}</span>}
         {action ? (
            <div className="relative z-10">{action}</div>
         ) : (
            <div className="p-3 bg-muted/50 rounded-xl text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:bg-primary/10 group-hover:text-primary transition-all group-hover:translate-x-1">
               <ChevronRight size={18} strokeWidth={3} />
            </div>
         )}
      </div>
    </div>
  );
}
