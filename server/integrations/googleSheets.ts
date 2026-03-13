export interface GoogleSheetRow {
    id: string;
    tipo: string;
    nombre: string;
    fecha: string;
    notas: string;
}

function getGoogleSheetsEnv() {
    const csvUrl = process.env.GOOGLE_SHEETS_CSV_URL;

    if (!csvUrl) {
        throw new Error("GOOGLE_SHEETS_CSV_URL is not set");
    }

    return { csvUrl };
}

function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
            continue;
        }

        current += char;
    }

    result.push(current.trim());
    return result;
}

function normalizeDate(value: string): string {
    if (!value) return "";

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
    }

    return value.trim();
}

export async function fetchGoogleSheetRows(): Promise<GoogleSheetRow[]> {
    const { csvUrl } = getGoogleSheetsEnv();

    const res = await fetch(csvUrl);

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
            `Google Sheets fetch error (${res.status} ${res.statusText}): ${text}`,
        );
    }

    const csvText = await res.text();

    const lines = csvText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length <= 1) {
        return [];
    }

    const [headerLine, ...dataLines] = lines;
    const headers = parseCsvLine(headerLine).map((h) => h.trim().toLowerCase());

    const idIndex = headers.indexOf("id");
    const tipoIndex = headers.indexOf("tipo");
    const nombreIndex = headers.indexOf("nombre");
    const fechaIndex = headers.indexOf("fecha");
    const notasIndex = headers.indexOf("notas");

    if ([idIndex, tipoIndex, nombreIndex, fechaIndex, notasIndex].some((i) => i < 0)) {
        throw new Error(
            'Google Sheets CSV must contain these headers: "ID", "Tipo", "Nombre", "Fecha", "Notas"',
        );
    }

    return dataLines.map((line) => {
        const cols = parseCsvLine(line);

        return {
            id: cols[idIndex] ?? "",
            tipo: cols[tipoIndex] ?? "",
            nombre: cols[nombreIndex] ?? "",
            fecha: normalizeDate(cols[fechaIndex] ?? ""),
            notas: cols[notasIndex] ?? "",
        };
    });
}