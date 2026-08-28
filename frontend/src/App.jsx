import TableauDeBordAdmin from "./pages/admin/TableauDeBordAdmin"
import CompagniesAdmin from "./features/compagnies/pages/CompagniesAdmin"

import Creermissions1Admin from "./features/missions/pages/Creermissions1Admin"
import CreerMissions2Admin from "./features/missions/pages/CreerMissions2Admin"
import CreerMissions3Admin from "./features/missions/pages/CreerMissions3Admin"
import CreerMission4Admin from "./features/missions/pages/CreerMissions4Admin"
import VisuelMissionsAdmin from "./features/missions/pages/VisuelMissionsAdmin"
import MissionDetail from "./features/missions/pages/missionsDetail"

import DetailVehiculesAdmin from "./features/vehicules/pages/DetailVehiculesAdmin"
import MessagerieAdmin from "./pages/admin/MessagerieAdmin"
import PageContactMessagerieAdmin from "./pages/admin/PageContactMessagerieAdmin"
import SectionsAdmin from "./features/sections/pages/SectionsAdmin"
import Utilisateurs from "./features/users/page/Utilisateurs"
import VehiculesAdmin from "./features/vehicules/pages/VehiculesPage"
import AjouterVehiculeAdmin from "./features/vehicules/pages/AjouterVehiculeAdmin"
import ConducteurVehiculeDetailPage from "./features/conducteur/pages/ConducteurVehiculeDetailPage"
import ConducteurVehiculesPage from "./features/conducteur/pages/ConducteurVehiculesPage"
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom"
import { MissionsProvider } from "./features/missions/context/MissionsContext";
function App() {
  return <BrowserRouter>
    <Routes>
      {/**Routes admin  */}
      <Route path="/admin/tableau-de-bord" element={<TableauDeBordAdmin />} />
      <Route path="/admin/compagnies" element={<CompagniesAdmin />} />
      <Route element={<MissionsProvider />}>
        <Route path="/admin/creer-missions-1" element={<Creermissions1Admin />} />
        <Route path="/admin/creer-missions-2" element={<CreerMissions2Admin />} />
        <Route path="/admin/creer-missions-3" element={<CreerMissions3Admin />} />
        <Route path="/admin/creer-missions-4" element={<CreerMission4Admin />} />
      </Route>
      <Route path="/admin/vehicules/:id" element={<DetailVehiculesAdmin />} />
      <Route path="/admin/messages" element={<MessagerieAdmin />} />
      <Route path="/admin/contact" element={<PageContactMessagerieAdmin />} />
      <Route path="/admin/compagnies/:compagnieId/sections" element={<SectionsAdmin />} />
      <Route path="/admin/compagnies/:compagnieId/sections/:sectionId/utilisateurs" element={<Utilisateurs/>}/>      
      <Route path="/admin/vehicules" element={<VehiculesAdmin />} />
      <Route path="/admin/vehicules/ajouter" element={<AjouterVehiculeAdmin />}/>
      <Route path="/admin/missions" element={<VisuelMissionsAdmin />} />
      <Route path="/admin/missions/:missionsId" element={<MissionDetail />} />

      {/**Routes OA */}
      {/**Routes conducteur */}
      <Route path="/conducteur" element={<Navigate to="/conducteur/vehicules" replace />} />
      <Route path="/conducteur/vehicules" element={<ConducteurVehiculesPage />} />
      <Route path="/conducteur/vehicules/:missionVehiculeId" element={<ConducteurVehiculeDetailPage />} />
    </Routes>
  </BrowserRouter>
}

export default App
