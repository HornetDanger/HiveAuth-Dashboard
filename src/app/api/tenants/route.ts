import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const HIVEAUTH_API_URL = process.env.HIVEAUTH_API_URL;
const HIVEAUTH_API_PREFIX = "/api/v1";
const HIVEAUTH_APP_SECRET = process.env.HIVEAUTH_APP_SECRET;

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();

  try {
    const response = await fetch(
      `${HIVEAUTH_API_URL}${HIVEAUTH_API_PREFIX}/admin/tenants${queryString ? `?${queryString}` : ""}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-app-secret": HIVEAUTH_APP_SECRET || "",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const response = await fetch(`${HIVEAUTH_API_URL}${HIVEAUTH_API_PREFIX}/admin/tenants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-secret": HIVEAUTH_APP_SECRET || "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
