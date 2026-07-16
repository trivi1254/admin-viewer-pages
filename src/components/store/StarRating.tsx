import { Star } from 'lucide-react';

export function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-white/20'}
        />
      ))}
    </div>
  );
}
