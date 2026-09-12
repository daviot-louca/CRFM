import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import MainLayout from "@/components/layout/MainLayout"
import { createVehicule, getVehiculeTypes } from "../api/vehicules.api"

function AjouterVehiculeAdmin() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    vehiculeName: "",
    immatriculation: "",
    kilometrage: "",
    horametre: "",
    carburant: "",
    disponibilite: true,
    categorie: "",
    vehiculeTypeId: "",
  })

  const [vehiculeTypes, setVehiculeTypes] = useState([])
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchTypes() {
      setLoadingTypes(true)

      try {
        const data = await getVehiculeTypes()
        setVehiculeTypes(data)
      } catch {
        setVehiculeTypes([])
      } finally {
        setLoadingTypes(false)
      }
    }

    fetchTypes()
  }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "categorie" ? { vehiculeTypeId: "" } : {}),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    if (
      !formData.vehiculeName.trim() ||
      !formData.immatriculation.trim() ||
      !formData.carburant.trim() ||
      !formData.vehiculeTypeId ||
      !formData.categorie
    ) {
      setError(
        "Veuillez renseigner les champs obligatoires : Nom du véhicule, Immatriculation, Catégorie, Type de véhicule et Carburant."
      )
      return
    }

    const payload = {
      vehiculeName: formData.vehiculeName.trim(),
      immatriculation: formData.immatriculation.trim(),
      carburant: formData.carburant.trim(),
      disponibilite: formData.disponibilite,
      vehiculeTypeId: Number(formData.vehiculeTypeId),
      kilometrage:
        formData.kilometrage !== ""
          ? Number(formData.kilometrage)
          : null,
      horametre:
        formData.horametre !== ""
          ? Number(formData.horametre)
          : null,
    }

    setSubmitting(true)

    try {
      await createVehicule(payload)
      navigate("/admin/vehicules")
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Erreur lors de la création du véhicule."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const categories = [
    "Véhicule léger",
    "Poids lourds",
    "Blindé",
  ]

  const vehiculeTypesFiltres = formData.categorie
    ? vehiculeTypes.filter(
        (type) => type.categorie === formData.categorie
      )
    : []

  return (
    <MainLayout>
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        {/* Retour */}
        <div className="mb-5 sm:mb-8">
          <button
            onClick={() => navigate("/admin/vehicules")}
            className="inline-flex min-h-10 items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 sm:text-sm"
            type="button"
          >
            ← Retour
          </button>
        </div>

        {/* En-tête */}
        <div className="mb-5 sm:mb-8">
          <h1 className="break-words text-xl font-semibold text-gray-900 sm:text-2xl">
            Ajouter un véhicule
          </h1>

          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
            Renseignez les informations du véhicule à ajouter
            au parc.
          </p>
        </div>

        {/* Formulaire */}
        <div className="w-full min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
          <form
            onSubmit={handleSubmit}
            className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2"
            noValidate
          >
            {error && (
              <div className="min-w-0 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 md:col-span-2">
                {error}
              </div>
            )}

            {/* Nom du véhicule */}
            <div className="min-w-0">
              <label
                htmlFor="vehiculeName"
                className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
              >
                Nom du véhicule *
              </label>

              <input
                type="text"
                id="vehiculeName"
                name="vehiculeName"
                value={formData.vehiculeName}
                onChange={handleChange}
                className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-10 sm:px-4 sm:text-sm"
                required
                autoComplete="off"
              />
            </div>

            {/* Immatriculation */}
            <div className="min-w-0">
              <label
                htmlFor="immatriculation"
                className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
              >
                Immatriculation *
              </label>

              <input
                type="text"
                id="immatriculation"
                name="immatriculation"
                value={formData.immatriculation}
                onChange={handleChange}
                className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-10 sm:px-4 sm:text-sm"
                required
                autoComplete="off"
              />
            </div>

            {/* Catégorie */}
            <div className="min-w-0">
              <label
                htmlFor="categorie"
                className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
              >
                Catégorie *
              </label>

              <select
                id="categorie"
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-10 sm:px-4 sm:text-sm"
                required
              >
                <option value="">
                  -- Sélectionnez une catégorie --
                </option>

                {categories.map((categorie) => (
                  <option key={categorie} value={categorie}>
                    {categorie}
                  </option>
                ))}
              </select>
            </div>

            {/* Type de véhicule */}
            <div className="min-w-0">
              <label
                htmlFor="vehiculeTypeId"
                className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
              >
                Type de véhicule *
              </label>

              <select
                id="vehiculeTypeId"
                name="vehiculeTypeId"
                value={formData.vehiculeTypeId}
                onChange={handleChange}
                disabled={
                  loadingTypes ||
                  !formData.categorie ||
                  vehiculeTypesFiltres.length === 0
                }
                className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 sm:h-10 sm:px-4 sm:text-sm"
                required
              >
                {!formData.categorie && (
                  <option value="">
                    Sélectionnez d'abord une catégorie
                  </option>
                )}

                {formData.categorie &&
                  vehiculeTypesFiltres.length === 0 && (
                    <option value="">
                      Aucun type dans cette catégorie
                    </option>
                  )}

                {formData.categorie &&
                  vehiculeTypesFiltres.length > 0 && (
                    <>
                      <option value="">
                        -- Sélectionnez un type --
                      </option>

                      {vehiculeTypesFiltres.map(
                        ({ id, typeName, EMAT8 }) => (
                          <option key={id} value={id}>
                            {typeName}
                            {EMAT8 ? ` - ${EMAT8}` : ""}
                          </option>
                        )
                      )}
                    </>
                  )}
              </select>
            </div>

            {/* Carburant */}
            <div className="min-w-0">
              <label
                htmlFor="carburant"
                className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
              >
                Carburant *
              </label>

              <select
                id="carburant"
                name="carburant"
                value={formData.carburant}
                onChange={handleChange}
                className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-10 sm:px-4 sm:text-sm"
                required
              >
                <option value="">
                  -- Sélectionnez un carburant --
                </option>
                <option value="Diesel">Diesel</option>
                <option value="Essence">Essence</option>
                <option value="Électrique">Électrique</option>
                <option value="Hybride">Hybride</option>
              </select>
            </div>

            {/* Kilométrage */}
            <div className="min-w-0">
              <label
                htmlFor="kilometrage"
                className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
              >
                Kilométrage
              </label>

              <input
                type="number"
                id="kilometrage"
                name="kilometrage"
                min={0}
                value={formData.kilometrage}
                onChange={handleChange}
                inputMode="numeric"
                className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-10 sm:px-4 sm:text-sm"
              />
            </div>

            {/* Horamètre */}
            <div className="min-w-0">
              <label
                htmlFor="horametre"
                className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
              >
                Horamètre
              </label>

              <input
                type="number"
                id="horametre"
                name="horametre"
                min={0}
                value={formData.horametre}
                onChange={handleChange}
                inputMode="numeric"
                className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-10 sm:px-4 sm:text-sm"
              />
            </div>

            {/* Disponibilité */}
            <div className="min-w-0 md:col-span-2">
              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 transition hover:bg-gray-100 sm:px-4">
                <input
                  type="checkbox"
                  id="disponibilite"
                  name="disponibilite"
                  checked={formData.disponibilite}
                  onChange={handleChange}
                  className="h-5 w-5 shrink-0 rounded border border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
                />

                <span className="text-sm font-medium text-gray-700">
                  Véhicule disponible
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 md:col-span-2 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
              <button
                type="button"
                onClick={() => navigate("/admin/vehicules")}
                disabled={submitting}
                className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-h-0"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={
                  submitting ||
                  loadingTypes ||
                  !formData.categorie ||
                  vehiculeTypesFiltres.length === 0
                }
                className="min-h-11 w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-h-0"
              >
                {submitting
                  ? "Création..."
                  : "Ajouter le véhicule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}

export default AjouterVehiculeAdmin