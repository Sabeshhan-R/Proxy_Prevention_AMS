import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  LogIn 
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-slate-950 font-sans selection:bg-primary selection:text-white">
      <main className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
        
        <div className="z-10 flex flex-col items-center gap-8 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 text-sm font-bold text-blue-600 dark:text-blue-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Anti-Proxy Security Enabled</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Smart Attendance for <br />
            <span className="text-blue-600 dark:text-blue-400">
              Modern Classrooms
            </span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
            Eliminate proxies with our secure QR-based system. Tied to Lab IPs,
            device tokens, and session expiration for ultimate trust.
          </p>
          {/* Main Action Buttons */}
          <div className="flex flex-col gap-4 w-full pt-4">
            <Link
              href="/auth/signup"
              className="group bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all duration-300"
            >
              <Users className="h-6 w-6" />
              Get Started
            </Link>

            <div className="flex flex-col gap-4">
              <Link
                href="/auth/login"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold py-4 rounded-[2rem] flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm"
              >
                <LogIn className="h-5 w-5" />
                Student Login
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-slate-100 dark:border-slate-900 py-12 px-8 bg-slate-50/50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-4 text-muted-foreground text-sm font-medium">
          <p>© 2026 Attendance Flow. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Lab Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
