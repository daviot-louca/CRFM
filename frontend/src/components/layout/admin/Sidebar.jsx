import { NavLink } from "react-router-dom"
import logoBataillon from "/images/logoCompagnie/logoBataillon.webp"

function Sidebar({ userRole, userId, missions = [] }) {
  const role = String(userRole || "").toLowerCase()

  const estConducteur =
    role === "conducteur" ||
    (["administrateur", "oal", "soa"].includes(role) &&
      missions.some((mission) =>
        mission?.missionsVehicules?.some(
          (vehicule) =>
            vehicule?.conducteurId != null &&
            userId != null &&
            String(vehicule.conducteurId) === String(userId),
        ),
      ))

  const estRolePrincipal = [
    "administrateur",
    "soa",
    "oal",
  ].includes(role)

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto px-3 py-4 sm:gap-4 sm:px-4 sm:py-5">
      <div className="flex shrink-0 items-center justify-center py-1 sm:py-2">
        <img
          src={logoBataillon}
          alt="logo du bataillon"
          className="h-auto w-20 sm:w-24"
        />
      </div>

      <nav className="flex flex-col gap-2 sm:gap-3">

        {/* Administrateur / OAL / SOA */}
        {estRolePrincipal && (
          <>
            <NavLink
              to="/admin/missions"
              className="rounded-md bg-gris-fonce px-3 py-2.5 text-sm text-gris-clair transition-all duration-300 hover:bg-gris-clair hover:text-gris-fonce sm:px-4 sm:py-3 sm:text-base"
            >
              Missions
            </NavLink>

            <NavLink
              to="/admin/vehicules"
              className="rounded-md bg-gris-fonce px-3 py-2.5 text-sm text-gris-clair transition-all duration-300 hover:bg-gris-clair hover:text-gris-fonce sm:px-4 sm:py-3 sm:text-base"
            >
              Véhicules
            </NavLink>

            <NavLink
              to="/admin/compagnies"
              className="rounded-md bg-gris-fonce px-3 py-2.5 text-sm text-gris-clair transition-all duration-300 hover:bg-gris-clair hover:text-gris-fonce sm:px-4 sm:py-3 sm:text-base"
            >
              <span className="block sm:hidden">
                Personnel
              </span>

              <span className="hidden sm:block">
                Compagnies/Personnel
              </span>
            </NavLink>

            <NavLink
              to="/admin/tableau-de-bord"
              className="rounded-md bg-gris-fonce px-3 py-2.5 text-sm text-gris-clair transition-all duration-300 hover:bg-gris-clair hover:text-gris-fonce sm:px-4 sm:py-3 sm:text-base"
            >
              Tableau de bord
            </NavLink>
          </>
        )}

        {/* Données conducteur */}
        {estConducteur && (
          <NavLink
            to="/conducteur/vehicules"
            className="rounded-md bg-gris-fonce px-3 py-2.5 text-sm text-gris-clair transition-all duration-300 hover:bg-gris-clair hover:text-gris-fonce sm:px-4 sm:py-3 sm:text-base"
          >
            Données conducteur
          </NavLink>
        )}

        {/* Aide accessible à tout le monde */}
        <NavLink
          to="/PageAide"
          className="rounded-md bg-gris-fonce px-3 py-2.5 text-sm text-gris-clair transition-all duration-300 hover:bg-gris-clair hover:text-gris-fonce sm:px-4 sm:py-3 sm:text-base"
        >
          Page d'aide
        </NavLink>

      </nav>
    </div>
  )
}

export default Sidebar