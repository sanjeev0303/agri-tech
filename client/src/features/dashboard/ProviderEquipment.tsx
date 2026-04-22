import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Tractor, 
  Trash2, 
  Plus, 
  Layers,
  Eye, 
  EyeOff, 
  Settings2,
  Save,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EquipmentData {
  id: number;
  name: string;
  type: string;
  image_url: string;
  hourly_rate: number;
  daily_rate: number;
  is_available: boolean;
  owner_id: number;
}

const EQUIPMENT_TYPES = ['Tractor', 'Harvester', 'Plow', 'Seeder', 'Sprayer', 'Baler'];

export default function ProviderEquipment() {
  const queryClient = useQueryClient();
  const [showEqForm, setShowEqForm] = useState(false);
  const [eqFormData, setEqFormData] = useState({ name: '', type: 'Tractor', image_url: '', hourly_rate: '', daily_rate: '' });

  // Manage popup state
  const [managingEq, setManagingEq] = useState<EquipmentData | null>(null);
  const [manageForm, setManageForm] = useState<Partial<EquipmentData>>({});

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['providerEquipment'],
    queryFn: async () => {
      const res = await apiClient.get<EquipmentData[]>('/provider/equipment');
      return res.data;
    }
  });

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
      queryClient.invalidateQueries({ queryKey: ['providerEquipment'] });
    }
  });

  const updateEqMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EquipmentData> }) => {
      const res = await apiClient.put<EquipmentData>(`/provider/equipment/${id}`, {
        ...data,
        hourly_rate: data.hourly_rate !== undefined ? Number(data.hourly_rate) : undefined,
        daily_rate: data.daily_rate !== undefined ? Number(data.daily_rate) : undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      setManagingEq(null);
      queryClient.invalidateQueries({ queryKey: ['providerEquipment'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/provider/equipment/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerEquipment'] });
    }
  });

  function handleAddSequence(e: React.FormEvent) {
    e.preventDefault();
    addEqMutation.mutate(eqFormData);
  }

  function openManage(eq: EquipmentData) {
    setManagingEq(eq);
    setManageForm({
      name: eq.name,
      type: eq.type,
      image_url: eq.image_url,
      hourly_rate: eq.hourly_rate,
      daily_rate: eq.daily_rate,
      is_available: eq.is_available,
    });
  }

  function isValidImageUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return u.protocol === 'https:' || u.protocol === 'http:';
    } catch {
      return false;
    }
  }

  function handleManageSave(e: React.FormEvent) {
    e.preventDefault();
    if (!managingEq) return;
    updateEqMutation.mutate({ id: managingEq.id, data: manageForm });
  }

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
        className="max-w-[1600px] mx-auto space-y-10 pb-20 px-6 sm:px-10"
      >
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Layers size={10} strokeWidth={3} />
              Inventory Intelligence
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-6xl font-heading font-black tracking-tight leading-none bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent italic">
              Asset <span className="text-primary not-italic">Matrix</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg font-medium max-w-xl">
              Monitor, rotate, and scale your machinery fleet via the unified marketplace gateway.
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
                  Register New Machine
                </div>
             </button>
          </motion.div>
        </header>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoading ? (
             [...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-[3rem]" />
             ))
          ) : equipment?.length === 0 ? (
            <motion.div variants={itemVariants} className="col-span-full py-32 text-center space-y-6 bg-card border-2 border-dashed border-muted rounded-[3.5rem] shadow-2xl shadow-primary/5">
                <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground opacity-30">
                  <Tractor size={48} strokeWidth={1} />
                </div>
                <div>
                   <h3 className="text-2xl font-black font-heading mb-2 uppercase tracking-tight">Zero-Stock Inventory</h3>
                   <p className="text-muted-foreground max-w-sm mx-auto italic font-medium">Your platform assets will appear here once registered through the uplink portal.</p>
                </div>
                <button 
                   onClick={() => setShowEqForm(true)}
                   className="px-8 py-3 bg-muted hover:bg-muted/80 text-foreground font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                >
                   Initiate Supply Flow
                </button>
            </motion.div>
          ) : (
            equipment?.map((eq) => (
              <motion.div 
                key={eq.id} 
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="group relative aspect-[4/5] bg-card rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/5 border-2 border-transparent hover:border-primary/20 transition-all cursor-default"
              >
                {/* Background Image with Mesh Overlay */}
                <div className="absolute inset-0 z-0">
                   <img 
                      src={eq.image_url || "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg"} 
                      alt={eq.name} 
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg"; }}
                      className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 z-10 p-10 flex flex-col justify-between text-white">
                   <div className="flex justify-between items-start">
                      <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
                         {eq.type}
                      </div>
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20",
                        eq.is_available ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      )}>
                         {eq.is_available ? <Eye size={18} /> : <EyeOff size={18} />}
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1">Unit ID: {eq.id.toString().padStart(4, '0')}</p>
                        <h2 className="text-3xl font-black font-heading leading-tight uppercase tracking-tight">{eq.name}</h2>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 group-hover:bg-white/20 transition-colors">
                            <p className="text-[8px] font-black uppercase text-white/50 mb-1 tracking-widest">Hourly</p>
                            <p className="text-lg font-black tracking-tighter">₹{eq.hourly_rate.toLocaleString()}</p>
                         </div>
                         <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 group-hover:bg-white/20 transition-colors">
                            <p className="text-[8px] font-black uppercase text-white/50 mb-1 tracking-widest">Daily</p>
                            <p className="text-lg font-black tracking-tighter">₹{eq.daily_rate.toLocaleString()}</p>
                         </div>
                      </div>

                      <div className="flex gap-3 mt-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                         <button
                            onClick={() => openManage(eq)}
                            className="flex-1 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2"
                         >
                            <Settings2 size={12} />
                            Manage
                         </button>
                         <button 
                            disabled={deleteMutation.isPending}
                            onClick={() => confirm('Archived assets cannot be booked. Remove this listing?') && deleteMutation.mutate(eq.id)}
                            className="w-12 h-12 flex items-center justify-center bg-red-500/80 hover:bg-red-600 text-white rounded-xl transition-colors backdrop-blur-md"
                         >
                            <Trash2 size={18} />
                         </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Add Equipment Modal */}
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
                  <div className="absolute top-0 right-0 p-20 opacity-[0.02] text-primary rotate-12 -mr-10 -mt-10 pointer-events-none">
                    <Tractor size={300} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h2 className="text-4xl font-black font-heading tracking-tight mb-2 uppercase italic">Asset <span className="text-primary not-italic">Setup</span></h2>
                        <p className="text-muted-foreground font-medium italic">Broadcast your machinery to the global network.</p>
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
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Friendly Marker</label>
                           <input 
                             required 
                             placeholder="e.g. John Deere 5050D"
                             className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background rounded-2xl p-5 outline-none transition-all font-bold placeholder:opacity-30"
                             value={eqFormData.name} onChange={e => setEqFormData({...eqFormData, name: e.target.value})} 
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Unit Classification</label>
                           <select 
                             className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background rounded-2xl p-5 outline-none transition-all font-black appearance-none"
                             value={eqFormData.type} onChange={e => setEqFormData({...eqFormData, type: e.target.value})}
                           >
                             {EQUIPMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                           </select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Asset Imagery (Direct URL)</label>
                        <input 
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
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Daily Cap (₹)</label>
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
                          {addEqMutation.isPending ? 'Syncing...' : 'Initiate Broadcast'}
                        </button>
                      </div>
                    </form>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Manage Equipment Modal */}
        <AnimatePresence>
          {managingEq && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setManagingEq(null)}
                className="absolute inset-0 bg-background/60 backdrop-blur-2xl" 
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl bg-card border-2 border-muted rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] p-12 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-20 opacity-[0.02] text-primary rotate-12 -mr-10 -mt-10 pointer-events-none">
                  <Settings2 size={300} />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Unit ID: {managingEq.id.toString().padStart(4, '0')}</p>
                      <h2 className="text-4xl font-black font-heading tracking-tight mb-2 uppercase italic">
                        Manage <span className="text-primary not-italic">Asset</span>
                      </h2>
                      <p className="text-muted-foreground font-medium italic">Update listing parameters for <span className="text-foreground font-black">{managingEq.name}</span>.</p>
                    </div>
                    <button 
                      onClick={() => setManagingEq(null)}
                      className="p-4 bg-muted/50 hover:bg-muted rounded-2xl text-muted-foreground transition-all hover:rotate-90"
                    >
                      <Plus size={24} className="rotate-45" />
                    </button>
                  </div>

                  <form onSubmit={handleManageSave} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Friendly Marker</label>
                        <input 
                          required
                          className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background rounded-2xl p-5 outline-none transition-all font-bold"
                          value={manageForm.name || ''}
                          onChange={e => setManageForm({...manageForm, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Unit Classification</label>
                        <select
                          className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background rounded-2xl p-5 outline-none transition-all font-black appearance-none"
                          value={manageForm.type || 'Tractor'}
                          onChange={e => setManageForm({...manageForm, type: e.target.value})}
                        >
                          {EQUIPMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Asset Imagery (Direct URL)</label>
                      <input 
                        className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background rounded-2xl p-5 outline-none transition-all font-bold placeholder:opacity-30"
                        placeholder="https://images.pexels.com/..."
                        value={manageForm.image_url || ''}
                        onChange={e => setManageForm({...manageForm, image_url: e.target.value})}
                      />
                      {manageForm.image_url && !isValidImageUrl(manageForm.image_url) && (
                        <p className="text-[10px] text-red-500 font-black ml-1">⚠ Invalid URL — must start with http:// or https://</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Hourly Revenue (₹)</label>
                        <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary">₹</span>
                          <input
                            required
                            type="number"
                            step="0.01"
                            className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background rounded-2xl p-5 pl-12 outline-none transition-all font-black"
                            value={manageForm.hourly_rate ?? ''}
                            onChange={e => setManageForm({...manageForm, hourly_rate: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Daily Cap (₹)</label>
                        <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary">₹</span>
                          <input
                            required
                            type="number"
                            step="0.01"
                            className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background rounded-2xl p-5 pl-12 outline-none transition-all font-black"
                            value={manageForm.daily_rate ?? ''}
                            onChange={e => setManageForm({...manageForm, daily_rate: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Availability Toggle */}
                    <div className="flex items-center justify-between p-6 bg-muted/30 rounded-2xl border-2 border-transparent hover:border-primary/20 transition-all">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-0.5">Marketplace Visibility</p>
                        <p className="font-black text-sm">
                          {manageForm.is_available ? (
                            <span className="text-green-500">Active — Listed on marketplace</span>
                          ) : (
                            <span className="text-red-400">Inactive — Hidden from marketplace</span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setManageForm({...manageForm, is_available: !manageForm.is_available})}
                        className="transition-transform active:scale-90"
                      >
                        {manageForm.is_available ? (
                          <ToggleRight size={52} className="text-green-500" />
                        ) : (
                          <ToggleLeft size={52} className="text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => setManagingEq(null)}
                        className="px-8 py-5 bg-muted hover:bg-muted/80 text-foreground font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={updateEqMutation.isPending}
                        className="flex-1 bg-primary text-primary-foreground py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        <Save size={14} />
                        {updateEqMutation.isPending ? 'Saving...' : 'Save Changes'}
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
