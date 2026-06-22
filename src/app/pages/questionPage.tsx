import { MarkdownViewer } from "@/components/MarkdownViewer";
import { questionRepository } from "@/db/repositories/questionRepository";
import GeneralHeader from "@/feautures/general-header";
import QuestionCard from "@/feautures/QuestionCard";
import { IonContent, IonPage } from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export default function QuestionsPage() {
  const { chapterId } = useParams();
  const {
    data: questions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["patterns", chapterId],
    queryFn: () => questionRepository.getByChapter(chapterId),
  });

  return (
    <IonPage>
      <GeneralHeader title="Questions" />
      <IonContent>
        <main className="p-3">
          <p>QUESTIONS</p>
          <ul className="flex flex-col gap-4">
            {questions.map((question) => {
              return (
                <li key={question.id} className="flex ">
                  <QuestionCard question={question} />
                </li>
              );
            })}
          </ul>
        </main>
      </IonContent>
    </IonPage>
  );
}
