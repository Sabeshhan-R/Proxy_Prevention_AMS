"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  History, 
  MapPin, 
  QrCode, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("ams_user");
    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      router.push("/auth/login"); // not logged in
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("ams_user");
    router.push("/auth/login");
  };
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24 text-slate-900 dark:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <ShieldCheck className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Attendance Flow</h1>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Device Verified
            </div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all active:scale-95"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      <main className="flex-1 px-6 py-6 space-y-8 max-w-md mx-auto w-full">
        {/* Profile Card */}
        <section className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="space-y-1">
              <p className="text-blue-100/70 text-sm font-semibold uppercase tracking-wider">Student Profile</p>
              <h2 className="text-3xl font-extrabold">{user?.name || "—"}</h2>
              <p className="text-xs font-mono bg-white/10 w-fit px-3 py-1 rounded-lg border border-white/10 font-bold">
                REG: {user?.id || "—"}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-3xl p-4 border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">Attendance %</p>
                <p className="text-2xl font-black">98.5%</p>
              </div>
              <div className="bg-white/10 rounded-3xl p-4 border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">Days Present</p>
                <p className="text-2xl font-black">24 / 25</p>
              </div>
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 bg-blue-400/20 rounded-full -ml-16 -mb-16 blur-2xl" />
        </section>

        {/* Dashboard Actions */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Quick Actions</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Mark Attendance Button */}
            <Link 
              href="/scan"
              className="group flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-blue-500/50 active:scale-[0.98] transition-all duration-300"
            >
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <QrCode className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-slate-900 dark:text-white">Mark Attendance</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">Scan Lab QR Code</p>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ChevronRight className="h-5 w-5" />
              </div>
            </Link>

            {/* Onduty Request Button */}
            <button 
              onClick={() => router.push("/onduty")}
              className="group flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-blue-500/50 active:scale-[0.98] transition-all duration-300"
            >
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                  <Clock className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-slate-900 dark:text-white">On-Duty Request</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">Apply for official leave</p>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 px-8 pb-10 pt-4 flex justify-center items-center z-40 pointer-events-none">
        <Link 
          href="/scan" 
          className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(37,99,235,0.4)] border-4 border-white dark:border-slate-900 active:scale-90 transition-all pointer-events-auto"
        >
          <QrCode className="text-white h-8 w-8" />
        </Link>
      </nav>
    </div>
  );
}
