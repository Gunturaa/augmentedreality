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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('models')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update model" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Ambil filename dulu untuk dihapus dari Storage
    const { data: modelData, error: fetchError } = await supabase
      .from('models')
      .select('filename')
      .eq('id', id)
      .single();

    if (fetchError || !modelData) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    // Hapus dari bucket 'ar-models'
    const { error: storageError } = await supabase.storage
      .from('ar-models')
      .remove([modelData.filename]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
    }

    // Hapus dari tabel database
    const { error: dbError } = await supabase
      .from('models')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete model" }, { status: 500 });
  }
}
