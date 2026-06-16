import GeneralHeader from "@/feautures/general-header";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

export default function QuestionsTab() {
  return (
    <IonPage>
      <GeneralHeader />
      <IonContent fullscreen={true}>
        <main></main>
      </IonContent>
    </IonPage>
  );
}
