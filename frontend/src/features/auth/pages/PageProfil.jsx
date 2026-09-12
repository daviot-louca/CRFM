import { useState } from "react"
import {
    Badge,
    Building2,
    Eye,
    EyeOff,
    KeyRound,
    Layers3,
    Lock,
    Mail,
    Phone,
    Shield,
    User,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import MainLayout from "../../../components/layout/MainLayout"
import {
    modifierMotDePasse,
    updateMyProfile,
} from "../api/auth.service"
import { toast } from "sonner"

function PageProfil() {
    const navigate = useNavigate()

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

    const gradeInitial =
        typeof user?.grade === "string"
            ? user.grade.trim()
            : ""

    const nomInitial =
        typeof user?.lastName === "string"
            ? user.lastName.trim()
            : ""

    const prenomInitial =
        typeof user?.firstName === "string"
            ? user.firstName.trim()
            : ""

    const emailInitial =
        typeof user?.email === "string"
            ? user.email.trim()
            : ""

    const telephoneInitial =
        typeof user?.phoneNumber === "string"
            ? user.phoneNumber.trim()
            : ""

    const [grade, setGrade] = useState(gradeInitial)
    const [nom, setNom] = useState(nomInitial)
    const [prenom, setPrenom] = useState(prenomInitial)
    const [email, setEmail] = useState(emailInitial)
    const [telephone, setTelephone] = useState(telephoneInitial)

    const [editionProfil, setEditionProfil] = useState(false)
    const [modificationProfilEnCours, setModificationProfilEnCours] =
        useState(false)

    const [ancienMotDePasse, setAncienMotDePasse] = useState("")
    const [nouveauMotDePasse, setNouveauMotDePasse] = useState("")
    const [confirmation, setConfirmation] = useState("")

    const [visibleAncien, setVisibleAncien] = useState(false)
    const [visibleNouveau, setVisibleNouveau] = useState(false)
    const [visibleConfirmation, setVisibleConfirmation] = useState(false)

    const [modificationMotDePasseEnCours, setModificationMotDePasseEnCours] =
        useState(false)

    if (!user) {
        navigate("/login", {
            replace: true,
        })

        return null
    }

    const role =
        typeof user.role?.roleName === "string"
            ? user.role.roleName.trim()
            : ""

    const compagnie =
        user.compagnie?.compagnieName ??
        user.compagnie?.name ??
        user.compagnie?.nom ??
        ""

    const section =
        user.section?.sectionName ??
        user.section?.name ??
        user.section?.nom ??
        ""
    const roleFormate = role
        ? role.charAt(0).toUpperCase() + role.slice(1)
        : "Non renseigné"

    const formulaireMotDePasseValide =
        ancienMotDePasse.length > 0 &&
        nouveauMotDePasse.length > 0 &&
        confirmation.length > 0 &&
        nouveauMotDePasse === confirmation

    const handleAnnulerEditionProfil = () => {
        setGrade(gradeInitial)
        setNom(nomInitial)
        setPrenom(prenomInitial)
        setEmail(emailInitial)
        setTelephone(telephoneInitial)
        setEditionProfil(false)
    }

    const handleModifierProfil = async (event) => {
        event.preventDefault()

        if (modificationProfilEnCours) {
            return
        }

        setModificationProfilEnCours(true)

        try {
            const userUpdated = await updateMyProfile({
                grade: grade.trim(),
                lastName: nom.trim(),
                email: email.trim(),
                phoneNumber: telephone.trim(),
            })

            const nouveauUser = {
                ...user,
                ...userUpdated,
                role: user.role,
                compagnie: user.compagnie,
                section: user.section,
            }

            localStorage.setItem(
                "user",
                JSON.stringify(nouveauUser)
            )

            localStorage.setItem(
                "userGrade",
                grade.trim()
            )

            localStorage.setItem(
                "userLastName",
                nom.trim()
            )

            setGrade(
                typeof userUpdated?.grade === "string"
                    ? userUpdated.grade.trim()
                    : grade.trim()
            )

            setNom(
                typeof userUpdated?.lastName === "string"
                    ? userUpdated.lastName.trim()
                    : nom.trim()
            )

            setEmail(
                typeof userUpdated?.email === "string"
                    ? userUpdated.email.trim()
                    : email.trim()
            )

            setTelephone(
                typeof userUpdated?.phoneNumber === "string"
                    ? userUpdated.phoneNumber.trim()
                    : telephone.trim()
            )

            toast.success(
                "Profil modifié avec succès"
            )

            setEditionProfil(false)
        } catch (error) {
            console.error(
                "Erreur lors de la modification du profil :",
                error
            )

            toast.error(
                error?.response?.data?.error ??
                "Impossible de modifier le profil"
            )
        } finally {
            setModificationProfilEnCours(false)
        }
    }

    const handleModifierMotDePasse = async (event) => {
        event.preventDefault()

        if (
            !formulaireMotDePasseValide ||
            modificationMotDePasseEnCours
        ) {
            return
        }

        setModificationMotDePasseEnCours(true)

        try {
            await modifierMotDePasse({
                oldPassword: ancienMotDePasse,
                newPassword: nouveauMotDePasse,
            })

            toast.success(
                "Mot de passe modifié avec succès"
            )

            setAncienMotDePasse("")
            setNouveauMotDePasse("")
            setConfirmation("")
        } catch (error) {
            console.error(
                "Erreur lors de la modification du mot de passe :",
                error
            )

            toast.error(
                error?.response?.data?.error ??
                "Impossible de modifier le mot de passe"
            )
        } finally {
            setModificationMotDePasseEnCours(false)
        }
    }

    return (
        <MainLayout>
            <div className="mx-auto box-border w-full min-w-0 max-w-5xl px-3 py-3 sm:px-4 sm:py-6 lg:px-6 lg:py-8">

                <div className="box-border w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">

                    <div className="box-border w-full min-w-0 p-3 sm:p-6 lg:p-8">

                        <section>

                            <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                                <div>

                                    <h2 className="text-base font-bold text-slate-900 sm:text-xl">
                                        Informations personnelles
                                    </h2>

                                    <p className="mt-1 text-sm leading-5 text-slate-500">
                                        Informations associées à votre compte.
                                    </p>

                                </div>

                                {!editionProfil && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditionProfil(true)
                                        }
                                        className="min-h-11 w-full box-border rounded-xl bg-[#303030] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#505050] sm:w-auto sm:px-5"
                                    >
                                        Modifier mes informations
                                    </button>
                                )}

                            </div>

                            {editionProfil ? (

                                <form onSubmit={handleModifierProfil}>

                                    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">

                                        <ProfileInput
                                            id="grade"
                                            label="Grade"
                                            value={grade}
                                            onChange={setGrade}
                                            icon={
                                                <Badge size={20} />
                                            }
                                        />

                                        <ProfileInput
                                            id="prenom"
                                            label="Prénom"
                                            value={prenom}
                                            onChange={setPrenom}
                                            icon={
                                                <User size={20} />
                                            }
                                            disabled
                                        />

                                        <ProfileInput
                                            id="nom"
                                            label="Nom"
                                            value={nom}
                                            onChange={setNom}
                                            icon={
                                                <User size={20} />
                                            }
                                        />

                                        <ProfileInput
                                            id="email"
                                            label="Adresse e-mail"
                                            type="email"
                                            value={email}
                                            onChange={setEmail}
                                            icon={
                                                <Mail size={20} />
                                            }
                                        />

                                        <ProfileInput
                                            id="telephone"
                                            label="Téléphone"
                                            value={telephone}
                                            onChange={setTelephone}
                                            icon={
                                                <Phone size={20} />
                                            }
                                        />

                                        <InfoCard
                                            icon={
                                                <Shield size={20} />
                                            }
                                            label="Rôle"
                                            value={roleFormate}
                                        />

                                        <InfoCard
                                            icon={
                                                <Building2 size={20} />
                                            }
                                            label="Compagnie"
                                            value={compagnie}
                                        />

                                        <InfoCard
                                            icon={
                                                <Layers3 size={20} />
                                            }
                                            label="Section"
                                            value={section}
                                        />

                                    </div>

                                    <div className="mt-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:justify-end">

                                        <button
                                            type="button"
                                            onClick={
                                                handleAnnulerEditionProfil
                                            }
                                            disabled={
                                                modificationProfilEnCours
                                            }
                                            className="box-border min-h-11 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
                                        >
                                            Annuler
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={
                                                modificationProfilEnCours
                                            }
                                            className="box-border min-h-11 w-full rounded-xl bg-[#303030] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-200 transition hover:bg-[#505050] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:w-auto sm:px-6"
                                        >
                                            {modificationProfilEnCours
                                                ? "Modification..."
                                                : "Enregistrer les modifications"}
                                        </button>

                                    </div>

                                </form>

                            ) : (

                                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">

                                    <InfoCard
                                        icon={
                                            <Badge size={20} />
                                        }
                                        label="Grade"
                                        value={grade}
                                    />

                                    <InfoCard
                                        icon={
                                            <User size={20} />
                                        }
                                        label="Prénom"
                                        value={prenom}
                                    />

                                    <InfoCard
                                        icon={
                                            <User size={20} />
                                        }
                                        label="Nom"
                                        value={nom}
                                    />

                                    <InfoCard
                                        icon={
                                            <Mail size={20} />
                                        }
                                        label="Adresse e-mail"
                                        value={email}
                                    />

                                    <InfoCard
                                        icon={
                                            <Phone size={20} />
                                        }
                                        label="Téléphone"
                                        value={telephone}
                                    />

                                    <InfoCard
                                        icon={
                                            <Shield size={20} />
                                        }
                                        label="Rôle"
                                        value={roleFormate}
                                    />

                                    <InfoCard
                                        icon={
                                            <Building2 size={20} />
                                        }
                                        label="Compagnie"
                                        value={compagnie}
                                    />

                                    <InfoCard
                                        icon={
                                            <Layers3 size={20} />
                                        }
                                        label="Section"
                                        value={section}
                                    />

                                </div>

                            )}

                        </section>

                        <section className="mt-8 min-w-0 border-t border-slate-200 pt-6 sm:pt-8 lg:max-w lg:flex lg:flex-col lg:justify-center lg:items-center">

                            <div className="mb-5 flex min-w-0 items-start gap-3">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-[#303030]">
                                    <KeyRound size={21} />
                                </div>

                                <div>

                                    <h2 className="text-base font-bold text-slate-900 sm:text-xl">
                                        Sécurité
                                    </h2>

                                    <p className="mt-1 text-sm leading-5 text-slate-500">
                                        Modifiez le mot de passe de votre compte.
                                    </p>

                                </div>

                            </div>

                            <form
                                onSubmit={handleModifierMotDePasse}
                                className="w-full min-w-0 max-w-2xl"
                            >

                                <div className="space-y-5">

                                    <PasswordInput
                                        id="ancien-mot-de-passe"
                                        label="Mot de passe actuel"
                                        value={ancienMotDePasse}
                                        onChange={
                                            setAncienMotDePasse
                                        }
                                        visible={visibleAncien}
                                        setVisible={
                                            setVisibleAncien
                                        }
                                        autoComplete="current-password"
                                    />

                                    <PasswordInput
                                        id="nouveau-mot-de-passe"
                                        label="Nouveau mot de passe"
                                        value={nouveauMotDePasse}
                                        onChange={
                                            setNouveauMotDePasse
                                        }
                                        visible={visibleNouveau}
                                        setVisible={
                                            setVisibleNouveau
                                        }
                                        autoComplete="new-password"
                                    />

                                    <PasswordInput
                                        id="confirmation-mot-de-passe"
                                        label="Confirmer le nouveau mot de passe"
                                        value={confirmation}
                                        onChange={setConfirmation}
                                        visible={
                                            visibleConfirmation
                                        }
                                        setVisible={
                                            setVisibleConfirmation
                                        }
                                        autoComplete="new-password"
                                    />

                                    {confirmation.length > 0 &&
                                        nouveauMotDePasse !==
                                        confirmation && (
                                            <p className="text-sm font-medium leading-5 text-red-600">
                                                Les mots de passe ne correspondent pas.
                                            </p>
                                        )}

                                    {confirmation.length > 0 &&
                                        nouveauMotDePasse ===
                                        confirmation && (
                                            <p className="text-sm font-medium leading-5 text-green-600">
                                                Les mots de passe correspondent.
                                            </p>
                                        )}

                                </div>

                                <div className="mt-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:justify-end lg:justify-between">

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAncienMotDePasse("")
                                            setNouveauMotDePasse("")
                                            setConfirmation("")
                                        }}
                                        disabled={
                                            modificationMotDePasseEnCours
                                        }
                                        className="box-border min-h-11 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
                                    >
                                        Annuler
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            !formulaireMotDePasseValide ||
                                            modificationMotDePasseEnCours
                                        }
                                        className={`box-border min-h-11 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition sm:w-auto sm:px-6 ${
                                            formulaireMotDePasseValide &&
                                            !modificationMotDePasseEnCours
                                                ? "bg-[#303030] shadow-gray-200 hover:bg-[#505050]"
                                                : "cursor-not-allowed bg-slate-300 shadow-none"
                                        }`}
                                    >
                                        {modificationMotDePasseEnCours
                                            ? "Modification..."
                                            : "Modifier le mot de passe"}
                                    </button>

                                </div>

                            </form>

                        </section>

                    </div>

                </div>

            </div>
        </MainLayout>
    )
}

function InfoCard({
    icon,
    label,
    value,
}) {
    return (
        <div className="box-border min-w-0 max-w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-5">

            <div className="flex min-w-0 items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                    {icon}
                </div>

                <div className="min-w-0">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {label}
                    </p>

                    <p className="mt-1 min-w-0 wrap-break-word text-sm font-semibold leading-5 text-slate-900 sm:text-base">
                        {value || "Non renseigné"}
                    </p>

                </div>

            </div>

        </div>
    )
}

function ProfileInput({
    id,
    label,
    type = "text",
    value,
    onChange,
    icon,
    disabled = false,
}) {
    return (
        <div className="box-border min-w-0 max-w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-5">

            <label
                htmlFor={id}
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400"
            >
                {label}
            </label>

            <div className="relative">

                <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center text-slate-400">
                    {icon}
                </div>

                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    disabled={disabled}
                    className="box-border block h-12 w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#303030] focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 sm:h-11 sm:text-sm"
                />

            </div>

        </div>
    )
}

function PasswordInput({
    id,
    label,
    value,
    onChange,
    visible,
    setVisible,
    autoComplete,
}) {
    return (
        <div>

            <label
                htmlFor={id}
                className="mb-2 block text-sm font-semibold text-slate-900"
            >
                {label}
            </label>

            <div className="relative">

                <Lock
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    id={id}
                    type={
                        visible
                            ? "text"
                            : "password"
                    }
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    autoComplete={autoComplete}
                    placeholder="••••••••"
                    className="box-border block h-12 w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#303030] focus:ring-4 focus:ring-gray-100 sm:h-11 sm:text-sm"
                />

                <button
                    type="button"
                    onClick={() =>
                        setVisible(!visible)
                    }
                    className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={
                        visible
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                    }
                >
                    {visible ? (
                        <EyeOff size={19} />
                    ) : (
                        <Eye size={19} />
                    )}
                </button>

            </div>

        </div>
    )
}

export default PageProfil