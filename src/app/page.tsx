import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[120px] pointer-events-none" />

      <main className="relative z-10 flex flex-col items-center gap-10 p-8 text-center max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-200 to-indigo-500">
            WebAR Prototype
          </h1>
          <p className="text-xl sm:text-2xl font-medium text-zinc-400">
            Scan. Point. Experience.
          </p>
        </div>
        
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-2xl">
          <p className="text-base text-zinc-300 leading-relaxed mb-6">
            Welcome to the Educational AR Platform. To view an AR model, <strong>scan its QR Code</strong> using your device's camera. 
            If you are a teacher or admin, log in to the dashboard to upload and manage 3D models.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link 
              href="/admin"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-zinc-200 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              Open Admin Dashboard
            </Link>
            <a
              href="https://jeromeetienne.github.io/AR.js/data/images/hiro.png"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white/20 text-white text-base font-semibold rounded-full hover:border-white/50 hover:bg-white/5 transition-all"
            >
              Get Hiro Marker
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
