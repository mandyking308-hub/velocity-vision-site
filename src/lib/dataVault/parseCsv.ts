// Minimal RFC4180-ish CSV parser. Handles quoted fields, embedded commas, escaped quotes,
// and CR/LF newlines. Also auto-detects tab vs comma for pasted content.

export interface ParsedTable {
  headers: string[];
  rows: Record<string, string>[];
}

export function detectDelimiter(sample: string): string {
  const firstLine = sample.split(/\r?\n/)[0] ?? "";
  const tabs = (firstLine.match(/\t/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  const semis = (firstLine.match(/;/g) || []).length;
  if (tabs >= commas && tabs >= semis && tabs > 0) return "\t";
  if (semis > commas) return ";";
  return ",";
}

export function parseCsv(text: string, delimiter?: string): ParsedTable {
  const delim = delimiter ?? detectDelimiter(text);
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const src = text.replace(/\r\n?/g, "\n");

  while (i < src.length) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === delim) {
      cur.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\n") {
      cur.push(field);
      rows.push(cur);
      cur = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }

  if (rows.length === 0) return { headers: [], rows: [] };

  const headers = rows[0].map((h, idx) => (h || `column_${idx + 1}`).trim());
  const dataRows = rows.slice(1).filter((r) => r.some((c) => c && c.trim() !== ""));
  const result = dataRows.map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? "").trim();
    });
    return obj;
  });
  return { headers, rows: result };
}
