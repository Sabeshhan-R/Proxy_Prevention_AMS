"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Key, Fingerprint } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication
    router.push("/dashboard");
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sign In</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Access your classroom and track attendance easily.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2 group">
          <label
            htmlFor="register-id"
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 pl-1 group-focus-within:text-blue-600 transition-colors"
          >
            Register Number
          </label>
          <div className="relative">
            <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              id="register-id"
              type="text"
              placeholder="e.g. 2024CS001"
              required
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-300 outline-none text-slate-900 dark:text-white placeholder:text-slate-300 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2 group">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 pl-1 group-focus-within:text-blue-600 transition-colors"
          >
            Password
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-300 outline-none text-slate-900 dark:text-white placeholder:text-slate-300 shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20 accent-primary"
            />
            <label htmlFor="remember" className="text-xs font-semibold text-slate-500">
              Stay Signed In
            </label>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-xs font-bold text-blue-600 hover:underline underline-offset-4"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all duration-300"
        >
          <LogIn className="h-5 w-5" />
          Login to Account
        </button>
      </form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs font-bold uppercase">
          <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">New to Attendance Flow?</span>
        </div>
      </div>

      <Link
        href="/auth/signup"
        className="block w-full text-center py-4 rounded-2xl border-2 border-blue-600/20 hover:border-blue-600/40 text-blue-600 font-bold text-sm bg-blue-50 dark:bg-blue-900/10 transition-all duration-300"
      >
        Create New Student Account
      </Link>
    </div>
  );
}
