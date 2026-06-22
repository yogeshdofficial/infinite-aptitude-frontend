import { IonContent, IonPage } from "@ionic/react";
import GeneralHeader from "@/feautures/general-header";
import { useQuery } from "@tanstack/react-query";
import ChapterCard from "@/feautures/practice/components/ChapterCard";
import { chapterRepository } from "@/db/repositories/chapterRepository";

export default function PracticeTab() {
  const {
    data: chapters = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chapters"],
    queryFn: () => chapterRepository.getAll(),
  });

  if (isLoading) {
    return <p>Loading</p>;
  }

  if (error) {
    return <p>Failed to load chapters"</p>;
  }
  return (
    <IonPage className="p-2">
      <GeneralHeader />
      <IonContent fullscreen={true} className="">
        <main className="p-4 flex gap-4 flex-col">
          {chapters.map((chap) => (
            <ChapterCard key={chap.id} chapter={chap} />
          ))}
        </main>
      </IonContent>
    </IonPage>
  );
}
