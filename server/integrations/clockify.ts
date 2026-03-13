type OwnerKey = "quique" | "adri";

interface ClockifyProject {
  id: string;
  name: string;
}

interface ClockifyTag {
  id: string;
  name: string;
}

interface ClockifyTimeInterval {
  start: string;
  end?: string | null;
  duration?: string | null;
}

export interface ClockifyTimeEntry {
  id: string;
  userId: string;
  projectId?: string | null;
  tagIds?: string[] | null;
  timeInterval: ClockifyTimeInterval;
}

export interface CategoryHours {
  name: string;
  hours: number;
}

export interface ClockifyDashboardHours {
  totalHours: number;
  byCategory: CategoryHours[];
}

export interface ClockifyHoursResponse {
  quique: ClockifyDashboardHours;
  adri: ClockifyDashboardHours;
  squirly: ClockifyDashboardHours;
}

export interface ClockifyFetchOptions {
  start?: string | Date;
  end?: string | Date;
}

const CLOCKIFY_TAG_FILTER = "Squirly Academy";

const PROJECT_TO_CATEGORY: Record<string, string> = {
  "CRISTALIZACIÓN": "Cristalización",
  "DISEÑO Y DESARROLLO DE PROD/SERV": "Diseño de producto",
  "EJECUCIÓN DEL PROYECTO": "Ejecución de proyecto",
  "FORMACIÓN": "Formación",
  "GESTIÓN DE EQUIPO": "Reuniones de equipo",
  "VISITAS COMERCIALES": "Visitas comerciales",
};

const FALLBACK_CATEGORY = "Otros";

export function getClockifyEnv() {
  const apiBase =
    (process.env.CLOCKIFY_API_BASE ?? "https://api.clockify.me/api/v1").trim();
  const apiKey = process.env.CLOCKIFY_API_KEY?.trim();
  const workspaceId = process.env.CLOCKIFY_WORKSPACE_ID?.trim();
  const adriUserId = process.env.CLOCKIFY_USER_ID_ADRI?.trim();
  const quiqueUserId = process.env.CLOCKIFY_USER_ID_QUIQUE?.trim();

  if (!apiKey) throw new Error("CLOCKIFY_API_KEY is not set");
  if (!workspaceId) throw new Error("CLOCKIFY_WORKSPACE_ID is not set");
  if (!adriUserId) throw new Error("CLOCKIFY_USER_ID_ADRI is not set");
  if (!quiqueUserId) throw new Error("CLOCKIFY_USER_ID_QUIQUE is not set");

  return {
    apiBase,
    apiKey,
    workspaceId,
    adriUserId,
    quiqueUserId,
  };
}

function parseIsoDurationToHours(duration: string | null | undefined): number {
  if (!duration) return 0;

  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  return hours + minutes / 60 + seconds / 3600;
}

function calculateEntryHours(entry: ClockifyTimeEntry): number {
  const { timeInterval } = entry;

  if (timeInterval.duration) {
    return parseIsoDurationToHours(timeInterval.duration);
  }

  if (timeInterval.start && timeInterval.end) {
    const start = new Date(timeInterval.start).getTime();
    const end = new Date(timeInterval.end).getTime();

    if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
      return (end - start) / (1000 * 60 * 60);
    }
  }

  return 0;
}

function mapProjectToCategory(projectName: string | null | undefined): string {
  if (!projectName) return FALLBACK_CATEGORY;

  const key = projectName.trim().toUpperCase();
  return PROJECT_TO_CATEGORY[key] ?? FALLBACK_CATEGORY;
}

function createEmptyDashboardHours(): ClockifyDashboardHours {
  return {
    totalHours: 0,
    byCategory: [],
  };
}

function mapToDashboardHours(
  categoryMap: Map<string, number>,
): ClockifyDashboardHours {
  const byCategory: CategoryHours[] = Array.from(categoryMap.entries())
    .map(([name, hours]) => ({
      name,
      hours: Number(hours.toFixed(2)),
    }))
    .sort((a, b) => b.hours - a.hours);

  const totalHours = byCategory.reduce((sum, cat) => sum + cat.hours, 0);

  return {
    totalHours: Number(totalHours.toFixed(2)),
    byCategory,
  };
}

function toIsoString(value: string | Date): string {
  if (typeof value === "string") {
    return new Date(value).toISOString();
  }

  return value.toISOString();
}

async function fetchJson<T>(url: string, apiKey: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Clockify API error (${res.status} ${res.statusText}): ${text}`,
    );
  }

  return (await res.json()) as T;
}

async function fetchClockifyProjects(): Promise<ClockifyProject[]> {
  const { apiBase, apiKey, workspaceId } = getClockifyEnv();
  const url = `${apiBase}/workspaces/${workspaceId}/projects?page-size=5000`;
  return fetchJson<ClockifyProject[]>(url, apiKey);
}

async function fetchClockifyTags(): Promise<ClockifyTag[]> {
  const { apiBase, apiKey, workspaceId } = getClockifyEnv();
  const url = `${apiBase}/workspaces/${workspaceId}/tags?page-size=5000`;
  return fetchJson<ClockifyTag[]>(url, apiKey);
}

export async function fetchClockifyTimeEntries(
  options: ClockifyFetchOptions = {},
): Promise<ClockifyTimeEntry[]> {
  const { apiBase, apiKey, workspaceId, adriUserId, quiqueUserId } =
    getClockifyEnv();

  const start = options.start ? toIsoString(options.start) : undefined;
  const end = options.end ? toIsoString(options.end) : undefined;

  const userIds = [adriUserId, quiqueUserId];

  const responses = await Promise.all(
    userIds.map(async (userId) => {
      const params = new URLSearchParams();

      if (start) params.set("start", start);
      if (end) params.set("end", end);
      params.set("page-size", "5000");

      const url = `${apiBase}/workspaces/${workspaceId}/user/${userId}/time-entries?${params.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Clockify API error (${res.status} ${res.statusText}): ${text}`,
        );
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected Clockify API response: expected an array");
      }

      return data as ClockifyTimeEntry[];
    }),
  );

  return responses.flat();
}

export async function getClockifyDashboardHours(
  options: ClockifyFetchOptions = {},
): Promise<ClockifyHoursResponse> {
  const { adriUserId, quiqueUserId } = getClockifyEnv();

  const [entries, tags, projects] = await Promise.all([
    fetchClockifyTimeEntries(options),
    fetchClockifyTags(),
    fetchClockifyProjects(),
  ]);

  const squirlyTag = tags.find(
    (tag) => tag.name.trim().toLowerCase() === CLOCKIFY_TAG_FILTER.toLowerCase(),
  );

  if (!squirlyTag) {
    return {
      quique: createEmptyDashboardHours(),
      adri: createEmptyDashboardHours(),
      squirly: createEmptyDashboardHours(),
    };
  }

  const projectById = new Map(projects.map((p) => [p.id, p.name]));

  const perOwnerCategoryMap: Record<OwnerKey, Map<string, number>> = {
    quique: new Map(),
    adri: new Map(),
  };

  const squirlyCategoryMap: Map<string, number> = new Map();

  for (const entry of entries) {
    const tagIds = entry.tagIds ?? [];
    if (!tagIds.includes(squirlyTag.id)) continue;

    const hours = calculateEntryHours(entry);
    if (hours <= 0) continue;

    let ownerKey: OwnerKey | null = null;
    if (entry.userId === quiqueUserId) ownerKey = "quique";
    if (entry.userId === adriUserId) ownerKey = "adri";
    if (!ownerKey) continue;

    const rawProjectName = entry.projectId
      ? projectById.get(entry.projectId)
      : null;

    const category = mapProjectToCategory(rawProjectName);

    const ownerMap = perOwnerCategoryMap[ownerKey];
    ownerMap.set(category, (ownerMap.get(category) ?? 0) + hours);

    squirlyCategoryMap.set(
      category,
      (squirlyCategoryMap.get(category) ?? 0) + hours,
    );
  }

  const quique =
    perOwnerCategoryMap.quique.size > 0
      ? mapToDashboardHours(perOwnerCategoryMap.quique)
      : createEmptyDashboardHours();

  const adri =
    perOwnerCategoryMap.adri.size > 0
      ? mapToDashboardHours(perOwnerCategoryMap.adri)
      : createEmptyDashboardHours();

  const squirly =
    squirlyCategoryMap.size > 0
      ? mapToDashboardHours(squirlyCategoryMap)
      : createEmptyDashboardHours();

  return {
    quique,
    adri,
    squirly,
  };
}