import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";

export function FavoriteButton({ id, className }: { id: string; className?: string }) {
  const fav = useProgress((s) => s.favorites.includes(id));
  const toggle = useProgress((s) => s.toggleFavorite);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-pressed={fav}
      aria-label={fav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      className={cn(fav && "text-primary", className)}
    >
      <Heart className={cn(fav && "fill-current")} />
    </Button>
  );
}
