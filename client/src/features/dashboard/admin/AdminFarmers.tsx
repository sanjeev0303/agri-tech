import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios';
import DashboardLayout from '../../../components/DashboardLayout';
import { Trash2, Mail, Phone } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface UserData {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  profile: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

export default function AdminFarmers() {
  const queryClient = useQueryClient();

  const { data: farmers, isLoading } = useQuery({
    queryKey: ['adminFarmers'],
    queryFn: async () => {
      const res = await apiClient.get<UserData[]>('/admin/users?role=user');
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiClient.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFarmers'] });
    }
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-heading font-black mb-2 tracking-tight">Farmer Management</h1>
          <p className="text-muted-foreground text-lg font-medium">Oversee registered farmers and their accounts.</p>
        </header>

        <div className="bg-card border-2 border-muted/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-24 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Loading farmers...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black">
                  <tr>
                    <th className="px-8 py-6">Farmer</th>
                    <th className="px-8 py-6">Contact Info</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/50">
                  {farmers?.map((f) => (
                    <tr key={f.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                            {f.profile.first_name?.[0]}{f.profile.last_name?.[0]}
                          </div>
                          <div>
                            <div className="font-black text-sm uppercase tracking-tight">
                              {f.profile.first_name} {f.profile.last_name}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-bold uppercase">ID: {f.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1 text-xs font-bold">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail size={12} /> {f.email}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone size={12} /> {f.profile.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          f.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {f.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => confirm('Delete this user?') && deleteMutation.mutate(f.id)}
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
