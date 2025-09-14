interface RecListProps {
  recs: string[];
  title?: string;
}

export function RecList({ recs, title = "Next steps" }: RecListProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 font-semibold text-gray-900 text-lg">{title}</div>
      <ul className="space-y-3">
        {recs.map((rec, index) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            <span className="text-green-600 mt-0.5">✅</span>
            <span className="text-gray-700 leading-relaxed">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
