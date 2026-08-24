import Script from "next/script";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

import ARScene from "../../../components/ARScene";

async function getModel(id: string) {
  try {
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !data) return null;
    return data;
  } catch (e) {
    return null;
  }
}

export default async function DynamicARPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const model = await getModel(id);

  if (!model) {
    notFound();
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-transparent">
      {/* Load A-Frame and AR.js */}
      <Script src="https://aframe.io/releases/1.3.0/aframe.min.js" strategy="beforeInteractive" />
      <Script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js" strategy="beforeInteractive" />
      {/* Load AR.js Gesture Controls (Zoom & Rotate) */}
      <Script src="https://raw.githack.com/fcor/arjs-gestures/master/dist/gestures.js" strategy="beforeInteractive" />
      
      {/* Navigation Layer */}
      <div className="absolute top-6 left-6 z-50">
        <Link 
          href="/" 
          className="px-5 py-2.5 bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-semibold rounded-2xl shadow-lg hover:bg-white hover:text-black transition-all"
        >
          ← Kembali
        </Link>
      </div>

      {/* Model Title */}
      <div className="absolute top-6 right-6 z-50 pointer-events-none">
        <div className="bg-black/60 backdrop-blur px-5 py-2.5 rounded-2xl border border-white/10 text-white font-bold shadow-lg">
          {model.name}
        </div>
      </div>

      {/* Model Viewer Scene */}
      <ARScene modelUrl={model.url} hotspotsCode={model.hotspots_code} />
    </div>
  );
}
