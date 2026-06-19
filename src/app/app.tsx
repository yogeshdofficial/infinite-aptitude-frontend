import { IonApp } from "@ionic/react";
import AppSidebar from "../feautures/app-sidebar";
import Provider from "./provider";
import AppRouter from "./routes";
export default function App() {
  return (
    <Provider>
      <IonApp>
        <AppSidebar />
        <AppRouter />
      </IonApp>
    </Provider>
  );
}
