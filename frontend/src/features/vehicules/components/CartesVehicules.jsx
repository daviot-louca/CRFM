import { useVehicules } from "../hooks/useAllVehicule";
import { Link } from "react-router-dom";
function CartesVehicules({ recherche = "" }) {
    const { vehicules, loading, error } = useVehicules();

    if (loading) {
        return <p>Chargement des véhicules...</p>;
    }

    if (error) {
        return <p>Impossible de charger les véhicules.</p>;
    }

    const rechercheNormalisee = recherche.toLowerCase().trim();

    const vehiculesFiltres = vehicules.filter((vehicule) => {
        if (!rechercheNormalisee) return true;

        return [
            vehicule.vehiculeName,
            vehicule.immatriculation,
            vehicule.vehiculeType?.typeName,
            vehicule.vehiculeType?.EMAT8,
            vehicule.carburant,
        ].some((valeur) =>
            String(valeur || "")
                .toLowerCase()
                .includes(rechercheNormalisee)
        );
    });

    return (
        <div>
            {vehiculesFiltres.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">
                    Aucun véhicule ne correspond à votre recherche.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {vehiculesFiltres.map((vehicule) => (
                        <div
                            key={vehicule.id}
                            className="
                                group flex min-h-60 flex-col overflow-hidden rounded-xl
                                border border-gray-200 bg-gris-fonce
                                transition duration-200
                                hover:-translate-y-1 hover:shadow-lg
                            "
                        >
                            <div className="flex h-40 items-center justify-center bg-bleu p-4">
                                <img
                                    src={vehicule.vehiculeType?.UrlImage}
                                    alt={vehicule.vehiculeName}
                                    className="h-full w-full object-contain"
                                />
                            </div>

                            <div className="flex flex-1 flex-col justify-between p-4">
                                <div>
                                    <h3 className="line-clamp-2 text-sm font-semibold">
                                        {vehicule.vehiculeName}
                                    </h3>

                                    <p className="mt-2 text-xs opacity-60">
                                        Immatriculation
                                    </p>

                                    <p className="text-sm font-medium">
                                        {vehicule.immatriculation}
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs ${vehicule.disponibilite
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {vehicule.disponibilite
                                            ? "Disponible"
                                            : "Indisponible"}
                                    </span>

                                    <Link
                                        to={`/admin/vehicules/${vehicule.id}`}
                                        className="text-xs font-medium hover:underline"
                                    >
                                        Voir les détails →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CartesVehicules;