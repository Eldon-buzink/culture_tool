import { scoreToBand, traitMeta, Trait, Band } from './interpretation';

export type Profile = Record<Trait, number>;

export function buildIndividualRecs(profile: Profile): string[] {
  const recs: string[] = [];
  
  (Object.keys(traitMeta) as Trait[]).forEach(trait => {
    const band = scoreToBand(profile[trait]);
    const meta = traitMeta[trait].bands[band];
    
    // Pick 1-2 from needs/growth and make them specific
    if (meta.needs?.length) {
      recs.push(`Quick win • ${meta.needs[0]}`);
    }
    if (meta.growth?.length) {
      recs.push(`Try this • ${meta.growth[0]}`);
    }
  });
  
  // De-duplicate & cap at 5
  return Array.from(new Set(recs)).slice(0, 5);
}

export function teamBand(scores: number[]): Band {
  if (scores.length === 0) return 'balanced';
  const sorted = [...scores].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return scoreToBand(median);
}

export function buildTeamAgreements(teamProfiles: Profile[]): string[] {
  const agreements: string[] = [];
  
  // Analyze each trait across the team
  (Object.keys(traitMeta) as Trait[]).forEach(trait => {
    const scores = teamProfiles.map(profile => profile[trait]);
    const teamBandValue = teamBand(scores);
    const meta = traitMeta[trait].bands[teamBandValue];
    
    // Pick 1-2 needs that would help the team
    if (meta.needs?.length) {
      agreements.push(`Team agreement • ${meta.needs[0]}`);
    }
  });
  
  // De-duplicate & cap at 4
  return Array.from(new Set(agreements)).slice(0, 4);
}

export function getTeamLens(teamProfiles: Profile[]): Array<{trait: string, label: string, band: string}> {
  const lens: Array<{trait: string, label: string, band: string}> = [];
  
  (Object.keys(traitMeta) as Trait[]).forEach(trait => {
    const scores = teamProfiles.map(profile => profile[trait]);
    const teamBandValue = teamBand(scores);
    const meta = traitMeta[trait].bands[teamBandValue];
    
    lens.push({
      trait: traitMeta[trait].label,
      label: meta.styleLabel,
      band: teamBandValue
    });
  });
  
  return lens;
}

export function getTeamStrengthsAndWatchouts(teamProfiles: Profile[]): {strengths: string[], watchouts: string[]} {
  const allStrengths: string[] = [];
  const allWatchouts: string[] = [];
  
  (Object.keys(traitMeta) as Trait[]).forEach(trait => {
    const scores = teamProfiles.map(profile => profile[trait]);
    const teamBandValue = teamBand(scores);
    const meta = traitMeta[trait].bands[teamBandValue];
    
    if (meta.strengths?.length) {
      allStrengths.push(...meta.strengths.slice(0, 2));
    }
    if (meta.watchouts?.length) {
      allWatchouts.push(...meta.watchouts.slice(0, 2));
    }
  });
  
  return {
    strengths: Array.from(new Set(allStrengths)).slice(0, 4),
    watchouts: Array.from(new Set(allWatchouts)).slice(0, 4)
  };
}
