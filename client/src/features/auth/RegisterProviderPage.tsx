import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Phone, ArrowRight, Briefcase, Star, Cpu, Tractor } from 'lucide-react';
import { apiClient } from '../../api/axios';
import { AuthBackground } from '../../components/AuthBackground';
import { cn } from '../../lib/utils';

export default function RegisterProviderPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'provider' as 'provider' | 'labour'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/register/provider', formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Technical synchronization error.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectRole = (role: 'provider' | 'labour') => {
    setFormData(prev => ({ ...prev, role }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background py-16 px-4 sm:px-6 lg:px-8">
      <AuthBackground />

      <div className="container max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side: Visual Storytelling */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block space-y-12"
        >
          <div className="space-y-6">
            <h1 className="text-7xl font-heading font-black tracking-tighter leading-[0.8] italic">
              Scale Your <br />
              <span className="gradient-text italic font-heading">Expertise.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium max-w-md leading-relaxed">
              Join the elite workforce of Agri-Tech providers. Deploy your skills, equipment, and labor on the most advanced agricultural marketplace.
            </p>
          </div>

          <div className="space-y-8">
            {[
              { icon: Briefcase, title: "Global Opportunities", desc: "Access high-value contracts from modern farms" },
              { icon: Star, title: "Performance Alpha", desc: "Build your reputation with verified ratings" },
              { icon: Cpu, title: "Automated Workflow", desc: "Manage deployments with precision telemetry" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-6 group"
              >
                <div className="p-4 bg-accent/10 rounded-2xl text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
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

        {/* Right Side: Registration Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-xl mx-auto"
        >
          <div className="glass rounded-[3rem] p-8 md:p-12 border-accent/20 shadow-2xl space-y-8 relative overflow-hidden backdrop-blur-2xl">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-black tracking-tight italic">Provider Portfolio</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/60 italic">Provider / Specialist Portal</p>
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

            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Role Selection */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => selectRole('provider')}
                  className={cn(
                    "p-6 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden group/role",
                    formData.role === 'provider' 
                      ? "bg-accent/10 border-accent shadow-lg shadow-accent/20" 
                      : "bg-muted/30 border-transparent hover:border-accent/30"
                  )}
                >
                  <div className="relative z-10">
                    <Tractor size={24} className={cn("mb-3", formData.role === 'provider' ? "text-accent" : "text-muted-foreground")} />
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Equipment</p>
                    <p className="text-xs font-bold opacity-60">Fleet Owner</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => selectRole('labour')}
                  className={cn(
                    "p-6 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden group/role",
                    formData.role === 'labour' 
                      ? "bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/20" 
                      : "bg-muted/30 border-transparent hover:border-blue-500/30"
                  )}
                >
                  <div className="relative z-10">
                    <Briefcase size={24} className={cn("mb-3", formData.role === 'labour' ? "text-blue-500" : "text-muted-foreground")} />
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Specialist</p>
                    <p className="text-xs font-bold opacity-60">Agri-Labour</p>
                  </div>
                </button>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 opacity-50">Legal First Name</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={18} />
                    <input
                      type="text"
                      name="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full pl-14 pr-6 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none font-medium"
                      placeholder="John"
                    />
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 opacity-50">Legal Last Name</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={18} />
                    <input
                      type="text"
                      name="last_name"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full pl-14 pr-6 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none font-medium"
                      placeholder="Doe"
                    />
                  </div>
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 opacity-50">Professional Email</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={18} />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-14 pr-6 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none font-medium"
                    placeholder="provider@ecosystem.com"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 opacity-50">Secure Password</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-14 pr-14 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 opacity-50">Dispatch Contact (Phone)</label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-14 pr-6 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none font-medium"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </motion.div>

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-accent-foreground py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3 overflow-hidden group mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Initialize Professional Profile <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.form>

            <motion.div 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="pt-8 border-t border-border/50 text-center"
            >
              <p className="text-xs font-medium text-muted-foreground">
                Already part of the network? <Link to="/login" className="text-accent font-black uppercase tracking-widest hover:underline px-2">Log in here</Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
