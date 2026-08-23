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
        formData.kilometrage !== "" ? Number(formData.kilometrage) : null,
      horametre:
        formData.horametre !== "" ? Number(formData.horametre) : null,
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

  const categories = ["Véhicule léger", "Poids lourds", "Blindé"]

  const vehiculeTypesFiltres = formData.categorie
    ? vehiculeTypes.filter((type) => type.categorie === formData.categorie)
    : []

  return (
    <MainLayout>
      <button
        onClick={() => navigate("/admin/vehicules")}
        className="mb-4 rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
        type="button"
      >
        ← Retour
      </button>
      <h1 className="mb-1 text-2xl font-semibold text-gray-900">
        Ajouter un véhicule
      </h1>
      <p className="mb-6 text-gray-600">
        Renseignez les informations du véhicule à ajouter au parc.
      </p>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 md:grid-cols-2"
          noValidate
        >
          {error && (
            <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="vehiculeName"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Nom du véhicule *
            </label>
            <input
              type="text"
              id="vehiculeName"
              name="vehiculeName"
              value={formData.vehiculeName}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="immatriculation"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Immatriculation *
            </label>
            <input
              type="text"
              id="immatriculation"
              name="immatriculation"
              value={formData.immatriculation}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="categorie"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Catégorie *
            </label>
            <select
              id="categorie"
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">-- Sélectionnez une catégorie --</option>
              {categories.map((categorie) => (
                <option key={categorie} value={categorie}>
                  {categorie}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="vehiculeTypeId"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Type de véhicule *
            </label>
            <select
              id="vehiculeTypeId"
              name="vehiculeTypeId"
              value={formData.vehiculeTypeId}
              onChange={handleChange}
              disabled={loadingTypes || !formData.categorie || vehiculeTypesFiltres.length === 0}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              {!formData.categorie && (
                <option value="">Sélectionnez d'abord une catégorie</option>
              )}
              {formData.categorie && vehiculeTypesFiltres.length === 0 && (
                <option value="">Aucun type dans cette catégorie</option>
              )}
              {formData.categorie && vehiculeTypesFiltres.length > 0 && (
                <>
                  <option value="">-- Sélectionnez un type --</option>
                  {vehiculeTypesFiltres.map(({ id, typeName, EMAT8 }) => (
                    <option key={id} value={id}>
                      {typeName}
                      {EMAT8 ? ` - ${EMAT8}` : ""}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="carburant"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Carburant *
            </label>
            <select
              id="carburant"
              name="carburant"
              value={formData.carburant}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">-- Sélectionnez un carburant --</option>
              <option value="Diesel">Diesel</option>
              <option value="Essence">Essence</option>
              <option value="Électrique">Électrique</option>
              <option value="Hybride">Hybride</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="kilometrage"
              className="mb-1 block text-sm font-medium text-gray-700"
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
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="horametre"
              className="mb-1 block text-sm font-medium text-gray-700"
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
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="disponibilite"
              name="disponibilite"
              checked={formData.disponibilite}
              onChange={handleChange}
              className="h-5 w-5 rounded border border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="disponibilite"
              className="text-sm font-medium text-gray-700"
            >
              Véhicule disponible
            </label>
          </div>

          <div className="md:col-span-2 flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/vehicules")}
              disabled={submitting}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || loadingTypes || !formData.categorie || vehiculeTypesFiltres.length === 0}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Création..." : "Ajouter le véhicule"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default AjouterVehiculeAdmin
