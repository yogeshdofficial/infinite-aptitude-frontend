import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { Chapter } from "@/lib/schema";
import { patternRepository } from "@/db/repositories/patternRepository";
import { LuChevronRight } from "react-icons/lu";
import clsx from "clsx";

interface ChapterCardProps {
  chapter: Chapter;
}

export default function ChapterCard({ chapter }: Readonly<ChapterCardProps>) {
  /**
   * Pattern counts are prefetched in the background by PracticeTab as soon
   * as the chapter list loads, so this query almost always hits the cache —
   * no extra DB round-trip. The `enabled: false` guard is not needed because
   * staleTime: Infinity prevents any background refetch.
   */
  const { data: patterns } = useQuery({
    queryKey: ["patternCounts", chapter.id],
    queryFn: () => patternRepository.getCountsByChapter(chapter.id),
    staleTime: Infinity,
  });

  const totalQuestions = patterns?.reduce((s, p) => s + p.count, 0);

  return (
    <Link to={`/tabs/practice/${chapter.id}`} className="group block h-full">
      <Card
        className={clsx(
          "h-full w-full transition-all",
          "hover:bg-muted/40 hover:border-primary/30 hover:shadow-md",
          "active:scale-[0.98]",
        )}
      >
        <CardContent className="flex h-full flex-col justify-between gap-2 p-4">
          {/* Chapter name */}
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium leading-snug">
              {chapter.display_name}
            </span>
            <LuChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>

          {/* Stats row — visible once prefetch resolves */}
          {patterns !== undefined && (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {patterns.length} pattern{patterns.length !== 1 ? "s" : ""}
              </span>
              {totalQuestions !== undefined && totalQuestions > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {totalQuestions} Q
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
