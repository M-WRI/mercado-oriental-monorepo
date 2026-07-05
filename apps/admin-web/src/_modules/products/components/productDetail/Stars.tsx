export function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-sm">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "text-amber-400" : "text-gray-200"}>
          ★
        </span>
      ))}
    </span>
  );
}
