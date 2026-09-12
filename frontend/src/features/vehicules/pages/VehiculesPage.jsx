import CartesVehicules from "../components/CartesVehicules";
import MainLayout from "@/components/layout/MainLayout";
import { useState } from "react";
import { Link } from "react-router-dom";

function VehiculesPage() {
  const [recherche, setRecherche] = useState("");

  return (
    <MainLayout>
      <div className="mb-5 flex w-full min-w-0 flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="relative w-full min-w-0 sm:max-w-md">
          <input
            type="text"
            className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-10 sm:px-4 sm:text-sm"
            placeholder="Rechercher un véhicule..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>

        <Link
          to="/admin/vehicules/ajouter"
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-gris-fonce px-4 py-3 text-sm font-semibold text-gris-clair transition hover:opacity-90 active:scale-[0.99] sm:min-h-0 sm:w-auto sm:py-2.5"
        >
          + Ajouter un véhicule
        </Link>
      </div>

      <div className="w-full min-w-0">
        {/* This page must continue to display all vehicles (available and unavailable).
            Only the mission creation flow should use the /vehicules/disponibles endpoint. */}
        <CartesVehicules recherche={recherche} />
      </div>
    </MainLayout>
  );
}

export default VehiculesPage;