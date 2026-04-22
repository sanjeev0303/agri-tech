import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import { 
  LayoutDashboard, 
  Users, 
  Tractor, 
  CalendarCheck, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  UserCircle,
  Briefcase,
  HardHat,
  Calendar,
  CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const role = user?.role;

  const links = [
    { name: 'Overview', icon: LayoutDashboard, path: '/dashboard/admin', roles: ['superadmin'] },
    { name: 'User Management', icon: Users, path: '/dashboard/admin/users', roles: ['superadmin'] },
    { name: 'Farmers', icon: HardHat, path: '/dashboard/admin/farmers', roles: ['superadmin'] },
    { name: 'Providers', icon: Briefcase, path: '/dashboard/admin/providers', roles: ['superadmin'] },
    { name: 'Equipment', icon: Tractor, path: '/dashboard/admin/equipment', roles: ['superadmin'] },
    { name: 'Labour', icon: HardHat, path: '/dashboard/admin/labour', roles: ['superadmin'] },
    { name: 'Bookings', icon: Calendar, path: '/dashboard/admin/bookings', roles: ['superadmin'] },
    
    // Provider Links
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/provider', roles: ['provider'] },
    { name: 'Service Deployments', icon: CalendarCheck, path: '/dashboard/provider/bookings', roles: ['provider'] },
    { name: 'My Equipment', icon: Tractor, path: '/dashboard/provider/equipment', roles: ['provider'] },
    
    // Labour Links
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/labour', roles: ['labour'] },
    { name: 'My Deployments', icon: CalendarCheck, path: '/dashboard/labour/bookings', roles: ['labour'] },

    // User Links
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/user', roles: ['user'] },
    { name: 'My Bookings', icon: CalendarCheck, path: '/dashboard/user/bookings', roles: ['user'] },
    
    // Common
    { name: 'Profile', icon: UserCircle, path: '/profile', roles: ['superadmin', 'provider', 'labour', 'user'] },
    { name: 'Payments', icon: CreditCard, path: role === 'superadmin' ? '/dashboard/admin/payments' : (role === 'labour' ? '/dashboard/labour/payments' : '/dashboard/provider/payments'), roles: ['superadmin', 'provider', 'labour'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['superadmin', 'provider', 'labour', 'user'] },
  ];

  const filteredLinks = links.filter(link => role && link.roles.includes(role));

  return (
    <aside 
      className={cn(
        "h-screen sticky top-0 bg-white dark:bg-card border-r border-slate-200 dark:border-muted/30 transition-all duration-300 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-[100]",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
            Agro-Tech
          </span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {filteredLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <link.icon size={22} className={cn(isCollapsed ? "mx-auto" : "")} />
            {!isCollapsed && <span className="font-medium whitespace-nowrap">{link.name}</span>}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border shadow-sm">
                {link.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User info */}
      <div className="p-4 border-t border-muted">
        <div className={cn("flex flex-col gap-2", isCollapsed ? "items-center" : "")}>
          {!isCollapsed && (
            <div className="px-2 mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Signed in as</p>
              <p className="text-sm font-bold truncate max-w-[180px]">{user?.email}</p>
              <p className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block mt-1 font-bold">
                {role?.toUpperCase()}
              </p>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-4 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors w-full",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <LogOut size={22} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
