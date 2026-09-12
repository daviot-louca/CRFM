import {
    CarFront,
    CheckCircle2,
    ClipboardList,
    Fuel,
    Gauge,
    Info,
    ListChecks,
    Truck,
    UserCheck,
    Users,
} from "lucide-react"
import MainLayout from "../../../components/layout/MainLayout"

function PageAide() {
    const userStorage = localStorage.getItem("user")

    let user = null

    if (userStorage) {
        try {
            user = JSON.parse(userStorage)
        } catch (error) {
            console.error(
                "Impossible de récupérer les informations utilisateur :",
                error
            )
        }
    }

    if (!user) {
        return null
    }

    const role =
        typeof user?.role?.roleName === "string"
            ? user.role.roleName.trim().toLowerCase()
            : ""

    const contenuParRole = {
        administrateur: {
            titre: "Fonctionnement du CRFM",
            sousTitre:
                "Retrouvez les différentes étapes de préparation et de suivi d'une mission.",
            introduction:
                "En tant qu'administrateur, vous êtes responsable de la préparation initiale de la mission. Vous intervenez sur les premières étapes avant que les OA, SOA et conducteurs prennent le relais.",

            etapes: [
                {
                    numero: "01",
                    titre: "Informations de la mission",
                    responsable: "Administrateur",
                    icon: <ClipboardList size={22} />,
                    description:
                        "La mission commence par la saisie de ses informations générales.",
                    contenu: [
                        "Renseigner le titre de la mission",
                        "Renseigner le lieu",
                        "Renseigner la description",
                        "Renseigner les dates nécessaires à la mission",
                        "Compléter les autres informations demandées",
                    ],
                },
                {
                    numero: "02",
                    titre: "Affectation des troupes",
                    responsable: "Administrateur",
                    icon: <Users size={22} />,
                    description:
                        "Vous déterminez les personnels qui participent à la mission et organisez les groupes.",
                    contenu: [
                        "Sélectionner les personnels participant à la mission",
                        "Créer les groupes automatiquement lorsque cela est possible",
                        "Créer manuellement les groupes lorsque vous souhaitez choisir précisément les personnels",
                        "Déterminer la composition de chaque groupe",
                        "Un personnel ne peut appartenir qu'à un seul groupe",
                    ],
                },
                {
                    numero: "03",
                    titre: "Désignation des OA et SOA",
                    responsable: "Administrateur",
                    icon: <UserCheck size={22} />,
                    description:
                        "Vous désignez les responsables qui poursuivront la préparation de la mission.",
                    contenu: [
                        "Désigner obligatoirement un OAL pour la mission",
                        "Désigner au minimum un SOA pour chaque groupe",
                        "Un OA peut être responsable de plusieurs groupes",
                        "Un SOA est responsable d'un seul groupe",
                    ],
                },
                {
                    numero: "04",
                    titre: "Choix des véhicules",
                    responsable: "OA",
                    icon: <Truck size={22} />,
                    description:
                        "Après votre intervention, les OA affectent les véhicules nécessaires à leurs groupes.",
                    contenu: [
                        "L'OA accède uniquement aux groupes dont il est responsable",
                        "Les véhicules disponibles sont proposés pour chaque groupe",
                        "Plusieurs véhicules peuvent être affectés à un même groupe",
                        "La disponibilité des véhicules est contrôlée par l'application",
                    ],
                },
                {
                    numero: "05",
                    titre: "Désignation des conducteurs",
                    responsable: "SOA",
                    icon: <CarFront size={22} />,
                    description:
                        "Les SOA désignent ensuite les conducteurs des véhicules de leur groupe.",
                    contenu: [
                        "Le SOA accède à son groupe",
                        "Il consulte les véhicules affectés à son groupe",
                        "Il dispose de la liste des personnels de son groupe",
                        "Il désigne le conducteur de chaque véhicule",
                        "Le conducteur est affecté à son véhicule",
                    ],
                },
                {
                    numero: "06",
                    titre: "Retour de mission",
                    responsable: "Conducteur",
                    icon: <Gauge size={22} />,
                    description:
                        "Pendant la mission, les conducteurs renseignent les informations nécessaires à sa clôture.",
                    contenu: [
                        "Renseigner le kilométrage de départ et d'arrivée du véhicule lorsque celui-ci est suivi au kilométrage",
                        "Renseigner l'horamètre de départ et d'arrivée lorsque celui-ci est suivi à l'horamètre",
                        "Enregistrer chaque plein effectué pendant la mission",
                        "Les informations renseignées sont automatiquement intégrées à la mission",
                        "La mission est terminée lorsque toutes les informations nécessaires ont été renseignées",
                    ],
                },
            ],
        },

        oa: {
            titre: "Votre fonctionnement dans le CRFM",
            sousTitre:
                "Retrouvez les étapes qui concernent votre intervention dans une mission.",
            introduction:
                "En tant qu'OA, vous intervenez après la préparation initiale de la mission par l'administrateur. Votre rôle principal est de choisir les véhicules nécessaires pour votre ou vos groupes et de suivre les informations de la mission.",

            etapes: [
                {
                    numero: "04",
                    titre: "Choix des véhicules",
                    responsable: "Votre intervention",
                    icon: <Truck size={22} />,
                    description:
                        "Vous choisissez les véhicules nécessaires pour votre ou vos groupes.",
                    contenu: [
                        "Vous voyez uniquement le ou les groupes dont vous êtes responsable",
                        "Chaque groupe dispose d'une liste des véhicules disponibles",
                        "Vous pouvez affecter plusieurs véhicules à un même groupe",
                        "La disponibilité des véhicules est contrôlée par l'application",
                        "Un véhicule indisponible ne peut pas être affecté à la mission",
                    ],
                },
                {
                    numero: "05",
                    titre: "Désignation des conducteurs",
                    responsable: "SOA",
                    icon: <CarFront size={22} />,
                    description:
                        "Une fois les véhicules choisis, le SOA intervient pour désigner les conducteurs.",
                    contenu: [
                        "Le SOA voit les véhicules affectés à son groupe",
                        "Il sélectionne les conducteurs parmi les personnels de son groupe",
                        "Chaque conducteur est affecté à son véhicule",
                    ],
                },
                {
                    numero: "06",
                    titre: "Retour de mission",
                    responsable: "Conducteur",
                    icon: <Gauge size={22} />,
                    description:
                        "À la fin de la mission, les conducteurs renseignent les informations relatives à leurs véhicules.",
                    contenu: [
                        "Le conducteur renseigne le kilométrage de départ et d'arrivée ou l'horamètre selon le véhicule",
                        "Il enregistre chaque plein effectué",
                        "Les informations sont intégrées automatiquement à la mission",
                        "Le total des pleins est visible dans votre vue",
                        "La mission est terminée lorsque toutes les informations nécessaires sont renseignées",
                    ],
                },
            ],
        },

        soa: {
            titre: "Votre fonctionnement dans le CRFM",
            sousTitre:
                "Retrouvez les étapes qui concernent votre intervention dans une mission.",
            introduction:
                "En tant que SOA, vous intervenez après l'affectation des véhicules afin de désigner les conducteurs de votre groupe et de suivre les informations renseignées pendant la mission.",

            etapes: [
                {
                    numero: "05",
                    titre: "Désignation des conducteurs",
                    responsable: "Votre intervention",
                    icon: <CarFront size={22} />,
                    description:
                        "Vous désignez les conducteurs des véhicules affectés à votre groupe.",
                    contenu: [
                        "Vous voyez uniquement votre groupe",
                        "Vous consultez les véhicules affectés à votre groupe",
                        "Vous disposez de la liste des personnels de votre groupe",
                        "Vous désignez le conducteur correspondant à chaque véhicule",
                        "Un conducteur est affecté à son véhicule",
                    ],
                },
                {
                    numero: "06",
                    titre: "Retour de mission",
                    responsable: "Conducteur",
                    icon: <Gauge size={22} />,
                    description:
                        "Les conducteurs renseignent les informations relatives à leurs véhicules après et pendant la mission.",
                    contenu: [
                        "Le conducteur renseigne le kilométrage de départ et d'arrivée ou l'horamètre selon le véhicule",
                        "Il enregistre chaque plein effectué",
                        "Les informations sont automatiquement intégrées à la mission",
                        "Le total des pleins est visible dans votre vue",
                        "La mission est terminée lorsque toutes les informations nécessaires sont renseignées",
                    ],
                },
            ],
        },

        conducteur: {
            titre: "Votre fonctionnement dans le CRFM",
            sousTitre:
                "Retrouvez les informations nécessaires à votre intervention en tant que conducteur.",
            introduction:
                "En tant que conducteur, vous intervenez directement sur votre véhicule pendant et à la fin de la mission. Vous n'avez pas à préparer la mission : votre véhicule vous est désigné par le SOA.",

            etapes: [
                {
                    numero: "01",
                    titre: "Votre affectation",
                    responsable: "SOA",
                    icon: <CarFront size={22} />,
                    description:
                        "Le SOA vous désigne comme conducteur d'un véhicule appartenant à votre groupe.",
                    contenu: [
                        "Votre véhicule vous est attribué par le SOA",
                        "Vous ne choisissez pas vous-même votre véhicule",
                        "Vous accédez aux informations de la mission qui vous concernent",
                    ],
                },
                {
                    numero: "02",
                    titre: "Votre mission",
                    responsable: "Conducteur",
                    icon: <ClipboardList size={22} />,
                    description:
                        "Depuis votre espace, vous consultez la mission et les informations relatives à votre véhicule.",
                    contenu: [
                        "Consulter les informations de votre mission",
                        "Consulter votre véhicule",
                        "Accéder aux informations que vous devez renseigner",
                    ],
                },
                {
                    numero: "03",
                    titre: "Relevés du véhicule",
                    responsable: "Conducteur",
                    icon: <Gauge size={22} />,
                    description:
                        "Vous renseignez les relevés nécessaires au suivi de votre véhicule.",
                    contenu: [
                        "Renseigner le kilométrage de départ et d'arrivée si le véhicule est suivi au kilométrage",
                        "Renseigner l'horamètre de départ et d'arrivée si le véhicule est suivi à l'horamètre",
                        "Renseigner les informations demandées par l'application",
                    ],
                },
                {
                    numero: "04",
                    titre: "Enregistrer les pleins",
                    responsable: "Conducteur",
                    icon: <Fuel size={22} />,
                    description:
                        "Chaque plein effectué pendant la mission doit être enregistré dans l'application.",
                    contenu: [
                        "À chaque passage en station, effectuez votre plein",
                        "Ouvrez votre mission dans l'application",
                        "Utilisez « Ajouter un plein »",
                        "Renseignez les informations demandées",
                        "Pour un nouveau plein, utilisez à nouveau « Ajouter un plein »",
                    ],
                },
                {
                    numero: "05",
                    titre: "Fin de mission",
                    responsable: "Conducteur",
                    icon: <CheckCircle2 size={22} />,
                    description:
                        "Votre mission est complète lorsque toutes les informations demandées ont été renseignées.",
                    contenu: [
                        "Vérifier que les relevés de départ et d'arrivée sont renseignés",
                        "Vérifier que les pleins effectués ont été enregistrés",
                        "Compléter toutes les informations demandées par l'application",
                        "Les informations sont ensuite prises en compte pour la clôture de la mission",
                    ],
                },
            ],
        },
    }

    const contenu = contenuParRole[role]

    if (!contenu) {
        return (
            <MainLayout>
                <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-5 lg:px-8">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-slate-600">
                            Aucune documentation disponible pour votre profil.
                        </p>
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="mx-auto box-border w-full min-w-0 max-w-6xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">

                {/* En-tête */}
                <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mb-8 sm:rounded-3xl">

                    <div className="p-5 sm:p-8 lg:p-10">

                        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-[#303030] sm:h-14 sm:w-14">
                                <Info size={25} />
                            </div>

                            <div className="min-w-0">

                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Documentation
                                </p>

                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                                    {contenu.titre}
                                </h1>

                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    {contenu.sousTitre}
                                </p>

                                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                                    {contenu.introduction}
                                </p>

                            </div>

                        </div>

                    </div>

                </section>

                {/* Parcours */}
                <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mb-8 sm:rounded-3xl">

                    <div className="border-b border-slate-200 p-5 sm:p-7">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-[#303030]">
                                <ListChecks size={21} />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                                    Votre parcours
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Les étapes qui vous concernent dans le
                                    déroulement d'une mission.
                                </p>
                            </div>

                        </div>

                    </div>

                    <div className="p-4 sm:p-7">

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                            {contenu.etapes.map((etape) => (
                                <div
                                    key={`${role}-${etape.numero}-${etape.titre}`}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
                                >

                                    <div className="flex items-start justify-between gap-3">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#303030] shadow-sm">
                                            {etape.icon}
                                        </div>

                                        <span className="text-2xl font-black text-slate-200">
                                            {etape.numero}
                                        </span>

                                    </div>

                                    <h3 className="mt-4 text-base font-bold text-slate-900">
                                        {etape.titre}
                                    </h3>

                                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        {etape.responsable}
                                    </p>

                                </div>
                            ))}

                        </div>

                    </div>

                </section>

                {/* Détails */}
                <section className="mb-6 sm:mb-8">

                    <div className="mb-4 px-1 sm:mb-5">

                        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                            Les étapes en détail
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Les informations utiles pour comprendre votre
                            intervention.
                        </p>

                    </div>

                    <div className="space-y-4 sm:space-y-5">

                        {contenu.etapes.map((etape) => (
                            <article
                                key={`${role}-detail-${etape.numero}-${etape.titre}`}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl"
                            >

                                <div className="flex min-w-0 flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-7">

                                    <div className="flex shrink-0 items-center gap-3">

                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-[#303030]">
                                            {etape.icon}
                                        </div>

                                        <span className="text-sm font-black text-slate-300 sm:hidden">
                                            ÉTAPE {etape.numero}
                                        </span>

                                    </div>

                                    <div className="min-w-0 flex-1">

                                        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                            <div>

                                                <p className="hidden text-xs font-bold uppercase tracking-wider text-slate-400 sm:block">
                                                    Étape {etape.numero}
                                                </p>

                                                <h3 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                                                    {etape.titre}
                                                </h3>

                                            </div>

                                            <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                                {etape.responsable}
                                            </span>

                                        </div>

                                        <p className="mt-3 text-sm leading-6 text-slate-600">
                                            {etape.description}
                                        </p>

                                        <ul className="mt-4 space-y-2.5">

                                            {etape.contenu.map((element) => (
                                                <li
                                                    key={element}
                                                    className="flex min-w-0 items-start gap-2.5 text-sm leading-5 text-slate-600"
                                                >

                                                    <CheckCircle2
                                                        size={17}
                                                        className="mt-0.5 shrink-0 text-slate-400"
                                                    />

                                                    <span className="min-w-0">
                                                        {element}
                                                    </span>

                                                </li>
                                            ))}

                                        </ul>

                                    </div>

                                </div>

                            </article>
                        ))}

                    </div>

                </section>

                {/* Pleins : uniquement conducteur */}
                {role === "conducteur" && (
                    <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mb-8 sm:rounded-3xl">

                        <div className="p-5 sm:p-7 lg:p-8">

                            <div className="flex min-w-0 flex-col gap-5 sm:flex-row">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-[#303030]">
                                    <Fuel size={23} />
                                </div>

                                <div className="min-w-0">

                                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                                        Enregistrer plusieurs pleins
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        Il n'y a pas besoin de renseigner un
                                        nombre total de pleins à l'avance.
                                        Chaque plein est enregistré au moment
                                        où il est effectué.
                                    </p>

                                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                                        <InfoStep
                                            numero="1"
                                            texte="Vous arrivez à une station et effectuez votre plein."
                                        />

                                        <InfoStep
                                            numero="2"
                                            texte="Vous ouvrez votre mission et utilisez « Ajouter un plein »."
                                        />

                                        <InfoStep
                                            numero="3"
                                            texte="Pour chaque nouveau plein, vous ajoutez une nouvelle entrée."
                                        />

                                    </div>

                                    <div className="mt-5 rounded-2xl bg-slate-900 p-4 sm:p-5">

                                        <div className="flex items-start gap-3">

                                            <Fuel
                                                size={19}
                                                className="mt-0.5 shrink-0 text-white"
                                            />

                                            <p className="text-sm leading-6 text-white">
                                                L'application additionne
                                                automatiquement les pleins
                                                enregistrés pendant la mission.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>
                )}

                {/* Fin de mission */}
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:rounded-3xl sm:p-7">

                    <div className="flex items-start gap-3">

                        <CheckCircle2
                            size={20}
                            className="mt-0.5 shrink-0 text-slate-500"
                        />

                        <div>

                            <h2 className="text-sm font-bold text-slate-900">
                                À retenir
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-slate-600">

                                {role === "administrateur" &&
                                    "Vous préparez la mission et désignez les responsables qui poursuivront sa préparation."}

                                {role === "oa" &&
                                    "Vous intervenez principalement pour affecter les véhicules à votre ou vos groupes et suivre les informations de la mission."}

                                {role === "soa" &&
                                    "Vous intervenez principalement pour désigner les conducteurs des véhicules de votre groupe et suivre les informations de la mission."}

                                {role === "conducteur" &&
                                    "Votre rôle est de renseigner les informations relatives à votre véhicule pendant et à la fin de la mission. Chaque information renseignée contribue à la clôture du CRFM."}

                            </p>

                        </div>

                    </div>

                </section>

            </div>
        </MainLayout>
    )
}

function InfoStep({ numero, texte }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

            <div className="flex items-start gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-700 shadow-sm">
                    {numero}
                </div>

                <p className="text-sm leading-5 text-slate-600">
                    {texte}
                </p>

            </div>

        </div>
    )
}

export default PageAide