import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import type { RootState } from '../../store';
import { apiClient } from '../../api/axios';
import BookingModal from './BookingModal';
import { Tractor, Info, LogIn, Filter, Search, CheckCircle2, Zap } from 'lucide-react';
import { ListingSkeleton } from '../../components/ListingSkeleton';

interface Equipment {
  id: number;
  name: string;
  type: string;
  hourly_rate: number;
  daily_rate: number;
  is_available: boolean;
  image_url: string;
}

export default function EquipmentListing() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
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
    queryKey: ['publicEquipment'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get<Equipment[]>(`/public/equipment?skip=${pageParam}&limit=12`);
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 12 ? allPages.length * 12 : undefined;
    }
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const equipmentList = data?.pages.flat() || [];

  const isFarmer = user?.role === 'user';

  const filteredList = equipmentList?.filter(eq =>
    eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto min-h-screen space-y-16">
      {/* Decorative Header - Rendered immediately for LCP optimization */}
      <header className="relative py-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full -z-10" />
        <div className="space-y-6">
           <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass border border-primary/20">
              <Tractor className="text-primary" size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Global Asset Matrix</span>
           </div>
           <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter leading-[0.8] italic">
                  Advanced <br /><span className="text-primary">Fleet.</span>
                </h1>
                <p className="text-muted-foreground text-xl font-medium max-w-xl leading-relaxed italic">
                  Premium machinery on-demand. Every unit is strictly telemetry-verified for peak seasonal performance.
                </p>
              </div>

              {/* Advanced Search/Filter Bar */}
              <div className="flex gap-3 w-full lg:w-auto">
                 <div className="relative flex-1 lg:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                    />
                 </div>
                 <button className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all border border-border/50 text-muted-foreground">
                    <Filter size={20} />
                 </button>
              </div>
           </div>
        </div>
      </header>

      {isError ? (
        <div className="py-24 flex items-center justify-center">
          <div className="glass p-12 rounded-[3rem] border-destructive/20 text-center space-y-6 max-w-md">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto text-destructive">
              <Info size={32} />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Telemetry Interrupted</h2>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">Failed to establish secure handshake with the equipment database.</p>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-foreground text-background rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">Retry Protocol</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoading ? (
            <ListingSkeleton />
          ) : !filteredList || filteredList.length === 0 ? (
            <div className="col-span-full text-center py-40 glass rounded-[4rem] space-y-8 border-dashed border-2 border-border/50">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto opacity-20">
                <Tractor size={48} />
              </motion.div>
              <div className="space-y-2">
                <p className="text-3xl font-black uppercase tracking-tighter">No Active Telemetry</p>
                <p className="text-sm font-medium italic text-muted-foreground">Your search criteria did not match any available units in our current synchronization.</p>
              </div>
            </div>
          ) : (
            filteredList.map((eq: Equipment, idx: number) => {
              const isAboveFold = idx < 4;
              return (
                <motion.div
                  key={eq.id}
                  initial={isAboveFold ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: isAboveFold ? 0 : (idx % 12) * 0.1 }}
                  className="group glass rounded-[3rem] p-8 flex flex-col justify-between overflow-hidden shadow-2xl shadow-primary/5 transition-all hover:scale-[1.02] hover:border-primary/40 active:scale-95"
                >
                  {/* Image Section */}
                  <div className="relative mb-8 rounded-[2rem] overflow-hidden aspect-[4/5] bg-muted">
                     <img
                       src={eq.image_url || 'https://images.unsplash.com/photo-1594776208137-aa2d9c44a2aa?q=80&w=400'}
                       alt={eq.name}
                       className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-80"
                       loading={isAboveFold ? "eager" : "lazy"}
                       {...(isAboveFold ? { fetchPriority: "high" } : {})}
                       decoding="async"
                     />
                     <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/50 shadow-lg">
                        <div className="flex items-center gap-1.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                           <span className="text-[8px] font-black uppercase tracking-[0.2em]">{eq.type}</span>
                        </div>
                     </div>
                  </div>

                  <div className="mb-10 space-y-4">
                    <div className="space-y-1 h-14">
                       <h3 className="font-black text-2xl tracking-tighter italic leading-none line-clamp-1">{eq.name}</h3>
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                          <CheckCircle2 size={10} /> Precision Tested
                       </div>
                    </div>

                    <div className="flex items-end justify-between pt-4 border-t border-border/50 h-16">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground italic">Elite Rate</p>
                          <p className="text-3xl font-black tracking-tighter leading-none italic">₹{eq.hourly_rate}<span className="text-xs opacity-40">/HR</span></p>
                       </div>
                       <div className="text-right">
                          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground italic">Daily Saver</p>
                          <p className="text-xl font-black tracking-tighter text-muted-foreground/60 leading-none">₹{eq.daily_rate}</p>
                       </div>
                    </div>
                  </div>

                <div className="space-y-3">
                  {!isAuthenticated ? (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-4 bg-muted/50 hover:bg-primary hover:text-primary-foreground text-muted-foreground font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all border border-transparent hover:border-primary"
                    >
                      <LogIn size={14} />
                      <span>Initialize Portal</span>
                    </button>
                  ) : !isFarmer ? (
                    <div className="w-full py-4 bg-destructive/10 text-destructive text-center font-black text-[10px] uppercase tracking-widest rounded-2xl border border-destructive/20 opacity-60">
                      Restriction: Providers Only
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedEquipment(eq)}
                      className="w-full py-4 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      Initialize Reservation
                    </button>
                  )}
                </div>
              </motion.div>
              )
            })
          )}

          {/* Intersection Observer Trigger - Always rendered in the grid to prevent CLS */}
          <div ref={ref} className="col-span-full h-40 flex flex-col items-center justify-center gap-4">
            {isFetchingNextPage ? (
              <>
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Syncing Next Cluster...</p>
              </>
            ) : hasNextPage ? (
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-30">Scroll to expand matrix</p>
            ) : (equipmentList.length > 0) ? (
              <div className="flex flex-col items-center gap-2 opacity-20">
                <Zap size={24} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">End of Global Fleet</p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {selectedEquipment && (
        <AnimatePresence>
          <BookingModal
            isOpen={true}
            onClose={() => setSelectedEquipment(null)}
            item={selectedEquipment}
            type="equipment"
          />
        </AnimatePresence>
      )}
    </div>
  );
}
