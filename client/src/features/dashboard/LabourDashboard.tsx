import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Plus, 
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
  MoreVertical,
  Award,
  Camera,
  CheckCircle2,
  Edit2,
  Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Switch } from '../../components/ui/Switch';

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

interface LabourService {
  id: number;
  skills: string;
  hourly_rate: number;
  is_available: boolean;
  is_public: boolean;
  image_url: string;
}

export default function LabourDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const queryClient = useQueryClient();
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showSkillDrawer, setShowSkillDrawer] = useState(false);
  const [editingLabour, setEditingLabour] = useState<LabourService | null>(null);
  const [skillFormData, setSkillFormData] = useState({ skills: '', hourly_rate: '', image_url: '' });
  const [uploadingImage, setUploadingImage] = useState(false);

  const PREDEFINED_SKILLS = [
    "Tractor Operation",
    "Harvester Maintenance",
    "Seedling Specialist",
    "Irrigation Technician",
    "Organic Farming Consultant",
    "Drone Pilot (Agri)",
    "Greenhouse Manager",
    "Soil Analysis Expert",
    "Livestock Management",
    "Pest Control Specialist"
  ];

  // Analytics
  const { data: analytics } = useQuery({
    queryKey: ['providerAnalytics'],
    queryFn: async () => {
      const res = await apiClient.get<ProviderAnalytics>('/analytics/provider');
      return res.data;
    }
  });

  // Labour Services
  const { data: labourServices, refetch: refetchLabour } = useQuery({
    queryKey: ['providerLabour'],
    queryFn: async () => {
      const res = await apiClient.get<LabourService[]>('/provider/labour');
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

  // Add Labour Service Mutation
  const addSkillMutation = useMutation({
    mutationFn: async (data: typeof skillFormData) => {
      await apiClient.post('/provider/labour', {
        ...data,
        hourly_rate: Number(data.hourly_rate)
      });
    },
    onSuccess: () => {
      setSkillFormData({ skills: '', hourly_rate: '', image_url: '' });
      setShowSkillForm(false);
      setEditingLabour(null);
      queryClient.invalidateQueries({ queryKey: ['providerAnalytics'] });
      refetchLabour();
    }
  });

  const updateLabourMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<LabourService> }) => {
      await apiClient.put(`/provider/labour/${id}`, data);
    },
    onSuccess: () => {
      refetchLabour();
      setEditingLabour(null);
      setShowSkillForm(false);
      queryClient.invalidateQueries({ queryKey: ['providerAnalytics'] });
    }
  });

  const deleteLabourMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/provider/labour/${id}`);
    },
    onSuccess: () => {
      refetchLabour();
      queryClient.invalidateQueries({ queryKey: ['providerAnalytics'] });
    }
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // We'll reuse the profile update endpoint if it supports just image upload, 
      // or we can add a generic upload endpoint. 
      // For now, let's assume we can use the existing PATCH /user/profile which returns the image_url
      const res = await apiClient.patch('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSkillFormData(prev => ({ ...prev, image_url: res.data.image_url }));
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploadingImage(false);
    }
  };



  function handleAddSequence(e: React.FormEvent) {
    e.preventDefault();
    addSkillMutation.mutate(skillFormData);
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
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <Award size={10} strokeWidth={3} />
              Specialist Profile Active
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-6xl font-heading font-black tracking-tight leading-none bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
              Labour <span className="text-blue-500 italic">Console</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg font-medium max-w-xl">
              Manage your agricultural deployments and skills for <span className="text-foreground font-black border-b-2 border-blue-500/30">{user?.email}</span>.
            </motion.p>
          </div>
          
          <motion.div variants={itemVariants} className="flex gap-4">
             <button 
                onClick={() => {
                  setEditingLabour(null);
                  setSkillFormData({ skills: '', hourly_rate: '', image_url: '' });
                  setShowSkillForm(true);
                }}
                className="group relative px-8 py-4 bg-blue-600 text-white font-black rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
             >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="relative flex items-center gap-2 uppercase tracking-widest text-[11px]">
                  <Plus size={16} strokeWidth={3} />
                  Register New Skill
                </div>
             </button>
          </motion.div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          
          {/* Main Financial Card (Large) */}
          <motion.div 
            variants={itemVariants}
            className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-3 row-span-2 bg-card border-2 border-muted/50 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl shadow-blue-500/5"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
               <Wallet size={280} />
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/10">
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
                    {v: 30}, {v: 50}, {v: 40}, {v: 80}, {v: 60}, {v: 100}, {v: 75}
                  ]}>
                    <defs>
                      <linearGradient id="colorEarningsBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={4} fill="url(#colorEarningsBlue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Skill Metrics (Medium) */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-3 bg-white dark:bg-card border-2 border-slate-100 dark:border-muted/20 rounded-[3rem] p-10 shadow-xl shadow-blue-500/5 flex flex-col justify-between group">
             <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black font-heading tracking-tight">Service Presence</h3>
                  <Layers className="text-muted-foreground opacity-30" size={24} />
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="p-8 bg-muted/30 rounded-[2.5rem] border border-muted-foreground/5 hover:border-blue-500/20 transition-all cursor-default relative overflow-hidden group/sub">
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Total Specializations</p>
                      <p className="text-5xl font-black font-heading mb-1">{analytics?.active_labour || 0}</p>
                      <p className="text-[9px] font-bold text-blue-500 italic uppercase">Verified Skills</p>
                    </div>
                    <HardHat className="absolute -bottom-4 -right-4 text-blue-500 opacity-[0.03] group-hover/sub:scale-125 transition-transform duration-500" size={150} />
                  </div>
                </div>
             </div>
          </motion.div>

          {/* Pending Queue (Compact) */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 xl:col-span-2 bg-blue-600 text-white rounded-[3rem] p-10 shadow-2xl shadow-blue-500/30 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col justify-between h-full">
               <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Queue Status</p>
                    <h3 className="text-2xl font-black font-heading leading-tight uppercase">Booking<br/>Requests</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                     <TrendingUp size={20} strokeWidth={3} />
                  </div>
               </div>
               <div>
                  <div className="text-6xl font-black font-heading tracking-tighter mb-2">{analytics?.pending_bookings || 0}</div>
                  <p className="text-xs font-bold italic opacity-80 uppercase tracking-tighter">New service requests awaiting your confirmation</p>
               </div>
               <button className="mt-8 py-3 bg-white text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-all">
                  Manage Requests
               </button>
            </div>
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700 -mr-10 -mt-10">
              <CalendarCheck size={280} />
            </div>
          </motion.div>

          {/* Order Feed */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 xl:col-span-4 bg-white dark:bg-card border-2 border-slate-100 dark:border-muted/20 rounded-[3.5rem] p-10 shadow-2xl shadow-blue-500/5 flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div>
                 <h3 className="text-xl font-black font-heading tracking-tight flex items-center gap-3">
                   Service Logs
                   <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-muted-foreground/10">Real-time</span>
                 </h3>
                 <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest italic">Monitoring global service ingress</p>
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
                    className="p-8 bg-muted/20 border-2 border-transparent hover:border-blue-500/20 rounded-[2.5rem] transition-all cursor-pointer group/item flex items-center justify-between relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 transform -translate-x-full group-hover/item:translate-x-0 transition-transform" />
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center border-2",
                        b.status === 'confirmed' ? "bg-green-50 border-green-100 text-green-600" : "bg-amber-50 border-amber-100 text-amber-600"
                      )}>
                        <HardHat size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-sm uppercase tracking-tight">Deployment #{b.id.toString().padStart(4, '0')}</p>
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
                           <span>Labour Service</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                       <div className="text-right">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-50">Settlement</p>
                          <p className="text-xl font-black text-blue-600 tracking-tighter">₹{b.total_price.toLocaleString()}</p>
                       </div>
                       <div className="p-3 bg-muted/50 rounded-xl text-muted-foreground group-hover/item:bg-blue-600 group-hover/item:text-white transition-all">
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
                   <p className="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground italic">Waiting for skill requests...</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Professional Status Controls */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 xl:col-span-6 bg-white dark:bg-card border-2 border-slate-100 dark:border-muted/20 rounded-[3.5rem] p-10 shadow-2xl shadow-blue-500/5 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black font-heading tracking-tight">Professional Control Center</h3>
                <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest italic">Manage your marketplace visibility and operational status</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labourServices?.map((lb) => (
                <div key={lb.id} className="p-8 bg-muted/20 rounded-[2.5rem] border-2 border-transparent hover:border-blue-500/20 transition-all space-y-6 relative group/card">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingLabour(lb);
                        setSkillFormData({ skills: lb.skills, hourly_rate: lb.hourly_rate.toString(), image_url: lb.image_url });
                        setShowSkillForm(true);
                      }}
                      className="p-2 bg-background rounded-lg text-muted-foreground hover:text-blue-500 transition-colors shadow-sm"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm("Are you sure you want to retire this skill profile?")) {
                          deleteLabourMutation.mutate(lb.id);
                        }
                      }}
                      className="p-2 bg-background rounded-lg text-muted-foreground hover:text-destructive transition-colors shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <img 
                      src={lb.image_url || `https://i.pravatar.cc/100?u=${lb.id}`} 
                      alt="" 
                      className="w-12 h-12 rounded-xl object-cover bg-muted" 
                    />
                    <div>
                      <p className="font-black text-sm tracking-tight">{lb.skills}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">₹{lb.hourly_rate}/HR</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-widest">Availability</p>
                        <p className="text-[8px] font-bold text-muted-foreground italic uppercase">Ready for immediate hire</p>
                      </div>
                      <Switch 
                        checked={lb.is_available} 
                        onCheckedChange={(checked) => updateLabourMutation.mutate({ id: lb.id, data: { is_available: checked }})} 
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-widest">Marketplace Visibility</p>
                        <p className="text-[8px] font-bold text-muted-foreground italic uppercase">Show profile in public matrix</p>
                      </div>
                      <Switch 
                        checked={lb.is_public} 
                        onCheckedChange={(checked) => updateLabourMutation.mutate({ id: lb.id, data: { is_public: checked }})} 
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!labourServices || labourServices.length === 0) && (
                <div className="col-span-full py-12 text-center bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-muted">
                  <p className="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground italic">No professional services registered</p>
                </div>
              )}
            </div>
          </motion.div>

        </div>

        {/* Skill Registration Modal */}
        <AnimatePresence>
          {showSkillForm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setShowSkillForm(false)}
                 className="absolute inset-0 bg-background/60 backdrop-blur-2xl" 
               />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0, y: 20 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 0.9, opacity: 0, y: 20 }}
                 className="relative w-full max-w-2xl bg-card border-2 border-muted rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] p-12 overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-20 opacity-[0.02] text-blue-600 rotate-12 -mr-10 -mt-10">
                    <HardHat size={300} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h2 className="text-4xl font-black font-heading tracking-tight mb-2 uppercase">
                          {editingLabour ? 'Edit Skill Profile' : 'Skill Profiling'}
                        </h2>
                        <p className="text-muted-foreground font-medium italic">
                          {editingLabour ? 'Refine your professional credentials' : 'Broadcast your expertise to the Agri-Tech network'}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setShowSkillForm(false);
                          setEditingLabour(null);
                        }}
                        className="p-4 bg-muted/50 hover:bg-muted rounded-2xl text-muted-foreground transition-all hover:rotate-90"
                      >
                         <Plus size={24} className="rotate-45" />
                      </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (editingLabour) {
                        updateLabourMutation.mutate({ 
                          id: editingLabour.id, 
                          data: { 
                            ...skillFormData, 
                            hourly_rate: Number(skillFormData.hourly_rate) 
                          } 
                        });
                      } else {
                        handleAddSequence(e);
                      }
                    }} className="space-y-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Specializations (Skills)</label>
                         <div 
                           onClick={() => setShowSkillDrawer(true)}
                           className="w-full bg-muted/30 border-2 border-transparent hover:border-blue-500/20 rounded-2xl p-5 cursor-pointer transition-all flex items-center justify-between"
                         >
                           <span className={cn("font-bold", !skillFormData.skills && "opacity-30")}>
                             {skillFormData.skills || "Select expertise..."}
                           </span>
                           <ChevronRight size={18} className="text-muted-foreground" />
                         </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Professional Portrait</label>
                        <div className="relative group/upload">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            disabled={uploadingImage}
                          />
                          <div className={cn(
                            "w-full bg-muted/30 border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center gap-4",
                            skillFormData.image_url ? "border-green-500/30 bg-green-500/5" : "border-muted-foreground/20 hover:border-blue-500/30",
                            uploadingImage && "animate-pulse"
                          )}>
                            {uploadingImage ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Uploading...</p>
                              </div>
                            ) : skillFormData.image_url ? (
                              <>
                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-xl">
                                  <img src={skillFormData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-white" />
                                  </div>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-green-600 italic">Portrait Synchronized</p>
                              </>
                            ) : (
                              <>
                                <div className="p-5 bg-muted rounded-2xl text-muted-foreground group-hover/upload:text-blue-600 group-hover/upload:bg-blue-50 transition-all">
                                  <Camera size={32} />
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-bold opacity-80 mb-1">Click to Capture or Upload</p>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">PNG, JPG up to 10MB</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Hourly Deployment Rate (₹)</label>
                        <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-blue-600">₹</span>
                          <input required type="number" step="0.01" className="w-full bg-muted/30 border-2 border-transparent focus:border-blue-500/30 focus:bg-background rounded-2xl p-5 pl-12 outline-none transition-all font-black" 
                            value={skillFormData.hourly_rate} onChange={e => setSkillFormData({...skillFormData, hourly_rate: e.target.value})} />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button 
                          type="submit" 
                          disabled={addSkillMutation.isPending || updateLabourMutation.isPending}
                          className="flex-1 bg-blue-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          {addSkillMutation.isPending || updateLabourMutation.isPending ? 'Syncing...' : (editingLabour ? 'Update Skill Profile' : 'Deploy Skill Profile')}
                        </button>
                      </div>
                    </form>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Skill Selection Drawer */}
        <AnimatePresence>
          {showSkillDrawer && (
            <div className="fixed inset-0 z-[110] flex items-end justify-center md:items-center">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSkillDrawer(false)}
                className="absolute inset-0 bg-background/40 backdrop-blur-md"
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-xl bg-card border-t-2 md:border-2 border-muted rounded-t-[3rem] md:rounded-[3.5rem] shadow-2xl p-10 max-h-[80vh] overflow-hidden flex flex-col"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black font-heading uppercase tracking-tight">Select Expertise</h3>
                  <button 
                    onClick={() => setShowSkillDrawer(false)}
                    className="p-3 bg-muted rounded-xl text-muted-foreground hover:scale-110 transition-all"
                  >
                    <Plus size={20} className="rotate-45" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                  {PREDEFINED_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => {
                        setSkillFormData({...skillFormData, skills: skill});
                        setShowSkillDrawer(false);
                      }}
                      className={cn(
                        "w-full p-6 rounded-2xl text-left font-bold transition-all flex items-center justify-between group",
                        skillFormData.skills === skill 
                          ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" 
                          : "bg-muted/30 hover:bg-muted/60"
                      )}
                    >
                      <span>{skill}</span>
                      {skillFormData.skills === skill && <Zap size={16} fill="currentColor" />}
                      <ChevronRight size={16} className={cn("opacity-0 group-hover:opacity-100 transition-opacity", skillFormData.skills === skill && "hidden")} />
                    </button>
                  ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-muted">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center italic">
                    Select a core competency to proceed with profiling
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
}
