export default function EventsLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
