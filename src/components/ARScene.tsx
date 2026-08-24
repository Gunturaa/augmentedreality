"use client";

import { useEffect, useState } from "react";

export default function ARScene({ modelUrl }: { modelUrl: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ensuring the component only renders on the client side
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // We use dangerouslySetInnerHTML to prevent React from trying to manage
  // A-Frame's custom DOM elements and avoiding hydration/re-render issues.
  return (
    <div
      className="w-full h-full absolute top-0 left-0 z-0"
      dangerouslySetInnerHTML={{
        __html: `
          <a-scene embedded arjs="sourceType: webcam; debugUIEnabled: false;">
            <a-assets>
              <!-- Load the dynamic 3D model passed from the server -->
              <a-asset-item id="dynamic-model" src="${modelUrl}"></a-asset-item>
            </a-assets>

            <a-marker preset="hiro">
              <a-entity 
                gltf-model="#dynamic-model"
                position="0 0.5 0" 
                scale="0.5 0.5 0.5"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear"
              ></a-entity>
            </a-marker>
            <a-entity camera></a-entity>
          </a-scene>
        `,
      }}
    />
  );
}
