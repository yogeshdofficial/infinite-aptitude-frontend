import { IonApp } from "@ionic/react";
import AppSidebar from "../feautures/app-sidebar";
import Provider from "./provider";
import AppRouter from "./routes";
import { useEffect } from "react";
import sqliteService from "@/db/sqliteService";
export default function App() {
  useEffect(() => {
    async function test() {
      const db = sqliteService.getDB();

      const result = await db.query("SELECT COUNT(*) count FROM questions");

      console.log(result.values);
    }

    test();
  }, []);
  return (
    <Provider>
      <IonApp>
        <AppSidebar />
        <AppRouter />
      </IonApp>
    </Provider>
  );
}
