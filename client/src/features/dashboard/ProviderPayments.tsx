import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Layers,
  Zap,
  ChevronRight,
  Building2,
  IndianRupee,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProviderPayments() {
  const { data: payments, isPending, refetch } = useQuery({
    queryKey: ['providerPayments'],
    queryFn: async () => {
      const [analytics, wallet, bank, withdrawals] = await Promise.all([
        apiClient.get('/analytics/provider'),
        apiClient.get('/provider/wallet'),
        apiClient.get('/provider/bank-details'),
        apiClient.get('/provider/withdrawals')
      ]);
      return {
        ...analytics.data,
        wallet_balance: wallet.data.balance,
        bank_details: bank.data,
        withdrawal_history: withdrawals.data,
        pending_holdings: analytics.data.pending_bookings 
      };
    }
  });

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({
    account_holder_name: "",
    account_number: "",
    ifsc_code: "",
    bank_name: ""
  });

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/provider/bank-details', bankForm);
      setShowBankForm(false);
      refetch();
    } catch (err) {
      alert("Failed to save bank details");
    }
  };

  const handleWithdraw = async () => {
    if (!payments?.bank_details.length) {
      alert("Please add a bank account first");
      setShowBankForm(true);
      return;
    }
    try {
      await apiClient.post('/provider/withdraw', {
        amount: parseFloat(withdrawAmount),
        bank_detail_id: payments.bank_details[0].id
      });
      setWithdrawAmount("");
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Withdrawal failed");
    }
  };

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

  if (isPending && !payments) return (
     <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse italic">Reconciling Financial Logs...</p>
        </div>
     </div>
  );

  const chartData = [
    { name: 'Advance Vault', value: payments?.advance_earnings || 0, color: 'hsl(var(--primary))' },
    { name: 'Final Liquidity', value: payments?.final_earnings || 0, color: '#3b82f6' }
  ];

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
          <div className="space-y-2">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Zap size={10} strokeWidth={3} />
              Wealth Intelligence Node
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-6xl font-heading font-black tracking-tight leading-none bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent italic">
              Financial <span className="text-primary not-italic">Matrix</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg font-medium max-w-xl">
              Monitor your capitalized earnings and manage high-velocity payout streams.
            </motion.p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-6 gap-8">
           {/* Left Column: Digital Wallet */}
           <div className="xl:col-span-2 space-y-8">
              <motion.div 
                variants={itemVariants}
                className="p-10 border-2 rounded-[3.5rem] bg-primary text-primary-foreground shadow-[0_40px_100px_-20px_rgba(16,185,129,0.3)] relative overflow-hidden group"
              >
                 <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                    <Wallet size={200} />
                 </div>
                 <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2 font-mono">Total Capitalized</h3>
                      <p className="text-3xl font-black font-heading tracking-widest opacity-40 mb-1">Agri-Trust Card</p>
                      <p className="text-6xl font-black font-heading tracking-tighter mb-10">₹{payments?.wallet_balance.toLocaleString()}</p>
                    </div>

                    <div className="space-y-4">
                       <div className="relative">
                          <input
                            type="number"
                            placeholder="Enter Amount"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full bg-white/10 border-2 border-white/10 rounded-2xl px-6 py-4 text-lg font-black placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all"
                          />
                          <IndianRupee className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                       </div>
                       <button
                         onClick={handleWithdraw}
                         className="w-full bg-white text-primary font-black uppercase tracking-[0.2em] py-5 rounded-[2rem] text-[11px] hover:bg-white/90 transition-all shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95"
                       >
                         Request Instant Payout
                       </button>
                    </div>
                 </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                 <EarningStat
                   title="Admin Vault Holding"
                   value={`₹${(payments?.pending_holdings || 0).toLocaleString()}`}
                   icon={Layers}
                   color="amber"
                   description="Reserved funds awaiting release"
                 />
              </motion.div>

              <motion.div variants={itemVariants} className="p-10 bg-card border-2 border-muted/50 rounded-[3.5rem] shadow-2xl shadow-primary/5">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                       <div className="p-3 bg-muted rounded-xl"><Building2 size={20} className="text-primary" /></div>
                       <h4 className="font-black font-heading tracking-tight text-lg uppercase">Settlement Account</h4>
                    </div>
                    <button
                      onClick={() => setShowBankForm(true)}
                      className="text-[10px] font-black text-primary hover:underline uppercase tracking-[0.2em]"
                    >
                      {payments?.bank_details.length ? "Configure" : "Link Account"}
                    </button>
                 </div>

                 {payments?.bank_details.length ? (
                   <div className="p-6 bg-muted/30 rounded-3xl border border-muted flex items-center justify-between">
                      <div className="space-y-1">
                         <p className="text-sm font-black text-foreground">{payments.bank_details[0].bank_name}</p>
                         <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">
                           A/C: {payments.bank_details[0].account_number.replace(/\d(?=\d{4})/g, "•")}
                         </p>
                      </div>
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                         <CheckCircle2 size={16} />
                      </div>
                   </div>
                 ) : (
                    <div className="p-8 text-center border-2 border-dashed border-muted rounded-3xl opacity-50">
                       <AlertCircle size={24} className="mx-auto mb-2" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No Bank Linked</p>
                    </div>
                 )}
              </motion.div>
           </div>

           {/* Right Column: Analytics & Feed */}
           <div className="xl:col-span-4 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Distribution Chart */}
                 <motion.div variants={itemVariants} className="bg-card border-2 border-muted/50 rounded-[3.5rem] p-10 shadow-2xl shadow-primary/5 flex flex-col items-center group">
                   <div className="w-full flex items-center justify-between mb-6">
                     <h3 className="text-xl font-black font-heading tracking-tight flex items-center gap-3 uppercase">
                        Liquidity Ratio
                        <span className="px-3 py-1 bg-muted rounded-full text-[9px] font-black tracking-widest text-muted-foreground border border-muted-foreground/10">30/70 Split</span>
                     </h3>
                     <TrendingUp className="text-primary" size={24} />
                   </div>
                   <div className="h-[280px] w-full relative">
                     <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280} debounce={100}>
                       <PieChart>
                         <Pie
                           data={chartData}
                           cx="50%"
                           cy="50%"
                           innerRadius={70}
                           outerRadius={100}
                           paddingAngle={10}
                           dataKey="value"
                         >
                           {chartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                           ))}
                         </Pie>
                         <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', fontWeight: 800, fontSize: '12px' }} />
                         <Legend verticalAlign="bottom" align="center" iconType="circle" />
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                   <p className="mt-6 text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] italic text-center">Comparing locked growth vs liquid capital assets</p>
                 </motion.div>

                 {/* Cumulative Stats */}
                 <div className="flex flex-col gap-8">
                    <motion.div variants={itemVariants} className="flex-1 p-10 bg-card border-2 border-muted/50 rounded-[3.5rem] flex flex-col justify-center relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8 opacity-5 text-primary group-hover:scale-110 transition-transform">
                          <TrendingUp size={140} />
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">Platform Contribution</p>
                       <p className="text-5xl font-black font-heading text-primary">₹{(payments?.total_earnings + (payments?.pending_holdings || 0)).toLocaleString()}</p>
                       <p className="text-[10px] font-bold text-muted-foreground mt-4 italic uppercase">Total Lifetime Throughput</p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="flex-1 p-10 bg-card border-2 border-muted/50 rounded-[3.5rem] flex flex-col justify-center relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-500 group-hover:scale-110 transition-transform">
                          <History size={140} />
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">Audit Frequency</p>
                       <p className="text-5xl font-black font-heading text-blue-500">{payments?.recent_transactions.length || 0}</p>
                       <p className="text-[10px] font-bold text-muted-foreground mt-4 italic uppercase">Successful Verifications</p>
                    </motion.div>
                 </div>
              </div>

              {/* Wealth Timeline */}
              <motion.div variants={itemVariants} className="bg-card border-2 border-muted/50 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-primary/5 flex flex-col">
                <div className="p-10 pb-6 flex items-center justify-between">
                   <h3 className="text-2xl font-black font-heading tracking-tight flex items-center gap-3">
                      Wealth Timeline
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   </h3>
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-primary" />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Settlements</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-blue-500" />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Withdrawals</span>
                      </div>
                   </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Audit ID / Status</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stage</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Asset Value</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Synchronization Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/30">
                      {/* Withdrawal Requests */}
                      {payments?.withdrawal_history.map((req: any) => (
                        <tr key={`withdraw-${req.id}`} className="bg-blue-50/10 dark:bg-blue-950/5 group hover:bg-blue-50/20 dark:hover:bg-blue-950/10 transition-colors">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                                 <ArrowUpRight size={18} />
                              </div>
                              <div>
                                 <p className="text-[11px] font-black uppercase tracking-widest">Transfer Order</p>
                                 <p className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.3em] font-mono">REQ-{req.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 font-bold text-xs">
                             <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-black uppercase tracking-[0.2em] text-[8px]">
                               {req.status}
                             </span>
                          </td>
                          <td className="px-6 py-6 font-black text-lg text-blue-600 tracking-tighter">-₹{req.amount.toLocaleString()}</td>
                          <td className="px-10 py-6 text-xs text-right font-black uppercase tracking-widest text-muted-foreground/60">
                             {new Date(req.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}

                      {payments?.recent_transactions.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-muted/10 transition-colors group cursor-default">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-3 rounded-2xl group-hover:scale-110 transition-transform",
                                tx.status === 'success' ? "bg-primary/10 text-primary border border-primary/10" : "bg-red-100 text-red-600"
                              )}>
                                <CheckCircle2 size={18} />
                              </div>
                              <div>
                                 <p className="text-[11px] font-black uppercase tracking-widest">Inbound Credit</p>
                                 <p className="text-[9px] font-bold text-muted-foreground uppercase font-mono tracking-widest">#S-{tx.booking_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                             <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[9px] font-black uppercase tracking-widest border border-muted-foreground/10">
                               {tx.stage} Payload
                             </span>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex flex-col">
                               <span className="font-black text-lg text-primary tracking-tighter">₹{tx.provider_amount.toLocaleString()}</span>
                               <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40 line-through">₹{tx.amount.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-xs text-right font-black uppercase tracking-widest text-muted-foreground/60">
                             {new Date(tx.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-8 bg-muted/20 text-center border-t border-muted/50">
                   <button className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:underline">Download Global Audit PDF</button>
                </div>
              </motion.div>
           </div>
        </div>

        {/* Bank Form Modal Redesign */}
        <AnimatePresence>
          {showBankForm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setShowBankForm(false)}
                 className="absolute inset-0 bg-background/60 backdrop-blur-2xl" 
               />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0, y: 20 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 0.9, opacity: 0, y: 20 }}
                 className="relative w-full max-w-xl bg-card border-2 border-muted rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] p-12 overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-16 opacity-[0.03] text-primary rotate-12 -mr-10 -mt-10 pointer-events-none">
                    <Building2 size={300} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h2 className="text-4xl font-black font-heading tracking-tight mb-2 uppercase italic">Vault <span className="text-primary not-italic">Sync</span></h2>
                        <p className="text-muted-foreground font-medium italic">Authenticate your destination for capital flow.</p>
                      </div>
                      <button 
                        onClick={() => setShowBankForm(false)}
                        className="p-4 bg-muted/50 hover:bg-muted rounded-2xl text-muted-foreground transition-all hover:rotate-90"
                      >
                         <ChevronRight size={24} className="rotate-45" />
                      </button>
                    </div>

                    <form onSubmit={handleBankSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Legal Holder Name</label>
                            <input
                              required
                              className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/50 focus:bg-background rounded-2xl px-6 py-4 font-black transition-all outline-none placeholder:opacity-20"
                              placeholder="e.g. Verified Provider Name"
                              value={bankForm.account_holder_name}
                              onChange={e => setBankForm({...bankForm, account_holder_name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Capital Destination (A/C)</label>
                            <input
                               required
                               className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/50 focus:bg-background rounded-2xl px-6 py-4 font-black transition-all outline-none placeholder:opacity-20"
                               placeholder="Standard Account Number"
                               value={bankForm.account_number}
                               onChange={e => setBankForm({...bankForm, account_number: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Transit Code (IFSC)</label>
                                <input
                                   required
                                   className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/50 focus:bg-background rounded-2xl px-6 py-4 font-black transition-all outline-none placeholder:opacity-20"
                                   placeholder="HDFC0123456"
                                   value={bankForm.ifsc_code}
                                   onChange={e => setBankForm({...bankForm, ifsc_code: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Network Provider</label>
                                <input
                                   required
                                   className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/50 focus:bg-background rounded-2xl px-6 py-4 font-black transition-all outline-none placeholder:opacity-20"
                                   placeholder="e.g. HDFC/SBI"
                                   value={bankForm.bank_name}
                                   onChange={e => setBankForm({...bankForm, bank_name: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                              type="submit"
                              className="flex-1 px-4 py-5 bg-primary text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95"
                            >
                              Finalize Synchronization
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

function EarningStat({ title, value, icon: Icon, color, description }: { title: string, value: string | number, icon: any, color: string, description: string }) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-500 border-blue-500/10 shadow-blue-500/5",
    amber: "text-amber-500 border-amber-500/10 shadow-amber-500/5"
  };

  return (
    <div className={cn("p-10 border-2 rounded-[3.5rem] bg-card shadow-2xl flex flex-col group", colorMap[color])}>
       <div className="flex justify-between items-center mb-8">
          <div className="p-3 bg-muted rounded-xl text-muted-foreground group-hover:text-amber-500 transition-colors">
             <Icon size={24} strokeWidth={2.5} />
          </div>
          <ArrowUpRight size={20} className="opacity-0 group-hover:opacity-30 transition-opacity" />
       </div>
       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">{title}</h3>
       <p className="text-4xl font-black font-heading tracking-tighter text-foreground mb-1">
         {value}
       </p>
       <p className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-tighter opacity-40">{description}</p>
    </div>
  );
}
