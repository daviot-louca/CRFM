import { useEffect, useState } from "react";
import Sidebar from "./admin/Sidebar";
import Navbar from "../ui/Navbar";
import { getMissions } from "../../features/missions/api/missions.api";

function MainLayout({ children }) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [missions, setMissions] = useState([]);

  const userRole =
    localStorage.getItem("userRole") || "";

  const recupererUserId = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "null",
      );

      return user?.id ?? null;
    } catch (error) {
      console.error(
        "Impossible de récupérer l'utilisateur :",
        error,
      );

      return null;
    }
  };

  const userId = recupererUserId();

  useEffect(() => {
    const role = String(userRole).toLowerCase();

    if (
      ![
        "administrateur",
        "oal",
        "soa",
        "conducteur",
      ].includes(role)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMissions([]);
      return;
    }

    const chargerMissions = async () => {
      try {
        const data = await getMissions();

        setMissions(data ?? []);
      } catch (error) {
        console.error(
          "[MAIN LAYOUT] Erreur récupération missions :",
          error,
        );

        setMissions([]);
      }
    };

    chargerMissions();
  }, [userRole]);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-bleu lg:block">
        <Sidebar
          userRole={userRole}
          userId={userId}
          missions={missions}
        />
      </aside>

      {/* Menu mobile */}
      {menuOuvert && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMenuOuvert(false)}
            className="absolute inset-0 bg-black/50"
          />

          <div className="relative flex h-full w-full flex-col bg-bleu">
            <div className="flex justify-end px-4 py-4 sm:px-6">
              <button
                type="button"
                aria-label="Fermer le menu"
                onClick={() => setMenuOuvert(false)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gris-fonce text-2xl text-white transition hover:bg-gris-clair hover:text-gris-fonce"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-8 sm:px-6">
              <Sidebar
                userRole={userRole}
                userId={userId}
                missions={missions}
              />
            </div>
          </div>
        </div>
      )}

      {/* Contenu */}
      <div className="flex min-h-screen flex-col lg:ml-64">
        <header className="px-4 sm:px-6">
          <div className="flex items-start gap-3">
            <button
              type="button"
              aria-label="Ouvrir le menu"
              aria-expanded={menuOuvert}
              onClick={() => setMenuOuvert(true)}
              className="mt-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bleu text-xl text-white transition hover:opacity-90 lg:hidden"
            >
              ☰
            </button>

            <div className="min-w-0 flex-1">
              <Navbar />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;