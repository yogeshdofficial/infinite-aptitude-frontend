import { useEffect } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import GeneralHeader from "@/feautures/general-header";
import ChapterCard from "@/feautures/practice/components/ChapterCard";
import { chapterRepository } from "@/db/repositories/chapterRepository";
import { patternRepository } from "@/db/repositories/patternRepository";
import { Skeleton } from "@/components/ui/skeleton";
import { LuArrowRight, LuLayoutGrid } from "react-icons/lu";
import { Link } from "react-router-dom";

/**
 * As soon as the chapter list is known, silently prefetch pattern counts for
 * every chapter in the background. Since data is static and cached at both
 * the React Query layer (staleTime: Infinity) and the dbCache layer, these
 * requests are free after the first load — making every subsequent navigation
 * to a ChapterPage instant.
 */
function useEagerPrefetch(chapterIds: string[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!chapterIds.length) return;

    // Stagger the prefetches so they don't all fire simultaneously on first
    // load and compete with the initial render.
    let i = 0;
    const step = () => {
      const id = chapterIds[i];
      if (!id) return;
      queryClient.prefetchQuery({
        queryKey: ["patternCounts", id],
        queryFn: () => patternRepository.getCountsByChapter(id),
        staleTime: Infinity,
      });
      i++;
      if (i < chapterIds.length) {
        // ~50 ms between each to keep the main thread free
        setTimeout(step, 50);
      }
    };

    // Start after a short idle gap so the render finishes first
    const timer = setTimeout(step, 200);
    return () => clearTimeout(timer);
  }, [chapterIds, queryClient]);
}

export default function PracticeTab() {
  const {
    data: chapters = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chapters"],
    queryFn: () => chapterRepository.getAll(),
  });

  const chapterIds = chapters.map((c) => c.id);
  useEagerPrefetch(chapterIds);

  return (
    <IonPage>
      <GeneralHeader title="Practice" />
      <IonContent fullscreen>
        <div className="mx-auto max-w-5xl px-6 py-8 lg:py-10">
          {/* Page header */}
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Practice</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a chapter to start learning
              </p>
            </div>
            {/* Desktop shortcut to the Browse view */}
            <Link
              to="/tabs/browse"
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/40 hover:text-foreground"
            >
              <LuLayoutGrid className="size-3.5" />
              Browse view
              <LuArrowRight className="size-3" />
            </Link>
          </div>

          {/* Chapter grid
              Mobile: 1 col  |  sm: 2 col  |  lg: 3 col  |  xl: 4 col  */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
              ))}

            {error && (
              <p className="col-span-full text-sm text-destructive">
                Failed to load chapters. Please try again.
              </p>
            )}

            {!isLoading && !error && chapters.length === 0 && (
              <p className="col-span-full text-sm text-muted-foreground">
                No chapters found.
              </p>
            )}

            {chapters.map((chap) => (
              <ChapterCard key={chap.id} chapter={chap} />
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
