"use client";

import { useEffect, useState } from "react";

export default function ARScene({ modelUrl }: { modelUrl: string }) {
  const [mounted, setMounted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Wait until A-Frame is fully loaded from the Next.js Script tags
    const checkAframe = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).AFRAME) {
        clearInterval(checkAframe);
        
        // Register custom A-Frame component for interaction
        if (!(window as any).AFRAME.components['interactive-model']) {
          (window as any).AFRAME.registerComponent('interactive-model', {
            init: function () {
              const el = this.el;
              
              // Listen for click/tap events
              el.addEventListener('click', () => {
                // Dispatch event to React
                window.dispatchEvent(new CustomEvent('ar-model-click'));
                
                // Add a quick visual "bounce" animation to the 3D model
                el.setAttribute('animation__bounce', 'property: scale; from: 0.5 0.5 0.5; to: 0.8 0.8 0.8; dur: 150; dir: alternate; loop: 1');
              });
            }
          });
        }
        
        setMounted(true);
      }
    }, 100);

    return () => clearInterval(checkAframe);
  }, []);

  // Listen for the custom event dispatched from A-Frame
  useEffect(() => {
    const handleModelClick = () => {
      setShowPopup(true);
      // Auto-hide popup after 3 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    };

    window.addEventListener('ar-model-click', handleModelClick);
    return () => window.removeEventListener('ar-model-click', handleModelClick);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50 text-white font-bold bg-transparent">
        <p className="bg-black/50 px-4 py-2 rounded-xl backdrop-blur">Menyiapkan Kamera AR...</p>
      </div>
    );
  }

  return (
    <>
      {/* Interactive Pop-up UI for Exam Requirement */}
      {showPopup && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md border-2 border-indigo-500 text-black px-6 py-5 rounded-3xl shadow-[0_10px_40px_rgba(79,70,229,0.3)] animate-bounce text-center min-w-[250px]">
            <div className="text-4xl mb-2">✨</div>
            <h3 className="font-extrabold text-xl mb-1 text-indigo-900">Interaksi Berhasil!</h3>
            <p className="text-sm font-semibold text-zinc-600">Model 3D disentuh oleh user.</p>
          </div>
        </div>
      )}

      {/* AR Scene */}
      <div
        className="w-full h-full absolute top-0 left-0 z-0"
        dangerouslySetInnerHTML={{
          __html: `
            <a-scene 
              embedded 
              arjs="sourceType: webcam; debugUIEnabled: false;"
              renderer="antialias: true; alpha: true"
              cursor="rayOrigin: mouse; fuse: false"
              raycaster="objects: .clickable"
            >
              <a-assets>
                <a-asset-item id="dynamic-model" src="${modelUrl}"></a-asset-item>
              </a-assets>

              <!-- Hiro Marker with Smoothing enabled -->
              <a-marker 
                preset="hiro" 
                smooth="true" 
                smoothCount="10" 
                smoothTolerance="0.01" 
                smoothThreshold="5"
              >
                <!-- 3D Model with interaction classes -->
                <a-entity 
                  id="ar-model"
                  class="clickable"
                  interactive-model
                  gltf-model="#dynamic-model"
                  position="0 0.5 0" 
                  scale="0.5 0.5 0.5"
                  animation="property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear"
                ></a-entity>
              </a-marker>
              
              <!-- Camera entity -->
              <a-entity camera></a-entity>
            </a-scene>
          `,
        }}
      />
    </>
  );
}
