import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useHistory } from "react-router-dom";
import { IonContent, IonPage } from "@ionic/react";

import GeneralHeader from "@/feautures/general-header";
import { chapterRepository } from "@/db/repositories/chapterRepository";
import { patternRepository } from "@/db/repositories/patternRepository";
import { Skeleton } from "@/components/ui/skeleton";
import type { Chapter } from "@/lib/schema";
import { LuChevronDown, LuChevronRight, LuSearch } from "react-icons/lu";
import clsx from "clsx";

// ── Individual chapter accordion ──────────────────────────────────────────────

function ChapterSection({ chapter }: Readonly<{ chapter: Chapter }>) {
  const history = useHistory();
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");

  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ["patternCounts", chapter.id],
    queryFn: () => patternRepository.getCountsByChapter(chapter.id),
    enabled: expanded,
    staleTime: Infinity,
  });

  const filtered = search.trim()
    ? patterns.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      )
    : patterns;

  const totalQuestions = patterns.reduce((s, p) => s + p.count, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <button
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className="flex-1">
          <span className="block text-sm font-semibold leading-tight">
            {chapter.display_name}
          </span>
          <span className="text-xs text-muted-foreground">
            {expanded && patterns.length > 0
              ? `${patterns.length} patterns · ${totalQuestions} questions`
              : totalQuestions > 0
                ? `${totalQuestions} questions`
                : "Tap to expand"}
          </span>
        </span>
        {expanded ? (
          <LuChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
        ) : (
          <LuChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border/60">
          {/* Pattern search — only shown when there are enough patterns */}
          {!isLoading && patterns.length > 5 && (
            <div className="border-b border-border/60 px-3 py-2">
              <div className="relative">
                <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter patterns…"
                  className="w-full rounded-lg border border-border/60 bg-background pl-7 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col gap-2 p-3">
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-9 w-3/4 rounded-lg" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              {search ? "No patterns match your search." : "No patterns yet."}
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {filtered.map((pattern) => (
                <li key={pattern.pattern_id}>
                  <button
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/30 active:bg-muted/50"
                    onClick={() =>
                      history.push(`/tabs/practice/${chapter.id}`)
                    }
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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PatternsTab() {
  const {
    data: chapters = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chapters"],
    queryFn: () => chapterRepository.getAll(),
  });

  // On desktop the chapters split into two equal columns so the list is
  // not a single long scroll on wide screens.
  const half = Math.ceil(chapters.length / 2);
  const left = chapters.slice(0, half);
  const right = chapters.slice(half);

  return (
    <IonPage>
      <GeneralHeader title="Patterns" />
      <IonContent fullscreen>
        <div className="mx-auto max-w-5xl px-6 py-8 lg:py-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Patterns</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Expand a chapter to browse its patterns and question counts.
            </p>
          </div>

          {isLoading && (
            // Loading skeletons — two columns on lg
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          )}

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

          {/* Mobile: single column. Desktop (lg+): two columns */}
          {!isLoading && chapters.length > 0 && (
            <>
              {/* Mobile layout */}
              <div className="flex flex-col gap-3 lg:hidden pb-8">
                {chapters.map((chapter) => (
                  <ChapterSection key={chapter.id} chapter={chapter} />
                ))}
              </div>

              {/* Desktop layout — two columns */}
              <div className="hidden lg:grid lg:grid-cols-2 gap-3 pb-8 items-start">
                <div className="flex flex-col gap-3">
                  {left.map((chapter) => (
                    <ChapterSection key={chapter.id} chapter={chapter} />
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  {right.map((chapter) => (
                    <ChapterSection key={chapter.id} chapter={chapter} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
