import { createClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, size, price, qty, name, phone, address } = body

    // Validate required fields
    if (!productId || !qty || !name || !phone || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from("purchases").insert([{ productId, size, price, qty, name, phone, address }])

    if (error) {
      console.error("[v0] Supabase insert error:", error)
      return NextResponse.json({ error: error.message || "Failed to save purchase" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] POST /api/purchase error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("purchases").select("*").order("createdAt", { ascending: false })

    if (error) {
      console.error("[v0] Supabase select error:", error)
      return NextResponse.json({ error: error.message || "Failed to fetch purchases" }, { status: 500 })
    }

    return NextResponse.json({ purchases: data || [] })
  } catch (err) {
    console.error("[v0] GET /api/purchase error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
