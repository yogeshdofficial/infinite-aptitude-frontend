import { useQuery } from "@tanstack/react-query";
import { IonContent, IonPage } from "@ionic/react";

import GeneralHeader from "@/feautures/general-header";
import { chapterRepository } from "@/db/repositories/chapterRepository";
import { patternRepository } from "@/db/repositories/patternRepository";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Chapter } from "@/lib/schema";
import { useSavedQuestionIds } from "@/hooks/use-saved-questions";
import { LuBookOpen, LuLayoutGrid, LuCircleDashed, LuBookmark } from "react-icons/lu";
import { Link } from "react-router-dom";

// ── Single chapter row ────────────────────────────────────────────────────────

function ChapterProgressRow({ chapter }: Readonly<{ chapter: Chapter }>) {
  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ["patternCounts", chapter.id],
    queryFn: () => patternRepository.getCountsByChapter(chapter.id),
    staleTime: Infinity,
  });

  const total = patterns.reduce((sum, p) => sum + p.count, 0);

  return (
    <Link
      to={`/tabs/practice/${chapter.id}`}
      className="group block"
    >
      <Card className="transition-all hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm active:scale-[0.99]">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LuBookOpen className="size-4" />
            </span>
            <span className="truncate text-sm font-medium">
              {chapter.display_name}
            </span>
          </div>

          {isLoading ? (
            <Skeleton className="h-4 w-24 shrink-0" />
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant="secondary"
                className="rounded-full px-2 py-0 text-[11px]"
              >
                {patterns.length} pattern{patterns.length !== 1 ? "s" : ""}
              </Badge>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {total} Q
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// ── Summary stat cards ────────────────────────────────────────────────────────

function SummaryStats({
  chapterCount,
  patternData,
  savedCount,
}: {
  chapterCount: number;
  patternData: { patterns: number; questions: number };
  savedCount: number;
}) {
  const stats = [
    {
      icon: LuBookOpen,
      label: "Chapters",
      value: chapterCount,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: LuLayoutGrid,
      label: "Patterns",
      value: patternData.patterns,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      icon: LuCircleDashed,
      label: "Questions",
      value: patternData.questions,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: LuBookmark,
      label: "Saved",
      value: savedCount,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      to: "/tabs/saved",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
      {stats.map(({ icon: Icon, label, value, color, bg, to }) => {
        const card = (
          <Card
            className={`shadow-sm ${to ? "transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.98]" : ""}`}
          >
            <CardContent className="flex flex-col gap-1.5 p-4">
              <span
                className={`flex size-8 items-center justify-center rounded-lg ${bg} ${color}`}
              >
                <Icon className="size-4" />
              </span>
              <span className="text-xl font-bold tracking-tight">
                {value > 0 ? value.toLocaleString() : "—"}
              </span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        );
        return to ? (
          <Link key={label} to={to} className="block">
            {card}
          </Link>
        ) : (
          <div key={label}>{card}</div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProgressTab() {
  const {
    data: chapters = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chapters"],
    queryFn: () => chapterRepository.getAll(),
  });

  // Aggregate pattern + question counts from already-cached per-chapter data.
  // The repository calls live inside queryFn (not in the render body) so
  // they only ever run when the query actually executes, instead of firing
  // off a fresh batch of promises on every re-render of this component.
  const { data: allPatterns } = useQuery({
    queryKey: ["allPatternCounts", chapters.map((c) => c.id).join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        chapters.map((c) => patternRepository.getCountsByChapter(c.id)),
      );
      return results.flat();
    },
    enabled: chapters.length > 0,
    staleTime: Infinity,
  });

  const { data: savedIds } = useSavedQuestionIds();

  const summaryData = {
    patterns: allPatterns?.length ?? 0,
    questions: allPatterns?.reduce((s, p) => s + p.count, 0) ?? 0,
  };

  return (
    <IonPage>
      <GeneralHeader title="Progress" />
      <IonContent fullscreen>
        <div className="mx-auto max-w-3xl px-6 py-8 lg:py-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Progress</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Question and pattern coverage by chapter.
            </p>
          </div>

          {/* Summary stats — shown once chapters have loaded */}
          {!isLoading && chapters.length > 0 && (
            <SummaryStats
              chapterCount={chapters.length}
              patternData={summaryData}
              savedCount={savedIds?.size ?? 0}
            />
          )}

          {/* Per-chapter list */}
          <div className="flex flex-col gap-3 pb-8">
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}

            {error && (
              <p className="text-sm text-destructive">
                Failed to load progress. Please try again.
              </p>
            )}

            {chapters.map((chapter) => (
              <ChapterProgressRow key={chapter.id} chapter={chapter} />
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
