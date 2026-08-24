"use client";

import { useEffect, useState } from "react";

export default function ARScene({ modelUrl, hotspotsCode }: { modelUrl: string; hotspotsCode?: string | null }) {
  const [mounted, setMounted] = useState(false);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  useEffect(() => {
    // Tunggu sampai A-Frame termuat dari Script tag di layout
    const checkAframe = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).AFRAME) {
        clearInterval(checkAframe);
        
        // Mendaftarkan Komponen A-Frame Khusus (Penerjemah Hotspot)
        if (!(window as any).AFRAME.components['hotspots-parser']) {
          (window as any).AFRAME.registerComponent('hotspots-parser', {
            init: function () {
              const rawHtml = decodeURIComponent(this.el.getAttribute('data-hotspots') || '');
              if (!rawHtml) return;
              
              // Membedah kode HTML yang di-paste dari Admin Dashboard
              const parserDiv = document.createElement('div');
              parserDiv.innerHTML = rawHtml;
              const buttons = parserDiv.querySelectorAll('.Hotspot');
              
              buttons.forEach((btn) => {
                const pos = btn.getAttribute('data-position');
                const annotationDiv = btn.querySelector('.HotspotAnnotation');
                const text = annotationDiv ? annotationDiv.textContent : 'Info Part';
                
                if (pos) {
                  // Membuat wadah untuk Visual dan Hitbox
                  const container = document.createElement('a-entity');
                  container.setAttribute('position', cleanPos);

                  // 1. BOLA VISUAL (Kecil, elegan, dan berdenyut)
                  const visual = document.createElement('a-sphere');
                  visual.setAttribute('radius', '0.04'); 
                  visual.setAttribute('color', '#4f46e5'); 
                  visual.setAttribute('opacity', '0.9');
                  visual.setAttribute('animation__pulse', 'property: scale; from: 1 1 1; to: 1.5 1.5 1.5; dir: alternate; loop: true; dur: 800');

                  // 2. BOLA HITBOX (Besar, transparan, sebagai sensor sentuhan jari)
                  const hitbox = document.createElement('a-sphere');
                  hitbox.setAttribute('radius', '0.25'); // Ukuran super besar untuk jari
                  hitbox.setAttribute('opacity', '0'); // Dibuat 100% transparan
                  hitbox.setAttribute('material', 'transparent: true');
                  hitbox.setAttribute('class', 'clickable'); // Sensor klik hanya pada hitbox

                  // Logika saat hitbox disentuh/diklik
                  const triggerInfo = () => {
                    window.dispatchEvent(new CustomEvent('show-ar-info', { detail: text }));
                    visual.setAttribute('color', '#fbbf24'); // Visual yang berkedip
                    setTimeout(() => visual.setAttribute('color', '#4f46e5'), 500);
                  };
                  
                  // Gunakan click dan mousedown untuk kompatibilitas layar sentuh HP
                  hitbox.addEventListener('click', triggerInfo);
                  hitbox.addEventListener('mousedown', triggerInfo);
                  
                  // Tempelkan visual dan hitbox ke dalam container, lalu ke objek 3D utama
                  container.appendChild(visual);
                  container.appendChild(hitbox);
                  this.el.appendChild(container);
                }
              });
            }
          });
        }
        
        setMounted(true);
      }
    }, 100);

    return () => clearInterval(checkAframe);
  }, []);

  // Listener untuk menangkap klik dari dunia A-Frame ke dunia React
  useEffect(() => {
    const handleInfo = (e: any) => {
      setActiveAnnotation(e.detail);
    };
    
    window.addEventListener('show-ar-info', handleInfo);
    return () => window.removeEventListener('show-ar-info', handleInfo);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50 text-white font-bold bg-transparent">
        <p className="bg-black/50 px-4 py-2 rounded-xl backdrop-blur">Menyiapkan Kamera AR...</p>
      </div>
    );
  }

  // Inject kode HTML ke data-attribute secara aman
  const encodedHotspots = encodeURIComponent(hotspotsCode || '');

  return (
    <>
      {/* UI React (Overlay) untuk memunculkan teks informasi saat diklik */}
      {activeAnnotation && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-sm">
          <div className="bg-white/95 backdrop-blur-md border-2 border-indigo-500 p-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] text-center animate-in slide-in-from-bottom-5 duration-300">
            <h3 className="font-extrabold text-2xl text-indigo-900 mb-2">{activeAnnotation}</h3>
            <p className="text-sm font-medium text-zinc-600 mb-4">Titik 3D part ini berhasil disentuh!</p>
            <button 
              onClick={() => setActiveAnnotation(null)}
              className="bg-zinc-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-zinc-800 transition-colors w-full shadow-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Kamera AR.js dan Render Dunia 3D */}
      <div
        className="w-full h-full absolute top-0 left-0 z-0"
        dangerouslySetInnerHTML={{
          __html: `
            <a-scene 
              embedded 
              arjs="sourceType: webcam; debugUIEnabled: false; trackingMethod: best;"
              renderer="antialias: true; alpha: true"
              cursor="rayOrigin: mouse; fuse: false"
              raycaster="objects: .clickable"
              gesture-detector
            >
              <a-assets>
                <a-asset-item id="dynamic-model" src="${modelUrl}"></a-asset-item>
              </a-assets>

              <!-- Marker Hiro dengan algoritma Smoothing untuk stabilitas -->
              <a-marker 
                preset="hiro" 
                smooth="true" 
                smoothCount="10" 
                smoothTolerance="0.01" 
                smoothThreshold="5"
              >
                <!-- 
                  Entity 3D yang membawa model sekaligus menjalankan 
                  algoritma hotspots-parser ciptaan kita
                -->
                <a-entity 
                  id="ar-model"
                  gltf-model="#dynamic-model"
                  position="0 0.5 0" 
                  scale="0.5 0.5 0.5"
                  rotation="-90 0 0"
                  data-hotspots="${encodedHotspots}"
                  hotspots-parser
                  gesture-handler="minScale: 0.1; maxScale: 10"
                ></a-entity>
              </a-marker>
              
              <!-- Kamera Utama -->
              <a-entity camera></a-entity>
            </a-scene>
          `,
        }}
      />
    </>
  );
}
