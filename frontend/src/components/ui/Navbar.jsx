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
            : /^\/admin\/compagnies\/[^/]+\/sections\/[^/]+\/utilisateurs$/.test(
              location.pathname
            )
              ? "Utilisateurs de la section"
              : location.pathname.startsWith("/admin/missions") ||
                location.pathname.startsWith("/admin/creer") ||
                location.pathname.startsWith("/admin/validation")
                ? "Missions"
                : location.pathname === "/profil"
                  ? "Profil utilisateur"
                  : location.pathname === "/PageAide"
                    ? "Page d'aide"
                    : location.pathname === "/admin/vehicules/ajouter"
                      ? "Ajouter un véhicule"
                      : location.pathname.startsWith("/admin/vehicules/")
                        ? "Détails du véhicule"
                        : location.pathname.startsWith("/admin/missions/")
                          ? "Détails de la mission"
                          : location.pathname.startsWith("/conducteur/vehicules")
                            ? "Données conducteur"
                            : ""

  const description =
    location.pathname === "/admin/tableau-de-bord"
      ? "Vue d’ensemble de l’activité et des missions"
      : location.pathname === "/admin/compagnies"
        ? "Gérez les compagnies, leurs sections et leurs responsables"
        : location.pathname.startsWith("/admin/vehicules")
          ? "Gérez et suivez l’ensemble du parc de véhicules"
          : /^\/admin\/compagnies\/[^/]+\/sections$/.test(location.pathname)
            ? "Consultez et gérez les sections rattachées à cette compagnie"
            : /^\/admin\/compagnies\/[^/]+\/sections\/[^/]+\/utilisateurs$/.test(
              location.pathname
            )
              ? "Consultez et gérez les utilisateurs rattachés à cette section"
              : location.pathname.startsWith("/admin/missions") ||
                location.pathname.startsWith("/admin/creer") ||
                location.pathname.startsWith("/admin/validation")
                ? "Gérez, consultez et créez les missions."
                : location.pathname === "/profil"
                  ? "Consultez et modifiez vos informations personnelles"
                  : location.pathname === "/PageAide"
                    ? "Consultez la page d'aide pour obtenir des informations sur l'utilisation de l'application"
                    : location.pathname === "/admin/vehicules/ajouter"
                      ? "Ajoutez un nouveau véhicule au parc"
                      : location.pathname.startsWith("/admin/vehicules/")
                        ? "Consultez et modifiez les informations du véhicule"
                        : location.pathname.startsWith("/admin/missions/")
                          ? "Consultez et modifiez les informations de la mission"
                          : location.pathname.startsWith("/conducteur/vehicules")
                            ? "Consultez les informations de vos missions et véhicules"
                            : ""

  return (
    <div className="relative w-full py-3 sm:m-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:py-0">
      <div className="min-w-0 flex-1 pr-2 pt-14 sm:pt-0">
        <h1 className="wrap-break-word text-xl font-semibold leading-tight sm:text-xl md:text-2xl">
          {titre}
        </h1>

        <h2 className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-500 sm:text-sm">
          {description}
        </h2>
      </div>

      <div className="absolute right-0 mr-4 top-3 shrink-0 sm:static sm:self-auto">
        <BoutonProfile />
      </div>
    </div>
  )
}

export default Navbar