import React, { useState } from "react";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/login", form);

      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] flex items-stretch overflow-hidden font-sans">
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-[#DC143C]/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFBF00]/5 blur-[100px] rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#DC143C] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(220,20,60,0.4)]">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
            LoanWise
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-black tracking-tighter text-white leading-none uppercase mb-6">
            SECURE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC143C] to-[#FFBF00]">
              TERMINAL
            </span>{" "}
            ACCESS
          </h1>
          <p className="max-w-md text-gray-500 font-medium leading-relaxed tracking-wide">
            Enter your credentials to access the AI-powered loan risk analysis
            platform. Our neural engines are standing by.
          </p>
        </div>

        <div className="relative z-10 flex gap-6 text-[10px] font-black tracking-[0.3em] text-gray-700 uppercase">
          <span>ENCRYPTED: AES-256</span>
          <span>STATUS: NOMINAL</span>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="lg:hidden absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#dc143c15_0%,transparent_50%)]" />

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            <div className="mb-10">
              <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-2">
                Login
              </h2>
              <p className="text-gray-500 text-sm font-medium">
                Authentication required to proceed.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs animate-in zoom-in-95 duration-300">
                <AlertCircle size={16} />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase ml-1">
                  Email Node
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#DC143C] transition-colors"
                    size={18}
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@nexus.com"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-[#DC143C]/50 focus:ring-1 focus:ring-[#DC143C]/20 transition-all placeholder:text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase ml-1">
                  Access Code
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#DC143C] transition-colors"
                    size={18}
                  />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white text-sm outline-none focus:border-[#DC143C]/50 focus:ring-1 focus:ring-[#DC143C]/20 transition-all placeholder:text-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                disabled={isLoading}
                className="w-full relative group overflow-hidden bg-[#DC143C] disabled:bg-gray-800 text-white font-black py-4 rounded-2xl text-xs tracking-[0.3em] uppercase transition-all shadow-[0_0_30px_rgba(220,20,60,0.3)] hover:shadow-[0_0_40px_rgba(220,20,60,0.5)] active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    INITIATE SESSION{" "}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-center mt-6 text-gray-500 text-sm">
                New to the platform?{" "}
                <Link
                  to="/signup"
                  className="text-white font-bold hover:text-[#DC143C] transition"
                >
                  CREATE ACCOUNT
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;