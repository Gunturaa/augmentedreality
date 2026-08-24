import { NextRequest, NextResponse } from "next/server";
import path from "path";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const file = formData.get("file") as File;

    if (!name || !file) {
      return NextResponse.json({ error: "Name and file are required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique ID and filename
    const id = crypto.randomUUID();
    const ext = path.extname(file.name) || ".glb";
    const filename = `${id}${ext}`;

    // Upload to Supabase Storage (bucket: ar-models)
    const { data: storageData, error: storageError } = await supabase.storage
      .from('ar-models')
      .upload(filename, buffer, {
        contentType: file.type || 'model/gltf-binary',
        upsert: false
      });

    if (storageError) {
      console.error("Storage upload error:", storageError);
      return NextResponse.json({ error: "Failed to upload file to storage. Did you create the 'ar-models' bucket?" }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('ar-models')
      .getPublicUrl(filename);
      
    const fileUrl = publicUrlData.publicUrl;

    // Generate QR Code data URL pointing to the dynamic AR page
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const arUrl = `${protocol}://${host}/ar/${id}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(arUrl, { 
      width: 400, 
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });

    // Save metadata to Supabase DB
    const { data: dbData, error: dbError } = await supabase
      .from('models')
      .insert([
        {
          id,
          name,
          filename,
          url: fileUrl,
          qrCode: qrCodeDataUrl,
          arUrl: arUrl
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      return NextResponse.json({ error: "Failed to save model metadata to database." }, { status: 500 });
    }

    return NextResponse.json(dbData, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}
