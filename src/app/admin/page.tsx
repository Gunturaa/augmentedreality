"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

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
    const form = e.currentTarget;
    setUploading(true);
    setUploadStatus("Starting upload...");
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const file = formData.get("file") as File;
    const hotspotsCode = formData.get("hotspots_code") as string;

    if (!name || !file) {
      setUploadStatus("Name and file are required.");
      setUploading(false);
      return;
    }
    
    try {
      // 1. Generate unique ID for the file
      const id = crypto.randomUUID();
      const ext = file.name.substring(file.name.lastIndexOf('.'));
      const filename = `${id}${ext}`;

      // 2. Upload directly to Supabase Storage from browser
      setUploadStatus(`Uploading 3D file to Cloud...`);
      const { data: storageData, error: storageError } = await supabase.storage
        .from('ar-models')
        .upload(filename, file, {
          upsert: false,
        });

      if (storageError) {
        throw new Error("Failed to upload to storage: " + storageError.message);
      }

      // 3. Send metadata to Next.js API to generate QR Code and save to Database
      setUploadStatus("Generating QR Code & saving data...");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, name, filename, hotspots_code: hotspotsCode }),
      });
      
      if (res.ok) {
        setUploadStatus("Upload successful!");
        form.reset();
        fetchModels(); // Refresh the list
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to process metadata.");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus(error.message || "An error occurred.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setProcessingId(id);
    try {
      const res = await fetch(`/api/models/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchModels();
      } else {
        alert("Failed to delete model.");
      }
    } catch (error) {
      alert("An error occurred while deleting.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleEdit = async (id: string, currentName: string) => {
    const newName = prompt("Enter new model name:", currentName);
    
    if (newName === null || newName.trim() === "" || newName === currentName) {
      return;
    }

    setProcessingId(id);
    try {
      const res = await fetch(`/api/models/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      
      if (res.ok) {
        fetchModels();
      } else {
        alert("Failed to update model name.");
      }
    } catch (error) {
      alert("An error occurred while updating.");
    } finally {
      setProcessingId(null);
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
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl h-fit shadow-2xl sticky top-8">
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
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Hotspots HTML Code <span className="text-zinc-500 font-normal">(Opsional)</span>
                </label>
                <textarea 
                  name="hotspots_code" 
                  rows={4}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-xs"
                  placeholder='<button class="Hotspot" slot="hotspot-1" ...> ... </button>'
                ></textarea>
                <p className="text-xs text-zinc-500 mt-2 font-medium">
                  💡 <span className="text-zinc-400">Tips:</span> Anda tidak perlu repot memilah kode! Cukup <strong className="text-indigo-400">Copy semua kode (Copy HTML Snippet)</strong> dari modelviewer.dev/editor lalu Paste ke kotak ini. Sistem pintar kami akan otomatis menyaring dan mengambil kode hotspot-nya saja!
                </p>
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
                  <div key={model.id} className={`bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-xl transition-all relative ${processingId === model.id ? 'opacity-50 pointer-events-none' : 'hover:border-zinc-700'}`}>
                    
                    {/* Actions Menu */}
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                      <button 
                        onClick={() => handleEdit(model.id, model.name)}
                        className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-indigo-600 text-sm rounded-full transition-colors shadow"
                        title="Edit Name"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(model.id, model.name)}
                        className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-red-600 text-sm rounded-full transition-colors shadow"
                        title="Delete Model"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="p-6 flex-1 flex flex-col pt-10">
                      <h3 className="font-bold text-xl mb-1 truncate pr-8" title={model.name}>{model.name}</h3>
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
