import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ShieldCheck,
  Download,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  LayoutDashboard,
} from "lucide-react";

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const actualUser = storedUser?.user || storedUser;

    if (!actualUser?.id) {
      window.location.href = "/login";
      return;
    }

    setUser(actualUser);
    fetchData(actualUser.id);
  }, []);

  const fetchData = async (userId) => {
    try {
      const analyticsRes = await axios.get(
        `http://127.0.0.1:8000/analytics/${userId}`
      );

      const historyRes = await axios.get(
        `http://127.0.0.1:8000/history/${userId}`
      );

      setAnalytics(analyticsRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  };

  const exportCSV = () => {
    if (!history.length) return;

    const headers = ["Income", "Loan", "Ratio", "Risk", "Confidence", "Date"];

    const rows = history.map((row) => [
      row.income,
      row.loan_amount,
      Number(row.loan_to_income).toFixed(2),
      row.risk_level,
      row.confidence,
      row.created_at?.slice(0, 10),
    ]);

    const csvContent =
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${user?.name || "user"}_loan_predictions.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const filteredHistory = history.filter((row) => {
    const query = search.toLowerCase();

    return (
      String(row.income).toLowerCase().includes(query) ||
      String(row.loan_amount).toLowerCase().includes(query) ||
      String(row.loan_to_income).toLowerCase().includes(query) ||
      String(row.risk_level).toLowerCase().includes(query) ||
      String(row.confidence).toLowerCase().includes(query) ||
      String(row.created_at).toLowerCase().includes(query)
    );
  });

  const kpis = [
    {
      label: "Total Predictions",
      value: analytics?.total || 0,
      icon: LayoutDashboard,
      color: "#FFFFFF",
    },
    {
      label: "Low Risk",
      value: analytics?.low || 0,
      icon: ShieldCheck,
      color: "#22c55e",
    },
    {
      label: "Medium Risk",
      value: analytics?.medium || 0,
      icon: TrendingUp,
      color: "#FFBF00",
    },
    {
      label: "High Risk",
      value: analytics?.high || 0,
      icon: AlertCircle,
      color: "#DC143C",
    },
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-slate-300 p-6 lg:p-10 pt-28">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-5 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight">
              Welcome back, {user?.name?.toUpperCase() || "USER"}
            </h1>

            <p className="text-gray-500 text-xs mt-1">
              User ID:{" "}
              <span className="text-white font-bold">{user?.id || "-"}</span>{" "}
              | Neural Network Status:{" "}
              <span className="text-green-500 font-bold">Synchronized</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-5 py-3 bg-white/[0.05] border border-white/20 rounded-xl text-xs text-white hover:bg-white/10 transition"
            >
              <Download size={14} /> Export CSV
            </button>

            <button
              onClick={handleLogout}
              className="px-5 py-3 bg-[#DC143C] text-white rounded-xl text-xs font-bold hover:bg-[#b01030]"
            >
              Logout
            </button>
          </div>
        </header>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;

            return (
              <div
                key={i}
                className="bg-white/[0.02] border border-white/20 rounded-2xl p-6"
              >
                <div className="flex justify-between mb-4">
                  <Icon size={20} style={{ color: kpi.color }} />
                  <ArrowUpRight size={14} />
                </div>

                <p className="text-xs text-gray-500">{kpi.label}</p>
                <h3 className="text-3xl font-black text-white">{kpi.value}</h3>
              </div>
            );
          })}
        </div>

        {/* TABLE */}
        <div className="bg-white/[0.02] border border-white/20 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-72 bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:border-[#DC143C]"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-white/20">
                  <th className="p-4">Income</th>
                  <th className="p-4">Loan</th>
                  <th className="p-4">Ratio</th>
                  <th className="p-4">Risk</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((row) => (
                    <tr key={row.id} className="border-t border-white/10 text-center">
                      <td className="p-4">${Number(row.income).toLocaleString()}</td>
                      <td className="p-4">${Number(row.loan_amount).toLocaleString()}</td>
                      <td className="p-4">{Number(row.loan_to_income).toFixed(2)}</td>
                      <td className="p-4">{row.risk_level}</td>
                      <td className="p-4">{row.confidence ? `${row.confidence}%` : "N/A"}</td>
                      <td className="p-4">{row.created_at?.slice(0, 10)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No predictions found for this user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;