import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Chapter } from "@/lib/schema";
import { LuChevronRight } from "react-icons/lu";

interface ChapterCardProps {
  chapter: Chapter;
}

export default function ChapterCard({ chapter }: Readonly<ChapterCardProps>) {
  return (
    <Link to={`/tabs/practice/${chapter.id}`}>
      <Card className="w-full transition-colors hover:bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>{chapter.display_name}</span>
            <LuChevronRight className="size-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}
