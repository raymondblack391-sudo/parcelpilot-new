import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing location query.",
        },
        { status: 400 }
      );
    }

    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?format=jsonv2` +
      `&limit=1` +
      `&addressdetails=1` +
      `&q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ParcelPilot/1.0 (parcelpilot logistics)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Geocoding service returned HTTP ${response.status}.`,
        },
        { status: 502 }
      );
    }

    const results = await response.json();

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Location not found.",
        latitude: null,
        longitude: null,
        displayName: null,
      });
    }

    const result = results[0];

    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({
        success: false,
        error: "Invalid coordinates returned by geocoding service.",
        latitude: null,
        longitude: null,
        displayName: null,
      });
    }

    return NextResponse.json({
      success: true,
      latitude,
      longitude,
      displayName: result.display_name || query,
    });
  } catch (error) {
    console.error("GEOCODE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to geocode this location.",
      },
      { status: 500 }
    );
  }
}
