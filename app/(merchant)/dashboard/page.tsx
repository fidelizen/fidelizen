"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Label } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingUp, Users, Star, Trophy, Settings } from "lucide-react";

type Merchant = {
  id: string;
  business: string;
  city: string;
  plan_price?: number | null;
  avg_margin?: number | null;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [customersTotal, setCustomersTotal] = useState(0);
  const [customersNewMonth, setCustomersNewMonth] = useState(0);
  const [scansMonth, setScansMonth] = useState(0);
  const [rewardsMonth, setRewardsMonth] = useState(0);
  const [program, setProgram] = useState<{ scans_required: number; reward_label: string } | null>(null);

  const monthStart = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const monthStartISO = useMemo(() => monthStart.toISOString(), [monthStart]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: m } = await supabase
        .from("merchants")
        .select("id,business,city,plan_price,avg_margin")
        .eq("user_id", user.id)
        .single();

      if (!m) return;
      setMerchant(m as Merchant);

      const { data: p } = await supabase
        .from("programs")
        .select("scans_required,reward_label")
        .eq("merchant_id", m.id)
        .maybeSingle();
      if (p) setProgram(p as any);

      const [{ count: c1 }, { count: c2 }, { count: c3 }, { count: c4 }] = await Promise.all([
        supabase.from("customers").select("id", { count: "exact", head: true }).eq("merchant_id", m.id),
        supabase.from("customers").select("id", { count: "exact", head: true }).eq("merchant_id", m.id).gte("created_at", monthStartISO),
        supabase.from("scans").select("id", { count: "exact", head: true }).eq("merchant_id", m.id).eq("accepted", true).gte("created_at", monthStartISO),
        supabase.from("rewards").select("id", { count: "exact", head: true }).eq("merchant_id", m.id).gte("issued_at", monthStartISO),
      ]);

      setCustomersTotal(c1 ?? 0);
      setCustomersNewMonth(c2 ?? 0);
      setScansMonth(c3 ?? 0);
      setRewardsMonth(c4 ?? 0);
      setLoading(false);
    })();
  }, [monthStartISO]);

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg">Chargement…</p>
      </div>
    );

  const pieData = [
    { name: "Clients totaux", value: customersTotal },
    { name: "Nouveaux clients", value: customersNewMonth },
    { name: "Scans acceptés", value: scansMonth },
    { name: "Récompenses", value: rewardsMonth },
  ];
  const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];
  const total = pieData.reduce((acc, d) => acc + d.value, 0);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10 sm:px-6">
      {/* HEADER */}
      <div className="max-w-4xl text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex justify-center items-center gap-3">
          <BarChart3 className="text-emerald-600 w-8 h-8" />
          Tableau de bord
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Suivez la performance de votre programme et la fidélité de vos clients 📊
        </p>
      </div>

      {/* CONTENU */}
      <div className="w-full max-w-5xl flex flex-col gap-8">
        {/* RENTABILITY BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm opacity-90">Programme de fidélité</p>
              <h2 className="text-lg sm:text-xl font-semibold">
                {program
                  ? `${program.scans_required} passages = ${program.reward_label}`
                  : "Configurez votre programme"}
              </h2>
            </div>
            <a
              href="/setup-program"
              className="inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-medium transition"
            >
              Modifier
            </a>
          </div>
          <p className="text-sm opacity-90 mt-3">
            📈 {customersNewMonth} nouveau{customersNewMonth > 1 ? "x" : ""} client
            {customersNewMonth > 1 ? "s" : ""} ce mois-ci
          </p>
        </motion.div>

        {/* KPI */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="grid gap-4 grid-cols-2 md:grid-cols-4"
        >
          <Card title="Clients (total)" value={customersTotal} icon={<Users className="text-emerald-600 w-5 h-5" />} />
          <Card title="Nouveaux clients" value={customersNewMonth} icon={<TrendingUp className="text-emerald-600 w-5 h-5" />} />
          <Card title="Scans du mois" value={scansMonth} icon={<Star className="text-emerald-600 w-5 h-5" />} />
          <Card title="Récompenses" value={rewardsMonth} icon={<Trophy className="text-emerald-600 w-5 h-5" />} />
        </motion.div>

        {/* GRAPH */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="text-emerald-600 w-5 h-5" />
            Répartition des performances
          </h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={3}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                  <Label
                    value={`Total : ${total}`}
                    position="center"
                    fill="#065f46"
                    style={{ fontSize: "1rem", fontWeight: "bold" }}
                  />
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

/* --- Composant KPI Card --- */
function Card({ title, value, icon }: { title: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col items-center md:items-start text-center md:text-left transition hover:shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-sm text-gray-500">{title}</p>
      </div>
      <div className="text-2xl md:text-3xl font-bold text-emerald-600">{value}</div>
    </div>
  );
}
