export default function FailedPaymentsLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-8 w-44 animate-pulse rounded-lg bg-muted" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
