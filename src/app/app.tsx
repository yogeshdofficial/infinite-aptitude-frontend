import { IonApp } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Provider from "./provider";
import AppRouter from "./routes";

export default function App() {
  return (
    <Provider>
      <IonApp>
        <IonReactRouter>
          <AppRouter />
        </IonReactRouter>
      </IonApp>
    </Provider>
  );
}
