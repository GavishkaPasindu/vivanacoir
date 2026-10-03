import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const url = process.env.GOOGLE_SCRIPT_URL;
    if (!url) {
      console.warn("GOOGLE_SCRIPT_URL not set in environment variables");
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    const res = await fetch(url, {
      method: "GET",
      cache: 'no-store'
    });

    if (!res.ok) throw new Error("Failed to fetch orders from Google Sheets");

    const orders = await res.json();
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const url = process.env.GOOGLE_SCRIPT_URL;
    if (!url) {
      return NextResponse.json({ success: true, mock: true }, { status: 200 });
    }

    const payload = await req.json();

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to push to Google Sheets");

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
