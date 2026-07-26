import React, { useState } from "react";
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const calculateStrength = () => {
    if (form.password.length === 0) return 0;
    if (form.password.length < 6) return 33;
    if (form.password.length < 10) return 66;
    return 100;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      localStorage.removeItem("user");

      const res = await axios.post("http://127.0.0.1:8000/signup", form);

      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      setIsSuccess(true);

      setTimeout(() => {
        navigate("/analysis");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] flex items-stretch overflow-hidden font-sans">
      <div className="hidden lg:flex w-[45%] relative flex-col justify-between p-16 border-r border-white/5 bg-[#030303]">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-[#DC143C]/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFBF00]/5 blur-[100px] rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-[size:30px_30px]" />
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
          <h1 className="text-6xl font-black tracking-tighter text-white uppercase leading-[0.85] mb-6">
            INITIALIZE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC143C] to-[#FFBF00]">
              IDENTITY
            </span>{" "}
            NODE
          </h1>
          <p className="max-w-sm text-gray-500 font-medium tracking-wide leading-relaxed">
            Join the neural network for intelligent loan risk analysis. Secure
            your terminal access today.
          </p>
        </div>

        <div className="relative z-10 text-[9px] font-black tracking-[0.4em] text-gray-700 uppercase">
          Neural-Sync: 2026 // Auth Protocol 4.0
        </div>
      </div>

      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 relative">
        <div className="lg:hidden absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#dc143c10_0%,transparent_50%)]" />

        <div className="w-full max-w-md my-auto">
          {!isSuccess ? (
            <div className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <div className="mb-10">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-2 italic">
                  New Registration
                </h2>
                <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase">
                  Enter Credentials for Network Entry
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs">
                  <AlertCircle size={16} />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase ml-1">
                    Entity Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#DC143C]" size={18} />
                    <input
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-[#DC143C]/50 placeholder:text-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase ml-1">
                    Communication Channel
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#DC143C]" size={18} />
                    <input
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@nexus.ai"
                      className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-[#DC143C]/50 placeholder:text-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase ml-1">
                    Secure Access Key
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#DC143C]" size={18} />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white text-sm outline-none focus:border-[#DC143C]/50 placeholder:text-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="px-1 pt-1">
                    <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${
                          calculateStrength() === 33
                            ? "bg-[#DC143C] w-1/3"
                            : calculateStrength() === 66
                            ? "bg-[#FFBF00] w-2/3"
                            : calculateStrength() === 100
                            ? "bg-green-500 w-full"
                            : "w-0"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  className="w-full bg-[#DC143C] hover:bg-[#B31031] disabled:bg-gray-800 text-white font-black py-4 rounded-2xl text-[10px] tracking-[0.3em] uppercase transition-all shadow-[0_0_30px_rgba(220,20,60,0.3)] flex items-center justify-center gap-2 mt-8"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      Create Account <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 pt-8 border-t border-white/5 text-center">
                <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                  Existing Identity Found? <br />
                  <Link
                    to="/login"
                    className="text-white hover:text-[#FFBF00] transition-colors mt-2 inline-block italic"
                  >
                    Login to Terminal
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-12 text-center shadow-[0_0_60px_rgba(220,20,60,0.1)]">
              <div className="w-20 h-20 bg-[#DC143C]/10 border border-[#DC143C]/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="text-[#DC143C]" size={40} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic">
                Node Initialized
              </h2>
              <p className="text-gray-500 text-sm font-medium mb-8">
                Account created and user session synced.
              </p>
              <button
                onClick={() => navigate("/analysis")}
                className="w-full bg-white text-black font-black py-4 rounded-2xl text-[10px] tracking-[0.3em] uppercase hover:bg-[#DC143C] hover:text-white transition-all"
              >
                Go to Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;