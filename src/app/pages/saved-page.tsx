import { useMemo } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useQuery } from "@tanstack/react-query";

import GeneralHeader from "@/feautures/general-header";
import QuestionCard from "@/feautures/QuestionCard";
import { useSavedQuestionsList } from "@/hooks/use-saved-questions";
import { chapterRepository } from "@/db/repositories/chapterRepository";
import { Skeleton } from "@/components/ui/skeleton";
import { LuBookmark } from "react-icons/lu";

export default function SavedPage() {
  const { data: questions = [], isLoading } = useSavedQuestionsList();

  const { data: chapters = [] } = useQuery({
    queryKey: ["chapters"],
    queryFn: () => chapterRepository.getAll(),
  });

  const chapterName = useMemo(() => {
    const map = new Map(chapters.map((c) => [c.id, c.display_name]));
    return (chapterId: string) => map.get(chapterId) ?? chapterId;
  }, [chapters]);

  // Group in saved-order (most recent first) but keep each chapter's
  // questions together so the list reads coherently while studying.
  const groups = useMemo(() => {
    const order: string[] = [];
    const byChapter = new Map<string, typeof questions>();
    for (const q of questions) {
      if (!byChapter.has(q.chapter_id)) {
        byChapter.set(q.chapter_id, []);
        order.push(q.chapter_id);
      }
      byChapter.get(q.chapter_id)!.push(q);
    }
    return order.map((chapterId) => ({
      chapterId,
      questions: byChapter.get(chapterId)!,
    }));
  }, [questions]);

  return (
    <IonPage>
      <GeneralHeader title="Saved" />
      <IonContent fullscreen>
        <div className="mx-auto max-w-3xl px-6 py-8 lg:py-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Saved</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Questions you've bookmarked for later review.
            </p>
          </div>

          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          )}

          {!isLoading && questions.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LuBookmark className="size-6" />
              </div>
              <div>
                <p className="text-sm font-medium">Nothing saved yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tap the bookmark icon on any question to save it here.
                </p>
              </div>
            </div>
          )}

          {!isLoading && groups.length > 0 && (
            <div className="flex flex-col gap-8 pb-8">
              {groups.map(({ chapterId, questions: chapterQuestions }) => (
                <section key={chapterId}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {chapterName(chapterId)}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {chapterQuestions.map((q) => (
                      <QuestionCard key={q.id} question={q} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
