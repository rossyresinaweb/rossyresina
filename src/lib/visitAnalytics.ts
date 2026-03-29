import prisma from "@/lib/prisma";
import { getVisitStats as getLegacyVisitStats, recordVisit as recordLegacyVisit } from "@/lib/visitStore";

const db = prisma as any;

export type VisitWindowPreset = "24h" | "7d" | "30d" | "90d" | "365d" | "all";

const WINDOW_DAYS: Record<Exclude<VisitWindowPreset, "all">, number> = {
  "24h": 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "365d": 365,
};

const cleanText = (value: unknown, fallback: string): string => {
  const v = String(value || "").trim();
  return v || fallback;
};

export const normalizeIp = (value: unknown): string => {
  let ip = String(value || "").trim();
  if (!ip) return "";
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  return ip;
};

const toDateKey = (value: Date): string => {
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, "0");
  const d = String(value.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const toMonthKey = (value: Date): string => {
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

export function parseWindowPreset(value: unknown): VisitWindowPreset {
  const v = String(value || "").trim().toLowerCase();
  if (v === "24h") return "24h";
  if (v === "7d") return "7d";
  if (v === "30d") return "30d";
  if (v === "90d") return "90d";
  if (v === "365d") return "365d";
  return "all";
}

export function resolveWindowDates(preset: VisitWindowPreset): { start: Date | null; end: Date; label: string } {
  const end = new Date();
  if (preset === "all") return { start: null, end, label: "Todo el historial" };
  const days = WINDOW_DAYS[preset];
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end, label: `Últimos ${days} días` };
}

export async function recordVisitDb(input: {
  path: string;
  country: string;
  city: string;
  visitorId: string;
  userEmail?: string;
  userName?: string;
}) {
  const now = new Date();
  const visitorId = cleanText(input.visitorId, "anon");
  const path = cleanText(input.path, "/");
  const country = cleanText(input.country, "DESCONOCIDO").toUpperCase();
  const city = cleanText(input.city, "DESCONOCIDA").toUpperCase();
  const userEmail = String(input.userEmail || "").trim().toLowerCase() || null;
  const userName = String(input.userName || "").trim() || null;

  try {
    await db.$transaction([
      db.webVisitorProfile.upsert({
        where: { id: visitorId },
        create: {
          id: visitorId,
          firstSeenAt: now,
          lastSeenAt: now,
          visitCount: 1,
          userEmail,
          userName,
          country,
          city,
          lastPath: path,
        },
        update: {
          lastSeenAt: now,
          visitCount: { increment: 1 },
          userEmail: userEmail || undefined,
          userName: userName || undefined,
          country,
          city,
          lastPath: path,
        },
      }),
      db.webVisitEvent.create({
        data: {
          visitedAt: now,
          path,
          country,
          city,
          visitorId,
          userEmail,
          userName,
        },
      }),
    ]);
  } catch {
    // Fallback local para no perder visitas si la BD no esta disponible.
    recordLegacyVisit({
      path,
      country,
      city,
      visitorId,
      userEmail: userEmail || undefined,
      userName: userName || undefined,
      at: now.toISOString(),
    });
  }
}

export async function getVisitStatsDb(preset: VisitWindowPreset) {
  const { start, end, label } = resolveWindowDates(preset);
  const where = start ? { visitedAt: { gte: start, lte: end } } : {};
  try {
    const [totalVisits, uniqueVisitorsRows, registeredUserVisits, countryRows, cityRows, pageRows, topUserRows, topVisitorRows] =
      await Promise.all([
        db.webVisitEvent.count({ where }),
        db.webVisitEvent.groupBy({
          by: ["visitorId"],
          where,
        }),
        db.webVisitEvent.count({
          where: {
            ...where,
            userEmail: { not: null },
          },
        }),
        db.webVisitEvent.groupBy({
          by: ["country"],
          where,
          _count: { _all: true },
          orderBy: { _count: { country: "desc" } },
          take: 20,
        }),
        db.webVisitEvent.groupBy({
          by: ["city"],
          where,
          _count: { _all: true },
          orderBy: { _count: { city: "desc" } },
          take: 20,
        }),
        db.webVisitEvent.groupBy({
          by: ["path"],
          where,
          _count: { _all: true },
          orderBy: { _count: { path: "desc" } },
          take: 20,
        }),
        db.webVisitEvent.groupBy({
          by: ["userEmail"],
          where: {
            ...where,
            userEmail: { not: null },
          },
          _count: { _all: true },
          _max: { visitedAt: true },
          orderBy: { _count: { userEmail: "desc" } },
          take: 20,
        }),
        db.webVisitEvent.groupBy({
          by: ["visitorId"],
          where,
          _count: { _all: true },
          _max: { visitedAt: true },
          orderBy: { _count: { visitorId: "desc" } },
          take: 20,
        }),
      ]);

    const uniqueVisitors = Array.isArray(uniqueVisitorsRows) ? uniqueVisitorsRows.length : 0;
    const avgVisitsPerVisitor = uniqueVisitors > 0 ? Number((totalVisits / uniqueVisitors).toFixed(2)) : 0;

    const userEmails = topUserRows
      .map((r: any) => String(r.userEmail || "").trim().toLowerCase())
      .filter(Boolean);
    const visitorIds = topVisitorRows
      .map((r: any) => String(r.visitorId || "").trim())
      .filter(Boolean);

    const [recentUserNames, visitorProfiles, seriesRows] = await Promise.all([
      userEmails.length
        ? db.webVisitEvent.findMany({
            where: {
              ...(start ? { visitedAt: { gte: start, lte: end } } : {}),
              userEmail: { in: userEmails },
            },
            select: { userEmail: true, userName: true, visitedAt: true },
            orderBy: { visitedAt: "desc" },
            take: 200,
          })
        : [],
      visitorIds.length
        ? db.webVisitorProfile.findMany({
            where: { id: { in: visitorIds } },
            select: { id: true, userEmail: true, userName: true, country: true, city: true },
          })
        : [],
      db.webVisitEvent.findMany({
        where,
        select: { visitedAt: true, visitorId: true },
        orderBy: { visitedAt: "asc" },
        take: 100000,
      }),
    ]);

    const userNameByEmail = new Map<string, string>();
    for (const row of recentUserNames || []) {
      const email = String((row as any).userEmail || "").trim().toLowerCase();
      const name = String((row as any).userName || "").trim();
      if (email && name && !userNameByEmail.has(email)) {
        userNameByEmail.set(email, name);
      }
    }

    const profileByVisitor = new Map<string, any>();
    for (const row of visitorProfiles || []) {
      profileByVisitor.set(String((row as any).id || ""), row);
    }

    const dayMap = new Map<string, { visits: number; visitors: Set<string> }>();
    const monthMap = new Map<string, { visits: number; visitors: Set<string> }>();
    for (const row of seriesRows || []) {
      const d = new Date((row as any).visitedAt);
      const visitorId = String((row as any).visitorId || "");
      const dayKey = toDateKey(d);
      const monthKey = toMonthKey(d);

      if (!dayMap.has(dayKey)) dayMap.set(dayKey, { visits: 0, visitors: new Set<string>() });
      if (!monthMap.has(monthKey)) monthMap.set(monthKey, { visits: 0, visitors: new Set<string>() });

      dayMap.get(dayKey)!.visits += 1;
      if (visitorId) dayMap.get(dayKey)!.visitors.add(visitorId);
      monthMap.get(monthKey)!.visits += 1;
      if (visitorId) monthMap.get(monthKey)!.visitors.add(visitorId);
    }

    const useMonthlySeries = preset === "all" || dayMap.size > 120;
    const series = Array.from((useMonthlySeries ? monthMap : dayMap).entries()).map(([period, data]) => ({
      period,
      visits: data.visits,
      uniqueVisitors: data.visitors.size,
    }));

    return {
      generatedAt: new Date().toISOString(),
      window: {
        preset,
        label,
        start: start ? start.toISOString() : null,
        end: end.toISOString(),
        granularity: useMonthlySeries ? "month" : "day",
      },
      overview: {
        totalVisits,
        uniqueVisitors,
        registeredUserVisits,
        avgVisitsPerVisitor,
      },
      byCountry: (countryRows || []).map((row: any) => ({
        country: row.country || "DESCONOCIDO",
        visits: Number(row?._count?._all || 0),
      })),
      byCity: (cityRows || []).map((row: any) => ({
        city: row.city || "DESCONOCIDA",
        visits: Number(row?._count?._all || 0),
      })),
      topPages: (pageRows || []).map((row: any) => ({
        path: row.path || "/",
        visits: Number(row?._count?._all || 0),
      })),
      topUsers: (topUserRows || []).map((row: any) => {
        const email = String(row.userEmail || "").trim().toLowerCase();
        return {
          email,
          name: userNameByEmail.get(email) || email,
          count: Number(row?._count?._all || 0),
          lastSeenAt: row?._max?.visitedAt ? new Date(row._max.visitedAt).toISOString() : null,
        };
      }),
      topVisitors: (topVisitorRows || []).map((row: any) => {
        const id = String(row.visitorId || "");
        const profile = profileByVisitor.get(id) || {};
        return {
          id,
          userEmail: profile.userEmail || "",
          userName: profile.userName || "",
          country: profile.country || "DESCONOCIDO",
          city: profile.city || "DESCONOCIDA",
          count: Number(row?._count?._all || 0),
          lastSeenAt: row?._max?.visitedAt ? new Date(row._max.visitedAt).toISOString() : null,
        };
      }),
      series,
    };
  } catch {
    const legacy = getLegacyVisitStats();
    const recent = Array.isArray(legacy?.recent) ? legacy.recent : [];
    const inWindow = recent.filter((row: any) => {
      if (!start) return true;
      const at = new Date(String(row?.at || ""));
      return !Number.isNaN(at.getTime()) && at >= start && at <= end;
    });

    const scopedRows = start ? inWindow : recent;
    const totalVisits = start ? scopedRows.length : Number(legacy?.totalVisits || 0);
    const uniqueVisitors = new Set(scopedRows.map((r: any) => String(r?.visitorId || "")).filter(Boolean)).size;
    const registeredUserVisits = scopedRows.filter((r: any) => String(r?.userEmail || "").trim()).length;
    const avgVisitsPerVisitor = uniqueVisitors > 0 ? Number((totalVisits / uniqueVisitors).toFixed(2)) : 0;

    const mapCount = (rows: any[], keyGetter: (row: any) => string) => {
      const map = new Map<string, number>();
      for (const row of rows) {
        const key = keyGetter(row);
        if (!key) continue;
        map.set(key, Number(map.get(key) || 0) + 1);
      }
      return Array.from(map.entries())
        .map(([key, visits]) => ({ key, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 20);
    };

    const byCountryRaw = mapCount(scopedRows, (r) => cleanText(r?.country, "DESCONOCIDO").toUpperCase());
    const byCityRaw = mapCount(scopedRows, (r) => cleanText(r?.city, "DESCONOCIDA").toUpperCase());
    const pagesRaw = mapCount(scopedRows, (r) => cleanText(r?.path, "/"));
    const usersRaw = mapCount(scopedRows, (r) => String(r?.userEmail || "").trim().toLowerCase());
    const visitorsRaw = mapCount(scopedRows, (r) => String(r?.visitorId || "").trim());

    const dayMap = new Map<string, { visits: number; visitors: Set<string> }>();
    const monthMap = new Map<string, { visits: number; visitors: Set<string> }>();
    for (const row of scopedRows) {
      const d = new Date(String(row?.at || ""));
      if (Number.isNaN(d.getTime())) continue;
      const visitorId = String(row?.visitorId || "");
      const dayKey = toDateKey(d);
      const monthKey = toMonthKey(d);
      if (!dayMap.has(dayKey)) dayMap.set(dayKey, { visits: 0, visitors: new Set<string>() });
      if (!monthMap.has(monthKey)) monthMap.set(monthKey, { visits: 0, visitors: new Set<string>() });
      dayMap.get(dayKey)!.visits += 1;
      if (visitorId) dayMap.get(dayKey)!.visitors.add(visitorId);
      monthMap.get(monthKey)!.visits += 1;
      if (visitorId) monthMap.get(monthKey)!.visitors.add(visitorId);
    }

    const useMonthlySeries = preset === "all" || dayMap.size > 120;
    const series = Array.from((useMonthlySeries ? monthMap : dayMap).entries())
      .map(([period, data]) => ({
        period,
        visits: data.visits,
        uniqueVisitors: data.visitors.size,
      }))
      .sort((a, b) => String(a.period).localeCompare(String(b.period)));

    return {
      generatedAt: new Date().toISOString(),
      window: {
        preset,
        label,
        start: start ? start.toISOString() : null,
        end: end.toISOString(),
        granularity: useMonthlySeries ? "month" : "day",
      },
      overview: {
        totalVisits,
        uniqueVisitors,
        registeredUserVisits,
        avgVisitsPerVisitor,
      },
      byCountry: byCountryRaw.map((r) => ({ country: r.key, visits: r.visits })),
      byCity: byCityRaw.map((r) => ({ city: r.key, visits: r.visits })),
      topPages: pagesRaw.map((r) => ({ path: r.key, visits: r.visits })),
      topUsers: usersRaw.map((r) => ({
        email: r.key,
        name: r.key,
        count: r.visits,
        lastSeenAt: null,
      })),
      topVisitors: visitorsRaw.map((r) => ({
        id: r.key,
        userEmail: "",
        userName: "",
        country: "DESCONOCIDO",
        city: "DESCONOCIDA",
        count: r.visits,
        lastSeenAt: null,
      })),
      series,
    };
  }
}

export function statsToCsv(payload: any): string {
  const lines: string[] = [];
  lines.push(["periodo", "visitas", "visitantes_unicos"].join(","));
  for (const row of Array.isArray(payload?.series) ? payload.series : []) {
    const period = String(row.period || "");
    const visits = Number(row.visits || 0);
    const unique = Number(row.uniqueVisitors || 0);
    lines.push([period, String(visits), String(unique)].join(","));
  }
  return lines.join("\n");
}

export async function isIpExcluded(ip: string): Promise<boolean> {
  const normalized = normalizeIp(ip);
  if (!normalized) return false;
  const row = await db.visitExcludedIp.findUnique({ where: { ip: normalized }, select: { ip: true } });
  return Boolean(row?.ip);
}

export async function listExcludedIps() {
  return db.visitExcludedIp.findMany({
    orderBy: { createdAt: "desc" },
    select: { ip: true, note: true, createdAt: true },
  });
}

export async function addExcludedIp(input: { ip: string; note?: string }) {
  const ip = normalizeIp(input.ip);
  if (!ip) throw new Error("IP_INVALIDA");
  return db.visitExcludedIp.upsert({
    where: { ip },
    create: { ip, note: String(input.note || "").trim() || null },
    update: { note: String(input.note || "").trim() || null },
    select: { ip: true, note: true, createdAt: true },
  });
}

export async function removeExcludedIp(ipValue: string) {
  const ip = normalizeIp(ipValue);
  if (!ip) return;
  await db.visitExcludedIp.deleteMany({ where: { ip } });
}
