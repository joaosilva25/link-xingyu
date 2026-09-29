import type { RowDataPacket } from "mysql2/promise";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID.test(id))
    return new Response("Imagem não encontrada.", { status: 404 });

  try {
    const [rows] = await getDb().execute<RowDataPacket[]>(
      "SELECT content_type, data FROM banner_images WHERE id = ?",
      [id],
    );
    const image = rows[0];
    if (!image) return new Response("Imagem não encontrada.", { status: 404 });
    return new Response(new Uint8Array(image.data as Buffer), {
      headers: {
        "Content-Type": image.content_type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Falha ao carregar imagem de banner.", error);
    return new Response("Imagem não encontrada.", { status: 404 });
  }
}
