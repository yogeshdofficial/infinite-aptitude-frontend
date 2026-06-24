import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHistory } from "react-router-dom";
import { IonContent, IonPage } from "@ionic/react";

import GeneralHeader from "@/feautures/general-header";
import { chapterRepository } from "@/db/repositories/chapterRepository";
import { patternRepository } from "@/db/repositories/patternRepository";
import { Skeleton } from "@/components/ui/skeleton";
import type { Chapter } from "@/lib/schema";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";

// ── Per-chapter pattern list ──────────────────────────────────────────────────

function ChapterSection({ chapter }: Readonly<{ chapter: Chapter }>) {
  const history = useHistory();
  const [expanded, setExpanded] = useState(false);

  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ["patternCounts", chapter.id],
    queryFn: () => patternRepository.getCountsByChapter(chapter.id),
    // Only fetch when the section is first opened
    enabled: expanded,
    staleTime: Infinity,
  });

  const totalQuestions = patterns.reduce((s, p) => s + p.count, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      {/* Chapter header – acts as the toggle */}
      <button
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className="flex-1">
          <span className="block text-sm font-semibold leading-tight">
            {chapter.display_name}
          </span>
          {!expanded && (
            <span className="text-xs text-muted-foreground">
              {totalQuestions > 0
                ? `${totalQuestions} questions`
                : "Tap to load"}
            </span>
          )}
        </span>
        {expanded ? (
          <LuChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform" />
        ) : (
          <LuChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {/* Pattern list */}
      {expanded && (
        <div className="border-t border-border/60">
          {isLoading ? (
            <div className="flex flex-col gap-2 p-3">
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-9 w-3/4 rounded-lg" />
            </div>
          ) : patterns.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No patterns yet.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {patterns.map((pattern) => (
                <li key={pattern.pattern_id}>
                  <button
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/30"
                    onClick={() => history.push(`/tabs/practice/${chapter.id}`)}
                  >
                    <span className="text-sm">{pattern.name}</span>
                    <span className="ml-3 shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {pattern.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PatternsTab() {
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
      <GeneralHeader title="Patterns" />
      <IonContent fullscreen>
        <main className="flex flex-col gap-3 p-4 pb-8">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}

          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Failed to load patterns. Please try again.
            </p>
          )}

          {!isLoading && !error && chapters.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No chapters found.
            </p>
          )}

          {chapters.map((chapter) => (
            <ChapterSection key={chapter.id} chapter={chapter} />
          ))}
        </main>
      </IonContent>
    </IonPage>
  );
}
