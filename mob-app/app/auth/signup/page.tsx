"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, User, Mail, Key, Fingerprint, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate registration
    router.push("/dashboard");
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Join the Class</h2>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Register your device and secure your attendance.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 pl-1 group-focus-within:text-blue-600">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="John"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-300 outline-none text-slate-900 dark:text-white placeholder:text-slate-300 shadow-sm"
              />
            </div>
          </div>
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 pl-1 group-focus-within:text-blue-600">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Doe"
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-300 outline-none text-slate-900 dark:text-white placeholder:text-slate-300 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2 group">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 pl-1 group-focus-within:text-blue-600">
            Student Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="email"
              placeholder="john@university.edu"
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-300 outline-none text-slate-900 dark:text-white placeholder:text-slate-300 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2 group">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 pl-1 group-focus-within:text-blue-600">
            Register Number
          </label>
          <div className="relative">
            <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="2024CSXXX"
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-300 outline-none text-slate-900 dark:text-white placeholder:text-slate-300 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2 group">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 pl-1 group-focus-within:text-blue-600">
            Create Password
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-300 outline-none text-slate-900 dark:text-white placeholder:text-slate-300 shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
          <p className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
            By signing up, your device will be permanently bound to this account for future authentication.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all duration-300"
        >
          <UserPlus className="h-5 w-5" />
          Complete Registration
        </button>
      </form>

      <div className="pt-2 text-center">
        <p className="text-sm text-slate-500 font-medium">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 font-bold hover:underline underline-offset-4"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
