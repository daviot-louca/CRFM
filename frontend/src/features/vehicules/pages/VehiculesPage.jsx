import CartesVehicules from "../components/CartesVehicules";
import MainLayout from "@/components/layout/MainLayout";
import { useState } from "react";
import { Link } from "react-router-dom";
function VehiculesPage() {
  const [recherche, setRecherche] = useState("");

  return (
    <MainLayout>
      <div className="mb-6 flex w-full items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Rechercher un véhicule..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>

        <Link
          to="/admin/vehicules/ajouter"
          className="shrink-0 rounded-lg bg-gris-fonce px-4 py-2.5 text-sm text-gris-clair"
        >
          + Ajouter un véhicule
        </Link>
      </div>
      <div>
        {/* This page must continue to display all vehicles (available and unavailable).
            Only the mission creation flow should use the /vehicules/disponibles endpoint. */}
        <CartesVehicules recherche={recherche} />
      </div>
    </MainLayout>
  );
}

export default VehiculesPage;