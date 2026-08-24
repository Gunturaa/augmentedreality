import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Model not found" }, { status: 404 });
  }
}
