import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, filename, hotspots_code } = body;

    if (!id || !name || !filename) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Auto-extract only the hotspot buttons if user pasted the entire HTML block
    let finalHotspotsCode = hotspots_code;
    if (hotspots_code) {
      const matches = hotspots_code.match(/<button class="Hotspot"[\s\S]*?<\/button>/g);
      if (matches) {
        finalHotspotsCode = matches.join('\n');
      } else {
        // If no hotspots found, leave it empty
        finalHotspotsCode = null;
      }
    }

    // Get public URL from Supabase
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
          arUrl: arUrl,
          hotspots_code: finalHotspotsCode || null
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
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: "Failed to process metadata" }, { status: 500 });
  }
}
