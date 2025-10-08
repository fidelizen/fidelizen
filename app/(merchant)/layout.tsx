"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  LogOut,
  QrCode,
  Settings,
  Gift,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/register");
        return;
      }

      setUserEmail(userData.user.email ?? null);

      const { data: merchant } = await supabase
        .from("merchants")
        .select("business")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (merchant?.business) setBusinessName(merchant.business);
    })();
  }, [router]);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/my-qr", label: "Mon QR code", icon: QrCode },
    { href: "/setup-program", label: "Programme", icon: Gift },
    { href: "/settings", label: "Paramètres", icon: Settings },
  ];

  const initials = businessName ? businessName[0].toUpperCase() : "?";

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-gray-50 text-gray-800">
      {/* === SIDEBAR (Desktop) === */}
      <aside className="hidden sm:flex w-64 bg-white border-r shadow-sm flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-emerald-600">Fidélizen</h1>
          <p className="text-xs text-gray-500 mt-1">Espace commerçant</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-emerald-100 text-emerald-700 shadow-sm"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bas du menu */}
        <div className="border-t p-4 text-sm text-gray-600">
          {userEmail && <p className="truncate mb-2 text-gray-500">{userEmail}</p>}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-all"
          >
            <LogOut size={16} />
            {loading ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </div>
      </aside>

      {/* === MOBILE HEADER === */}
      <header className="sm:hidden bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 hover:text-emerald-600 transition"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h1 className="text-lg font-semibold text-emerald-600">Fidélizen</h1>
        </div>

        {businessName && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold">
              {initials}
            </div>
          </div>
        )}
      </header>

      {/* === MOBILE MENU (overlay) === */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-lg transform transition-transform sm:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-emerald-600">Menu</h2>
          <button onClick={() => setMenuOpen(false)}>
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  active
                    ? "bg-emerald-100 text-emerald-700"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}

          <div className="border-t mt-4 pt-4 text-sm text-gray-600">
            {userEmail && <p className="truncate mb-2">{userEmail}</p>}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-all"
            >
              <LogOut size={16} />
              {loading ? "Déconnexion…" : "Se déconnecter"}
            </button>
          </div>
        </nav>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 flex flex-col animate-fadeIn mt-[56px] sm:mt-0">
        <header className="hidden sm:flex h-16 bg-white border-b px-6 items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 capitalize">
            {getPageTitle(pathname)}
          </h2>
          {businessName && (
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 flex items-center justify-center rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold"
              >
                {initials}
              </div>
              <span className="font-medium text-gray-700">{businessName}</span>
            </div>
          )}
        </header>

        <main
          className={`flex-1 p-6 overflow-y-auto ${
            pathname.includes("/settings") ? "flex items-center justify-center" : ""
          }`}
        >
          {children}
        </main>
      </div>

      {/* Effet d’apparition */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname.includes("dashboard")) return "Tableau de bord";
  if (pathname.includes("my-qr")) return "Mon QR code";
  if (pathname.includes("setup-program")) return "Mon programme";
  if (pathname.includes("settings")) return "Paramètres";
  return "";
}
