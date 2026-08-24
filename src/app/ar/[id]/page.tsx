import Script from "next/script";
import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Dynamically import the AR component with no SSR since it requires the window object
const ARScene = dynamic(() => import("../../../components/ARScene"), { ssr: false });

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
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black">
      {/* Load A-Frame and AR.js before the page becomes interactive */}
      <Script src="https://aframe.io/releases/1.3.0/aframe.min.js" strategy="beforeInteractive" />
      <Script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js" strategy="beforeInteractive" />
      
      {/* Navigation Layer (Must have high z-index to stay on top of the camera view) */}
      <div className="absolute top-6 left-6 z-50">
        <Link 
          href="/" 
          className="px-5 py-2.5 bg-white/90 backdrop-blur text-black font-semibold rounded-xl shadow-lg border border-white/20 hover:bg-white transition-all"
        >
          ← Exit AR
        </Link>
      </div>

      {/* AR Viewfinder UI */}
      <div className="absolute bottom-10 left-0 right-0 z-50 flex flex-col items-center pointer-events-none gap-2">
        <div className="bg-black/70 backdrop-blur px-6 py-3 rounded-full border border-white/20 text-white font-bold shadow-lg">
          {model.name}
        </div>
        <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-white/90 text-xs tracking-wide">
          Point camera at Hiro Marker
        </div>
      </div>

      {/* AR Scene Canvas */}
      <ARScene modelUrl={model.url} />
    </div>
  );
}
