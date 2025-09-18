// lib/recs.ts
import { scoreToBand } from "./interpretation";
import { recTemplates } from "./rec-templates";
import { enforceStyle } from "./rec-guard";

export function buildRecsFromProfile(profile: Record<string, number>) {
  const raw: string[] = [];
  for (const trait of Object.keys(recTemplates)) {
    const band = scoreToBand(profile[trait] ?? 50);
    const picks = recTemplates[trait as keyof typeof recTemplates][band];
    raw.push(`✅ Quick win • ${picks[0]}`, `🎯 Habit • ${picks[1]}`);
  }
  return enforceStyle(Array.from(new Set(raw)));
}
