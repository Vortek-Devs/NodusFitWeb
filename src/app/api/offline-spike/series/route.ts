import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();

  return NextResponse.json(
    {
      receivedAt: new Date().toISOString(),
      synced: true,
      payload,
    },
    { status: 202 },
  );
}
