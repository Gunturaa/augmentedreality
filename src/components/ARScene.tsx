"use client";

import { useEffect, useState } from "react";

// Trik agar TypeScript tidak protes tentang custom element
const ModelViewer = "model-viewer" as any;



export default function ARScene({ modelUrl }: { modelUrl: string }) {
  const [mounted, setMounted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-400 font-medium text-sm">Memuat 3D Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-zinc-900">
      <ModelViewer
        src={modelUrl}
        alt="3D Sparepart Motor"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        touch-action="pan-y"
        auto-rotate
        rotation-per-second="30deg"
        shadow-intensity="1.5"
        exposure="1"
        style={{ width: "100%", height: "100%", backgroundColor: "#18181b" }}
      >
        {/* Tombol khusus untuk masuk ke mode AR */}
        <button 
          slot="ar-button" 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white text-black font-extrabold px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 z-50"
        >
          <span className="text-2xl">📷</span> 
          VIEW IN REAL WORLD
        </button>

        {/* Hotspot Interaktif untuk Syarat Ujian */}
        <button 
          className="bg-indigo-600/90 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-bold border border-white/30 shadow-lg cursor-pointer hover:bg-indigo-500 transition-colors animate-pulse"
          slot="hotspot-1" 
          data-position="0 0.1 0" 
          data-normal="0 1 0"
          onClick={() => setShowInfo(!showInfo)}
        >
          🔍 Info Part
        </button>

        {/* Pop-up Informasi saat hotspot diklik */}
        {showInfo && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md border border-zinc-200 p-6 rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.5)] z-50 text-center min-w-[280px]">
            <div className="text-4xl mb-3">🛠️</div>
            <h3 className="font-extrabold text-xl text-zinc-900 mb-2">Interaksi Berhasil!</h3>
            <p className="text-sm text-zinc-600 mb-5 leading-relaxed">
              Ini adalah contoh fitur interaksi klik pada model 3D (Hotspot). 
              Anda bisa menyesuaikan teks ini untuk menampilkan informasi spesifik tentang part motor yang di-scan!
            </p>
            <button 
              onClick={() => setShowInfo(false)}
              className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors w-full shadow-md"
            >
              Tutup Info
            </button>
          </div>
        )}
      </ModelViewer>
    </div>
  );
}
