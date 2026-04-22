import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios';
import DashboardLayout from '../../../components/DashboardLayout';
import { cn } from '../../../lib/utils';
import { UserMinus, Shield, UserCheck, ShieldAlert } from 'lucide-react';

interface UserData {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminUserManagement() {
  const queryClient = useQueryClient();

  // Fetch Users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await apiClient.get<UserData[]>('/admin/users');
      return res.data;
    }
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiClient.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    }
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-heading font-black mb-2 tracking-tight">User Management</h1>
          <p className="text-muted-foreground text-lg font-medium italic">Administrative control over all system accounts.</p>
        </header>

        <div className="bg-white dark:bg-card border-2 border-slate-100 dark:border-muted/20 rounded-[2.5rem] shadow-2xl shadow-primary/5 overflow-hidden">
          <div className="px-8 py-6 border-b border-muted/20 flex justify-between items-center bg-muted/5">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-primary/10 text-primary rounded-xl">
                 <Shield size={20} />
               </div>
               <h2 className="text-xl font-bold font-heading">System Users</h2>
            </div>
          </div>

          {usersLoading ? (
            <div className="p-24 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Accessing Personnel Files...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black">
                  <tr>
                    <th className="px-8 py-6">ID</th>
                    <th className="px-8 py-6">Account</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/50">
                  {users?.map((u) => (
                    <tr key={u.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded">#{u.id}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-sm uppercase tracking-tight">{u.email}</span>
                          <div className="flex items-center gap-2 mt-1">
                             {u.role === 'superadmin' ? <ShieldAlert size={10} className="text-red-500" /> : <UserCheck size={10} className="text-primary" />}
                             <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">{u.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                          u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         {u.role !== 'superadmin' && (
                           <button 
                            onClick={() => confirm('Are you sure you want to delete this user?') && deleteMutation.mutate(u.id)}
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all group-hover:scale-110 active:scale-95"
                            title="Delete User"
                          >
                            <UserMinus size={18} />
                          </button>
                         )}
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
