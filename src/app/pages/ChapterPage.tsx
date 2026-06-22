import { Button } from "@/components/ui/button";
import { patternRepository } from "@/db/repositories/patternRepository";
import { IonContent, IonPage, useIonRouter } from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

export default function ChapterPage() {
  const { chapterId } = useParams();
  const router = useIonRouter();

  const {
    data: patterns = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["patterns", chapterId],
    queryFn: () => patternRepository.getByChapter(chapterId),
  });

  if (isLoading) {
    return <p>Loading</p>;
  }

  if (error) {
    return <p>Failed to load chapters"</p>;
  }
  return (
    <IonPage>
      <IonContent>
        <main className="p-2">
          <h1>{chapterId}</h1>
          <Button
            variant="outline"
            onClick={() => router.push(`/tabs/practice/${chapterId}/learn`)}
          >
            Learn
          </Button>
          <Button variant={"outline"}>Quiz</Button>
          <ul>
            {patterns.map((pattern) => {
              return <li key={pattern.id}>{pattern.name}</li>;
            })}
          </ul>
        </main>
      </IonContent>
    </IonPage>
  );
}
