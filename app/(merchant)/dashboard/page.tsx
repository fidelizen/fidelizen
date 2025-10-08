"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
} from "recharts";

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
      setMsg(null);

      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) { setMsg("Non connecté."); setLoading(false); return; }

      const { data: m, error: mErr } = await supabase
        .from("merchants")
        .select("id,business,city,plan_price,avg_margin")
        .eq("user_id", user.id)
        .single();

      if (mErr || !m) { setMsg("Impossible de charger le commerce."); setLoading(false); return; }
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg">Chargement…</p>
      </div>
    );
  }

  const pieData = [
    { name: "Clients totaux", value: customersTotal },
    { name: "Nouveaux clients", value: customersNewMonth },
    { name: "Scans acceptés", value: scansMonth },
    { name: "Récompenses", value: rewardsMonth },
  ];
  const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];
  const total = pieData.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
        📊 Tableau de bord
      </h1>

      {msg && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          {msg}
        </div>
      )}

      <RentabilityBanner merchant={merchant} program={program} customersNewMonth={customersNewMonth} />

      {/* KPI */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card title="Clients (total)" value={customersTotal} />
        <Card title="Nouveaux clients (mois)" value={customersNewMonth} />
        <Card title="Scans (mois)" value={scansMonth} />
        <Card title="Récompenses (mois)" value={rewardsMonth} />
      </div>

      {/* Graphique */}
      <div className="bg-white rounded-2xl shadow p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Répartition des performances</h3>
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
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 md:p-5 flex flex-col items-center md:items-start text-center md:text-left">
      <p className="text-sm text-gray-500">{title}</p>
      <div className="mt-1 md:mt-2 text-2xl md:text-3xl font-bold text-emerald-600">{value}</div>
    </div>
  );
}

function RentabilityBanner({
  merchant,
  program,
  customersNewMonth,
}: {
  merchant: Merchant | null;
  program: { scans_required: number; reward_label: string } | null;
  customersNewMonth: number;
}) {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl p-5 md:p-6 shadow space-y-3 md:space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm opacity-90">Programme de fidélité</p>
          <h2 className="text-lg md:text-xl font-semibold">
            {program
              ? `${program.scans_required} scans = ${program.reward_label}`
              : "Configurez votre programme"}
          </h2>
        </div>
        <a
          href="/setup-program"
          className="inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-medium"
        >
          Modifier
        </a>
      </div>

      <p className="text-sm opacity-90">
        📈 {customersNewMonth} nouveau{xIf(customersNewMonth)} client{pluralIf(customersNewMonth)} ce mois-ci
      </p>
    </div>
  );
}

function pluralIf(n: number) {
  return n > 1 ? "s" : "";
}
function xIf(n: number) {
  return n > 1 ? "x" : "";
}
