import { IonContent, IonPage } from "@ionic/react";
import GeneralHeader from "@/feautures/general-header";
import PracticeCard from "@/feautures/practice/components/practice-card";

export default function PracticeTab() {
  return (
    <IonPage>
      <GeneralHeader />
      <IonContent fullscreen={true}>
        <main className="p-2">
          <PracticeCard chapter="Ratio and Proprtion" />
        </main>
      </IonContent>
    </IonPage>
  );
}
