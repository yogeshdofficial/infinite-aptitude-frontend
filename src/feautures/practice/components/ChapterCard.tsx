import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import type { Chapter } from "@/lib/schema";
import { LuChevronRight } from "react-icons/lu";

interface ChapterCardProps {
  chapter: Chapter;
}

export default function ChapterCard({ chapter }: Readonly<ChapterCardProps>) {
  return (
    <Link to={`/tabs/practice/${chapter.id}`} className="group block">
      <Card className="w-full transition-all hover:bg-muted/40 hover:border-primary/30 hover:shadow-md">
        <CardContent className="flex items-center justify-between p-4">
          <span className="text-sm font-medium">{chapter.display_name}</span>
          <LuChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </Link>
  );
}
