import { useState } from "react"
import { ChevronRight, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

function BoutonProfile() {
  const navigate = useNavigate()
  const [menuOuvert, setMenuOuvert] = useState(false)

  const token = localStorage.getItem("token")
  const userStorage = localStorage.getItem("user")

  let grade = ""
  let lastName = ""
  let role = "Utilisateur"

  if (userStorage) {
    try {
      const user = JSON.parse(userStorage)

      grade =
        typeof user?.grade === "string"
          ? user.grade.trim()
          : ""

      lastName =
        typeof user?.lastName === "string"
          ? user.lastName.trim()
          : typeof user?.nom === "string"
            ? user.nom.trim()
            : ""

      role =
        typeof user?.role?.roleName === "string"
          ? user.role.roleName.trim()
          : "Utilisateur"
    } catch (error) {
      console.error(
        "Impossible de lire les informations utilisateur :",
        error
      )
    }
  }

  // Sécurité : récupération du rôle depuis le JWT si nécessaire
  if (
    token &&
    (!role || role === "Utilisateur")
  ) {
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      )

      if (
        typeof payload?.role?.roleName === "string"
      ) {
        role = payload.role.roleName
      }
    } catch (error) {
      console.error(
        "Impossible de lire le rôle du token :",
        error
      )
    }
  }

  const nomComplet =
    [grade, lastName]
      .filter(Boolean)
      .join(" ") || "Nom"

  const initiales =
    [lastName]
      .filter(Boolean)
      .map((element) => element.slice(0, 2))
      .join("")
      .toUpperCase() || "NO"

  const handleDeconnexion = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("userGrade")
    localStorage.removeItem("userLastName")
    localStorage.removeItem("userRole")

    setMenuOuvert(false)

    navigate("/login", {
      replace: true,
    })
  }

  const handleProfil = () => {
    setMenuOuvert(false)

    // À connecter plus tard au modal de profil
    navigate("/profil", {
      state: { fromProfile: true },
    })
  }

  return (
    <div className="relative">

      {/* Bouton principal */}
      <button
        type="button"
        onClick={() => setMenuOuvert(!menuOuvert)}
        aria-expanded={menuOuvert}
        aria-haspopup="menu"
        className="flex w-full max-w-xs items-center gap-2 rounded-xl bg-gris-clair px-2 py-1.5 text-left transition hover:bg-gray-200 sm:w-auto sm:gap-3"
      >
        {/* Initiales */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gris-fonce text-xs font-semibold uppercase text-white sm:h-10 sm:w-10 sm:text-sm">
          {initiales}
        </div>

        {/* Informations */}
        <div className="min-w-0 flex-1 pr-1 sm:pr-2">
          <p className="truncate text-xs font-semibold text-gray-700 sm:text-sm">
            {nomComplet}
          </p>

          <p className="truncate text-xs text-gray-500 sm:text-sm">
            {role.slice(0,5)}
          </p>
        </div>

        <ChevronRight
          size={17}
          className={`shrink-0 text-gray-500 transition-transform duration-200 ${menuOuvert
              ? "rotate-90"
              : ""
            }`}
        />
      </button>

      {/* Menu */}
      {menuOuvert && (
        <>
          {/* Overlay mobile */}
          <button
            type="button"
            aria-label="Fermer le menu profil"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
          />

          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[calc(100vw-2rem)] max-w-xs overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.18)]"
          >

            {/* En-tête du profil */}
            <button 
            className="mb-1 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3 w-full"
            onClick={handleProfil}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gris-fonce text-sm font-bold uppercase text-white">
                  {initiales}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {nomComplet}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {role}
                  </p>
                </div>
            </button>


            {/* Séparateur */}
            <div className="my-1 border-t border-gray-100" />

            {/* Déconnexion */}
            <button
              type="button"
              role="menuitem"
              onClick={handleDeconnexion}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-red-50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <LogOut size={20} />
              </span>

              <span>
                <span className="block text-sm font-bold text-red-600">
                  Déconnexion
                </span>

                <span className="mt-0.5 block text-xs text-red-400">
                  Quitter votre session
                </span>
              </span>
            </button>

          </div>
        </>
      )}
    </div>
  )
}

export default BoutonProfile