// lib/rec-guard.ts
const FORBIDDEN = /\b(sprint|backlog|roadmap|jira|po|microservice|cicd|feature flag|okr)s?\b/i;

export function sanitizeRec(line: string) {
  let s = line.replace(/\s+/g, ' ').trim();
  if (FORBIDDEN.test(s)) return null;
  if (s.length > 120) s = s.slice(0, 117) + '…';
  return s;
}

export function enforceStyle(lines: string[]) {
  const out: string[] = [];
  for (const raw of lines) {
    const s = sanitizeRec(raw);
    if (!s) continue;
    // prefix if missing
    if (!/^(✅|🎯|🤝)/.test(s)) {
      out.push(`✅ Quick win • ${s}`);
    } else {
      out.push(s);
    }
    if (out.length === 5) break;
  }
  return out;
}
