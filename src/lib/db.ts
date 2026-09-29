import "server-only";

import mysql from "mysql2/promise";
import type { Banner } from "@/types/banner";

declare global {
  var __linkbioPool: mysql.Pool | undefined;
}

export function getDb() {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("Banco de dados não configurado.");
  globalThis.__linkbioPool ??= mysql.createPool({
    uri,
    timezone: "Z",
    connectionLimit: 5,
    waitForConnections: true,
  });
  return globalThis.__linkbioPool;
}

const toIso = (value: unknown) =>
  value instanceof Date ? value.toISOString() : value ? String(value) : null;

export function toBanner(row: mysql.RowDataPacket): Banner {
  return {
    id: row.id,
    internal_name: row.internal_name,
    image_url: row.image_url,
    image_path: row.image_path,
    destination_url: row.destination_url,
    alt_text: row.alt_text,
    sort_order: Number(row.sort_order),
    enabled: Boolean(row.enabled),
    publish_at: toIso(row.publish_at),
    unpublish_at: toIso(row.unpublish_at),
    open_new_tab: Boolean(row.open_new_tab),
    created_at: toIso(row.created_at)!,
    updated_at: toIso(row.updated_at)!,
    deleted_at: toIso(row.deleted_at),
  };
}
