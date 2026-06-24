import { IonContent, IonPage } from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import GeneralHeader from "@/feautures/general-header";
import ChapterCard from "@/feautures/practice/components/ChapterCard";
import { chapterRepository } from "@/db/repositories/chapterRepository";
import { Skeleton } from "@/components/ui/skeleton";

export default function PracticeTab() {
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
      <GeneralHeader title="Practice" />
      <IonContent fullscreen>
        <main className="flex flex-col gap-3 p-4">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}

          {error && (
            <p className="text-sm text-destructive">
              Failed to load chapters. Please try again.
            </p>
          )}

          {!isLoading && !error && chapters.length === 0 && (
            <p className="text-sm text-muted-foreground">No chapters found.</p>
          )}

          {chapters.map((chap) => (
            <ChapterCard key={chap.id} chapter={chap} />
          ))}
        </main>
      </IonContent>
    </IonPage>
  );
}
