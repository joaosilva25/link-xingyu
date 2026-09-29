import type { RowDataPacket } from "mysql2/promise";
import type { Banner } from "@/types/banner";
import { requireAdminSession } from "@/lib/admin-auth";
import { getDb, toBanner } from "@/lib/db";
import { hasDatabaseEnv } from "@/lib/env";

export async function getAllBanners(): Promise<Banner[]> {
  await requireAdminSession();
  try {
    const [rows] = await getDb().query<RowDataPacket[]>(
      "SELECT * FROM banners WHERE deleted_at IS NULL ORDER BY sort_order",
    );
    return rows.map(toBanner);
  } catch (error) {
    console.error(error);
    throw new Error("Não foi possível carregar os banners.");
  }
}

export async function getBannerById(id: string): Promise<Banner | null> {
  await requireAdminSession();
  const [rows] = await getDb().execute<RowDataPacket[]>(
    "SELECT * FROM banners WHERE id = ? AND deleted_at IS NULL",
    [id],
  );
  return rows[0] ? toBanner(rows[0]) : null;
}

export async function getPublicBanners(): Promise<Banner[]> {
  if (!hasDatabaseEnv()) return [];
  const now = new Date();
  try {
    const [rows] = await getDb().execute<RowDataPacket[]>(
      `SELECT * FROM banners
       WHERE enabled = 1 AND deleted_at IS NULL
         AND (publish_at IS NULL OR publish_at <= ?)
         AND (unpublish_at IS NULL OR unpublish_at > ?)
       ORDER BY sort_order`,
      [now, now],
    );
    return rows.map(toBanner);
  } catch (error) {
    console.error(error);
    throw new Error("Não foi possível carregar esta Link Bio.");
  }
}
