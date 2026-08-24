import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const revalidate = 0; // Disable static caching

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Fetch models error:", error);
    return NextResponse.json([]);
  }
}
