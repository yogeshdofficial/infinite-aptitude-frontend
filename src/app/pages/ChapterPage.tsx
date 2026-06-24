import { useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import { IonContent, IonPage } from "@ionic/react";
import { useQuery } from "@tanstack/react-query";

import { chapterRepository } from "@/db/repositories/chapterRepository";
import { chapterResourceRepository } from "@/db/repositories/chapterResourceRepository";
import { patternRepository } from "@/db/repositories/patternRepository";
import { patternDocRepository } from "@/db/repositories/patternDocRepository";

import GeneralHeader from "@/feautures/general-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LuBookOpen,
  LuFileText,
  LuChevronRight,
  LuGraduationCap,
  LuPenLine,
} from "react-icons/lu";

// ── Helpers ──────────────────────────────────────────────────────────────────

function ResourceRow({
  icon,
  label,
  sublabel,
  available,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  available: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={!available}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 text-left shadow-sm transition-all hover:border-primary/30 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium leading-tight">{label}</span>
        {sublabel && (
          <span className="text-xs text-muted-foreground">{sublabel}</span>
        )}
      </span>
      <LuChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function PatternRow({
  name,
  count,
  hasDoc,
  onClick,
}: {
  name: string;
  count: number;
  hasDoc: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 text-left shadow-sm transition-all hover:border-primary/30 hover:bg-muted/40"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
        <LuPenLine className="size-4" />
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium leading-tight">{name}</span>
        <span className="text-xs text-muted-foreground">
          {count} question{count === 1 ? "" : "s"}
          {!hasDoc && " · no notes yet"}
        </span>
      </span>
      {hasDoc && (
        <LuChevronRight className="size-4 shrink-0 text-muted-foreground" />
      )}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ChapterPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const history = useHistory();

  const { data: chapter } = useQuery({
    queryKey: ["chapter", chapterId],
    queryFn: () => chapterRepository.getById(chapterId),
  });

  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["chapterResources", chapterId],
    queryFn: () => chapterResourceRepository.getAllForChapter(chapterId),
  });

  const { data: patternCounts = [], isLoading: patternsLoading } = useQuery({
    queryKey: ["patternCounts", chapterId],
    queryFn: () => patternRepository.getCountsByChapter(chapterId),
  });

  const { data: patternDocs = [] } = useQuery({
    queryKey: ["patternDocs", chapterId],
    queryFn: () => patternDocRepository.getByChapter(chapterId),
  });

  const docsByPattern = useMemo(() => {
    const map = new Map<string, string>();
    for (const doc of patternDocs) {
      if (doc.pattern_id) map.set(doc.pattern_id, doc.markdown);
    }
    return map;
  }, [patternDocs]);

  const overview = resources?.find((r) => r.resource_type === "overview");
  const cheatsheet = resources?.find((r) => r.resource_type === "cheatsheet");

  /** Navigate to the full-page resource viewer */
  function openResource(title: string, markdown: string) {
    history.push(`/tabs/practice/${chapterId}/resource`, { title, markdown });
  }

  /** Navigate to the pattern doc viewer */
  function openPatternDoc(patternName: string, markdown: string) {
    history.push(`/tabs/practice/${chapterId}/resource`, {
      title: patternName,
      markdown,
    });
  }

  return (
    <IonPage>
      <GeneralHeader title={chapter?.display_name ?? ""} />

      <IonContent fullscreen>
        <main className="flex flex-col gap-5 p-4 pb-8">
          {/* ── Primary actions ── */}
          <div className="flex gap-2">
            <Button
              className="flex-1 rounded-xl font-semibold"
              onClick={() => history.push(`/tabs/practice/${chapterId}/learn`)}
            >
              <LuGraduationCap className="mr-1.5 size-4" />
              Learn
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl font-semibold"
            >
              Quiz
            </Button>
          </div>

          {/* ── Resources section ── */}
          <section>
            <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Resources
            </h2>
            <div className="flex flex-col gap-2">
              {resourcesLoading ? (
                <>
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </>
              ) : (
                <>
                  <ResourceRow
                    icon={<LuBookOpen className="size-4" />}
                    label="Chapter Overview"
                    sublabel={
                      overview ? "Concepts & key ideas" : "Not available yet"
                    }
                    available={!!overview}
                    onClick={() =>
                      openResource(
                        `${chapter?.display_name} — Overview`,
                        overview?.markdown ?? "",
                      )
                    }
                  />
                  <ResourceRow
                    icon={<LuFileText className="size-4" />}
                    label="Cheatsheet"
                    sublabel={
                      cheatsheet ? "Quick reference" : "Not available yet"
                    }
                    available={!!cheatsheet}
                    onClick={() =>
                      openResource(
                        `${chapter?.display_name} — Cheatsheet`,
                        cheatsheet?.markdown ?? "",
                      )
                    }
                  />
                </>
              )}
            </div>
          </section>

          {/* ── Patterns section ── */}
          <section>
            <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Patterns
            </h2>

            {patternsLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : patternCounts.length === 0 ? (
              <p className="rounded-xl border border-border/60 p-4 text-center text-sm text-muted-foreground">
                No patterns found for this chapter.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {patternCounts.map((pattern) => {
                  const doc = docsByPattern.get(pattern.pattern_id);
                  return (
                    <PatternRow
                      key={pattern.pattern_id}
                      name={pattern.name}
                      count={pattern.count}
                      hasDoc={!!doc}
                      onClick={() => {
                        if (doc) openPatternDoc(pattern.name, doc);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
}
