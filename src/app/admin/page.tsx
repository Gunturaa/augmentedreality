"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AdminDashboard() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const fetchModels = async () => {
    try {
      const res = await fetch("/api/models");
      const data = await res.json();
      setModels(data);
    } catch (error) {
      console.error("Failed to fetch models", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setUploadStatus("Uploading...");
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        setUploadStatus("Upload successful!");
        e.currentTarget.reset();
        fetchModels(); // Refresh the list
      } else {
        setUploadStatus("Upload failed.");
      }
    } catch (error) {
      setUploadStatus("An error occurred.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
            <p className="text-zinc-400 mt-1">Manage your AR 3D models and QR codes</p>
          </div>
          <Link href="/" className="px-5 py-2.5 bg-zinc-800 font-semibold rounded-xl hover:bg-zinc-700 transition shadow-lg border border-zinc-700/50">
            Back to Home
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl h-fit shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Upload New Model</h2>
            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Model Name / Lesson</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g., Solar System"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">3D File (.glb)</label>
                <input 
                  type="file" 
                  name="file" 
                  accept=".glb" 
                  required 
                  className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer focus:outline-none transition-all"
                />
              </div>
              <button 
                type="submit" 
                disabled={uploading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-50 mt-4"
              >
                {uploading ? "Uploading & Generating QR..." : "Upload & Generate QR"}
              </button>
              {uploadStatus && <p className="text-sm text-center font-medium text-zinc-400 pt-2">{uploadStatus}</p>}
            </form>
          </div>

          {/* Model List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Uploaded Models
              {!loading && <span className="bg-zinc-800 text-xs py-1 px-2.5 rounded-full">{models.length}</span>}
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center h-48 bg-zinc-900/50 rounded-3xl border border-zinc-800/50 animate-pulse">
                <p className="text-zinc-500 font-medium">Loading models...</p>
              </div>
            ) : models.length === 0 ? (
              <div className="bg-zinc-900/50 border border-zinc-800 p-12 rounded-3xl text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🧊</span>
                </div>
                <h3 className="text-lg font-bold mb-2">No models yet</h3>
                <p className="text-zinc-500 max-w-sm">Upload your first .glb file using the form on the left to generate an AR experience.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {models.map((model) => (
                  <div key={model.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-xl hover:border-zinc-700 transition-colors">
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-xl mb-1 truncate">{model.name}</h3>
                      <p className="text-xs text-zinc-500 font-mono mb-6 truncate" title={model.id}>{model.id.split('-')[0]}...glb</p>
                      
                      <div className="flex-1 flex justify-center items-center bg-white p-6 rounded-2xl">
                        <Image 
                          src={model.qrCode} 
                          alt="QR Code" 
                          width={250} 
                          height={250}
                          className="w-full max-w-[160px] h-auto drop-shadow-md"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-black/40 p-4 border-t border-zinc-800 flex justify-between items-center gap-3">
                      <a 
                        href={model.qrCode} 
                        download={`qr-${model.name.replace(/\s+/g, '-').toLowerCase()}.png`}
                        className="flex-1 text-center text-sm font-semibold px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition"
                      >
                        Download QR
                      </a>
                      <a 
                        href={model.arUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 text-center text-sm font-semibold px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-900/20"
                      >
                        Test AR
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
