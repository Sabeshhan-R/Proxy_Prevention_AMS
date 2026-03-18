"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Scan,
  ShieldAlert,
  MapPin,
  Smartphone,
  CheckCircle2,
  Fingerprint,
  CameraOff
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScannerPage() {
  const [result, setResult] = useState<null | 'success' | 'checking'>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      if (!isMounted) return;

      const isSecure = window.isSecureContext || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      
      if (!isSecure) {
        setCameraError("Insecure Context: Camera access requires HTTPS unless on localhost.");
        return;
      }

      try {
        // Force cleanup of the container
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        // Delay slightly to let DOM settle after clearing
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!isMounted) return;

        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;

        const config = { 
          fps: 15, 
          // We set qrbox to a specific size but we'll hide the library's default UI via CSS
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await scanner.start(
          { facingMode: "environment" }, 
          config, 
          (decodedText) => {
            if (scannerRef.current) {
              scannerRef.current.stop().then(() => {
                if (isMounted) {
                  setResult('checking');
                  setTimeout(() => {
                    if (isMounted) setResult('success');
                  }, 2000);
                }
              }).catch(err => console.error(err));
            }
          },
          () => {} // Ignore frame errors
        );
      } catch (err: any) {
        console.error("Scanner Error:", err);
        if (isMounted) {
          const errStr = err?.toString().toLowerCase();
          if (errStr.includes("permission") || errStr.includes("notallowed")) {
            setCameraError("Camera permission denied.");
          } else {
            setCameraError("Scanner initialization failed.");
          }
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        const scannerInstance = scannerRef.current;
        if (scannerInstance.isScanning) {
          scannerInstance.stop().then(() => {
            scannerInstance.clear();
          }).catch(err => console.error("Cleanup Error:", err));
        }
        scannerRef.current = null;
      }
    };
  }, []);

  const handleMockScan = () => {
    setResult('checking');
    setTimeout(() => setResult('success'), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-white">
      {/* Header */}
      <div className="p-6 flex items-center justify-between relative z-10 border-b border-slate-900 bg-slate-950/50 backdrop-blur-md">
        <Link
          href="/dashboard"
          className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 active:scale-95 transition-all text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-md font-bold tracking-tight">Scanner</h2>
        <div className="h-10 w-10" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden">
        {result === 'success' ? (
          <div className="z-20 flex flex-col items-center space-y-8 animate-in zoom-in duration-500 w-full max-w-sm">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20" />
              <div className="h-24 w-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] relative">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-3xl font-bold text-white">Attendance Marked!</h3>
              <p className="text-slate-400 font-medium">Verified for Lab-04 Engineering</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 w-full space-y-4">
              <div className="flex items-center gap-4 p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <MapPin className="h-5 w-5 text-emerald-500" />
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Network Location</p>
                  <p className="text-sm font-bold text-slate-200">Lab IP: 192.168.1.104</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <Smartphone className="h-5 w-5 text-emerald-500" />
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Device Token</p>
                  <p className="text-sm font-bold text-slate-200">ID: dev_8291x_locked</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <Fingerprint className="h-5 w-5 text-emerald-500" />
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Identity Verification</p>
                  <p className="text-sm font-bold text-slate-200">Biometric Confirmation</p>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-center shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="z-20 space-y-12 flex flex-col items-center w-full max-w-sm">
            {/* Scanner Frame */}
            <div className="relative h-80 w-80">
              {/* Camera Feed Container */}
              <div 
                id="reader" 
                ref={containerRef}
                className="absolute inset-0 rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl"
              >
                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-center p-6 space-y-4">
                    <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
                      <CameraOff className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-white px-2 leading-tight">{cameraError}</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed px-4">
                        Modern browsers require <span className="text-blue-500 font-bold underline">HTTPS</span> for camera access. If you're on a mobile device via IP, camera features are blocked by default.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 w-full px-8">
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 px-6 rounded-xl border border-slate-700 transition-all active:scale-95"
                      >
                        Retry Scanner
                      </button>
                      <button
                        onClick={handleMockScan}
                        className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 text-[10px] font-bold py-2 px-6 rounded-xl border border-blue-500/20 transition-all active:scale-95 uppercase tracking-wider"
                      >
                        Mock Scan (Dev Fallback)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Overlays */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Animated Corners */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-500 rounded-tl-[2.5rem]" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-500 rounded-tr-[2.5rem]" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-blue-500 rounded-bl-[2.5rem]" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-500 rounded-br-[2.5rem]" />

                {/* Scan Line */}
                {!cameraError && (
                  <div className="absolute top-4 left-8 right-8 h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[scan_2.5s_ease-in-out_infinite] blur-[0.5px] rounded-full z-10" />
                )}
              </div>
            </div>

            <div className="text-center space-y-3 px-4">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                {result === 'checking' ? 'Authorizing...' : 'Scanning Presence'}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Aim your camera at the lab screen's QR code to verify your seat.
              </p>
            </div>

            {/* Security Alert */}
            <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-2xl text-red-500 w-full">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider">Anti-Proxy System</p>
                <p className="text-[11px] font-medium leading-tight opacity-80">
                  Real-time environmental scanning active. Fraud will be flagged.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        #reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 2.5rem !important;
        }
        /* Hide library's default UI elements */
        #reader__scan_region {
          background: transparent !important;
        }
        #reader__scan_region > div {
          display: none !important;
        }
        #reader img {
          display: none !important;
        }
        @keyframes scan {
          0%, 100% { top: 15%; opacity: 0.3; }
          50% { top: 80%; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
