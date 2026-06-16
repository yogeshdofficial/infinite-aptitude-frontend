import { Button } from "@/components/ui/button";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { IconMenu2, IconMenu2Filled } from "@tabler/icons-react";
import GeneralHeader from "@/feautures/general-header";

export default function HomeTab() {
  const { t } = useTranslation();
  return (
    <IonPage>
      <GeneralHeader />

      <IonContent fullscreen={true}>
        <main className="p-2">yogesh</main>
      </IonContent>
    </IonPage>
  );
}
