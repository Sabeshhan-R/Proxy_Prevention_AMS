"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
  CheckCircle2, 
  X,
  FileCheck,
  Send,
  Calendar,
  History,
  Clock,
  AlertCircle
} from "lucide-react";

export default function OnDutyRequestPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"apply" | "history">("apply");
  const [subject, setSubject] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isTodayOnly, setIsTodayOnly] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate total days
  const calculateTotalDays = () => {
    if (isTodayOnly) return 1;
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  };

  const totalDays = calculateTotalDays();

  // Mock History Data
  const historyData = [
    { id: 1, subject: "Annual Sports Meet", date: "15 Mar - 17 Mar", days: 3, status: "Approved", color: "text-emerald-500 bg-emerald-500/10" },
    { id: 2, subject: "Inter-College Workshop", date: "10 Mar - 10 Mar", days: 1, status: "Pending", color: "text-amber-500 bg-amber-500/10" },
    { id: 3, subject: "Robotics Competition", date: "01 Mar - 02 Mar", days: 2, status: "Rejected", color: "text-rose-500 bg-rose-500/10" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setActiveTab("history");
      }, 2000);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20">
        <button 
          onClick={() => router.back()}
          className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-800 active:scale-95 transition-all text-slate-600 dark:text-slate-400"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold">On-Duty Portal</h2>
        <div className="h-10 w-10" />
      </header>

      {/* Tabs */}
      <div className="px-6 pt-6">
        <div className="bg-slate-200/50 dark:bg-slate-900 rounded-2xl p-1.5 flex gap-1 items-center">
          <button 
            onClick={() => setActiveTab("apply")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "apply" 
              ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Send className="h-4 w-4" />
            Apply OD
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "history" 
              ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <History className="h-4 w-4" />
            History
          </button>
        </div>
      </div>

      <main className="flex-1 p-6 max-w-md mx-auto w-full">
        {activeTab === "apply" ? (
          <>
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center space-y-6 pt-12 animate-in fade-in zoom-in duration-500">
                <div className="h-24 w-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold">Request Submitted!</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium px-8">
                    Your OD request has been sent for faculty approval.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  {/* Subject Input */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                      Reason / Subject
                    </label>
                    <div className="relative group">
                      <FileText className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <textarea
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="E.g., Sports Meet, Workshop Participation..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-300 outline-none min-h-[100px] resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Today Only Checkbox */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all">
                    <input 
                      type="checkbox" 
                      id="today-only"
                      checked={isTodayOnly}
                      onChange={(e) => setIsTodayOnly(e.target.checked)}
                      className="h-5 w-5 rounded-lg border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-600/20 transition-all cursor-pointer"
                    />
                    <label htmlFor="today-only" className="text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer flex-1">
                      Applying for Today Only
                    </label>
                  </div>

                  {/* Dates Side by Side */}
                  <div className={`grid grid-cols-2 gap-4 transition-all duration-300 ${isTodayOnly ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                        From Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="date"
                          required={!isTodayOnly}
                          disabled={isTodayOnly}
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-3 text-xs focus:ring-4 focus:ring-blue-600/10 outline-none text-slate-600 dark:text-slate-300 appearance-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                        To Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="date"
                          required={!isTodayOnly}
                          disabled={isTodayOnly}
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-3 text-xs focus:ring-4 focus:ring-blue-600/10 outline-none text-slate-600 dark:text-slate-300 appearance-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Total Days Display */}
                  <div className="bg-blue-600/5 border border-blue-600/10 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Total Duration</span>
                    </div>
                    <div className="text-lg font-black text-blue-600">
                      {totalDays} <span className="text-[10px] font-bold uppercase tracking-widest">Days</span>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                      Supporting Document
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-[2rem] p-6 transition-all cursor-pointer ${
                          file 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-blue-500'
                        }`}
                      >
                        {file ? (
                          <div className="flex flex-col items-center space-y-2">
                            <FileCheck className="h-8 w-8 text-emerald-600" />
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                              {file.name}
                            </p>
                            <button 
                              type="button"
                              onClick={(e) => { e.preventDefault(); setFile(null); }}
                              className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1 mt-1"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-2">
                            <Upload className="h-8 w-8 text-blue-600/50" />
                            <div className="text-center">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">Upload JPG/PDF</p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!subject || !file || (!isTodayOnly && (!fromDate || !toDate)) || isSubmitting}
                  className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl ${
                    !subject || !file || (!isTodayOnly && (!fromDate || !toDate)) || isSubmitting
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Submit Request
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4">
                  Note: Supporting document must be clearly legible
                </p>
              </form>
            )}
          </>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Recent OD Submissions
            </h3>
            
            {historyData.map((item) => (
              <div 
                key={item.id} 
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {item.subject}
                    </h4>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {item.date} • {item.days} {item.days === 1 ? 'Day' : 'Days'}
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.color}`}>
                    {item.status}
                  </div>
                </div>
                
                {item.status === 'Rejected' && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-rose-500">
                    <AlertCircle className="h-3 w-3 mt-0.5" />
                    <p className="text-[10px] font-medium leading-relaxed">
                      Reason: Evidence document was blurred. Please resubmit.
                    </p>
                  </div>
                )}
              </div>
            ))}

            <div className="bg-blue-600/5 rounded-2xl p-4 border border-blue-600/10 mt-8">
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold leading-relaxed text-center">
                Processing usually takes 24-48 hours. Contact your Class In-charge for urgent approval.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
