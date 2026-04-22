import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Sprout, 
  Tractor, 
  Users, 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  Mail,
  Globe,
  MessageCircle,
  Share2
} from 'lucide-react';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import { ThemeToggle } from '../components/ThemeToggle';
import { cn } from '../lib/utils';
import { Chatbot } from '../components/Chatbot';

export default function Layout() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const navLinks = [
    { name: 'Equipment', path: '/equipment', icon: Tractor },
    { name: 'Labour', path: '/labour', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col w-full bg-background selection:bg-primary/20">
      {/* --- Premium Navbar --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl transition-all duration-300">
        <div className="container flex h-20 items-center justify-between px-6 lg:px-8">
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20"
            >
              <Sprout className="text-primary-foreground" size={24} />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-2xl tracking-tighter gradient-text">Agro-Tech</span>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Precision Farming</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  location.pathname === link.path 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <link.icon size={16} />
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="h-6 w-px bg-border hidden sm:block" />
            
            <nav className="flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="hidden sm:flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-all">
                    <LogIn size={16} /> Login
                  </Link>
                  <Link to="/register/user" className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    Sign Up
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-xs font-black tracking-tight">{user?.email?.split('@')[0]}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-primary">{user?.role}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {user?.role && (
                      <Link 
                        to={`/dashboard/${user.role === 'superadmin' ? 'admin' : user.role}`}
                        className="p-2.5 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all border border-border/50"
                        title="Dashboard"
                      >
                        <LayoutDashboard size={18} />
                      </Link>
                    )}
                    <button 
                      onClick={() => dispatch(logout())} 
                      className="p-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all border border-destructive/20"
                      title="Logout"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 w-full bg-background relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full -z-10" />
        <Outlet />
      </main>

      {/* --- Premium Footer --- */}
      <footer className="bg-muted/30 border-t pt-20 pb-10">
        <div className="container px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <Link to="/" className="flex items-center space-x-3 group w-fit">
                <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                  <Sprout className="text-primary-foreground" size={20} />
                </div>
                <span className="font-heading font-black text-xl tracking-tighter gradient-text">Agro-Tech</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Pioneering the next generation of digital agriculture. We connect future-ready farmers with elite resources to scale global food production.
              </p>
              <div className="flex items-center gap-4">
                {[Globe, MessageCircle, Share2, Mail].map((Icon, i) => (
                  <a key={i} href="#" className="p-2 rounded-lg bg-background border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-foreground/50">Marketplace</h3>
              <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                <li><Link to="/equipment" className="hover:text-primary transition-colors">Equipment Fleet</Link></li>
                <li><Link to="/labour" className="hover:text-primary transition-colors">Professional Personnel</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Agro-Logistics</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Premium Listings</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-foreground/50">Resources</h3>
              <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Analytics Guide</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Farmer Community</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Provider Program</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Tech Documentation</a></li>
              </ul>
            </div>

            <div className="bg-card p-8 rounded-[2.5rem] border border-border/50 shadow-xl space-y-6">
              <h3 className="font-black text-lg tracking-tight">Stay Updated</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">Get the latest agricultural insights and platform updates directly.</p>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full px-5 py-3 rounded-2xl bg-muted/50 border-none text-xs font-bold focus:ring-2 focus:ring-primary/20"
                />
                <button className="absolute right-2 top-1.5 p-1.5 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20">
                  <Mail size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Agro-Tech Operations © 2026 / Precision in Every Acre
            </p>
            <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <a href="#" className="hover:text-foreground">Privacy Protocol</a>
              <a href="#" className="hover:text-foreground">Service Terms</a>
              <a href="#" className="hover:text-foreground">Licensing</a>
            </div>
          </div>
        </div>
      </footer>
      <Chatbot />
    </div>
  );
}
