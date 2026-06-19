import {
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import { LuBookOpenText, LuDumbbell, LuLoader } from "react-icons/lu";
import PracticeTab from "./pages/practice-tab";
import PatternsTab from "./pages/patterns-tab";
import ProgressTab from "./pages/progress-tab";

export default function Routes() {
  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/practice">
            <PracticeTab />
          </Route>
          {/* <Route exact path="/">
            <Redirect to="/practice" />
          </Route> */}
          <Route exact path="/patterns">
            <PatternsTab />
          </Route>
          <Route exact path="/progress">
            <ProgressTab />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="practice" href="/practice">
            <LuDumbbell size={20} />
            <IonLabel>Practice</IonLabel>
          </IonTabButton>
          <IonTabButton tab="patterns" href="/patterns">
            <LuBookOpenText size={20} />
            <IonLabel>Patterns</IonLabel>
          </IonTabButton>
          <IonTabButton tab="progress" href="/progress">
            <LuLoader size={20} />
            <IonLabel>Progress</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
}
