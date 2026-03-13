import React from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Reset Password</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Enter your student email and we'll send you a recovery link.
        </p>
      </div>

      <form className="space-y-6">
        <div className="space-y-2 group">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 pl-1 group-focus-within:text-blue-600 transition-colors"
          >
            Student Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              id="email"
              type="email"
              placeholder="john@university.edu"
              required
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-300 outline-none text-slate-900 dark:text-white placeholder:text-slate-300 shadow-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all duration-300"
        >
          <Send className="h-5 w-5" />
          Send Reset Link
        </button>
      </form>

      <Link
        href="/auth/login"
        className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Login
      </Link>
    </div>
  );
}
