import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const username = "001";
  const password = "001";

  try {
    const body = await req.json();

    const backendResponse = await fetch(
      "http://87.241.165.71:8081/web/hs/Eportal/Order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(`${username}:${password}`).toString("base64"),
        },
        body: JSON.stringify(body),
      }
    );

    const text = await backendResponse.text();

    if (!backendResponse.ok) {
      return new NextResponse(text, { status: backendResponse.status });
    }

    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return new NextResponse(text);
    }
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Proxy error", { status: 500 });
  }
}
