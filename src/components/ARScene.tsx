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
                  // Membersihkan huruf 'm' (meter) dari koordinat Google
                  const cleanPos = pos.replace(/m/g, '').trim();
                  
                  // Menciptakan "Bola Bercahaya" 3D di koordinat tersebut
                  const sphere = document.createElement('a-sphere');
                  sphere.setAttribute('position', cleanPos);
                  sphere.setAttribute('radius', '0.08'); // Ukuran bola
                  sphere.setAttribute('color', '#4f46e5'); // Warna ungu indigo
                  sphere.setAttribute('opacity', '0.9');
                  sphere.setAttribute('class', 'clickable'); // Agar bisa di-klik oleh raycaster
                  sphere.setAttribute('animation__pulse', 'property: scale; from: 1 1 1; to: 1.4 1.4 1.4; dir: alternate; loop: true; dur: 800');
                  
                  // Menambahkan logika saat bola disentuh/diklik
                  sphere.addEventListener('click', () => {
                    // Mengirim sinyal ke antarmuka React dengan membawa teks keterangan
                    window.dispatchEvent(new CustomEvent('show-ar-info', { detail: text }));
                    
                    // Animasi kedip kuning saat diklik
                    sphere.setAttribute('color', '#fbbf24');
                    setTimeout(() => sphere.setAttribute('color', '#4f46e5'), 500);
                  });
                  
                  // Tempelkan bola ke dalam objek 3D utama
                  this.el.appendChild(sphere);
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
                  animation="property: rotation; to: -90 360 0; loop: true; dur: 15000; easing: linear"
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
