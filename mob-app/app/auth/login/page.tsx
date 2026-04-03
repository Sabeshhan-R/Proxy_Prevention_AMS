"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Key, Mail, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>("");

  // Pre-fill email from registration if available
  useEffect(() => {
    const savedEmail = localStorage.getItem("ams_student_email");
    const savedDevice = localStorage.getItem("ams_device_id");
    if (savedEmail) setForm(f => ({ ...f, email: savedEmail }));
    if (savedDevice) setDeviceId(savedDevice);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Client-Type": "mobile"
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: "student",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      // ── Device binding check ───────────────────────────────────────────────
      // The student's registered device_id must match the one stored in this browser.
      // If no device_id is stored here → this is an unregistered device.
      if (!deviceId) {
        setError(
          "No device ID found. This device is not registered. Please register first via 'Get Started'."
        );
        return;
      }

      if (data.user.device_id && data.user.device_id !== deviceId) {
        setError(
          "Device mismatch. Your account is registered to a different device. Use your original device."
        );
        return;
      }

      // ── Save session ───────────────────────────────────────────────────────
      localStorage.setItem("ams_user", JSON.stringify(data.user));
      localStorage.setItem("ams_student_email", form.email.trim().toLowerCase());

      router.push("/dashboard");
    } catch {
      setError("Network error. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Student Sign In</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Access your attendance dashboard.
        </p>
      </div>

      {/* Device check */}
      {deviceId ? (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200/60 dark:border-emerald-700/30 rounded-xl">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-mono truncate">
            Device: {deviceId.slice(0, 20)}…
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-700/30 rounded-xl">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            No device registered. Please <Link href="/auth/signup" className="underline">register first</Link>.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-2xl text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="space-y-1.5 group">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              name="email" type="email" required autoComplete="email"
              placeholder="student@university.edu"
              value={form.email} onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5 group">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">Password</label>
          <div className="relative">
            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              name="password" type={showPass ? "text" : "password"} required
              placeholder="••••••••"
              value={form.password} onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-10 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-xs font-bold text-blue-600 hover:underline underline-offset-4">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <LogIn className="h-5 w-5" />
          {loading ? "Signing In…" : "Sign In"}
        </button>
      </form>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs font-bold uppercase">
          <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">New Student?</span>
        </div>
      </div>

      <Link
        href="/auth/signup"
        className="block w-full text-center py-4 rounded-2xl border-2 border-blue-600/20 hover:border-blue-600/40 text-blue-600 font-bold text-sm bg-blue-50 dark:bg-blue-900/10 transition-all duration-300 active:scale-[0.98]"
      >
        Register via Mobile App
      </Link>
    </div>
  );
}
