import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import { cn } from '../../lib/utils';
import { 
  Users, 
  Tractor, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  IndianRupee,
  Percent
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend
} from 'recharts';

interface AdminAnalytics {
  total_users: number;
  total_providers: number;
  total_equipment: number;
  total_labour: number;
  total_bookings: number;
  total_revenue: number;
  total_commission: number;
  user_growth: any[];
  resource_distribution: any[];
  platform_radar: any[];
}

export default function AdminDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: analytics } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const res = await apiClient.get<AdminAnalytics>('/analytics/admin');
      return res.data;
    }
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-heading font-black mb-2 tracking-tighter">System Overview</h1>
            <p className="text-muted-foreground text-lg font-medium italic">Welcome back, <span className="text-primary font-bold">{user?.email}</span>. Here's the platform pulse.</p>
          </div>
          <div className="flex gap-3">
             <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-2xl border-2 border-muted border-dashed">
                <Activity size={16} className="text-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Live Status: Normal</span>
             </div>
          </div>
        </header>

        {/* Top KPIs Row 1: Finance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Revenue" value={`₹${analytics?.total_revenue?.toLocaleString() || 0}`} icon={IndianRupee} color="emerald" />
          <StatCard title="Platform Comm." value={`₹${analytics?.total_commission?.toLocaleString() || 0}`} icon={Percent} color="blue" />
          <StatCard title="Total Bookings" value={analytics?.total_bookings} icon={Calendar} color="rose" />
        </div>

        {/* Top KPIs Row 2: Resources */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Farmers" value={analytics?.total_users} icon={Users} color="indigo" />
          <StatCard title="Providers" value={analytics?.total_providers} icon={Briefcase} color="amber" />
          <StatCard title="Equipment" value={analytics?.total_equipment} icon={Tractor} color="emerald" />
          <StatCard title="Labour" value={analytics?.total_labour} icon={Briefcase} color="blue" />
        </div>

        {/* Charts Row 2: Financial Velocity */}
        <div className="bg-white dark:bg-card border-2 border-slate-100 dark:border-muted/20 rounded-[3.5rem] p-10 shadow-2xl shadow-primary/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold font-heading">Financial Velocity</h3>
              <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1 italic">Monthly Revenue vs Commission Flow</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gross Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Platform Comm.</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
              <AreaChart data={analytics?.user_growth}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dy={12} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dx={-12} />
                <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="commission" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorComm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 3: Listing Metrics & Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Growth Area Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-card border-2 border-slate-100 dark:border-muted/20 rounded-[3rem] p-10 shadow-2xl shadow-primary/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold font-heading">User Base Growth</h3>
                <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1 italic">Monthly active accounts</p>
              </div>
              <TrendingUp className="text-primary" size={24} />
            </div>
            <div className="h-[350px] w-full relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                <AreaChart data={analytics?.user_growth}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProviders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dy={12} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dx={-12} />
                  <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }} />
                  <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="providers" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorProviders)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Pie Chart */}
          <div className="bg-white dark:bg-card border-2 border-slate-100 dark:border-muted/20 rounded-[3rem] p-10 shadow-2xl shadow-primary/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold font-heading">Resource Split</h3>
              <PieChartIcon className="text-primary" size={24} />
            </div>
            <div className="h-[300px] w-full mt-4 relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                <PieChart>
                  <Pie
                    data={analytics?.resource_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {analytics?.resource_distribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none' }} />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-6">Equip. vs Labour Listings</p>
          </div>
        </div>

        {/* Charts Row 2: Bar & Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
           {/* Performance Bar Chart */}
           <div className="bg-white dark:bg-card border-2 border-slate-100 dark:border-muted/20 rounded-[3rem] p-10 shadow-2xl shadow-primary/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold font-heading">Listing Metrics</h3>
              <BarChart3 className="text-primary" size={24} />
            </div>
            <div className="h-[350px] w-full relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                <BarChart data={analytics?.resource_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dy={12} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dx={-12} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '1.5rem', border: 'none' }} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                    {analytics?.resource_distribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Radar Chart (Platform Health) */}
          <div className="bg-white dark:bg-card border-2 border-slate-100 dark:border-muted/20 rounded-[3rem] p-10 shadow-2xl shadow-primary/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold font-heading">Platform Health</h3>
              <Shield size={24} className="text-primary" />
            </div>
            <div className="h-[400px] w-full relative">
               <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analytics?.platform_radar}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                  <Radar
                    name="Aggregated Health"
                    dataKey="A"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.5}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Shield({ size, className }: { size: number, className: string }) {
  return <div className={cn("p-1.5 bg-primary/10 rounded-xl", className)}><Activity size={size-8} /></div>;
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value?: number | string, icon: any, color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
    blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
    amber: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30",
    rose: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
  };

  return (
    <div className={cn("p-8 border-2 rounded-[2.5rem] shadow-xl shadow-primary/5 group cursor-default transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-card", colorMap[color])}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{title}</h3>
        <Icon size={20} className="opacity-40 group-hover:rotate-12 transition-transform" />
      </div>
      <p className="text-4xl font-black font-heading mb-1 text-slate-900 dark:text-white tracking-tighter">{value !== undefined ? value : '-'}</p>
      <div className="flex items-center gap-1 mt-2">
         <span className="text-[8px] font-black uppercase opacity-60">System Synchronized</span>
      </div>
    </div>
  );
}
