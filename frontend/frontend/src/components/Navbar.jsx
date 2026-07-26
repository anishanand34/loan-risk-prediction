import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/[0.05] bg-black/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 bg-[#DC143C] rounded shadow-[0_0_15px_rgba(220,20,60,0.4)] flex items-center justify-center">
            <ShieldCheck className="text-white" size={18} />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">
            LoanWise
          </span>
        </div>

        <div className="hidden md:flex items-center gap-10 text-[11px] font-bold tracking-[0.2em] text-gray-400">
          <button onClick={() => navigate("/")} className="hover:text-white transition-colors">
            HOME
          </button>

          {user && (
            <>
              <button onClick={() => navigate("/analysis")} className="hover:text-white transition-colors">
                ANALYSIS
              </button>

              <button onClick={() => navigate("/dashboard")} className="hover:text-white transition-colors">
                DASHBOARD
              </button>
            </>
          )}

          {!user ? (
            <>
              <button onClick={() => navigate("/login")} className="hover:text-white transition-colors">
                LOGIN
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-2 bg-[#DC143C] text-white rounded-full text-[10px] font-black hover:bg-[#ff1a46] transition-all"
              >
                SIGNUP
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-full text-[10px] font-black hover:bg-white/10 transition-all"
            >
              LOGOUT
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}