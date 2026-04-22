import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { RootState } from '../../store';
import { apiClient } from '../../api/axios';
import BookingModal from './BookingModal';
import { 
  HardHat, 
  LogIn, 
  Briefcase, 
  Star, 
  Search, 
  Filter, 
  ShieldCheck,
  UserCheck,
  Zap
} from 'lucide-react';

interface Labour {
  id: number;
  skills: string;
  hourly_rate: number;
  is_available: boolean;
  image_url: string;
  provider_name?: string;
}

export default function LabourListing() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [selectedLabour, setSelectedLabour] = useState<Labour | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { ref, inView } = useInView();
  
  const { 
    data, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['publicLabour'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get<Labour[]>(`/public/labour?skip=${pageParam}&limit=12`);
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 12) return undefined;
      return allPages.length * 12;
    },
    initialPageParam: 0
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const labourList = data?.pages.flat() || [];

  const isFarmer = user?.role === 'user';

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <UserCheck size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-black tracking-tighter uppercase italic">Talent Roster Sync</p>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse">Verifying Professional Credentials</p>
        </div>
      </div>
    );
  }

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass p-12 rounded-[3rem] border-destructive/20 text-center space-y-6 max-w-md">
        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto text-destructive">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-black tracking-tight">Handshake Failed</h2>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed">Security protocol could not verify the workforce database. Access denied.</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-foreground text-background rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">Retry Protocol</button>
      </div>
    </div>
  );

  const filteredList = labourList?.filter(lb => 
    lb.skills.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (lb.provider_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto min-h-screen space-y-16">
      <header className="relative py-10">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full -z-10" />
        <div className="space-y-6">
           <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass border border-accent/20">
              <HardHat className="text-accent" size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Elite Personnel Matrix</span>
           </div>
           <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter leading-[0.8] italic">
                  Expert <br /><span className="text-accent">Labour.</span>
                </h1>
                <p className="text-muted-foreground text-xl font-medium max-w-xl leading-relaxed italic">
                  Verified agricultural specialists ready for immediate deployment. Build your seasonal dream team with precision.
                </p>
              </div>

              <div className="flex gap-3 w-full lg:w-auto">
                 <div className="relative flex-1 lg:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search expertise..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-muted/30 border-none focus:ring-2 focus:ring-accent/20 font-bold text-sm"
                    />
                 </div>
                 <button className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all border border-border/50 text-muted-foreground">
                    <Filter size={20} />
                 </button>
              </div>
           </div>
        </div>
      </header>

      {(!filteredList || filteredList.length === 0) ? (
        <div className="text-center py-40 glass rounded-[4rem] space-y-8 border-dashed border-2 border-border/50">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto opacity-20">
            <Briefcase size={48} />
          </motion.div>
          <div className="space-y-2">
            <p className="text-3xl font-black uppercase tracking-tighter">Personnel Offline</p>
            <p className="text-sm font-medium italic text-muted-foreground">No specialists found matching your operational requirements.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredList.map((labour: Labour, idx: number) => (
            <motion.div 
              key={labour.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx % 12) * 0.05 }}
              className="group glass rounded-[3rem] p-8 flex flex-col justify-between overflow-hidden shadow-2xl shadow-accent/5 transition-all hover:scale-[1.02] hover:border-accent/40 active:scale-95"
            >
              <div className="relative mb-8 rounded-[2rem] overflow-hidden aspect-[4/5] bg-muted">
                 <img 
                   src={labour.image_url || `https://i.pravatar.cc/300?u=${labour.id}`} 
                   alt={labour.provider_name || `Professional ${labour.id}`} 
                   className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-80" 
                 />
                 <div className="absolute top-4 right-4 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full flex items-center gap-1.5 border border-border/50 shadow-lg">
                    <Star size={10} className="fill-accent text-accent" strokeWidth={3} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-accent">Top Professional</span>
                 </div>
                 {labour.is_available && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1 bg-emerald-500/80 backdrop-blur-sm rounded-full text-white">
                       <Zap size={10} fill="currentColor" />
                       <span className="text-[8px] font-black uppercase tracking-widest">Available Now</span>
                    </div>
                 )}
              </div>
              
              <div className="mb-10 space-y-6">
                <div className="space-y-1">
                   <h3 className="font-black text-2xl tracking-tighter italic leading-none">{labour.provider_name || `Professional #${labour.id}`}</h3>
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent/60">
                      <ShieldCheck size={10} /> Identity Verified
                   </div>
                </div>

                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-2">
                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Core Competencies</p>
                   <p className="text-xs font-bold leading-relaxed opacity-80 italic line-clamp-2">{labour.skills}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                   <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Recruitment Base</p>
                      <p className="text-3xl font-black tracking-tighter leading-none italic">₹{labour.hourly_rate}<span className="text-xs opacity-40">/HR</span></p>
                   </div>
                   <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => <div key={s} className="w-1.5 h-1.5 rounded-full bg-accent/20" />)}
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                {!isAuthenticated ? (
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full py-4 bg-muted/50 hover:bg-accent hover:text-white text-muted-foreground font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all border border-transparent hover:border-accent"
                  >
                    <LogIn size={14} />
                    <span>Recruit Account</span>
                  </button>
                ) : !isFarmer ? (
                  <div className="w-full py-4 bg-destructive/10 text-destructive text-center font-black text-[10px] uppercase tracking-widest rounded-2xl border border-destructive/20 opacity-60">
                    Access Warning: Farmers Only
                  </div>
                ) : (
                  <button 
                    onClick={() => setSelectedLabour(labour)}
                    className="w-full py-4 bg-accent text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-2xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Recruit Professional
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          
          {/* Intersection Observer Anchor & Loader */}
          <div ref={ref} className="col-span-full py-12 flex flex-col items-center justify-center gap-4">
            {isFetchingNextPage ? (
              <>
                <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Expanding Matrix...</p>
              </>
            ) : hasNextPage ? (
              <div className="w-2 h-2 rounded-full bg-accent/20 animate-ping" />
            ) : labourList.length > 0 ? (
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40 italic">-- End of Workforce Database --</p>
            ) : null}
          </div>
        </div>
      )}

      {selectedLabour && (
        <AnimatePresence>
          <BookingModal 
            isOpen={true} 
            onClose={() => setSelectedLabour(null)} 
            item={{...selectedLabour, name: selectedLabour.provider_name || `Professional #${selectedLabour.id}`}} 
            type="labour" 
          />
        </AnimatePresence>
      )}
    </div>
  );
}
