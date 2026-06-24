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
        <div className="mx-auto max-w-3xl px-6 py-8">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Chapters</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}

            {error && (
              <p className="col-span-2 text-sm text-destructive">
                Failed to load chapters. Please try again.
              </p>
            )}

            {!isLoading && !error && chapters.length === 0 && (
              <p className="col-span-2 text-sm text-muted-foreground">
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
