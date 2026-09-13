import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useMission } from "../context/MissionsContextValue";
import useMissionCommandement from "../hooks/useMissionCommandement";
import MainLayout from "@/components/layout/MainLayout";

const getUserId = (user) =>
    typeof user === "object" ? user?.id : user;

const getUserName = (user) =>
    [
        user?.grade,
        user?.firstName,
        user?.lastName,
    ]
        .filter(Boolean)
        .join(" ") ||
    user?.name ||
    `Utilisateur ${user?.id ?? ""}`;

const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    boxShadow: "0 4px 18px rgba(15, 23, 42, 0.05)",
};

const selectStyle = {
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    height: "46px",
    padding: "0 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#172033",
    fontSize: "16px",
    outline: "none",
};

export default function CreerMissions5Admin() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const missionId = searchParams.get("missionId");

    const { groupesManuels } = useMission();

    const {
        groupesCommandement = [],
        soaMission = [],
        selectSoa,
        saveCommandement,
        loading,
        saving,
        error,
    } = useMissionCommandement(
        missionId,
        groupesManuels,
        [],
    );

    const groupes = useMemo(
        () =>
            Array.isArray(groupesManuels)
                ? groupesManuels
                : [],
        [groupesManuels],
    );

    const getSoaSelectionne = (groupeId) => {
        const groupe =
            groupesCommandement.find(
                (item) =>
                    String(item?.groupeId) ===
                    String(groupeId),
            );

        return groupe?.soaId ?? "";
    };

    const nombreSoaRenseignes = groupes.filter(
        (groupe) =>
            Boolean(
                getSoaSelectionne(groupe?.id),
            ),
    ).length;

    const commandementComplet =
        groupes.length > 0 &&
        soaMission.length > 0 &&
        groupes.every((groupe) =>
            Boolean(
                getSoaSelectionne(groupe?.id),
            ),
        );

    const handleContinuer = async () => {
        if (!missionId) {
            alert(
                "Aucune mission sélectionnée.",
            );
            return;
        }

        if (groupes.length === 0) {
            alert(
                "Aucun groupe n'est disponible pour cette mission.",
            );
            return;
        }

        if (soaMission.length === 0) {
            alert(
                "Aucun SOA affecté à cette mission n'est disponible.",
            );
            return;
        }

        const groupeIncomplet =
            groupes.find(
                (groupe) =>
                    !getSoaSelectionne(
                        groupe?.id,
                    ),
            );

        if (groupeIncomplet) {
            alert(
                "Veuillez sélectionner un SOA pour chaque groupe avant de continuer.",
            );
            return;
        }

        try {
            await saveCommandement();

            navigate(
                `/admin/creer-missions-6?missionId=${missionId}`,
            );
        } catch (err) {
            console.error(
                "Erreur sauvegarde commandement :",
                err,
            );
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4">
                    <p className="text-sm font-semibold text-slate-600">
                        Chargement du commandement...
                    </p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-50 px-4 pb-10 pt-4 text-slate-900 sm:px-6 sm:pb-12 sm:pt-6 lg:px-8">
                <div className="mx-auto w-full min-w-0 max-w-7xl">

                    <div className="mb-5 w-full min-w-0 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm sm:mb-8">
                        <div className="flex min-w-155 items-start px-3 py-4 sm:mx-auto sm:min-w-0 sm:max-w-5xl sm:px-5 sm:py-5">

                            {/* Étape 1 */}
                            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-600 bg-green-50 text-xs font-bold text-green-700 sm:h-8 sm:w-8 sm:text-sm">
                                    ✓
                                </div>

                                <span className="mt-1.5 max-w-20 text-center text-[9px] font-semibold leading-tight text-green-700 sm:mt-2 sm:max-w-none sm:text-xs">
                                    Infos
                                </span>
                            </div>

                            <div className="mt-3 h-0.5 min-w-4 flex-1 bg-green-300 sm:mt-4 sm:min-w-6" />

                            {/* Étape 2 - ACTIVE */}
                            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-600 bg-green-50 text-xs font-bold text-green-700  shadow-sm sm:h-8 sm:w-8 sm:text-sm">
                                    ✓
                                </div>

                                <span className="mt-1.5 max-w-24 text-center text-[9px] font-bold leading-tight text-green-700 sm:mt-2 sm:max-w-none sm:text-xs">
                                    Affectations des compagnies
                                </span>
                            </div>

                            <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

                            {/* Étape 3 */}
                            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 bborder-green-600 bg-green-50 text-xs font-bold text-green-700  sm:h-8 sm:w-8 sm:text-sm">
                                    ✓
                                </div>

                                <span className="mt-1.5 max-w-24 text-center text-[9px] font-semibold leading-tight text-green-700 sm:mt-2 sm:max-w-none sm:text-xs">
                                    Désignation de l'OAL
                                </span>
                            </div>

                            <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

                            {/* Étape 4 */}
                            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-600 bg-green-50 text-xs font-bold text-green-700  sm:h-8 sm:w-8 sm:text-sm">
                                    ✓
                                </div>

                                <span className="mt-1.5 max-w-20 text-center text-[9px] font-semibold leading-tight text-green-700 sm:mt-2 sm:max-w-none sm:text-xs">
                                    Véhicules
                                </span>
                            </div>

                            <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

                            {/* Étape 5 */}
                            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-600 text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm">
                                    5
                                </div>

                                <span className="mt-1.5 max-w-24 text-center text-[9px] font-semibold leading-tight text-blue-700 sm:mt-2 sm:max-w-none sm:text-xs">
                                    Désignation du ou des SOA
                                </span>
                            </div>

                            <div className="mt-3 h-0.5 min-w-4 flex-1 bg-gray-200 sm:mt-4 sm:min-w-6" />

                            {/* Étape 6 */}
                            <div className="flex min-w-0 shrink-0 flex-1 flex-col items-center">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 text-xs font-bold text-gray-400 sm:h-8 sm:w-8 sm:text-sm">
                                    6
                                </div>

                                <span className="mt-1.5 max-w-20 text-center text-[9px] font-semibold leading-tight text-gray-400 sm:mt-2 sm:max-w-none sm:text-xs">
                                    Conducteurs
                                </span>
                            </div>

                        </div>
                    </div>
                    {/* EN-TÊTE */}

                    <section
                        style={cardStyle}
                        className="mb-4 p-5 sm:p-7"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                                    Étape 3
                                </p>

                                <h1 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
                                    Désignation des SOA
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                                    Désignez le SOA responsable de chaque groupe de la mission.
                                </p>
                            </div>

                            <div className="w-fit rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                                {nombreSoaRenseignes}/
                                {groupes.length} groupe
                                {groupes.length > 1 ? "s" : ""}{" "}
                                renseigné
                                {nombreSoaRenseignes > 1
                                    ? "s"
                                    : ""}
                            </div>
                        </div>
                    </section>

                    {/* GROUPES */}

                    <section
                        style={cardStyle}
                        className="mb-5 p-4 sm:p-7"
                    >
                        {groupes.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                Aucun groupe n'est disponible
                                pour cette mission.
                            </div>
                        ) : soaMission.length === 0 ? (
                            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm leading-relaxed text-orange-800">
                                Aucun SOA affecté à cette mission
                                n'est disponible.
                            </div>
                        ) : (
                            <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                                {groupes.map(
                                    (groupe, index) => {
                                        const groupeId =
                                            groupe?.id;

                                        const soaSelectionne =
                                            getSoaSelectionne(
                                                groupeId,
                                            );

                                        return (
                                            <article
                                                key={
                                                    groupeId ??
                                                    `groupe-${index}`
                                                }
                                                className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm sm:p-5"
                                            >
                                                <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                                            Groupe {index + 1}
                                                        </p>

                                                        <h2 className="wrap-break-words text-base font-extrabold text-slate-900">
                                                            {groupe?.nom ??
                                                                groupe?.nomGroupe ??
                                                                `Groupe ${index + 1
                                                                }`}
                                                        </h2>
                                                    </div>

                                                    {soaSelectionne && (
                                                        <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">
                                                            ✓ Affecté
                                                        </span>
                                                    )}
                                                </div>

                                                <label
                                                    htmlFor={`soa-${groupeId ?? index
                                                        }`}
                                                    className="mb-2 block text-xs font-bold text-slate-700 sm:text-sm"
                                                >
                                                    SOA responsable
                                                    <span className="ml-1 text-red-600">
                                                        *
                                                    </span>
                                                </label>

                                                <select
                                                    id={`soa-${groupeId ?? index
                                                        }`}
                                                    value={
                                                        soaSelectionne
                                                    }
                                                    onChange={(event) =>
                                                        selectSoa(
                                                            groupeId,
                                                            event.target
                                                                .value || null,
                                                        )
                                                    }
                                                    disabled={saving}
                                                    style={{
                                                        ...selectStyle,
                                                        opacity:
                                                            saving
                                                                ? 0.6
                                                                : 1,
                                                    }}
                                                >
                                                    <option value="">
                                                        Sélectionner un SOA
                                                    </option>

                                                    {soaMission.map(
                                                        (soa) => (
                                                            <option
                                                                key={getUserId(
                                                                    soa,
                                                                )}
                                                                value={getUserId(
                                                                    soa,
                                                                )}
                                                            >
                                                                {getUserName(
                                                                    soa,
                                                                )}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>

                                                {soaSelectionne && (
                                                    <p className="mt-2 text-[11px] font-bold text-green-700">
                                                        ✓ SOA sélectionné pour
                                                        ce groupe
                                                    </p>
                                                )}
                                            </article>
                                        );
                                    },
                                )}
                            </div>
                        )}
                    </section>

                    {/* ERREUR */}

                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-700 sm:p-4 sm:text-sm">
                            {error}
                        </div>
                    )}

                    {/* NAVIGATION */}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/admin/creer-missions-2?missionId=${missionId}`,
                                )
                            }
                            disabled={saving}
                            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:w-auto sm:px-5 sm:py-2.5"
                        >
                            ← Étape précédente
                        </button>

                        <button
                            type="button"
                            onClick={handleContinuer}
                            disabled={
                                saving ||
                                !commandementComplet
                            }
                            className="min-h-11 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:min-h-0 sm:w-auto sm:py-2.5"
                        >
                            {saving
                                ? "Enregistrement..."
                                : "Continuer vers les véhicules →"}
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
