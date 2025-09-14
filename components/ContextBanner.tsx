export default function ContextBanner() {
  return (
    <div className="rounded-xl border bg-blue-50/50 p-4 text-sm leading-relaxed text-gray-700">
      <div className="flex items-start gap-2">
        <div className="text-blue-600">💡</div>
        <div>
          <strong>Understanding Your Results:</strong> Traits describe <strong>preferences</strong>, not good/bad. 
          Value depends on context and team mix. Use these results to start conversations, not make verdicts.
        </div>
      </div>
    </div>
  );
}
