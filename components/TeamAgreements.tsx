// components/TeamAgreements.tsx
export function TeamAgreements({ items }: { items: string[] }) {
  if (!items?.length) return null;
  
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 font-semibold">Team working agreements</div>
      <ul className="space-y-2 text-sm">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
