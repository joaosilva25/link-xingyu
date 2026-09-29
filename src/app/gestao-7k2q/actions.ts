"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fromZonedTime } from "date-fns-tz";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { clearAdminSession, requireAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { bannerSchema } from "@/lib/validation";

async function adminDb() {
  await requireAdminSession();
  return getDb();
}

const text = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();
const toUtc = (value: string) =>
  value ? fromZonedTime(value, "America/Sao_Paulo") : null;

function refreshBannerPages() {
  revalidatePath("/");
  revalidatePath("/gestao-7k2q");
  revalidatePath("/gestao-7k2q/banners");
  revalidatePath("/gestao-7k2q/programacoes");
}

async function nextSortOrder(db: Awaited<ReturnType<typeof adminDb>>) {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT MAX(sort_order) AS last FROM banners WHERE deleted_at IS NULL",
  );
  const last = rows[0]?.last;
  return last === null || last === undefined ? 0 : Number(last) + 1;
}

export async function saveBanner(data: FormData) {
  const db = await adminDb();
  const id = text(data, "id");
  const oldImageUrl = text(data, "existing_image_url");
  const oldImagePath = text(data, "existing_image_path") || null;
  const parsed = bannerSchema.safeParse({
    internal_name: text(data, "internal_name"),
    destination_url: text(data, "destination_url"),
    alt_text: text(data, "alt_text"),
    enabled: data.get("enabled") === "on",
    open_new_tab: data.get("open_new_tab") === "on",
    publish_at: text(data, "publish_at"),
    unpublish_at: text(data, "unpublish_at"),
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message || "Revise os campos.");

  let imageUrl = oldImageUrl;
  let imagePath = oldImagePath;
  let uploadedPath: string | null = null;
  const file = data.get("image");

  if (file instanceof File && file.size) {
    if (file.size > 8 * 1024 * 1024)
      throw new Error("A imagem deve ter no máximo 8 MB.");
    if (
      !["image/png", "image/jpeg", "image/webp", "image/avif"].includes(
        file.type,
      )
    )
      throw new Error("Envie PNG, JPG, WEBP ou AVIF.");
    uploadedPath = crypto.randomUUID();
    try {
      await db.execute(
        "INSERT INTO banner_images (id, content_type, data, created_at) VALUES (?, ?, ?, ?)",
        [
          uploadedPath,
          file.type,
          Buffer.from(await file.arrayBuffer()),
          new Date(),
        ],
      );
    } catch (error) {
      console.error(error);
      throw new Error("Não foi possível enviar a imagem. Tente novamente.");
    }
    imagePath = uploadedPath;
    imageUrl = `/media/${uploadedPath}`;
  }
  if (!imageUrl) throw new Error("Selecione uma imagem.");

  const now = new Date();
  const values = [
    parsed.data.internal_name,
    imageUrl,
    imagePath,
    parsed.data.destination_url || null,
    parsed.data.alt_text || null,
    parsed.data.enabled,
    parsed.data.open_new_tab,
    toUtc(parsed.data.publish_at),
    toUtc(parsed.data.unpublish_at),
  ];

  try {
    if (id) {
      await db.execute(
        `UPDATE banners SET internal_name = ?, image_url = ?, image_path = ?,
           destination_url = ?, alt_text = ?, enabled = ?, open_new_tab = ?,
           publish_at = ?, unpublish_at = ?, updated_at = ?
         WHERE id = ?`,
        [...values, now, id],
      );
    } else {
      await db.execute(
        `INSERT INTO banners (id, internal_name, image_url, image_path,
           destination_url, alt_text, enabled, open_new_tab, publish_at,
           unpublish_at, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), ...values, await nextSortOrder(db), now, now],
      );
    }
  } catch (error) {
    console.error(error);
    if (uploadedPath)
      await db.execute("DELETE FROM banner_images WHERE id = ?", [
        uploadedPath,
      ]);
    throw new Error(
      id
        ? "Não foi possível salvar as alterações. Tente novamente."
        : "Não foi possível criar o banner. Tente novamente.",
    );
  }

  if (id && uploadedPath && oldImagePath && oldImagePath !== uploadedPath) {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM banners WHERE image_path = ? AND id <> ? AND deleted_at IS NULL",
      [oldImagePath, id],
    );
    if (Number(rows[0]?.total ?? 0) === 0)
      await db.execute("DELETE FROM banner_images WHERE id = ?", [
        oldImagePath,
      ]);
  }

  refreshBannerPages();
  redirect(`/gestao-7k2q/banners?saved=${id ? "updated" : "created"}`);
}

export async function toggleBanner(id: string, enabled: boolean) {
  const db = await adminDb();
  try {
    await db.execute(
      "UPDATE banners SET enabled = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL",
      [enabled, new Date(), id],
    );
  } catch (error) {
    console.error(error);
    throw new Error("Não foi possível alterar o banner. Tente novamente.");
  }
  refreshBannerPages();
}

export async function duplicateBanner(id: string) {
  const db = await adminDb();
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT internal_name, image_url, image_path, destination_url, alt_text,
            publish_at, unpublish_at, open_new_tab
     FROM banners WHERE id = ? AND deleted_at IS NULL`,
    [id],
  );
  const source = rows[0];
  if (!source) throw new Error("Banner não encontrado.");
  const now = new Date();
  try {
    await db.execute(
      `INSERT INTO banners (id, internal_name, image_url, image_path,
         destination_url, alt_text, enabled, open_new_tab, publish_at,
         unpublish_at, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        `${source.internal_name} — cópia`,
        source.image_url,
        source.image_path,
        source.destination_url,
        source.alt_text,
        source.open_new_tab,
        source.publish_at,
        source.unpublish_at,
        await nextSortOrder(db),
        now,
        now,
      ],
    );
  } catch (error) {
    console.error(error);
    throw new Error("Não foi possível duplicar o banner.");
  }
  refreshBannerPages();
}

export async function deleteBanner(id: string) {
  const db = await adminDb();
  const now = new Date();
  try {
    await db.execute(
      "UPDATE banners SET deleted_at = ?, enabled = 0, updated_at = ? WHERE id = ?",
      [now, now, id],
    );
  } catch (error) {
    console.error(error);
    throw new Error("Não foi possível excluir o banner.");
  }
  refreshBannerPages();
}

export async function reorderBanners(ids: string[]) {
  const db = await adminDb();
  if (!ids.length || new Set(ids).size !== ids.length)
    throw new Error("A ordem enviada é inválida.");
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const now = new Date();
    for (const [position, bannerId] of ids.entries()) {
      const [result] = await connection.execute<ResultSetHeader>(
        "UPDATE banners SET sort_order = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL",
        [position, now, bannerId],
      );
      if (result.affectedRows === 0) throw new Error("banner not found");
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error(error);
    throw new Error("Não foi possível salvar a nova ordem.");
  } finally {
    connection.release();
  }
  refreshBannerPages();
}

export async function logout() {
  await clearAdminSession();
  redirect("/acesso-7k2q");
}
