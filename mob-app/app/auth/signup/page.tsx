"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus, User, Mail, Key, Fingerprint, ShieldCheck,
  BookOpen, Hash, CheckCircle2, AlertCircle, Eye, EyeOff
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Generates a stable device ID and persists it in localStorage.
 * This ties the registration to THIS specific browser/device.
 */
function getOrCreateDeviceId(): string {
  const stored = localStorage.getItem("ams_device_id");
  if (stored) return stored;
  const id = "MOB-" + crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
  localStorage.setItem("ams_device_id", id);
  return id;
}

export default function SignupPage() {
  const router = useRouter();

  const [deviceId, setDeviceId] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    reg_no: "",
    dept: "",
    section: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setDeviceId(getOrCreateDeviceId());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!deviceId) {
      setError("Could not detect device ID. Please reload the page.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/student/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Client-Type": "mobile"
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          reg_no: form.reg_no.trim().toUpperCase(),
          dept: form.dept.trim().toUpperCase(),
          section: form.section.trim().toUpperCase(),
          password: form.password,
          device_id: deviceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      // Save basic info for the login page
      localStorage.setItem("ams_student_email", form.email.trim().toLowerCase());
      setSuccess(true);
    } catch {
      setError("Network error. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 animate-in zoom-in duration-500">
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">You&apos;re Registered!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your account is bound to this device.
            </p>
          </div>
          <div className="w-full bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">Device Bound</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-mono break-all">{deviceId}</p>
          </div>
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Registration form ─────────────────────────────────────────────────────
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Student Registration</h2>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Register this device to your account
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-2xl text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Name */}
        <div className="space-y-1.5 group">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              name="name" type="text" required autoComplete="name"
              placeholder="John Doe"
              value={form.name} onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
          </div>
        </div>

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

        {/* Register Number */}
        <div className="space-y-1.5 group">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">Register Number</label>
          <div className="relative">
            <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              name="reg_no" type="text" required
              placeholder="2024CS001"
              value={form.reg_no} onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Dept + Section */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 group">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">Dept</label>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                name="dept" type="text" required
                placeholder="CSE"
                value={form.dept} onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-3 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>
          </div>
          <div className="space-y-1.5 group">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">Section</label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                name="section" type="text" required
                placeholder="A"
                value={form.section} onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-3 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5 group">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">Password</label>
          <div className="relative">
            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              name="password" type={showPass ? "text" : "password"} required
              placeholder="Min 6 characters"
              value={form.password} onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-10 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5 group">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">Confirm Password</label>
          <div className="relative">
            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              name="confirmPassword" type="password" required
              placeholder="Re-enter password"
              value={form.confirmPassword} onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Device binding notice */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
          <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
            This device will be permanently bound to your account. Only this device can scan QR codes for your attendance.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !deviceId}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <UserPlus className="h-5 w-5" />
          {loading ? "Registering…" : "Create Student Account"}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-500 font-medium">
          Already registered?{" "}
          <Link href="/auth/login" className="text-blue-600 font-bold hover:underline underline-offset-4">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
