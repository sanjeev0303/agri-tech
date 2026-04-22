import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios';
import DashboardLayout from '../../../components/DashboardLayout';
import { Trash2, CheckCircle, XCircle, Clock, IndianRupee } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface BookingData {
  id: number;
  user_id: number;
  equipment_id?: number;
  labour_id?: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_price: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

export default function AdminBookings() {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: async () => {
      const res = await apiClient.get<BookingData[]>('/admin/bookings');
      return res.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await apiClient.patch(`/admin/bookings/${id}/status?status=${status}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/bookings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-heading font-black mb-2 tracking-tight">Global Transaction Log</h1>
          <p className="text-muted-foreground text-lg font-medium">Monitor and manage all bookings across the platform.</p>
        </header>

        <div className="bg-card border-2 border-muted/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-24 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Loading bookings...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black">
                  <tr>
                    <th className="px-8 py-6">Booking ID</th>
                    <th className="px-8 py-6">Details</th>
                    <th className="px-8 py-6">Schedule</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/50">
                  {bookings?.map((b) => (
                    <tr key={b.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-8 py-6 text-xs font-black text-muted-foreground">#BK-{b.id}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-sm uppercase tracking-tight">
                            {b.equipment_id ? 'Equipment' : 'Labour Service'}
                          </span>
                          <div className="flex items-center gap-1 font-black text-primary text-xs">
                             <IndianRupee size={10} strokeWidth={3} /> {b.total_price}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-[10px] font-black text-muted-foreground uppercase leading-none space-y-1">
                           <div className="flex items-center gap-1"><Clock size={10} /> {new Date(b.start_time).toLocaleDateString()}</div>
                           <div className="flex items-center gap-1"><Clock size={10} /> {new Date(b.end_time).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", getStatusColor(b.status))}>
                            {b.status}
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right flex items-center justify-end gap-2">
                        {b.status === 'pending' && (
                          <button 
                            onClick={() => updateStatusMutation.mutate({ id: b.id, status: 'confirmed' })}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Confirm Booking"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => confirm('Cancel this booking?') && updateStatusMutation.mutate({ id: b.id, status: 'cancelled' })}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Cancel Booking"
                        >
                          <XCircle size={18} />
                        </button>
                        <button 
                          onClick={() => confirm('Delete entry?') && deleteMutation.mutate(b.id)}
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
