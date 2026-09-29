import "server-only";

import type { RowDataPacket } from "mysql2/promise";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { requireAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import type {
  BannerWithClicks,
  ClickMetrics,
  ClickRankingItem,
  MetricsPeriod,
} from "@/types/click-metrics";
import type { Banner } from "@/types/banner";

const TIME_ZONE = "America/Sao_Paulo";
// America/Sao_Paulo não tem horário de verão desde 2019; CONVERT_TZ com offset fixo dispensa as tabelas de fuso do MySQL.
const MYSQL_OFFSET = "-03:00";
const DAY = 24 * 60 * 60 * 1000;

const toIso = (value: unknown) =>
  value instanceof Date ? value.toISOString() : value ? String(value) : null;

export async function getClickMetrics(
  period: MetricsPeriod,
): Promise<ClickMetrics> {
  await requireAdminSession();
  const db = getDb();
  const now = new Date();
  const todayKey = formatInTimeZone(now, TIME_ZONE, "yyyy-MM-dd");
  const todayStart = fromZonedTime(`${todayKey}T00:00:00`, TIME_ZONE);
  const seriesStart = new Date(todayStart.getTime() - (period - 1) * DAY);
  const ago = (days: number) => new Date(now.getTime() - days * DAY);

  try {
    const [[totals]] = await db.execute<RowDataPacket[]>(
      `SELECT
         COALESCE(SUM(clicked_at >= ? AND clicked_at < ?), 0) AS today,
         COALESCE(SUM(clicked_at >= ? AND clicked_at < ?), 0) AS yesterday,
         COALESCE(SUM(clicked_at >= ?), 0) AS last7,
         COALESCE(SUM(clicked_at >= ? AND clicked_at < ?), 0) AS previous7,
         COALESCE(SUM(clicked_at >= ?), 0) AS last30,
         COALESCE(SUM(clicked_at >= ? AND clicked_at < ?), 0) AS previous30,
         COUNT(*) AS total
       FROM banner_clicks`,
      [
        todayStart,
        new Date(todayStart.getTime() + DAY),
        new Date(todayStart.getTime() - DAY),
        todayStart,
        ago(7),
        ago(14),
        ago(7),
        ago(30),
        ago(60),
        ago(30),
      ],
    );

    const [daily] = await db.execute<RowDataPacket[]>(
      `SELECT DATE_FORMAT(CONVERT_TZ(clicked_at, '+00:00', '${MYSQL_OFFSET}'), '%Y-%m-%d') AS day,
              COUNT(*) AS clicks
       FROM banner_clicks
       WHERE clicked_at >= ?
       GROUP BY day`,
      [seriesStart],
    );
    const perDay = new Map(daily.map((row) => [row.day, Number(row.clicks)]));
    const series = Array.from({ length: period }, (_, index) => {
      const date = formatInTimeZone(
        new Date(seriesStart.getTime() + index * DAY + 12 * 60 * 60 * 1000),
        TIME_ZONE,
        "yyyy-MM-dd",
      );
      return { date, clicks: perDay.get(date) ?? 0 };
    });

    const [ranked] = await db.execute<RowDataPacket[]>(
      `SELECT b.id, b.internal_name, b.image_url, b.enabled, b.publish_at, b.unpublish_at,
              COUNT(c.id) AS clicks
       FROM banner_clicks c
       JOIN banners b ON b.id = c.banner_id
       WHERE c.clicked_at >= ?
       GROUP BY b.id
       ORDER BY clicks DESC
       LIMIT 5`,
      [ago(period)],
    );
    const ranking: ClickRankingItem[] = ranked.map((row) => ({
      id: row.id,
      internal_name: row.internal_name,
      image_url: row.image_url,
      enabled: Boolean(row.enabled),
      publish_at: toIso(row.publish_at),
      unpublish_at: toIso(row.unpublish_at),
      clicks: Number(row.clicks),
    }));

    return {
      today: Number(totals.today),
      yesterday: Number(totals.yesterday),
      last7: Number(totals.last7),
      previous7: Number(totals.previous7),
      last30: Number(totals.last30),
      previous30: Number(totals.previous30),
      total: Number(totals.total),
      series,
      ranking,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Não foi possível carregar as métricas de clique.");
  }
}

export async function addClickCounts(
  banners: Banner[],
): Promise<BannerWithClicks[]> {
  await requireAdminSession();
  let rows: RowDataPacket[];
  try {
    [rows] = await getDb().query<RowDataPacket[]>(
      "SELECT banner_id, COUNT(*) AS click_count FROM banner_clicks GROUP BY banner_id",
    );
  } catch (error) {
    console.error(error);
    throw new Error("Não foi possível carregar os cliques dos banners.");
  }
  const counts = new Map(
    rows.map((item) => [item.banner_id as string, Number(item.click_count)]),
  );
  return banners.map((banner) => ({
    ...banner,
    click_count: counts.get(banner.id) ?? 0,
  }));
}
