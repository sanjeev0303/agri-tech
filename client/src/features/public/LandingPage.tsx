import { motion, useScroll } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  Cpu,
  Database,
  Globe,
  LineChart,
  Microscope,
  Radio,
  Server,
  ShieldCheck,
  Sprout,
  Star,
  Target,
  Tractor,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";
// @ts-ignore
import "swiper/css/pagination";
// @ts-ignore
import "swiper/css/effect-coverflow";

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground selection:bg-primary/20 relative overflow-hidden">
      <GlobalBackground />
      <HeroSection />
      <ValueProposition />
      <ImmersiveShowcase />
      <BentoMarketplace />
      <TechEcosystem />
      <AnalyticsSection />
      <SeasonLifecycle />
      <ProcessJourney />
      <EfficiencyIntelligence />
      <EquipmentSection />
      <GlobalImpact />
      <GlobalNetwork />
      <FinalCTASection />
    </div>
  );
}

// --- Section 1: Premium Hero ---
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden py-20 lg:py-0">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
        <img
          src="https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Agriculture backdrop"
          className="w-full h-full object-cover grayscale"
        />
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-10"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass border border-primary/20">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] font-accent text-primary">
              Agriculture 4.0 Ecosystem
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-heading font-black leading-[0.9] tracking-tighter">
            Precision <br />
            <span className="gradient-text italic">Agriculture</span>
            <br />
            Reimagined.
          </h1>

          <p className="text-xl text-muted-foreground font-medium max-w-xl leading-relaxed">
            The elite marketplace connecting sustainable farmers with
            high-performance machinery and verified agricultural professionals.
          </p>

          <div className="flex flex-wrap gap-6 pt-4">
            <Link
              to="/register/user"
              className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              Get Started <ArrowRight size={16} strokeWidth={3} />
            </Link>
            <Link
              to="/register/provider"
              className="px-8 py-4 rounded-2xl bg-secondary text-secondary-foreground border border-border font-black uppercase tracking-widest text-xs hover:bg-secondary/80 transition-all shadow-xl"
            >
              List Services
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-10 border-t border-border/50">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={`https://i.pravatar.cc/150?u=${i}`}
                    alt="user"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-black tracking-tight">
                3,500+ Farmers Joined
              </p>
              <div className="flex items-center gap-1 text-accent">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={12} fill="currentColor" />
                ))}
                <span className="text-[10px] ml-2 text-muted-foreground font-bold italic">
                  Top Rated in Agri-Tech
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="relative hidden lg:block h-[600px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full h-full rounded-[4rem] overflow-hidden border-8 border-background shadow-3xl relative glass"
          >
            <img
              src="https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Modern Harvester"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

            {/* Floating UI Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-10 p-6 glass rounded-3xl shadow-2xl space-y-3 border-emerald-500/20"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <LineChart className="text-emerald-500" size={18} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">
                  Yield Index
                </span>
              </div>
              <p className="text-2xl font-black">+24.8%</p>
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 2, delay: 1 }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-10 left-10 p-6 glass rounded-3xl shadow-2xl flex items-center gap-4 border-accent/20"
            >
              <div className="p-3 bg-accent/20 rounded-full">
                <Users className="text-accent" size={24} />
              </div>
              <div>
                <p className="text-sm font-black">Elite workforce</p>
                <p className="text-[10px] text-muted-foreground font-bold">
                  120+ active today
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// --- Section 2: Value Proposition ---
function ValueProposition() {
  const values = [
    {
      title: "Verified Assets",
      desc: "Rigorous technical inspection for every piece of machinery.",
      icon: ShieldCheck,
    },
    {
      title: "Smart Logistics",
      desc: "Automated dispatch and real-time transit telemetry.",
      icon: Cpu,
    },
    {
      title: "Instant Talent",
      desc: "Deploy specialized workforce with single-click precision.",
      icon: Zap,
    },
  ];

  return (
    <section className="py-32 bg-secondary/30 border-y">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {values.map((v, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className="p-5 rounded-[2rem] bg-background border border-border/50 shadow-xl text-primary transform transition-transform hover:scale-110">
                <v.icon size={32} />
              </div>
              <h3 className="text-2xl font-black tracking-tight">{v.title}</h3>
              <p className="text-muted-foreground font-medium leading-relaxed max-w-xs">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Section 3: Bento Marketplace ---
function BentoMarketplace() {
  return (
    <section className="py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <header className="mb-16 space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">
            The Ecosystem
          </h2>
          <h3 className="text-5xl font-heading font-black tracking-tighter">
            Hyper-Local <span className="italic opacity-50">Marketplace.</span>
          </h3>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[240px]">
          <div className="md:col-span-2 lg:row-span-2 glass rounded-[3rem] p-10 flex flex-col justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <div className="p-4 bg-primary/10 rounded-2xl w-fit mb-6">
                <Tractor className="text-primary" size={28} />
              </div>
              <h4 className="text-3xl font-black mb-4">
                Heavy Fleet <br />
                Acquisition
              </h4>
              <p className="text-muted-foreground font-medium max-w-xs">
                Access modern machinery from verified local owners with flexible
                leasing terms.
              </p>
            </div>
            <motion.button
              whileHover={{ x: 10 }}
              className="relative z-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary mt-6"
            >
              Browse Fleet <ChevronRight size={16} />
            </motion.button>
            {/* Background Image Abstract */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
              <img
                src="https://images.pexels.com/photos/2581600/pexels-photo-2581600.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Fleet background"
                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
              />
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-5 transition-opacity transform translate-x-10 translate-y-10 group-hover:translate-x-5 group-hover:translate-y-5 duration-700">
              <Tractor size={300} strokeWidth={1} />
            </div>
          </div>

          <div className="md:col-span-1 lg:col-span-2 glass rounded-[3rem] p-10 flex flex-col justify-end group transition-all hover:bg-primary hover:text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
              <img
                src="https://images.pexels.com/photos/8413125/pexels-photo-8413125.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Personnel background"
                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000 grayscale"
              />
            </div>
            <div className="relative z-10">
              <div className="p-4 bg-accent/10 rounded-2xl w-fit mb-6 group-hover:bg-white/20 transition-colors">
                <Briefcase size={28} />
              </div>
              <h4 className="text-2xl font-black mb-2">Professional Personnel</h4>
              <p className="text-xs font-medium opacity-70">
                On-demand access to verified agricultural specialists.
              </p>
            </div>
          </div>

          <div className="lg:col-span-1 glass rounded-[3rem] p-8 flex flex-col justify-center items-center text-center space-y-4 border-accent/20">
            <div className="p-3 bg-accent/20 rounded-full">
              <Star className="text-accent" size={24} fill="currentColor" />
            </div>
            <p className="text-3xl font-black leading-none">4.9/5</p>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-50">
              Avg User Rating
            </p>
          </div>

          <div className="md:col-span-1 glass rounded-[3rem] p-8 flex flex-col justify-center space-y-2 border-primary/20 bg-primary/5">
            <BarChart3 className="text-primary mb-4" size={32} />
            <p className="text-sm font-black italic">
              Next-gen performance metrics available for every deployment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Section 4: Analytics ---
function AnalyticsSection() {
  return (
    <section className="py-32 bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40%] h-full bg-emerald-500/5 -skew-x-12 translate-x-20" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
        <img
          src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Tech background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10">
          <h2 className="text-6xl font-heading font-black tracking-tighter leading-none italic">
            Data-Driven <br />
            Cultivation.
          </h2>
          <p className="text-lg opacity-60 font-medium leading-relaxed max-w-xl">
            Our proprietary analytics engine processes atmospheric data and
            machinery telemetry to provide you with actionable insights for
            maximum efficiency.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4"></div>
          </div>

          <button className="px-10 py-5 rounded-2xl bg-emerald-600 font-black uppercase tracking-widest text-xs hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-500/20">
            View Sample Report
          </button>
        </div>

        <div className="relative">
          <div className="glass rounded-[3.5rem] p-10 relative z-10 space-y-8 animate-float">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-2xl font-black">Efficiency Overview</p>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-40 italic">
                  Live Telemetry Feed
                </p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-2xl">
                <Microscope className="text-emerald-500" size={24} />
              </div>
            </div>

            <div className="space-y-6">
              {[
                { name: "Telemetry Accuracy", val: 98 },
                { name: "Yield Optimization", val: 92 },
                { name: "Resource Saving", val: 87 },
              ].map((param, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                    <span>{param.name}</span>
                    <span>{param.val}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${param.val}%` }}
                      transition={{ duration: 1.5, delay: i * 0.2 }}
                      className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] dark:bg-cyan-400 dark:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Abstract Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/20 blur-[100px] -z-10 rounded-full" />
        </div>
      </div>
    </section>
  );
}

// --- Section 5: Journey ---
function ProcessJourney() {
  const steps = [
    {
      title: "Onboarding",
      desc: "Enterprise-grade identity verification.",
      icon: Users,
    },
    {
      title: "Synchronization",
      desc: "Select assets and secure deployment.",
      icon: Clock,
    },
    {
      title: "Operations",
      desc: "Real-time monitoring and reporting.",
      icon: Target,
    },
    {
      title: "Settlement",
      desc: "Automated payouts and performance review.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <header className="text-center mb-20 space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">
            Operational Flow
          </h2>
          <h3 className="text-5xl font-heading font-black tracking-tighter italic">
            Precision Journey.
          </h3>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
            <div className="p-10 rounded-[3rem] bg-background border border-border/50 shadow-xl transition-all hover:-translate-y-4 hover:border-primary/30 text-center space-y-6 relative z-10 overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none">
                  <img
                    src={[
                      "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400",
                      "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=400",
                      "https://images.pexels.com/photos/2132177/pexels-photo-2132177.jpeg?auto=compress&cs=tinysrgb&w=400",
                      "https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=400"
                    ][idx]}
                    alt={step.title}
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                <div className="relative z-10 w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <step.icon size={28} />
                </div>
                <h4 className="relative z-10 text-xl font-black">{step.title}</h4>
                <p className="relative z-10 text-xs text-muted-foreground font-semibold leading-relaxed">
                  {step.desc}
                </p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 left-full w-full h-[2px] bg-dashed-border -translate-y-1/2 -z-10 opacity-20" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Section 6: Equipment Showcase ---
function EquipmentSection() {
  return (
    <section className="py-32 bg-secondary/30 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">
              Inventory Spotlight
            </h2>
            <h3 className="text-5xl font-heading font-black tracking-tighter">
              Verified High-Tech Fleet.
            </h3>
          </div>
          <Link
            to="/equipment"
            className="px-6 py-3 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Explore Full Inventory
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            "https://imgs.search.brave.com/QpC_WtCeNmULCVpUmKDwWZsVf1F4Txo7w-ax9qEPndE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTE4/OTc0OTgzNS9waG90/by9pb3Qtc21hcnQt/YWdyaWN1bHR1cmUt/aW5kdXN0cnktNC0w/LWNvbmNlcHQtZHJv/bmUtdXNlLWZvci1z/cHJheS1hLXdhdGVy/LWZlcnRpbGl6ZXIt/b3ItY2hlbWljYWwu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PXRFR294RUFNUHRE/ckhZNjRJeEhHV0lT/U05mZjU0YkRvcFA5/VTZ0U01GUWs9",
            "https://imgs.search.brave.com/Xz76UYfPwBeVWZaZ4vLuLC65KL8jVBNQcAcx2dzBlqU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTM1/NzI1NjkzMS9waG90/by9hdXRvbWF0ZWQt/c21hcnQtZmFybWlu/Zy1mYWNpbGl0eS11/c2luZy1yb2JvdGlj/cy5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9aXk2M000bEc0/STFGSTBmaUpNT054/S1gxR2c4UWtnYlB6/bjlCSXZqU0k5MD0",
            "https://imgs.search.brave.com/bo7f0cDuR82bIDDMcg-oXCqlFPXZhlRMxdfthLV7npg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTMz/MTY0MjE5Ni9waG90/by9oaS10ZWNoLWZh/cm1pbmcuanBnP3M9/NjEyeDYxMiZ3PTAm/az0yMCZjPUJHaWRT/SzVQTzdWNjk2dTFB/eWhrcmd4U0kyTHNP/T3d5XzBwRk5Pc2JF/U2s9"
          ].map((img, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="group bg-background rounded-[3rem] p-8 border border-border/50 shadow-2xl overflow-hidden relative"
            >
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-8 bg-muted relative">
                <img
                  src={img}
                  alt={`Alpha Series Gen-${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                />
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black tracking-widest text-primary border border-primary/20">
                  ELITE UNIT
                </div>
              </div>
              <h4 className="text-2xl font-black tracking-tight mb-2">
                Alpha Series Gen-{i + 1}
              </h4>
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground italic mb-6">
                <span>Hiring Efficiency Score: 98%</span>
                <span className="text-primary not-italic">₹4,200/hr</span>
              </div>
              <button className="w-full py-4 rounded-2xl bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all text-[10px] font-black uppercase tracking-widest">
                Reserve Telemetry
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Section 7: Global Impact (NEW) ---
function GlobalImpact() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <header className="mb-20 space-y-4 max-w-2xl mx-auto">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">
            Global Presence
          </h2>
          <h3 className="text-5xl font-heading font-black tracking-tighter">
            Cultivating a Sustainable Future.
          </h3>
          <p className="text-muted-foreground font-medium leading-relaxed italic">
            Our impact spans continents, empowering millions of farmers with
            precision technology and shared resources.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center items-center">
          {[
            { label: "Active Nodes", val: "1.2k+" },
            { label: "Acres Managed", val: "450M+" },
            { label: "Platform Growth", val: "310%" },
            { label: "Carbon Saved", val: "12k Tons" },
          ].map((stat, i) => (
            <div
              key={i}
              className="space-y-4 glass p-10 rounded-[3rem] border-primary/10"
            >
              <p className="text-4xl font-black gradient-text tracking-tighter leading-none">
                {stat.val}
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-32 relative h-[400px] w-full max-w-4xl mx-auto rounded-[4rem] overflow-hidden glass p-4">
          <div className="absolute inset-0 opacity-[0.15]">
            <img
              src="https://images.pexels.com/photos/110854/pexels-photo-110854.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Global Network"
              className="w-full h-full object-cover grayscale"
            />
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Globe size={600} strokeWidth={0.5} />
          </div>
          <div className="relative z-10 flex flex-col justify-center items-center h-full space-y-8">
            <h4 className="text-2xl font-black italic opacity-60">
              "The absolute benchmark for agricultural technology 3.0"
            </h4>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-widest">
                — World Agri-Tech Forum
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Section 8: Final CTA ---
function FinalCTASection() {
  return (
    <section className="py-40 relative overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white blur-[200px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white blur-[150px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center space-y-12">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 border-2 border-white/20 rounded-full flex items-center justify-center mx-auto mb-10"
        >
          <Sprout size={40} />
        </motion.div>

        <h2 className="text-7xl font-heading font-black tracking-tighter leading-tight italic">
          Scale Your <br />
          Operations.
        </h2>
        <p className="text-xl opacity-80 font-medium max-w-xl mx-auto italic">
          Join the frontier of digital agriculture and transform your seasonal
          productivity today.
        </p>

        <div className="flex flex-wrap justify-center gap-6 pt-10">
          <Link
            to="/register/user"
            className="px-12 py-5 rounded-2xl bg-white text-primary font-black uppercase tracking-widest text-sm shadow-3xl hover:scale-105 active:scale-95 transition-all"
          >
            Initialize Portfolio
          </Link>
          <Link
            to="/labour"
            className="px-12 py-5 rounded-2xl bg-primary-foreground/5 border-2 border-white/20 text-white font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
          >
            Consult Specialists
          </Link>
        </div>

        <p className="pt-20 text-[10px] font-black uppercase tracking-[0.5em] opacity-40">
          Proprietary Ecosystem v2.4.0
        </p>
      </div>
    </section>
  );
}

// --- Global Background Elements ---
function GlobalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Floating Organic Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -40, 0],
          y: [0, 60, 0],
          rotate: [0, -45, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 blur-[100px] rounded-full"
      />

      {/* Parallax Moving SVGs (Abstract Circuit/Field Lines) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path
            d="M 10 0 L 0 0 0 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.1"
          />
        </pattern>
        <rect width="100" height="100" fill="url(#grid)" />
      </svg>
    </div>
  );
}

// --- Section: Immersive Showcase (Advanced Carousel) ---
function ImmersiveShowcase() {
  const assets = [
    {
      title: "Alpha Series Harvester",
      type: "Equipment",
      rate: "₹4,200/hr",
      img: "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=800",
      rating: 4.9,
    },
    {
      title: "Drone Soil Analyst",
      type: "Personnel",
      rate: "₹1,800/hr",
      img: "https://images.pexels.com/photos/14138670/pexels-photo-14138670.jpeg?auto=compress&cs=tinysrgb&w=800",
      rating: 4.8,
    },
    {
      title: "Precision Seeder v4",
      type: "Equipment",
      rate: "₹3,100/hr",
      img: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800",
      rating: 4.9,
    },
    {
      title: "AI Irrigation Expert",
      type: "Personnel",
      rate: "₹2,500/hr",
      img: "https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=800",
      rating: 4.7,
    },
  ];

  return (
    <section className="py-32 relative bg-muted/20 overflow-hidden">
      <div className="container mx-auto px-6 mb-16">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">
              Elite Catalog
            </h2>
            <h3 className="text-5xl font-heading font-black tracking-tighter italic">
              Top Performing <span className="text-primary/50">Assets.</span>
            </h3>
          </div>
          <div className="flex gap-4">
            <button className="swiper-prev p-4 rounded-full glass border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all">
              <ChevronLeft size={24} />
            </button>
            <button className="swiper-next p-4 rounded-full glass border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all">
              <ChevronRight size={24} />
            </button>
          </div>
        </header>
      </div>

      <div className="px-6">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: false,
          }}
          pagination={{ clickable: true }}
          navigation={{
            prevEl: ".swiper-prev",
            nextEl: ".swiper-next",
          }}
          autoplay={{ delay: 5000 }}
          className="w-full h-[600px] !pb-20"
        >
          {assets.map((asset, i) => (
            <SwiperSlide key={i} className="!w-[350px] md:!w-[500px]">
              <div className="group relative w-full h-[500px] rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                <img
                  src={asset.img}
                  alt={asset.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute top-8 right-8 glass p-3 rounded-2xl flex items-center gap-2 border-white/20">
                  <Star size={14} className="text-accent" fill="currentColor" />
                  <span className="text-xs font-black text-white">
                    {asset.rating}
                  </span>
                </div>

                <div className="absolute bottom-10 left-10 p-4 space-y-4 text-white">
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 text-[8px] font-black uppercase tracking-widest">
                    {asset.type}
                  </div>
                  <h4 className="text-4xl font-black tracking-tighter italic leading-none">
                    {asset.title}
                  </h4>
                  <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-60">
                        Listing Price
                      </p>
                      <p className="text-xl font-black">{asset.rate}</p>
                    </div>
                    <Link
                      to={asset.type === "Equipment" ? "/equipment" : "/labour"}
                      className="p-4 rounded-full bg-white text-black hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <ArrowUpRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

// --- Section: Tech Ecosystem (Interactive SVG) ---
function TechEcosystem() {
  const nodes = [
    {
      icon: Radio,
      label: "IoT Sensors",
      desc: "Real-time soil & atmosphere telemetry",
      x: "20%",
      y: "20%",
    },
    {
      icon: Cloud,
      label: "Cloud Core",
      desc: "Distributed processing & AI inference",
      x: "50%",
      y: "50%",
    },
    {
      icon: Database,
      label: "Data Lake",
      desc: "Historical yield & climate archives",
      x: "80%",
      y: "20%",
    },
    {
      icon: Server,
      label: "Edge Nodes",
      desc: "Local hardware control & sync",
      x: "20%",
      y: "80%",
    },
    {
      icon: Radio,
      label: "Satellite Link",
      desc: "Remote regional connectivity",
      x: "80%",
      y: "80%",
    },
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-slate-950 text-white">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">
            Connectivity Architecture
          </h2>
          <h3 className="text-6xl font-heading font-black tracking-tighter italic">
            The Digital <br />
            <span className="text-primary">Nervous System.</span>
          </h3>
          <p className="text-xl opacity-60 font-medium leading-relaxed max-w-xl">
            Our platform isn't just a marketplace—it's a synchronized mesh of
            hardware and software designed to optimize every metabolic process
            of your farm.
          </p>
          <ul className="space-y-4">
            {[
              "Advanced Protocol Sync",
              "End-to-End Encryption",
              "Millisecond Latency",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 font-black uppercase tracking-widest text-[10px] text-primary/80"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative aspect-square w-full max-w-2xl mx-auto flex items-center justify-center">
          {/* Background Technology Image */}
          <div className="absolute inset-0 opacity-10 pointer-events-none group">
            <img
              src="https://images.pexels.com/photos/14138670/pexels-photo-14138670.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Agri-Drone technology"
              className="w-full h-full object-cover rounded-[4rem] group-hover:scale-105 transition-transform duration-1000 grayscale"
            />
            <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
          </div>
          {/* Moving SVG Background Traces */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
            viewBox="0 0 100 100"
          >
            <motion.path
              d="M 20 20 L 50 50 L 80 20 M 50 50 L 20 80 M 50 50 L 80 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.circle
              cx="50"
              cy="50"
              r="1"
              fill="var(--primary)"
              animate={{ scale: [1, 2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </svg>

          {nodes.map((node, i) => (
            <motion.div
              key={i}
              style={{ left: node.x, top: node.y }}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
            >
              <div className="relative">
                <div className="p-4 glass rounded-2xl border-white/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all cursor-crosshair">
                  <node.icon size={24} />
                </div>
                <div className="absolute left-1/2 bottom-full mb-4 -translate-x-1/2 w-48 p-4 glass rounded-2xl border-white/10 opacity-0 group-hover:opacity-100 transition-all pointer-events-none text-center">
                  <p className="text-xs font-black uppercase tracking-widest mb-1">
                    {node.label}
                  </p>
                  <p className="text-[10px] font-medium opacity-60 leading-tight">
                    {node.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Section: Season Lifecycle (Vertical Timeline) ---
function SeasonLifecycle() {
  useScroll();

  const stages = [
    {
      title: "Analysis & Selection",
      desc: "Identifying the precise genetic and environmental profile for seasonal success.",
      icon: Microscope,
    },
    {
      title: "Strategic Deployment",
      desc: "Mobilizing hardware and personnel at the optimal astronomical window.",
      icon: Tractor,
    },
    {
      title: "Real-time Optimization",
      desc: "Adapting inputs based on hyper-local atmospheric shifts and telemetry.",
      icon: Target,
    },
    {
      title: "Elite Yield Settlement",
      desc: "Automated logistics for global distribution and margin maximization.",
      icon: LineChart,
    },
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <header className="text-center mb-32 space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">
            The Methodology
          </h2>
          <h3 className="text-5xl font-heading font-black tracking-tighter italic">
            Engineered For <span className="opacity-50">Impact.</span>
          </h3>
        </header>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Path SVG */}
          <div className="absolute left-[50%] top-0 bottom-0 w-[2px] bg-primary/20 -translate-x-1/2 hidden md:block" />

          <div className="space-y-40">
            {stages.map((stage, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-20`}
              >
                <div className="flex-1 text-center md:text-right w-full">
                  <div
                    className={`${i % 2 === 0 ? "md:text-right" : "md:text-left"} space-y-4`}
                  >
                    <h4 className="text-3xl font-black tracking-tighter italic">
                      {stage.title}
                    </h4>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">
                      {stage.desc}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 w-20 h-20 rounded-full glass border border-primary/20 flex items-center justify-center bg-background shadow-2xl">
                  <stage.icon size={28} className="text-primary" />
                  <div className="absolute -inset-4 bg-primary/5 rounded-full animate-pulse -z-10" />
                </div>

                <div className="flex-1 w-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
// --- Section: Efficiency Intelligence (ROI Dataviz) ---
function EfficiencyIntelligence() {
  const data = [
    { name: "Traditional", efficiency: 45, cost: 80 },
    { name: "Tech-Enabled", efficiency: 65, cost: 60 },
    { name: "Agro-Tech Pro", efficiency: 92, cost: 35 },
  ];

  const yieldData = [
    { month: "May", yield: 400 },
    { month: "Jun", yield: 600 },
    { month: "Jul", yield: 800 },
    { month: "Aug", yield: 1100 },
    { month: "Sep", yield: 1400 },
    { month: "Oct", yield: 1300 },
  ];

  return (
    <section className="py-32 bg-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none grayscale">
        <img
          src="https://images.pexels.com/photos/2132177/pexels-photo-2132177.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Field intelligence"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">
              Operational Alpha
            </h2>
            <h3 className="text-5xl font-heading font-black tracking-tighter">
              Efficiency <span className="italic">Intelligence.</span>
            </h3>
          </div>
          <p className="text-sm font-medium text-muted-foreground italic max-w-sm md:text-right">
            Visualizing the shift from legacy methods to precision-driven
            results. Data sourced from verified 2025 seasonal trials.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          {/* Efficiency Comparison Bar Chart */}
          <div className="lg:col-span-1 glass rounded-[3rem] p-10 space-y-8 flex flex-col justify-between border-primary/10">
            <h4 className="text-xl font-black italic">Cost/Benefit Ratio</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: "bold" }}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "10px",
                    }}
                  />
                  <Bar dataKey="efficiency" radius={[0, 10, 10, 0]}>
                    {data.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 2
                            ? "var(--chart-efficiency)"
                            : "rgba(16, 185, 129, 0.1)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] font-medium opacity-50 italic text-center">
              Efficiency gains observed across 450+ enterprise nodes.
            </p>
          </div>

          {/* Yield Growth Area Chart */}
          <div className="lg:col-span-2 glass rounded-[3.5rem] p-10 border-primary/10 relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-xl font-black italic">
                Seasonal Yield Projection
              </h4>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                  <div className="w-2 h-2 rounded-full bg-[var(--chart-efficiency)]" /> Projected
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yieldData}>
                  <defs>
                    <linearGradient id="yieldColor" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--chart-efficiency)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--chart-efficiency)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, opacity: 0.5 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="yield"
                    stroke="var(--chart-efficiency)"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#yieldColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Section: Global synergy Network (Marquee) ---
function GlobalNetwork() {
  const partners = [
    { name: "Trimble", type: "Geospatial" },
    { name: "John Deere", type: "Hardware" },
    { name: "Trimble", type: "Geospatial" },
    { name: "Caterpillar", type: "Logistics" },
    { name: "Kubota", type: "Mech Systems" },
    { name: "BASF", type: "Chemicals" },
    { name: "Bayer", type: "Seeds" },
    { name: "CLAAS", type: "Harvesting" },
  ];

  return (
    <section className="py-20 bg-background overflow-hidden border-t">
      <div className="container mx-auto px-6 mb-12">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-center text-primary/60 italic">
          Strategic Integration Partners
        </p>
      </div>

      <div className="flex relative items-center">
        <div className="flex animate-marquee gap-20 whitespace-nowrap">
          {[...partners, ...partners].map((p, i) => (
            <div
              key={i}
              className="flex flex-col items-center group cursor-pointer transition-all"
            >
              <span className="text-4xl font-heading font-black tracking-tighter opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all grayscale group-hover:grayscale-0 italic">
                {p.name}
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-40">
                {p.type}
              </span>
            </div>
          ))}
        </div>
        {/* Fades */}
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background to-transparent z-10" />
      </div>
    </section>
  );
}
