import { useState, useCallback, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IonContent, IonPage } from "@ionic/react";

import { questionRepository } from "@/db/repositories/questionRepository";
import { chapterRepository } from "@/db/repositories/chapterRepository";
import GeneralHeader from "@/feautures/general-header";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { CopyButton } from "@/components/CopyButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Question } from "@/lib/schema";
import {
  LuChevronLeft,
  LuChevronRight,
  LuArrowLeft,
  LuLightbulb,
  LuChevronUp,
  LuKeyboard,
} from "react-icons/lu";
import clsx from "clsx";

// ── Extras loader (hints + formulas) ─────────────────────────────────────────

function useExtras(questionId: string) {
  return useQuery({
    queryKey: ["questionExtras", questionId],
    queryFn: () => questionRepository.getExtrasById(questionId),
    staleTime: Infinity,
  });
}

// ── Prefetch the next question's extras ───────────────────────────────────────

function PrefetchExtras({ questionId }: { questionId: string | undefined }) {
  useQuery({
    queryKey: ["questionExtras", questionId],
    queryFn: () => questionRepository.getExtrasById(questionId!),
    enabled: !!questionId,
    staleTime: Infinity,
  });
  return null;
}

// ── Markdown list ─────────────────────────────────────────────────────────────

function MarkdownList({
  items,
  emptyMessage,
}: {
  items: string[] | undefined;
  emptyMessage: string;
}) {
  if (!items || items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }
  return (
    <ul className="flex flex-col divide-y divide-border">
      {items.map((item, i) => (
        <li key={i} className="relative py-3.5">
          <div className="flex items-start gap-3 pr-8">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
              {i + 1}
            </span>
            <MarkdownViewer markdown={item} />
          </div>
          <CopyButton text={item} className="absolute right-0 top-3.5" />
        </li>
      ))}
    </ul>
  );
}

// ── Solution panel content ────────────────────────────────────────────────────

function SolutionPanel({
  question,
  extras,
  extrasLoading,
}: {
  question: Question;
  extras: { hints?: string[]; formulas?: string[] } | undefined;
  extrasLoading: boolean;
}) {
  return (
    <Tabs defaultValue="solution">
      <div className="border-b border-border/60 bg-muted/30 px-3 pt-3 pb-0">
        <TabsList className="grid w-full grid-cols-4 rounded-xl bg-background/60">
          <TabsTrigger value="solution" className="rounded-lg text-xs">
            Solution
          </TabsTrigger>
          <TabsTrigger value="shortcut" className="rounded-lg text-xs">
            Shortcut
          </TabsTrigger>
          <TabsTrigger value="hints" className="rounded-lg text-xs">
            Hints
          </TabsTrigger>
          <TabsTrigger value="formulas" className="rounded-lg text-xs">
            Formulas
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="px-5 py-5">
        <TabsContent value="solution" className="mt-0">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Traditional Solution
            </span>
            {question.traditional_solution && (
              <CopyButton text={question.traditional_solution} />
            )}
          </div>
          <MarkdownViewer
            markdown={question.traditional_solution ?? "Solution not available."}
          />
        </TabsContent>

        <TabsContent value="shortcut" className="mt-0">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Shortcut / Fast Approach
            </span>
            {question.shortcut_solution && (
              <CopyButton text={question.shortcut_solution} />
            )}
          </div>
          <MarkdownViewer
            markdown={question.shortcut_solution ?? "No shortcut available."}
          />
        </TabsContent>

        <TabsContent value="hints" className="mt-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Hints
          </p>
          {extrasLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          ) : (
            <MarkdownList items={extras?.hints} emptyMessage="No hints available." />
          )}
        </TabsContent>

        <TabsContent value="formulas" className="mt-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Key Formulas
          </p>
          {extrasLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
            </div>
          ) : (
            <MarkdownList items={extras?.formulas} emptyMessage="No formulas listed." />
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}

// ── Single question study view ────────────────────────────────────────────────

function StudyCard({
  question,
  index,
  total,
  onPrev,
  onNext,
}: {
  question: Question;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [showSolution, setShowSolution] = useState(false);
  const [showKeyHint, setShowKeyHint] = useState(false);
  const { data: extras, isLoading: extrasLoading } = useExtras(question.id);

  const resetAndGo = useCallback((go: () => void) => {
    setShowSolution(false);
    go();
  }, []);

  const hasPrev = index > 0;
  const hasNext = index < total - 1;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

      switch (e.key) {
        case "ArrowRight":
          if (hasNext) resetAndGo(onNext);
          break;
        case "ArrowLeft":
          if (hasPrev) resetAndGo(onPrev);
          break;
        case " ":
          e.preventDefault();
          setShowSolution((v) => !v);
          break;
        case "Escape":
          setShowSolution(false);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hasNext, hasPrev, onNext, onPrev, resetAndGo]);

  const toggleButton = (
    <Button
      onClick={() => setShowSolution((v) => !v)}
      className={clsx(
        "w-full rounded-xl font-semibold gap-2 transition-all",
      )}
      variant={showSolution ? "outline" : "default"}
      size="default"
    >
      {showSolution ? (
        <>
          <LuChevronUp className="size-4" />
          Hide Solution
        </>
      ) : (
        <>
          <LuLightbulb className="size-4" />
          Show Solution
        </>
      )}
    </Button>
  );

  return (
    <div className="flex h-full flex-col">
      {/* ── Progress bar + counter ── */}
      <div className="shrink-0 border-b border-border/60 bg-muted/20 px-4 md:px-6 py-3">
        <div className="mx-auto max-w-6xl">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Question {index + 1} of {total}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full text-[10px]">
                Q{question.question_number}
              </Badge>
              {/* Keyboard hint — desktop only */}
              <button
                onClick={() => setShowKeyHint((v) => !v)}
                className="hidden lg:flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                title="Keyboard shortcuts"
              >
                <LuKeyboard className="size-3" />
                <span>
                  <kbd className="rounded border border-border/80 px-1 py-px bg-muted text-[9px]">Space</kbd>{" "}
                  reveal ·{" "}
                  <kbd className="rounded border border-border/80 px-1 py-px bg-muted text-[9px]">←</kbd>{" "}
                  <kbd className="rounded border border-border/80 px-1 py-px bg-muted text-[9px]">→</kbd>{" "}
                  navigate
                </span>
              </button>
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main content — two-column on desktop ── */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">

        {/* Question panel ─ mobile: fixed height | desktop: left column, scrollable */}
        <div className="shrink-0 lg:shrink-0 lg:w-[44%] xl:w-[40%] border-b border-border/60 lg:border-b-0 lg:border-r border-border/60 bg-background lg:overflow-y-auto flex flex-col">
          {/* Question text */}
          <div className="relative flex-1 px-5 md:px-7 py-5 md:py-6">
            <div className="pr-9">
              <MarkdownViewer
                markdown={question.question_text ?? "Question text missing"}
              />
            </div>
            <CopyButton
              text={question.question_text ?? ""}
              className="absolute right-3 md:right-5 top-5"
            />
          </div>

          {/* Toggle button lives at the bottom of the question — always reachable */}
          <div className="px-5 md:px-7 pb-5 md:pb-6 pt-3 border-t border-border/40 bg-background">
            {toggleButton}
          </div>
        </div>

        {/* Solution panel ─ mobile: flex-1 scroll | desktop: right column */}
        <div className="flex-1 overflow-y-auto">
          {/* max-w keeps lines readable on ultra-wide monitors; mx-auto centres it */}
          <div className="mx-auto w-full max-w-[780px] px-5 md:px-7 py-5 pb-28 lg:pb-10">
            {!showSolution ? (
              /* Empty state — desktop only (mobile shows the full page CTA above) */
              <div className="hidden lg:flex flex-col items-center justify-center h-full min-h-[220px] gap-4 text-center">
                <div className="size-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                  <LuLightbulb className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Ready when you are</p>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    Press{" "}
                    <kbd className="rounded border border-border/80 px-1.5 py-px bg-muted text-[10px]">
                      Space
                    </kbd>{" "}
                    or click <span className="font-medium text-foreground">Show Solution</span> to reveal
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <SolutionPanel
                  question={question}
                  extras={extras}
                  extrasLoading={extrasLoading}
                />
              </div>
            )}

            {/* Mobile-only: show toggle again below solution for easy hiding */}
            {showSolution && (
              <div className="mt-4 lg:hidden">
                {toggleButton}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Fixed Prev / Next bar ── */}
      <div className="shrink-0 border-t border-border/60 bg-background/95 px-4 md:px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => resetAndGo(onPrev)}
            disabled={!hasPrev}
            className="gap-1.5 rounded-xl font-medium min-w-[90px]"
          >
            <LuChevronLeft className="size-4" />
            Previous
          </Button>

          {/* Dot indicators (up to 12 visible) */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(total, 12) }).map((_, i) => {
              const dotIndex =
                total <= 12
                  ? i
                  : Math.round((i / 11) * (total - 1));
              return (
                <div
                  key={i}
                  className={clsx(
                    "rounded-full transition-all",
                    i ===
                      (total <= 12
                        ? index
                        : Math.round((index / (total - 1)) * 11))
                      ? "size-2.5 bg-primary"
                      : "size-1.5 bg-border"
                  )}
                />
              );
            })}
          </div>

          <Button
            onClick={() => resetAndGo(onNext)}
            disabled={!hasNext}
            className="gap-1.5 rounded-xl font-medium min-w-[90px]"
          >
            Next
            <LuChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Done screen ───────────────────────────────────────────────────────────────

function DoneScreen({
  total,
  onRestart,
  onBack,
}: {
  total: number;
  onRestart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl">
        🎉
      </div>
      <div>
        <h3 className="text-lg font-bold">Chapter complete!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You've gone through all {total} questions.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="rounded-xl">
          <LuArrowLeft className="mr-1.5 size-4" />
          Back
        </Button>
        <Button onClick={onRestart} className="rounded-xl">
          Start again
        </Button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function QuestionsPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const history = useHistory();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: chapter } = useQuery({
    queryKey: ["chapter", chapterId],
    queryFn: () => chapterRepository.getById(chapterId),
  });

  const {
    data: questions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["questions", chapterId],
    queryFn: () => questionRepository.getByChapter(chapterId),
  });

  const currentQuestion = questions[currentIndex];
  const nextQuestion = questions[currentIndex + 1];

  return (
    <IonPage>
      <GeneralHeader title={chapter?.display_name ?? "Learn"} />
      <IonContent fullscreen>
        <div className="flex h-full flex-col">
          {isLoading && (
            <div className="mx-auto max-w-3xl w-full px-6 py-8 flex flex-col gap-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          )}

          {error && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-destructive">
                Failed to load questions. Please try again.
              </p>
            </div>
          )}

          {!isLoading && !error && questions.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No questions found for this chapter yet.
              </p>
            </div>
          )}

          {!isLoading && currentQuestion && (
            <>
              <PrefetchExtras questionId={nextQuestion?.id} />
              <StudyCard
                key={currentQuestion.id}
                question={currentQuestion}
                index={currentIndex}
                total={questions.length}
                onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                onNext={() =>
                  setCurrentIndex((i) =>
                    Math.min(questions.length - 1, i + 1)
                  )
                }
              />
            </>
          )}

          {!isLoading &&
            !error &&
            questions.length > 0 &&
            currentIndex >= questions.length && (
              <DoneScreen
                total={questions.length}
                onRestart={() => setCurrentIndex(0)}
                onBack={() => history.goBack()}
              />
            )}
        </div>
      </IonContent>
    </IonPage>
  );
}
