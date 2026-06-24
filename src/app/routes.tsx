import { Redirect, Route } from "react-router-dom";
import {
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
} from "@ionic/react";
import PracticeTab from "@/app/pages/practice-tab";
import PatternsTab from "@/app/pages/patterns-tab";
import ProgressTab from "@/app/pages/progress-tab";
import QuestionPage from "@/app/pages/questionPage";
import { LuBookOpenText, LuDumbbell, LuLoader } from "react-icons/lu";
import ChapterPage from "@/app/pages/ChapterPage";
import ResourcePage from "@/app/pages/ResourcePage";

export default function Routes() {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tabs/practice">
          <PracticeTab />
        </Route>

        <Route exact path="/tabs/practice/:chapterId">
          <ChapterPage />
        </Route>

        <Route exact path="/tabs/practice/:chapterId/learn">
          <QuestionPage />
        </Route>

        <Route exact path="/tabs/practice/:chapterId/resource">
          <ResourcePage />
        </Route>

        <Route exact path="/tabs/patterns">
          <PatternsTab />
        </Route>

        <Route exact path="/tabs/progress">
          <ProgressTab />
        </Route>

        <Redirect exact from="/" to="/tabs/practice" />
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="practice" href="/tabs/practice">
          <LuDumbbell size={20} />

          <IonLabel>Practice</IonLabel>
        </IonTabButton>

        <IonTabButton tab="patterns" href="/tabs/patterns">
          <LuBookOpenText size={20} />

          <IonLabel>Patterns</IonLabel>
        </IonTabButton>

        <IonTabButton tab="progress" href="/tabs/progress">
          <LuLoader size={20} />
          <IonLabel>Progress</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}
