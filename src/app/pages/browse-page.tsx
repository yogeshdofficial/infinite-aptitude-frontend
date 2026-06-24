import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHistory } from "react-router-dom";
import { IonContent, IonPage } from "@ionic/react";

import GeneralHeader from "@/feautures/general-header";
import QuestionCard from "@/feautures/QuestionCard";
import { chapterRepository } from "@/db/repositories/chapterRepository";
import { patternRepository } from "@/db/repositories/patternRepository";
import { patternDocRepository } from "@/db/repositories/patternDocRepository";
import { questionRepository } from "@/db/repositories/questionRepository";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LuBookOpen,
  LuChevronRight,
  LuChevronLeft,
  LuArrowLeft,
  LuSearch,
} from "react-icons/lu";
import clsx from "clsx";

// ── Right panel: questions for a selected pattern ─────────────────────────────

function PatternQuestions({
  patternId,
  patternName,
  patternIndex,
  patternTotal,
  chapterId,
  onBack,
  onPrevPattern,
  onNextPattern,
}: {
  patternId: string;
  patternName: string;
  patternIndex: number;
  patternTotal: number;
  chapterId: string;
  onBack: () => void;
  onPrevPattern: () => void;
  onNextPattern: () => void;
}) {
  const history = useHistory();

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["questions-by-pattern", patternId],
    queryFn: () => questionRepository.getByPattern(patternId),
    staleTime: Infinity,
  });

  const { data: patternDoc } = useQuery({
    queryKey: ["patternDoc", patternId],
    queryFn: () => patternDocRepository.getByPattern(patternId),
    staleTime: Infinity,
  });

  return (
    <div className="flex h-full flex-col">
      {/* Sub-header with prev/next pattern navigation */}
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5 bg-muted/10">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={onBack}
          title="Back to patterns"
        >
          <LuArrowLeft className="size-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground">
            Pattern {patternIndex + 1} of {patternTotal}
          </p>
          <h3 className="truncate text-sm font-semibold leading-tight">
            {patternName}
          </h3>
        </div>

        {patternDoc && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 text-xs"
            onClick={() =>
              history.push(`/tabs/practice/${chapterId}/resource`, {
                title: patternName,
                markdown: patternDoc.markdown,
              })
            }
          >
            <LuBookOpen className="size-3.5" />
            Notes
          </Button>
        )}

        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={patternIndex === 0}
            onClick={onPrevPattern}
            title="Previous pattern"
          >
            <LuChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={patternIndex === patternTotal - 1}
            onClick={onNextPattern}
            title="Next pattern"
          >
            <LuChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Question list */}
      <div className="flex-1 overflow-y-auto py-4">
        {isLoading ? (
          <div className="mx-auto max-w-3xl px-4 md:px-5 flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No questions in this pattern yet.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl px-4 md:px-5 flex flex-col gap-3 pb-8">
            <p className="text-xs text-muted-foreground">
              {questions.length} question{questions.length === 1 ? "" : "s"}
            </p>
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Right panel: patterns for a selected chapter ──────────────────────────────

function ChapterPatterns({
  chapterId,
  chapterName,
  onBack,
}: {
  chapterId: string;
  chapterName: string;
  onBack: () => void;
}) {
  const [selectedPatternIndex, setSelectedPatternIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ["patternCounts", chapterId],
    queryFn: () => patternRepository.getCountsByChapter(chapterId),
    staleTime: Infinity,
  });

  const filtered = search.trim()
    ? patterns.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : patterns;

  const selectedPattern =
    selectedPatternIndex !== null ? patterns[selectedPatternIndex] : null;

  if (selectedPattern && selectedPatternIndex !== null) {
    return (
      <PatternQuestions
        key={selectedPattern.pattern_id}
        patternId={selectedPattern.pattern_id}
        patternName={selectedPattern.name}
        patternIndex={selectedPatternIndex}
        patternTotal={patterns.length}
        chapterId={chapterId}
        onBack={() => setSelectedPatternIndex(null)}
        onPrevPattern={() =>
          setSelectedPatternIndex((i) => Math.max(0, (i ?? 0) - 1))
        }
        onNextPattern={() =>
          setSelectedPatternIndex((i) =>
            Math.min(patterns.length - 1, (i ?? 0) + 1)
          )
        }
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Sub-header */}
      <div className="flex items-center gap-3 border-b border-border/60 px-4 md:px-5 py-3.5 bg-muted/10">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 lg:hidden"
          onClick={onBack}
        >
          <LuArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">Chapter</p>
          <h3 className="truncate text-sm font-semibold">{chapterName}</h3>
        </div>
      </div>

      {/* Pattern search */}
      {patterns.length > 5 && (
        <div className="px-4 md:px-5 py-2 border-b border-border/60">
          <div className="relative">
            <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter patterns…"
              className="w-full rounded-lg border border-border/60 bg-background pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>
      )}

      {/* Pattern list */}
      <div className="flex-1 overflow-y-auto py-4">
        {isLoading ? (
          <div className="mx-auto max-w-2xl px-4 md:px-5 flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {search ? "No patterns match your search." : "No patterns in this chapter yet."}
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl px-4 md:px-5 flex flex-col gap-1.5 pb-8">
            {!search && (
              <p className="mb-2 text-xs text-muted-foreground">
                {patterns.length} pattern{patterns.length === 1 ? "" : "s"} ·
                select one to browse questions
              </p>
            )}
            {filtered.map((pattern) => {
              const idx = patterns.indexOf(pattern);
              return (
                <button
                  key={pattern.pattern_id}
                  onClick={() => setSelectedPatternIndex(idx)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 text-left transition-all hover:border-primary/30 hover:bg-muted/40 hover:shadow-sm active:scale-[0.99]"
                >
                  <span className="flex-1 text-sm font-medium">
                    {pattern.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className="shrink-0 rounded-full px-2 py-0 text-[11px]"
                  >
                    {pattern.count}
                  </Badge>
                  <LuChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty state for the right panel ──────────────────────────────────────────

function RightPanelEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-8">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <LuBookOpen className="size-7" />
      </div>
      <div>
        <p className="text-sm font-medium">Pick a chapter</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Select a chapter on the left to browse its patterns and questions.
        </p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BrowsePage() {
  const [selectedChapter, setSelectedChapter] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [mobileView, setMobileView] = useState<"chapters" | "content">(
    "chapters"
  );

  const { data: chapters = [], isLoading } = useQuery({
    queryKey: ["chapters"],
    queryFn: () => chapterRepository.getAll(),
  });

  function selectChapter(id: string, name: string) {
    setSelectedChapter({ id, name });
    setMobileView("content");
  }

  return (
    <IonPage>
      <GeneralHeader title="Browse" />
      <IonContent fullscreen>
        <div className="flex h-full">
          {/* ── Left panel: chapter list ── */}
          <aside
            className={clsx(
              "flex flex-col border-r border-border/60 bg-muted/20",
              mobileView === "content"
                ? "hidden lg:flex lg:w-56 xl:w-64 shrink-0"
                : "flex w-full lg:w-56 xl:w-64 shrink-0"
            )}
          >
            <div className="px-4 py-3.5 border-b border-border/60">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Chapters
              </h2>
            </div>

            <nav className="flex-1 overflow-y-auto py-2">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="px-3 py-1">
                      <Skeleton className="h-9 w-full rounded-lg" />
                    </div>
                  ))
                : chapters.map((chapter) => {
                    const active = selectedChapter?.id === chapter.id;
                    return (
                      <button
                        key={chapter.id}
                        onClick={() =>
                          selectChapter(chapter.id, chapter.display_name)
                        }
                        className={clsx(
                          "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 mx-1 text-left text-sm transition-colors",
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground hover:bg-muted"
                        )}
                        style={{ width: "calc(100% - 8px)" }}
                      >
                        <span className="truncate">{chapter.display_name}</span>
                        {active && (
                          <LuChevronRight className="size-3.5 shrink-0" />
                        )}
                      </button>
                    );
                  })}
            </nav>
          </aside>

          {/* ── Right panel ── */}
          <main
            className={clsx(
              "flex-1 overflow-hidden",
              mobileView === "chapters" ? "hidden lg:block" : "block"
            )}
          >
            {!selectedChapter ? (
              <RightPanelEmpty />
            ) : (
              <ChapterPatterns
                key={selectedChapter.id}
                chapterId={selectedChapter.id}
                chapterName={selectedChapter.name}
                onBack={() => setMobileView("chapters")}
              />
            )}
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
}
