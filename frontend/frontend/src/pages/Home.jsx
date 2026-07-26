import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  Zap,
  Activity,
  Search,
  BarChart3,
} from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#010101] text-slate-300 font-sans selection:bg-red-500/30">

      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-10%,#dc143c10_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.05] bg-black/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#DC143C] to-[#800a1f] rounded flex items-center justify-center shadow-[0_0_15px_rgba(220,20,60,0.4)]">
              <ShieldCheck className="text-white" size={18} />
            </div>
            <span className="text-xl font-black text-white uppercase italic">
              LoanWise
            </span>
          </div>

          {/* NAV LINKS */}
          <div className="flex items-center gap-8 text-[10px] font-bold tracking-[0.3em] text-gray-500">

            <Link to="/" className="hover:text-white transition">
              HOME
            </Link>

            <Link to="/analysis" className="hover:text-white transition">
              ANALYSIS
            </Link>

            <Link to="/dashboard" className="hover:text-white transition">
              DASHBOARD
            </Link>

            <Link
              to="/login"
              className="px-6 py-2 bg-white text-black rounded-full text-[9px] font-black hover:bg-[#DC143C] hover:text-white transition-all"
            >
              LOGIN
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-44 pb-24 px-8 z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-[9px] font-black tracking-[0.3em] uppercase mb-8">
              <Activity size={12} className="animate-pulse" />
              AI RISK ACTIVE
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white uppercase leading-[0.85] mb-8">
              PREDICT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-400">
                LOAN RISK
              </span>
            </h1>

            <p className="text-gray-500 text-sm mb-10 max-w-md">
              AI-powered system to evaluate loan risk using machine learning and
              real-time analytics.
            </p>

            {/* BUTTONS */}
            <div className="flex gap-4">

              <Link
                to="/signup"
                className="px-8 py-4 bg-[#DC143C] text-white text-[10px] font-black uppercase rounded shadow hover:bg-[#ff1a46] transition-all"
              >
                Get Started <ArrowRight size={14} />
              </Link>

              <Link
                to="/analysis"
                className="px-8 py-4 border border-white/10 text-white text-[10px] font-black uppercase hover:bg-white/5 transition-all"
              >
                Analyze Loan
              </Link>

            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-[100px] rounded-full" />
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71"
              className="rounded-xl border border-white/10 opacity-80"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-8 z-10 relative">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">

          {[
            {
              title: "AI Prediction",
              desc: "Predict loan risk using ML models",
              icon: Zap,
            },
            {
              title: "Risk Insights",
              desc: "Detailed analytics & recommendations",
              icon: Search,
            },
            {
              title: "Dashboard",
              desc: "Track history, KPIs & insights",
              icon: BarChart3,
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-6 bg-[#111] border border-white/5 rounded-xl hover:border-red-500/40 transition"
            >
              <f.icon className="text-yellow-400 mb-4" />
              <h3 className="text-white text-lg">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t border-white/5 text-center text-gray-600 text-xs">
        © 2026 LoanWise — AI Loan Risk Platform
      </footer>

    </div>
  );
};

export default Home;