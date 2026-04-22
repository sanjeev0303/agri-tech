import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios';
import DashboardLayout from '../../../components/DashboardLayout';
import { Trash2, Mail, Phone, Calendar } from 'lucide-react';

interface UserData {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  profile: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

export default function AdminProviders() {
  const queryClient = useQueryClient();

  const { data: providers, isLoading } = useQuery({
    queryKey: ['adminProviders'],
    queryFn: async () => {
      const res = await apiClient.get<UserData[]>('/admin/users');
      return res.data.filter(u => u.role === 'provider' || u.role === 'labour');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiClient.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProviders'] });
    }
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-heading font-black mb-2 tracking-tight">Provider Directory</h1>
          <p className="text-muted-foreground text-lg font-medium">Manage professional accounts and provider access.</p>
        </header>

        <div className="bg-card border-2 border-muted/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-24 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Loading providers...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black">
                  <tr>
                    <th className="px-8 py-6">Provider</th>
                    <th className="px-8 py-6">Joined Date</th>
                    <th className="px-8 py-6">Contact Details</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/50">
                  {providers?.map((emp) => (
                    <tr key={emp.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                            {emp.profile.first_name?.[0]}{emp.profile.last_name?.[0]}
                          </div>
                          <div>
                            <div className="font-black text-sm uppercase tracking-tight">
                              {emp.profile.first_name} {emp.profile.last_name}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">ROLE: {emp.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none bg-muted px-4 py-2 rounded-xl border border-muted-foreground/10 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
                          <Calendar size={12} className="text-primary/70" />
                          <span>{new Date(emp.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1 text-xs font-bold">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail size={12} /> {emp.email}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone size={12} /> {emp.profile.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right space-x-2">
                        <button 
                          onClick={() => confirm('Delete this user?') && deleteMutation.mutate(emp.id)}
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
