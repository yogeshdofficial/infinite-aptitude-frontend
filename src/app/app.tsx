import { IonApp } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import AppSidebar from "../feautures/app-sidebar";
import Provider from "./provider";
import AppRouter from "./routes";
export default function App() {
  return (
    <Provider>
      <IonApp>
        <IonReactRouter>
          <AppSidebar />
          <AppRouter />
        </IonReactRouter>
      </IonApp>
    </Provider>
  );
}
