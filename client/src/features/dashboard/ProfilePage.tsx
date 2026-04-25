import { useSelector, useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/axios';
import type { RootState } from '../../store';
import { updateUser } from '../../store/authSlice';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Phone, 
  MapPin, 
  Camera, 
  Zap, 
  Fingerprint, 
  Activity,
  Award,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: profile, isPending, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await apiClient.get('/user/profile');
      return res.data;
    },
    placeholderData: user?.profile
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await apiClient.patch('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(updateUser({ profile: data }));
      refetch();
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadMutation.mutate(e.target.files[0]);
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

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-16 px-6 sm:px-10">
        {/* Header / Avatar Section - Rendered immediately for LCP optimization */}
        <header className="mb-20 text-center relative">
          <div className="relative inline-block group">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full group-hover:bg-primary/40 transition-all duration-700" />
            
            <div className="relative w-48 h-48 rounded-[4rem] bg-gradient-to-br from-primary to-emerald-600 p-[3px] shadow-2xl transform group-hover:rotate-6 transition-transform duration-500">
               <div className="w-full h-full rounded-[3.8rem] bg-background flex flex-col items-center justify-center overflow-hidden">
                  {profile?.image_url ? (
                    <img src={profile.image_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-7xl font-black text-primary italic leading-none">{user?.email?.[0].toUpperCase() || 'U'}</span>
                  )}
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors" />
               </div>
            </div>

            <label className="absolute bottom-2 right-2 p-4 bg-white dark:bg-card border-4 border-background rounded-[1.5rem] shadow-2xl hover:scale-110 active:scale-90 transition-all z-10 cursor-pointer">
              <Camera size={20} className="text-primary" />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={uploadMutation.isPending} />
              {uploadMutation.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-[1.5rem]">
                   <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </label>
          </div>

          <div className="mt-8 space-y-3">
            <h1 className="text-6xl font-heading font-black tracking-tighter leading-none bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent italic uppercase">
              {user?.email?.split('@')[0] || 'User Node'}
            </h1>
            <div className="flex items-center justify-center gap-4">
              <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <Shield size={10} strokeWidth={3} />
                {user?.role || 'GUEST'} ACCESS
              </span>
              <span className="px-4 py-1.5 bg-muted rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 border border-muted-foreground/10">
                <Activity size={10} strokeWidth={3} />
                Global Verified
              </span>
            </div>
          </div>
        </header>

        {isPending && !profile ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse italic">Synchronizing Identity Node...</p>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-10"
          >
          {/* Account Integrity Panel */}
          <motion.div variants={itemVariants} className="bg-card border-2 border-muted/50 rounded-[3.5rem] p-12 shadow-2xl shadow-primary/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-primary group-hover:scale-110 transition-transform pointer-events-none">
               <Fingerprint size={180} />
            </div>
            
            <h3 className="text-2xl font-black font-heading mb-10 flex items-center gap-4 italic">
               <Shield size={24} className="text-primary not-italic" />
               Account <span className="text-primary not-italic">Security</span>
            </h3>
            
            <div className="space-y-8">
              <ProfileItem icon={Mail} label="Authenticated Uplink" value={user?.email} />
              <ProfileItem icon={Award} label="System Authority" value={`${user?.role?.toUpperCase()} NODE`} />
              <ProfileItem icon={Calendar} label="Network Ingress" value="APRIL 2024 (GEN-1)" />
            </div>
            
            <div className="mt-12 pt-8 border-t border-muted/50 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">
               <span>Enforced by Agri-Trust v2.4</span>
               <Zap size={14} />
            </div>
          </motion.div>

          {/* Infrastructure Details Panel */}
          <motion.div variants={itemVariants} className="bg-card border-2 border-muted/50 rounded-[3.5rem] p-12 shadow-2xl shadow-primary/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-blue-500 group-hover:scale-110 transition-transform pointer-events-none">
               <Activity size={180} />
            </div>

            <h3 className="text-2xl font-black font-heading mb-10 flex items-center gap-4 italic">
               <User size={24} className="text-blue-500 not-italic" />
               Personnel <span className="text-blue-500 not-italic">Bio</span>
            </h3>

            <div className="space-y-8">
              <ProfileItem icon={Phone} label="Direct Comms" value={profile?.phone || "+91 00000-00000"} color="blue" />
              <ProfileItem icon={MapPin} label="Geospatial Node" value="KARNATAKA, INDIA (REGION-4)" color="blue" />
              <ProfileItem icon={Zap} label="Response Profile" value="HIGH PERFORMANCE" color="blue" />
            </div>

            <div className="mt-12">
               <button className="group w-full py-5 bg-foreground text-background font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95">
                  Update Identity Credentials
                  <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}

        {/* System Activity Summary (Extra Section for Premium Feel) */}
        <motion.div variants={itemVariants} className="mt-10 p-12 bg-primary/5 border-2 border-primary/20 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-8 group">
           <div className="flex items-center gap-6">
              <div className="p-5 bg-primary/10 rounded-3xl text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                 <Award size={32} strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                 <h4 className="text-xl font-black font-heading uppercase tracking-tight">Trust Score Verified</h4>
                 <p className="text-xs text-muted-foreground font-medium italic">You are in the top 5% of verified service providers this quarter.</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Reputation Index</p>
              <p className="text-5xl font-black font-heading tracking-tighter">9.8</p>
           </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function ProfileItem({ icon: Icon, label, value, color = "primary" }: { icon: any, label: string, value?: string, color?: "primary" | "blue" }) {
  const colorMap = {
    primary: "text-primary bg-primary/10 border-primary/10",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/10"
  };

  return (
    <div className="flex items-center gap-6 group/item cursor-default">
      <div className={cn("p-4 rounded-2xl border transition-all duration-300 group-hover/item:scale-110 shadow-lg", colorMap[color])}>
        <Icon size={20} strokeWidth={3} />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">{label}</p>
        <p className="text-lg font-black tracking-tight text-foreground">{value || 'NOT REGISTERED'}</p>
      </div>
    </div>
  );
}
