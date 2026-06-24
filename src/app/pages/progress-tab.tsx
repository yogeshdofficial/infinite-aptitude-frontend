import { useQuery } from "@tanstack/react-query";
import { IonContent, IonPage } from "@ionic/react";

import GeneralHeader from "@/feautures/general-header";
import { chapterRepository } from "@/db/repositories/chapterRepository";
import { patternRepository } from "@/db/repositories/patternRepository";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Chapter } from "@/lib/schema";

function ChapterProgressRow({ chapter }: Readonly<{ chapter: Chapter }>) {
  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ["patternCounts", chapter.id],
    queryFn: () => patternRepository.getCountsByChapter(chapter.id),
  });

  const total = patterns.reduce((sum, p) => sum + p.count, 0);

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <span className="text-sm font-medium">{chapter.display_name}</span>
        {isLoading ? (
          <Skeleton className="h-4 w-16" />
        ) : (
          <span className="text-xs text-muted-foreground">
            {patterns.length} pattern{patterns.length === 1 ? "" : "s"} · {total} question
            {total === 1 ? "" : "s"}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProgressTab() {
  const {
    data: chapters = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chapters"],
    queryFn: () => chapterRepository.getAll(),
  });

  return (
    <IonPage>
      <GeneralHeader title="Progress" />
      <IonContent fullscreen>
        <main className="flex flex-col gap-3 p-4">
          <p className="text-sm text-muted-foreground">
            Question and pattern coverage by chapter.
          </p>

          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}

          {error && (
            <p className="text-sm text-destructive">
              Failed to load progress. Please try again.
            </p>
          )}

          {chapters.map((chapter) => (
            <ChapterProgressRow key={chapter.id} chapter={chapter} />
          ))}
        </main>
      </IonContent>
    </IonPage>
  );
}
