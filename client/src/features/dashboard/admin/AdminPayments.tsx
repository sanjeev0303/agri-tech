import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios';
import DashboardLayout from '../../../components/DashboardLayout';
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Percent,
  History,
  Banknote,
  Ban} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../../lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Transaction {
  id: number;
  booking_id: number;
  total_amount: number;
  admin_commission: number;
  provider_amount: number;
  payment_stage: string;
  status: string;
  created_at: string;
  provider_email?: string;
  customer_email?: string;
}

interface AdminPaymentsData {
  total_revenue: number;
  total_commission: number;
  success_rate: number;
  held_funds: number;
  recent_transactions: Transaction[];
  unreleased_payments: Transaction[];
  released_payments: Transaction[];
  user_growth: any[];
}

interface WithdrawalRequest {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  user_email: string;
  bank_details: {
    account_holder_name: string;
    account_number: string;
    ifsc_code: string;
    bank_name: string;
  };
}

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState<'held' | 'payouts' | 'settled'>('held');

  const { data: payments, isPending, refetch } = useQuery({
    queryKey: ['adminPayments'],
    queryFn: async () => {
      const [analytics, unreleased, released] = await Promise.all([
        apiClient.get<AdminPaymentsData>('/analytics/admin'),
        apiClient.get<Transaction[]>('/admin/payments/unreleased'),
        apiClient.get<Transaction[]>('/admin/payments/released')
      ]);
      return {
        ...analytics.data,
        unreleased_payments: unreleased.data,
        released_payments: released.data,
        held_funds: unreleased.data.reduce((acc, curr) => acc + curr.provider_amount, 0)
      };
    }
  });

  const { data: withdrawals, refetch: refetchWithdrawals } = useQuery({
    queryKey: ['adminWithdrawals'],
    queryFn: async () => {
      const res = await apiClient.get<WithdrawalRequest[]>('/admin/withdrawals');
      return res.data;
    }
  });

  const handleRelease = async (id: number) => {
    try {
      await apiClient.post(`/admin/payments/${id}/release`);
      refetch();
    } catch (err) {
      alert("Release failed.");
    }
  };

  const handleFulfill = async (id: number) => {
    try {
      await apiClient.post(`/admin/withdrawals/${id}/complete`);
      refetchWithdrawals();
    } catch (err) {
      alert("Fulfillment failed.");
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this payout and return funds to the employee's wallet?")) return;
    try {
      await apiClient.post(`/admin/withdrawals/${id}/reject`);
      refetchWithdrawals();
    } catch (err) {
      alert("Rejection failed.");
    }
  };

  if (isPending && !payments) return <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="p-10 text-center font-black animate-pulse uppercase tracking-widest text-muted-foreground">Synchronizing Ledger...</div>
  </div>;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10 py-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-heading font-black mb-2 tracking-tighter">Finance Hub</h1>
            <p className="text-muted-foreground text-lg font-medium italic">Global transaction oversight and platform revenue analytics.</p>
          </div>
        </header>

        {/* Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FinanceCard
            title="Total Revenue"
            value={`₹${payments?.total_revenue.toLocaleString()}`}
            sub="Gross Platform Volume"
            icon={IndianRupee}
            color="emerald"
            trend="+12.5%"
          />
          <FinanceCard
            title="Held Funds"
            value={`₹${payments?.held_funds.toLocaleString()}`}
            sub="Awaiting Release"
            icon={History}
            color="amber"
            trend="Holding"
          />
          <FinanceCard
            title="Commission"
            value={`₹${payments?.total_commission.toLocaleString()}`}
            sub="10% Net Earnings"
            icon={Percent}
            color="blue"
            trend="+8.2%"
          />
          <FinanceCard
            title="Success Rate"
            value={`${payments?.success_rate.toFixed(1)}%`}
            sub="Payment Fulfillment"
            icon={CheckCircle2}
            color="amber"
            trend="+2.1%"
          />
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white dark:bg-card border-2 border-slate-100 dark:border-muted/20 rounded-[3.5rem] p-10 shadow-2xl shadow-primary/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black font-heading tracking-tight">Revenue Stream</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">Monthly financial velocity</p>
            </div>
            <TrendingUp className="text-primary" size={24} />
          </div>
          <div className="h-[350px] w-full relative">
            {payments?.user_growth && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={350} debounce={100}>
                <AreaChart data={payments.user_growth}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dy={12} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dx={-12} />
                  <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }} />
                  <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Transaction History & Payout Queue */}
        <div className="bg-white dark:bg-card border-2 border-slate-100 dark:border-muted/20 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-primary/5">
          <div className="p-10 border-b border-muted/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black font-heading tracking-tight">Financial Operations</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">Manage fund releases and withdrawal fulfillment</p>
            </div>

            <div className="flex bg-muted/30 p-1.5 rounded-2xl border border-muted/50">
               <button
                  onClick={() => setActiveTab('held')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'held' ? "bg-white dark:bg-slate-800 shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Held Transactions
                </button>
                <button
                  onClick={() => setActiveTab('payouts')}
                  className={cn(
                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'payouts' ? "bg-background text-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Payout Queue ({withdrawals?.filter(w => w.status === 'pending').length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('settled')}
                  className={cn(
                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'settled' ? "bg-background text-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Released Records ({payments?.released_payments.length || 0})
                </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'held' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID / Status / Release</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Provider</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stage</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Vendor Share</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/30">
                  {payments?.unreleased_payments.map((tx) => (
                    <tr key={`unreleased-${tx.id}`} className="bg-amber-50/30 dark:bg-amber-950/10 hover:bg-amber-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleRelease(tx.id)}
                            className="px-3 py-1.5 bg-amber-500 text-white text-[10px] font-black rounded-lg hover:bg-amber-600 transition-all uppercase tracking-widest shadow-lg shadow-amber-500/20"
                          >
                            Release
                          </button>
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-amber-600">HELD-TXN-{tx.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-bold text-sm truncate max-w-[150px]">{tx.provider_email}</td>
                      <td className="px-6 py-6 font-bold text-sm truncate max-w-[150px]">{tx.customer_email}</td>
                      <td className="px-6 py-6">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {tx.payment_stage || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-6 font-black text-sm">₹{(tx.total_amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-6 font-bold text-sm text-right text-amber-600 italic">₹{(tx.provider_amount || 0).toLocaleString()}</td>
                      <td className="px-10 py-6 text-xs text-right font-medium text-muted-foreground uppercase">Just Now</td>
                    </tr>
                  ))}

                  {payments?.recent_transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            tx.status === 'success' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          )}>
                            {tx.status === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest">TXN-{tx.id}</p>
                            <p className={cn("text-[10px] font-bold", tx.status === 'success' ? "text-green-500" : "text-red-500")}>
                              {tx.status.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-bold text-sm truncate max-w-[150px]">{tx.provider_email || 'System'}</td>
                      <td className="px-6 py-6 font-bold text-sm truncate max-w-[150px]">{tx.customer_email || 'System'}</td>
                      <td className="px-6 py-6">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                          {tx.payment_stage || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-6 font-black text-sm">₹{(tx.total_amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-6 font-bold text-sm text-right text-muted-foreground italic">₹{(tx.admin_commission || 0).toLocaleString()}</td>
                      <td className="px-10 py-6 text-xs text-right font-medium text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : activeTab === 'settled' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID / Status</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recipient (Provider)</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Originator (Customer)</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stage</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Settled Amount</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Date Released</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/30">
                  {payments?.released_payments.map((tx) => (
                    <tr key={`released-${tx.id}`} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 text-green-600 rounded-lg"><CheckCircle2 size={16} /></div>
                          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">TXN-{tx.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-bold text-sm">{tx.provider_email}</td>
                      <td className="px-6 py-6 font-bold text-sm">{tx.customer_email}</td>
                      <td className="px-6 py-6">
                        <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[10px] font-black uppercase tracking-widest">
                          {tx.payment_stage || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-6 font-black text-sm">₹{(tx.total_amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-6 font-bold text-sm text-right text-green-600 italic">₹{(tx.provider_amount || 0).toLocaleString()}</td>
                      <td className="px-10 py-6 text-xs text-right font-medium text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Request ID / Actions</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Employee</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bank Information</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/30">
                  {withdrawals?.map((req) => (
                    <tr key={req.id} className={cn(
                      "transition-colors group",
                      req.status === 'pending' ? "bg-primary/5" : "opacity-60"
                    )}>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          {req.status === 'pending' ? (
                            <div className="flex gap-2">
                               <button
                                onClick={() => handleFulfill(req.id)}
                                className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                title="Fulfill Payout"
                              >
                                <Banknote size={16} />
                              </button>
                              <button
                                onClick={() => handleReject(req.id)}
                                className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive hover:text-white transition-all"
                                title="Reject Request"
                              >
                                <Ban size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className={cn(
                              "p-2 rounded-lg",
                              req.status === 'completed' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            )}>
                              {req.status === 'completed' ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest">REQ-{req.id}</p>
                            <p className={cn("text-[10px] font-black uppercase italic",
                              req.status === 'completed' ? "text-green-500" : req.status === 'pending' ? "text-primary" : "text-destructive"
                            )}>
                              {req.status}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-8">
                        <p className="text-sm font-black">{req.user_email}</p>
                        <p className="text-[10px] font-bold text-muted-foreground opacity-60">ID: {req.id}</p>
                      </td>
                      <td className="px-6 py-8">
                        <div className="p-4 bg-muted/30 rounded-2xl border border-muted/50 inline-block">
                           <p className="text-xs font-black text-foreground">{req.bank_details.bank_name}</p>
                           <p className="text-[10px] font-bold text-muted-foreground tracking-widest mt-1">
                             {req.bank_details.account_number} • {req.bank_details.ifsc_code}
                           </p>
                           <p className="text-[8px] font-black uppercase opacity-40 mt-1">{req.bank_details.account_holder_name}</p>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <p className="text-2xl font-black font-heading tracking-tighter italic">₹{req.amount.toLocaleString()}</p>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">{new Date(req.created_at).toLocaleDateString()}</p>
                      </td>
                    </tr>
                  ))}
                  {(!withdrawals || withdrawals.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-10 py-20 text-center italic text-muted-foreground text-sm font-medium">
                        No payout requests detected in the ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function FinanceCard({ title, value, sub, icon: Icon, color, trend }: { title: string, value: string, sub: string, icon: any, color: string, trend: string }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };

  return (
    <div className={cn("p-10 border-2 rounded-[3rem] shadow-xl shadow-primary/5 group transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-card", colorMap[color])}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-white/50 backdrop-blur rounded-2xl shadow-sm border border-white/50">
          <Icon size={24} className="opacity-80" />
        </div>
        <div className={cn("flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase", trend.startsWith('+') ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
           {trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
           {trend}
        </div>
      </div>
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{title}</h3>
      <p className="text-4xl font-black font-heading mb-1 text-slate-900 dark:text-white tracking-tighter">{value}</p>
      <p className="text-[10px] font-bold opacity-60">{sub}</p>
    </div>
  );
}
