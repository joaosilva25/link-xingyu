import type { RowDataPacket } from "mysql2/promise";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function safeHeader(value: string | null) {
  return value ? value.slice(0, 500) : null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const now = new Date();
  let destination: URL;

  try {
    const [rows] = await getDb().execute<RowDataPacket[]>(
      `SELECT id, destination_url FROM banners
       WHERE id = ? AND enabled = 1 AND deleted_at IS NULL
         AND (publish_at IS NULL OR publish_at <= ?)
         AND (unpublish_at IS NULL OR unpublish_at > ?)`,
      [id, now, now],
    );
    const data = rows[0];
    if (!data?.destination_url)
      return new Response("Banner não encontrado.", { status: 404 });
    destination = new URL(data.destination_url);
    if (!["http:", "https:"].includes(destination.protocol))
      return new Response("Destino inválido.", { status: 404 });
  } catch (error) {
    console.error("Falha ao localizar banner para redirecionamento.", error);
    return new Response("Banner não encontrado.", { status: 404 });
  }

  try {
    await getDb().execute(
      "INSERT INTO banner_clicks (banner_id, clicked_at, referrer, user_agent) VALUES (?, ?, ?, ?)",
      [
        id,
        now,
        safeHeader(request.headers.get("referer")),
        safeHeader(request.headers.get("user-agent")),
      ],
    );
  } catch (error) {
    console.error("Falha ao registrar clique de banner.", error);
  }

  return Response.redirect(destination, 307);
}
