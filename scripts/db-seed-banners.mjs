import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import mysql from "mysql2/promise";

nextEnv.loadEnvConfig(process.cwd());

const uri = process.env.DATABASE_URL;
if (!uri) {
  console.error("Defina DATABASE_URL antes de importar os banners.");
  process.exit(1);
}

const BANNERS = [
  {
    name: "Coleção Lunar",
    file: "src/assets/BANNER BIO - Lunar.png",
    url: "https://www.xingyu.com.br/collections/colecao-lunar?utm_source=BANNER&utm_medium=INSTABIO&utm_campaign=10SI&utm_id=COLECAOLUNAR",
  },
  {
    name: "Black Friday",
    file: "src/assets/BANNER BIO BlackFriday.png",
    url: "http://ab.xingyujewelry.com.br/?utm_source=BANNERINSTA&utm_medium=BIOCAPTURA&utm_campaign=11AB&utm_id=LANCAMENTO",
  },
  {
    name: "Site Xingyu",
    file: "src/assets/BANNER 02.png",
    url: "https://www.xingyu.com.br",
  },
  {
    name: "Grupo VIP",
    file: "src/assets/BANNER 05.png",
    url: "https://vip.xingyujewelry.com.br/",
  },
];

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

const db = await mysql.createConnection({ uri, timezone: "Z" });
try {
  const [[{ total }]] = await db.query(
    "SELECT COUNT(*) AS total FROM banners WHERE deleted_at IS NULL",
  );
  if (Number(total) > 0 && !process.argv.includes("--force")) {
    console.log(`Já existem ${total} banners cadastrados; nada foi importado. Use --force para importar mesmo assim.`);
    process.exit(0);
  }

  const [[{ last }]] = await db.query(
    "SELECT MAX(sort_order) AS last FROM banners WHERE deleted_at IS NULL",
  );
  let order = last === null ? 0 : Number(last) + 1;

  await db.beginTransaction();
  for (const banner of BANNERS) {
    const now = new Date();
    const imageId = randomUUID();
    await db.execute(
      "INSERT INTO banner_images (id, content_type, data, created_at) VALUES (?, ?, ?, ?)",
      [imageId, MIME[extname(banner.file).toLowerCase()], await readFile(banner.file), now],
    );
    await db.execute(
      `INSERT INTO banners (id, internal_name, image_url, image_path, destination_url,
         alt_text, enabled, open_new_tab, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?)`,
      [randomUUID(), banner.name, `/media/${imageId}`, imageId, banner.url, banner.name, order++, now, now],
    );
    console.log(`Importado: ${banner.name}`);
  }
  await db.commit();
} catch (error) {
  await db.rollback().catch(() => {});
  throw error;
} finally {
  await db.end();
}
