"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import {
  ArrowLeft, Scan, ShieldAlert, MapPin, Smartphone,
  CheckCircle2, Fingerprint, CameraOff, AlertCircle, Loader2
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type ScanState = "scanning" | "checking" | "success" | "error";

interface ScanResult {
  message: string;
  attendance_id?: string;
  marked_at?: string;
}

export default function QRScannerPage() {
  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>("");
  const [user, setUser] = useState<any>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  // Load user session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("ams_user");
    const savedDevice = localStorage.getItem("ams_device_id");
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedDevice) setDeviceId(savedDevice);
  }, []);

  // ── Camera init ───────────────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;

    const startScanner = async () => {
      if (!isMounted.current) return;

      const isSecure =
        window.isSecureContext ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (!isSecure) {
        setCameraError("Camera requires HTTPS. Try from localhost.");
        return;
      }

      try {
        if (containerRef.current) containerRef.current.innerHTML = "";
        await new Promise(r => setTimeout(r, 300));
        if (!isMounted.current) return;

        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 15, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
          (decodedText) => {
            // QR found — stop camera and process
            if (scannerRef.current?.isScanning) {
              scannerRef.current.stop().then(() => {
                if (isMounted.current) handleQRPayload(decodedText);
              }).catch(console.error);
            }
          },
          () => {} // ignore per-frame errors
        );
      } catch (err: any) {
        if (!isMounted.current) return;
        const errStr = err?.toString().toLowerCase() ?? "";
        if (errStr.includes("permission") || errStr.includes("notallowed")) {
          setCameraError("Camera permission denied. Please allow camera access.");
        } else {
          setCameraError("Could not start scanner. Try reloading the page.");
        }
      }
    };

    startScanner();

    return () => {
      isMounted.current = false;
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Process QR payload ────────────────────────────────────────────────────
  const handleQRPayload = async (raw: string) => {
    setScanState("checking");
    setErrorMsg(null);

    try {
      let payload: any;
      try {
        payload = JSON.parse(raw);
      } catch {
        setErrorMsg("Invalid QR code. Not an AMS attendance token.");
        setScanState("error");
        return;
      }

      const { student_id, session_id, token } = payload;

      if (!student_id || !session_id || !token) {
        setErrorMsg("QR code is missing required fields.");
        setScanState("error");
        return;
      }

      if (!deviceId) {
        setErrorMsg("No device ID found. Please log in again.");
        setScanState("error");
        return;
      }

      const response = await fetch(`${API_URL}/api/mark-attendance`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Client-Type": "mobile"
        },
        body: JSON.stringify({ student_id, session_id, token, device_id: deviceId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setScanResult({ message: data.message, attendance_id: data.attendance_id, marked_at: data.marked_at });
        setScanState("success");
      } else {
        // Map specific error codes to user-friendly messages
        const errMap: Record<number, string> = {
          401: "Device mismatch. Use your registered device.",
          403: "QR code expired or session has ended. Ask teacher to rescan.",
          409: "Attendance already marked for this session.",
          404: "Session or student not found.",
        };
        setErrorMsg(errMap[response.status] || data.error || "Scan failed. Please try again.");
        setScanState("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your internet connection and try again.");
      setScanState("error");
    }
  };

  // ── Retry: restart scanner ────────────────────────────────────────────────
  const handleRetry = () => {
    setScanState("scanning");
    setErrorMsg(null);
    setScanResult(null);
    window.location.reload(); // simplest way to fully reset camera state
  };

  // ── Mock scan for dev (no camera) ─────────────────────────────────────────
  const handleMockScan = () => {
    const mockPayload = JSON.stringify({
      student_id: user?.uuid,
      session_id: "00000000-0000-0000-0000-000000000000",
      token: "MOCK_TOKEN",
      device_id: deviceId,
    });
    handleQRPayload(mockPayload);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-white">
      {/* Header */}
      <div className="p-6 flex items-center justify-between relative z-10 border-b border-slate-900 bg-slate-950/50 backdrop-blur-md">
        <Link href="/dashboard" className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 active:scale-95 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-md font-bold tracking-tight">QR Scanner</h2>
        <div className="h-10 w-10" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden">

        {/* ── SUCCESS ────────────────────────────────────── */}
        {scanState === "success" && (
          <div className="z-20 flex flex-col items-center space-y-6 animate-in zoom-in duration-500 w-full max-w-sm">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20" />
              <div className="h-24 w-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] relative">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-3xl font-bold">Attendance Marked!</h3>
              <p className="text-slate-400 font-medium">{scanResult?.message}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 w-full space-y-3">
              {scanResult?.marked_at && (
                <div className="flex items-center gap-4 p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                  <Fingerprint className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Marked At</p>
                    <p className="text-sm font-bold text-slate-200">
                      {new Date(scanResult.marked_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4 p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <Smartphone className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Device</p>
                  <p className="text-sm font-bold text-slate-200 font-mono">{deviceId.slice(0, 20)}…</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <MapPin className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Student</p>
                  <p className="text-sm font-bold text-slate-200">{user?.name || "—"}</p>
                </div>
              </div>
            </div>
            <Link href="/dashboard" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-center shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]">
              Return to Dashboard
            </Link>
          </div>
        )}

        {/* ── ERROR ─────────────────────────────────────── */}
        {scanState === "error" && (
          <div className="z-20 flex flex-col items-center space-y-6 animate-in zoom-in duration-500 w-full max-w-sm text-center">
            <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Scan Failed</h3>
              <p className="text-slate-400 text-sm">{errorMsg}</p>
            </div>
            <button onClick={handleRetry} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]">
              Try Again
            </button>
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white underline">
              Back to Dashboard
            </Link>
          </div>
        )}

        {/* ── CHECKING ──────────────────────────────────── */}
        {scanState === "checking" && (
          <div className="z-20 flex flex-col items-center space-y-6 animate-in fade-in duration-300">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            <div className="text-center">
              <h3 className="text-2xl font-bold">Verifying…</h3>
              <p className="text-slate-400 text-sm">Checking token and session</p>
            </div>
          </div>
        )}

        {/* ── SCANNING ──────────────────────────────────── */}
        {scanState === "scanning" && (
          <div className="z-20 space-y-10 flex flex-col items-center w-full max-w-sm">
            {/* Scanner frame */}
            <div className="relative h-80 w-80">
              <div id="reader" ref={containerRef} className="absolute inset-0 rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-center p-6 space-y-4">
                    <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
                      <CameraOff className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-white px-2 leading-tight">{cameraError}</p>
                      <p className="text-[10px] text-slate-500 px-4">
                        Browsers require <span className="text-blue-500 font-bold">HTTPS</span> for camera.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 w-full px-8">
                      <button onClick={() => window.location.reload()} className="bg-slate-800 text-white text-xs font-bold py-3 px-6 rounded-xl border border-slate-700 transition-all active:scale-95">
                        Retry Camera
                      </button>
                      <button onClick={handleMockScan} className="bg-blue-600/10 text-blue-500 text-[10px] font-bold py-2 px-6 rounded-xl border border-blue-500/20 transition-all active:scale-95 uppercase tracking-wider">
                        Mock Scan (Dev Mode)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Corner overlays */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-500 rounded-tl-[2.5rem]" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-500 rounded-tr-[2.5rem]" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-blue-500 rounded-bl-[2.5rem]" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-500 rounded-br-[2.5rem]" />
                {!cameraError && (
                  <div className="absolute top-4 left-8 right-8 h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[scan_2.5s_ease-in-out_infinite] blur-[0.5px] rounded-full z-10" />
                )}
              </div>
            </div>

            <div className="text-center space-y-2 px-4">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                Scan QR Code
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Point your camera at the QR code on the lab PC screen.
              </p>
            </div>

            {/* Anti-proxy badge */}
            <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-2xl text-red-500 w-full">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider">Anti-Proxy Active</p>
                <p className="text-[11px] font-medium opacity-80 leading-tight">
                  Device ID is verified server-side. Proxy attempts will be rejected.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        #reader video { object-fit: cover !important; width: 100% !important; height: 100% !important; border-radius: 2.5rem !important; }
        #reader__scan_region { background: transparent !important; }
        #reader__scan_region > div { display: none !important; }
        #reader img { display: none !important; }
        @keyframes scan { 0%, 100% { top: 15%; opacity: 0.3; } 50% { top: 80%; opacity: 0.8; } }
      `}</style>
    </div>
  );
}
