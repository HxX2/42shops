import { NextResponse, type NextRequest } from "next/server";
import { fetchCdnImage } from "@/lib/ft-api";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ path?: string[] }> }
) {
  const params = await props.params;
  let targetPath = "";

  if (params.path && params.path.length > 0) {
    targetPath = "/" + params.path.join("/");
  } else {
    targetPath = request.nextUrl.searchParams.get("path") || "";
  }

  if (!targetPath) {
    return new NextResponse("Missing image path", { status: 400 });
  }

  const result = await fetchCdnImage(targetPath);
  if (!result) {
    return new NextResponse("Image not found", { status: 404 });
  }

  return new NextResponse(result.buffer, {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
    },
  });
}
