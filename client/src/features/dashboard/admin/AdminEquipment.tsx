import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios';
import DashboardLayout from '../../../components/DashboardLayout';
import { Tractor, Trash2, IndianRupee, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

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

export default function AdminEquipment() {
  const queryClient = useQueryClient();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['adminEquipment'],
    queryFn: async () => {
      const res = await apiClient.get<EquipmentData[]>('/admin/equipment');
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/equipment/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEquipment'] });
    }
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-heading font-black mb-2 tracking-tight">Equipment Inventory</h1>
          <p className="text-muted-foreground text-lg font-medium">Manage all agricultural machinery listed on the platform.</p>
        </header>

        <div className="bg-card border-2 border-muted/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-24 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Loading equipment...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black">
                  <tr>
                    <th className="px-8 py-6">Machine Details</th>
                    <th className="px-8 py-6">Pricing</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/50">
                  {equipment?.map((eq) => (
                    <tr key={eq.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300 bg-muted/50 border border-muted-foreground/10">
                            {eq.image_url ? (
                              <img 
                                src={eq.image_url} 
                                alt={eq.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg"
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary bg-primary/10">
                                <Tractor size={24} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-black text-sm uppercase tracking-tight">{eq.name}</div>
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{eq.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 font-black text-primary">
                             <IndianRupee size={12} strokeWidth={3} /> {eq.hourly_rate}<span className="text-[10px] text-muted-foreground opacity-50 uppercase tracking-tighter">/hr</span>
                          </div>
                          <div className="flex items-center gap-1 font-black text-primary">
                             <IndianRupee size={12} strokeWidth={3} /> {eq.daily_rate}<span className="text-[10px] text-muted-foreground opacity-50 uppercase tracking-tighter">/day</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                          eq.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {eq.is_available ? <CheckCircle size={10} /> : <XCircle size={10} />}
                          {eq.is_available ? 'Available' : 'Unavailable'}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => confirm('Remove this listing?') && deleteMutation.mutate(eq.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
