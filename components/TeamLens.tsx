// components/TeamLens.tsx
import { teamBand } from "@/lib/team-agreements";

type Trait = 'openness'|'conscientiousness'|'extraversion'|'agreeableness'|'neuroticism';
type Profile = Record<Trait, number>;

export function TeamLens({ teamProfiles }: { teamProfiles: Profile[] }) {
  if (!teamProfiles?.length) return null;
  
  return (
    <section className="rounded-2xl border p-4 mt-4">
      <div className="mb-2 font-semibold">Team lens</div>
      <ul className="grid gap-2">
        {(['openness','conscientiousness','extraversion','agreeableness','neuroticism'] as const).map((trait)=>{
          const scores = teamProfiles.map(p=>p[trait]).filter(Boolean) as number[];
          const band = teamBand(scores);
          const label = ({
            openness: 'Openness',
            conscientiousness: 'Conscientiousness',
            extraversion: 'Extraversion',
            agreeableness: 'Agreeableness',
            neuroticism: 'Sensitivity to stress'
          } as const)[trait];
          const styleLabel = ({
            lower: { openness:'Structure-first', conscientiousness:'Adaptive doer', extraversion:'Calm contributor', agreeableness:'Direct challenger', neuroticism:'Steady under pressure' },
            balanced: { openness:'Pragmatic explorer', conscientiousness:'Balanced organizer', extraversion:'Situational connector', agreeableness:'Balanced collaborator', neuroticism:'Realistic responder' },
            higher: { openness:'Frontier-seeker', conscientiousness:'Reliable planner', extraversion:'Energized connector', agreeableness:'Support-first collaborator', neuroticism:'Sensitivity-aware' }
          } as const)[band][trait];
          return (
            <li key={trait} className="text-sm flex items-center justify-between">
              <span>{label}</span>
              <span className="opacity-80">{styleLabel}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
