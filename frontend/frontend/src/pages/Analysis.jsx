import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Activity,
  Cpu,
  ArrowRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const Analysis = () => {
  const navigate = useNavigate();

  const [income, setIncome] = useState("");
  const [loan, setLoan] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const calculateRisk = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setResult(null);
    setError("");

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const actualUser = storedUser?.user || storedUser;

    if (!actualUser?.id) {
      setError("Please login first.");
      setIsAnalyzing(false);
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/predict", {
        user_id: actualUser.id,
        income: Number(income),
        loan_amount: Number(loan),
      });

      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Prediction failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const riskColor =
    result?.risk_level === "High Risk"
      ? "#DC143C"
      : result?.risk_level === "Medium Risk"
      ? "#FFBF00"
      : "#22c55e";

  const chartData = [
    { name: "Income", value: Number(income) || 0, color: "#FFFFFF" },
    { name: "Loan", value: Number(loan) || 0, color: riskColor },
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-slate-300 p-6 lg:p-12 pt-32 selection:bg-crimson-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-10%,#dc143c08_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-[#FFBF00] text-[9px] font-black tracking-[0.4em] uppercase mb-4">
            <Cpu size={14} className="animate-pulse" /> ML Risk Processor
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
            Risk <span className="text-[#DC143C]">Analysis</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
          <div className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[2rem] p-8 h-fit shadow-2xl">
            <h3 className="text-xs font-black text-white tracking-widest uppercase mb-8 flex items-center gap-2">
              <Activity size={14} className="text-[#DC143C]" /> Parameter Input
            </h3>

            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={calculateRisk} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Annual Income ($)
                </label>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="e.g. 85000"
                  required
                  min="1"
                  className="w-full bg-black/50 border border-white/5 rounded-xl py-4 px-5 text-white outline-none focus:border-[#DC143C]/50 focus:ring-1 focus:ring-[#DC143C]/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Requested Loan ($)
                </label>
                <input
                  type="number"
                  value={loan}
                  onChange={(e) => setLoan(e.target.value)}
                  placeholder="e.g. 25000"
                  required
                  min="1"
                  className="w-full bg-black/50 border border-white/5 rounded-xl py-4 px-5 text-white outline-none focus:border-[#DC143C]/50 focus:ring-1 focus:ring-[#DC143C]/20 transition-all"
                />
              </div>

              <button
                disabled={isAnalyzing}
                className="w-full py-4 bg-[#DC143C] text-white font-black text-[10px] tracking-[0.3em] uppercase rounded-xl shadow-[0_0_20px_rgba(220,20,60,0.3)] hover:shadow-[0_0_30px_rgba(220,20,60,0.5)] transition-all flex items-center justify-center gap-2 disabled:bg-gray-800"
              >
                {isAnalyzing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Initiate Analysis <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="min-h-[500px]">
            {!result && !isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[2rem] text-gray-600">
                <Activity size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-[10px] font-black tracking-widest uppercase">
                  Awaiting Loan Data
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center animate-pulse">
                <Loader2 size={48} className="text-[#DC143C] animate-spin mb-4" />
                <p className="text-[10px] font-black tracking-widest uppercase text-white">
                  Running ML Prediction...
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ResultStat
                    label="Risk Level"
                    value={result.risk_level}
                    color={riskColor}
                    isNeon
                  />
                  <ResultStat
                    label="Loan-to-Income"
                    value={Number(result.loan_to_income).toFixed(2)}
                    color="#FFFFFF"
                  />
                  <ResultStat
                    label="Confidence"
                    value={`${Number(result.confidence || 0).toFixed(2)}%`}
                    color="#FFBF00"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8">
                      Exposure Comparison
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <XAxis
                            dataKey="name"
                            stroke="#444"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            cursor={{ fill: "transparent" }}
                            contentStyle={{
                              backgroundColor: "#000",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "10px",
                            }}
                          />
                          <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8">
                        Recommendation
                      </h4>
                      <p className="text-xl font-bold text-white tracking-tight leading-snug italic">
                        "{result.recommendation}"
                      </p>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5">
                      <div className="flex items-center gap-4 mb-6">
                        {result.risk_level === "High Risk" ? (
                          <AlertTriangle className="text-[#DC143C]" />
                        ) : (
                          <CheckCircle2 className="text-green-500" />
                        )}
                        <span className="text-[10px] font-black text-white tracking-widest uppercase">
                          Prediction saved successfully
                        </span>
                      </div>

                      <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full py-4 bg-white text-black font-black text-[10px] tracking-[0.3em] uppercase rounded-xl hover:bg-[#DC143C] hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        Go to Dashboard <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultStat = ({ label, value, color, isNeon }) => (
  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">
      {label}
    </span>
    <span
      className="text-3xl font-black tracking-tighter uppercase italic"
      style={{
        color,
        textShadow: isNeon ? `0 0 20px ${color}66` : "none",
      }}
    >
      {value}
    </span>
    {isNeon && (
      <div
        className="absolute top-0 right-0 w-12 h-12 blur-3xl rounded-full opacity-20"
        style={{ backgroundColor: color }}
      />
    )}
  </div>
);

export default Analysis;