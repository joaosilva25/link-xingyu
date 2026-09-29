import { vi } from "vitest";

export class RedirectError extends Error {
  constructor(public readonly url: string) {
    super(`NEXT_REDIRECT:${url}`);
  }
}

export const redirectMock = vi.fn((url: string) => {
  throw new RedirectError(url);
});

export type ExecuteCall = [string, unknown[] | undefined];

export function fakeDb(
  responses: Array<unknown[] | Error> = [],
) {
  const calls: ExecuteCall[] = [];
  const queue = [...responses];
  const run = vi.fn(async (sql: string, params?: unknown[]) => {
    calls.push([sql.replace(/\s+/g, " ").trim(), params]);
    const next = queue.shift();
    if (next instanceof Error) throw next;
    return [next ?? [], []];
  });
  const connection = {
    beginTransaction: vi.fn(async () => {}),
    commit: vi.fn(async () => {}),
    rollback: vi.fn(async () => {}),
    release: vi.fn(),
    execute: run,
  };
  return {
    calls,
    connection,
    pool: {
      execute: run,
      query: run,
      getConnection: vi.fn(async () => connection),
    },
  };
}

export const bannerRow = (overrides: Record<string, unknown> = {}) => ({
  id: "11111111-1111-4111-8111-111111111111",
  internal_name: "Coleção Lunar",
  image_url: "/media/22222222-2222-4222-8222-222222222222",
  image_path: "22222222-2222-4222-8222-222222222222",
  destination_url: "https://www.xingyu.com.br",
  alt_text: "Lunar",
  sort_order: 0,
  enabled: 1,
  publish_at: null,
  unpublish_at: null,
  open_new_tab: 1,
  created_at: new Date("2026-09-01T12:00:00.000Z"),
  updated_at: new Date("2026-09-02T12:00:00.000Z"),
  deleted_at: null,
  ...overrides,
});
