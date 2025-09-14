import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface TraitCardProps {
  trait: string;
  bandMeta: {
    styleLabel: string;
    tagline: string;
    strengths: string[];
    watchouts: string[];
    bestContexts: string[];
  };
}

export function TraitCard({ trait, bandMeta }: TraitCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">{trait}</div>
        <div className="text-lg font-semibold text-gray-900">{bandMeta.styleLabel}</div>
        <p className="text-sm text-gray-600 leading-relaxed">{bandMeta.tagline}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="font-medium text-sm text-gray-800 mb-2 flex items-center gap-1">
            🎯 Strengths
          </div>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {bandMeta.strengths.slice(0, 2).map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-medium text-sm text-gray-800 mb-2 flex items-center gap-1">
            ⚠️ Watch-outs
          </div>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {bandMeta.watchouts.slice(0, 2).map((watchout, index) => (
              <li key={index}>{watchout}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-medium text-sm text-gray-800 mb-2 flex items-center gap-1">
            🧭 Best when...
          </div>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {bandMeta.bestContexts.slice(0, 2).map((context, index) => (
              <li key={index}>{context}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
