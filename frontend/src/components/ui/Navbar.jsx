import { useLocation } from "react-router-dom"
import BoutonProfile from "./BoutonProfile"

function Navbar() {
  const location = useLocation()

  const titre =
    location.pathname === "/admin/tableau-de-bord"
      ? "Bienvenue dans le CRFM"
      : location.pathname === "/admin/compagnies"
        ? "Gestion des compagnies"
        : location.pathname.startsWith("/admin/vehicules")
          ? "Gestion des véhicules tactiques"
          : /^\/admin\/compagnies\/[^/]+\/sections$/.test(location.pathname)
            ? "Sections de la compagnie"
            : /^\/admin\/compagnies\/[^/]+\/sections\/[^/]+\/utilisateurs$/.test(location.pathname)
              ? "Utilisateurs de la section"
              : location.pathname.startsWith("/admin/missions") || location.pathname.startsWith("/admin/creer") || location.pathname.startsWith("/admin/validation")
              ? "Missions"
              :""

  const description =
    location.pathname === "/admin/tableau-de-bord"
      ? "Vue d’ensemble de l’activité et des missions"
      : location.pathname === "/admin/compagnies"
        ? "Gérez les compagnies, leurs sections et leurs responsables"
        : location.pathname.startsWith("/admin/vehicules")
          ? "Gérez et suivez l’ensemble du parc de véhicules"
          : /^\/admin\/compagnies\/[^/]+\/sections$/.test(location.pathname)
            ? "Consultez et gérez les sections rattachées à cette compagnie"
            : /^\/admin\/compagnies\/[^/]+\/sections\/[^/]+\/utilisateurs$/.test(location.pathname)
              ? "Consultez et gérez les utilisateurs rattachés à cette section"
              : location.pathname.startsWith("/admin/missions") || location.pathname.startsWith("/admin/creer") || location.pathname.startsWith("/admin/validation")
              ? "Gérez, consultez et créez les missions." 
              :""

  return (
    <div className="m-4 flex items-center justify-between">
      <div className="flex flex-col justify-between">
        <h1 className="">{titre}</h1>
        <h2>{description}</h2>
      </div>

      <BoutonProfile />
    </div>
  )
}

export default Navbar