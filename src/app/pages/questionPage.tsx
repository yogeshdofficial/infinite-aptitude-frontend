import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IonContent, IonPage } from "@ionic/react";

import { questionRepository } from "@/db/repositories/questionRepository";
import { chapterRepository } from "@/db/repositories/chapterRepository";
import GeneralHeader from "@/feautures/general-header";
import QuestionCard from "@/feautures/QuestionCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuestionsPage() {
  const { chapterId } = useParams<{ chapterId: string }>();

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

  return (
    <IonPage>
      <GeneralHeader title={chapter?.display_name ?? "Questions"} />
      <IonContent fullscreen>
        <main className="flex flex-col gap-3 p-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}

          {error && (
            <p className="text-sm text-destructive">
              Failed to load questions. Please try again.
            </p>
          )}

          {!isLoading && !error && questions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No questions found for this chapter yet.
            </p>
          )}

          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </main>
      </IonContent>
    </IonPage>
  );
}
