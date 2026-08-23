import { Link, useParams } from "react-router-dom";
import { useVehicules } from "../hooks/useAllVehicule";
import MainLayout from "@/components/layout/MainLayout";

function DetailVehiculesAdmin() {
  const { id } = useParams();
  const { vehicules, loading, error } = useVehicules();

  const vehicule = vehicules.find((item) => item.id === id);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm font-medium text-gray-500">Chargement du véhicule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">Impossible de charger le véhicule.</p>
      </div>
    );
  }

  if (!vehicule) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="font-semibold text-gray-800">Véhicule introuvable</p>
        <p className="mt-1 text-sm text-gray-500">Ce véhicule n'existe pas ou n'est plus disponible.</p>
        <Link to="/admin/vehicules" className="mt-5 inline-block rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
          Retour aux véhicules
        </Link>
      </div>
    );
  }

  const disponibilite = vehicule.disponible ?? vehicule.isDisponible ?? vehicule.disponibilite;
  const estDisponible = disponibilite === true || disponibilite === "disponible" || disponibilite === "Disponible";

  const valeur = (...values) => values.find((item) => item !== undefined && item !== null && item !== "");
  const afficher = (value, suffix = "") => value !== undefined && value !== null && value !== "" ? `${value}${suffix}` : "Non renseigné";

  const nomVehicule = valeur(vehicule.nom, vehicule.name, vehicule.immatriculation) || "Véhicule";
  const typeVehicule = valeur(
    vehicule.vehiculesType?.typeName,
    vehicule.vehiculeType?.typeName,
    vehicule.type?.typeName,
    vehicule.typeVehicule,
    typeof vehicule.type === "string" ? vehicule.type : null,
  );
  const categorieVehicule = valeur(
    vehicule.vehiculeType?.categorie,
    vehicule.vehiculesType?.categorie,
    vehicule.type?.categorie,
    vehicule.categorie,
  );
  const affectationsMission = Array.isArray(vehicule.missionsVehicules)
    ? vehicule.missionsVehicules
    : [];

  const affectationActive = affectationsMission.find((affectation) => {
    const statut = affectation.mission?.StatutMission?.toLowerCase();
    return statut === "en cours" || statut === "préparation" || statut === "preparation";
  }) || affectationsMission[0];

  const missionActuelle = affectationActive?.mission;
  const compagnieMission = valeur(
    affectationActive?.compagnie?.nom,
    affectationActive?.compagnie?.compagnieName,
  );
  const sectionMission = valeur(
    affectationActive?.section?.sectionName,
  );

  const formatDate = (date) => {
    if (!date) return "Non renseignée";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const informationsGenerales = [
    ["Immatriculation", valeur(vehicule.immatriculation, vehicule.immatriculationVehicule)],
    ["Type de véhicule", typeVehicule],
    ["Catégorie", categorieVehicule],
    ["Statut mission", missionActuelle?.StatutMission],
  ];

  const informationsTechniques = [
    ["Kilométrage", afficher(valeur(vehicule.kilometrage, vehicule.kilometrageActuel, vehicule.km), " km")],
    ["Horamètre", valeur(vehicule.horametre) != null ? afficher(vehicule.horametre, " h") : null],
    ["Carburant", valeur(vehicule.carburant, vehicule.typeCarburant, vehicule.fuel)],
    ["Places", valeur(vehicule.nombrePlaces, vehicule.nbPlaces, vehicule.places)],
    ["Année", valeur(vehicule.annee, vehicule.anneeMiseEnCirculation)],
    ["Dernière maintenance", valeur(vehicule.derniereMaintenance, vehicule.dateDerniereMaintenance)],
  ];

  const InfoCard = ({ label, value }) => (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:border-gray-200 hover:bg-white hover:shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">{label}</p>
      <p className="mt-2 wrap-break-word text-sm font-semibold text-gray-900">{afficher(value)}</p>
    </div>
  );

  return (
    <MainLayout>
      <div className="mx-auto mb-20 max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Administration / Véhicules / Détail</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-950">Fiche véhicule</h1>
          </div>

          <Link
            to="/admin/vehicules"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow"
          >
            <span aria-hidden="true">←</span>
            Retour aux véhicules
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-bleu text-white shadow-xl shadow-gray-200/60">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-28 right-32 h-56 w-56 rounded-full bg-white/3" />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-gray-200">
                  {typeVehicule || "Type non renseigné"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-gray-200">
                  {categorieVehicule || "Catégorie non renseignée"}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${estDisponible ? "bg-emerald-400/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/20" : "bg-red-400/15 text-red-300 ring-1 ring-inset ring-red-400/20"}`}>
                  <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${estDisponible ? "bg-emerald-300" : "bg-red-300"}`} />
                  {estDisponible ? "Disponible" : "Indisponible"}
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Véhicule</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{nomVehicule}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
                {missionActuelle
                  ? `${missionActuelle.missionName || "Mission sans nom"}${compagnieMission ? ` · ${compagnieMission}` : ""}${sectionMission ? ` · ${sectionMission}` : ""}`
                  : "Aucune mission actuellement affectée"}
              </p>
            </div>

            <div className="grid min-w-52 grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Kilométrage</p>
                <p className="mt-2 text-lg font-bold">{afficher(valeur(vehicule.kilometrage, vehicule.kilometrageActuel, vehicule.km), " km")}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Identification</p>
                <h3 className="mt-1 text-lg font-bold text-gray-950">Informations générales</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg" aria-hidden="true">▦</div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {informationsGenerales.map(([label, value]) => (
                <InfoCard key={label} label={label} value={value} />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Affectation</p>
                <h3 className="mt-1 text-lg font-bold text-gray-950">Mission actuelle</h3>
              </div>
              {missionActuelle && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                  {missionActuelle.StatutMission || "Mission"}
                </span>
              )}
            </div>

            {missionActuelle ? (
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-xs font-semibold text-gray-400">Mission</p>
                  <p className="mt-1 text-base font-bold text-gray-950">{missionActuelle.missionName || "Sans nom"}</p>
                  {missionActuelle.lieuMission && (
                    <p className="mt-1 text-sm text-gray-500">{missionActuelle.lieuMission}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Début</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{formatDate(missionActuelle.debutMission)}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Fin</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{formatDate(missionActuelle.finMission)}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <div className="relative pl-8">
                    <span className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-950 text-[9px] font-bold text-white">1</span>
                    <p className="text-xs font-semibold text-gray-400">Compagnie engagée</p>
                    <p className="mt-1 font-bold text-gray-900">{compagnieMission || "Non renseignée"}</p>
                  </div>
                  <div className="relative mt-4 pl-8">
                    <span className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[9px] font-bold text-gray-700">2</span>
                    <p className="text-xs font-semibold text-gray-400">Section engagée</p>
                    <p className="mt-1 font-bold text-gray-900">{sectionMission || "Non renseignée"}</p>
                  </div>
                </div>

                {missionActuelle.id && (
                  <Link
                    to={`/admin/missions-detail/${missionActuelle.id}`}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Voir la mission
                  </Link>
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                <p className="text-sm font-semibold text-gray-700">Aucune mission affectée</p>
                <p className="mt-1 text-xs leading-5 text-gray-400">Ce véhicule n'est associé à aucune mission dans les données actuelles.</p>
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Données véhicule</p>
            <h3 className="mt-1 text-lg font-bold text-gray-950">Informations techniques</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {informationsTechniques.map(([label, value]) => (
              <InfoCard key={label} label={label} value={value} />
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

export default DetailVehiculesAdmin;
