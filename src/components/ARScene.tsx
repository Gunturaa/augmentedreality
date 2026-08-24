"use client";

import { useEffect, useState, useRef } from "react";

// Trik agar TypeScript tidak protes tentang custom element
const ModelViewer = "model-viewer" as any;

export default function ARScene({ modelUrl, hotspotsCode }: { modelUrl: string; hotspotsCode?: string | null }) {
  const [mounted, setMounted] = useState(false);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect to handle hotspots code injection and interaction
  useEffect(() => {
    if (!mounted || !viewerRef.current || !hotspotsCode) return;
    
    // Inject the raw HTML hotspots code into the model-viewer
    // using insertAdjacentHTML to ensure they act as direct children
    viewerRef.current.insertAdjacentHTML('beforeend', hotspotsCode);

    // After injecting, we find all the new Hotspot buttons and add click interactions
    const hotspots = viewerRef.current.querySelectorAll('.Hotspot');
    
    hotspots.forEach((hotspot: HTMLElement) => {
      // Find the annotation div inside this hotspot
      const annotation = hotspot.querySelector('.HotspotAnnotation') as HTMLElement;
      if (annotation) {
        // Hide by default
        annotation.style.display = 'none';
        
        // Add click listener
        hotspot.addEventListener('click', () => {
          // Toggle visibility
          if (annotation.style.display === 'none') {
            // Hide all others first (optional, to only show one at a time)
            viewerRef.current.querySelectorAll('.HotspotAnnotation').forEach((ann: HTMLElement) => {
              ann.style.display = 'none';
            });
            // Show this one
            annotation.style.display = 'block';
          } else {
            annotation.style.display = 'none';
          }
        });
      }
    });

  }, [mounted, hotspotsCode]);

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
      
      {/* CSS Dinamis untuk mempercantik Hotspot mentah dari model-viewer editor */}
      <style dangerouslySetInnerHTML={{__html: `
        .Hotspot {
          background: rgba(79, 70, 229, 0.9) !important;
          border-radius: 32px !important;
          border: 2px solid rgba(255, 255, 255, 0.6) !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
          box-sizing: border-box !important;
          cursor: pointer !important;
          height: 24px !important;
          width: 24px !important;
          padding: 8px !important;
          position: relative !important;
          transition: transform 0.3s ease !important;
          animation: pulse-hotspot 2s infinite;
        }

        .Hotspot:not([data-visible]) {
          opacity: 0.3;
          pointer-events: none;
        }

        .Hotspot:hover {
          transform: scale(1.2);
        }

        .HotspotAnnotation {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          color: #18181b;
          display: none; /* Disembunyikan secara default */
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 700;
          left: calc(100% + 1em);
          max-width: 200px;
          padding: 12px 18px;
          position: absolute;
          top: 50%;
          width: max-content;
          transform: translateY(-50%);
          z-index: 100;
          animation: fade-in-annotation 0.2s ease-out;
        }

        @keyframes pulse-hotspot {
          0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
          100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
        }

        @keyframes fade-in-annotation {
          from { opacity: 0; transform: translateY(-50%) translateX(-10px); }
          to { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
      `}} />

      <ModelViewer
        ref={viewerRef}
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

        {/* Kode HTML Hotspot akan disuntikkan secara dinamis di sini oleh React useEffect */}

      </ModelViewer>
    </div>
  );
}
