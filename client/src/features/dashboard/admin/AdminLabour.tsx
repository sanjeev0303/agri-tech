import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios';
import DashboardLayout from '../../../components/DashboardLayout';
import { HardHat, Trash2, IndianRupee, UserCheck, UserX } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface LabourData {
  id: number;
  skills: string;
  hourly_rate: number;
  is_available: boolean;
  provider_id: number;
}

export default function AdminLabour() {
  const queryClient = useQueryClient();

  const { data: labour, isLoading } = useQuery({
    queryKey: ['adminLabour'],
    queryFn: async () => {
      const res = await apiClient.get<LabourData[]>('/admin/labour');
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/labour/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLabour'] });
    }
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-heading font-black mb-2 tracking-tight">Labour Registry</h1>
          <p className="text-muted-foreground text-lg font-medium">Manage all labour services and workforce listings.</p>
        </header>

        <div className="bg-card border-2 border-muted/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-24 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Loading labour listings...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black">
                  <tr>
                    <th className="px-8 py-6">Skills & Service</th>
                    <th className="px-8 py-6">Hourly Rate</th>
                    <th className="px-8 py-6">Availability</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/50">
                  {labour?.map((l) => (
                    <tr key={l.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <HardHat size={20} />
                          </div>
                          <div>
                            <div className="font-black text-sm uppercase tracking-tight">{l.skills || 'General Labour'}</div>
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Provider ID: #{l.provider_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1 font-black text-primary">
                          <IndianRupee size={12} strokeWidth={3} /> {l.hourly_rate}<span className="text-[10px] text-muted-foreground opacity-50 uppercase tracking-tighter ml-1">/hr</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                          l.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {l.is_available ? <UserCheck size={10} /> : <UserX size={10} />}
                          {l.is_available ? 'Available' : 'Booked'}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => confirm('Remove this listing?') && deleteMutation.mutate(l.id)}
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
