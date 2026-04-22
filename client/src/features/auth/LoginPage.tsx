import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, Cpu } from 'lucide-react';
import { apiClient } from '../../api/axios';
import { setCredentials } from '../../store/authSlice';
import { AuthBackground } from '../../components/AuthBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const res = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const meRes = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${res.data.access_token}`}
      });

      dispatch(setCredentials({ user: meRes.data, token: res.data.access_token }));
      
      const role = meRes.data.role;
      if (role === 'superadmin') navigate('/dashboard/admin');
      else if (role === 'employee') navigate('/dashboard/employee');
      else navigate('/dashboard/user');
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background py-12 px-4 sm:px-6 lg:px-8">
      <AuthBackground />

      <div className="container max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Visual Storytelling */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block space-y-12"
        >
          <div className="space-y-6">
            <h1 className="text-7xl font-heading font-black tracking-tighter leading-none italic">
              Welcome back to <br />
              <span className="gradient-text">Agri-Tech.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium max-w-md leading-relaxed">
              The neural center of your agricultural ecosystem. Synchronize your data, manage your fleet, and scale your yield.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {[
              { icon: ShieldCheck, title: "Secure Access", desc: "Enterprise-grade identity management" },
              { icon: Zap, title: "Real-time Sync", desc: "Instant telemetry & operational data" },
              { icon: Cpu, title: "AI Insights", desc: "Predictive analytics for your harvest" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-6 p-6 glass rounded-3xl border-primary/10 group hover:bg-primary/5 transition-all"
              >
                <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                  <item.icon size={24} />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest">{item.title}</h4>
                  <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="glass rounded-[3rem] p-10 md:p-12 border-primary/20 shadow-2xl space-y-10 relative overflow-hidden backdrop-blur-2xl">
            {/* Absolute Decorative SVG */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Zap size={100} className="text-primary rotate-12" />
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-black tracking-tight">Access Portal</h2>
              <p className="text-xs font-black uppercase tracking-widest text-primary/60">Initialize Session</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest rounded-2xl text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 opacity-50">Operational Email</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium"
                    placeholder="farmer@ecosystem.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 opacity-50">Encryption Key</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3 overflow-hidden group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-6 border-t border-border/50 text-center space-y-4">
              <p className="text-xs font-medium text-muted-foreground">
                First time here? <Link to="/register/user" className="text-primary font-black uppercase tracking-widest hover:underline px-2">Register Portfolio</Link>
              </p>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30 italic">Proprietary Access v2.4.0</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
