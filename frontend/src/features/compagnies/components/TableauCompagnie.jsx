import { useState } from "react";
import { Link } from "react-router-dom";
import { useCompagnies } from "../hooks/useCompagnies";

import { getOaByCompagnie } from "../../users/api/user.api";

function TableauCompagnie() {
  const {
    compagnies,
    loading,
    error,
    addCompagnie,
    editCompagnie,
    removeCompagnie,
  } = useCompagnies();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    imageUrl: "",
    ordre: "",
    oaId: "",
  });

  const [actionError, setActionError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [oaUsers, setOaUsers] = useState([]);
  const [oaError, setOaError] = useState(null);

  const token = localStorage.getItem("token");

  let userRole = null;

  try {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userRole = payload?.role?.roleName ?? null;
    }
  } catch (error) {
    console.error(
      "Impossible de récupérer le rôle utilisateur :",
      error
    );
  }

  const isAdministrateur = userRole === "administrateur";

  const resetForm = () => {
    setFormData({
      nom: "",
      imageUrl: "",
      ordre: "",
      oaId: "",
    });

    setShowAddForm(false);
    setEditingId(null);
    setActionError(null);
  };

  const handleAdd = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setActionError(null);

      const compagnieData = {
        nom: formData.nom,
        imageUrl: formData.imageUrl,
        ordre: formData.ordre,
      };

      await addCompagnie(compagnieData);
      resetForm();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Impossible d'ajouter la compagnie."
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = async (compagnie) => {
    setEditingId(compagnie.id);
    setShowAddForm(false);

    setFormData({
      nom: compagnie.nom || "",
      imageUrl: compagnie.imageUrl || "",
      ordre: compagnie.ordre ?? "",
      oaId: compagnie.oaId || "",
    });

    setActionError(null);
    setOaError(null);
    setOaUsers([]);

    try {
      const users = await getOaByCompagnie(compagnie.id);
      setOaUsers(users);
    } catch (err) {
      console.error(
        "Impossible de charger les OA de la compagnie :",
        err
      );

      setOaError(
        "Impossible de charger les OA de cette compagnie."
      );
    }
  };

  const handleEdit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setActionError(null);

      await editCompagnie(editingId, formData);
      resetForm();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Impossible de modifier la compagnie."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (compagnie) => {
    if (
      !window.confirm(
        `Supprimer définitivement ${compagnie.nom} ?`
      )
    ) {
      return;
    }

    try {
      setActionError(null);
      await removeCompagnie(compagnie.id);
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Impossible de supprimer la compagnie."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm font-medium text-gray-500">
          Chargement des compagnies...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">
          Impossible de charger les compagnies.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-20 w-full min-w-0">
      <div className="mb-5 flex w-full justify-end">
        {isAdministrateur && (
          <button
            type="button"
            onClick={() => {
              if (showAddForm) {
                resetForm();
              } else {
                setEditingId(null);

                setFormData({
                  nom: "",
                  imageUrl: "",
                  ordre: "",
                  oaId: "",
                });

                setActionError(null);
                setOaUsers([]);
                setOaError(null);
                setShowAddForm(true);
              }
            }}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 sm:w-auto"
          >
            {showAddForm
              ? "Annuler"
              : "Ajouter une compagnie"}
          </button>
        )}
      </div>

      {actionError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {actionError}
          </p>
        </div>
      )}

      {oaError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {oaError}
          </p>
        </div>
      )}

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="mb-5 w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <h2 className="text-lg font-bold text-gray-900">
            Ajouter une compagnie
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label
                htmlFor="add-compagnie-nom"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Nom
              </label>

              <input
                id="add-compagnie-nom"
                type="text"
                required
                value={formData.nom}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    nom: event.target.value,
                  }))
                }
                className="box-border block h-11 w-full min-w-0 max-w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-gray-500 sm:h-10 sm:text-sm"
              />
            </div>

            <div className="min-w-0">
              <label
                htmlFor="add-compagnie-image"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                URL de l'image
              </label>

              <input
                id="add-compagnie-image"
                type="text"
                value={formData.imageUrl}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    imageUrl: event.target.value,
                  }))
                }
                className="box-border block h-11 w-full min-w-0 max-w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-gray-500 sm:h-10 sm:text-sm"
              />
            </div>

            <div className="min-w-0">
              <label
                htmlFor="add-compagnie-ordre"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Ordre
              </label>

              <input
                id="add-compagnie-ordre"
                type="number"
                min="1"
                required
                value={formData.ordre}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    ordre: Number(event.target.value),
                  }))
                }
                className="box-border block h-11 w-full min-w-0 max-w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-gray-500 sm:h-10 sm:text-sm"
              />
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                OA de la compagnie
              </label>

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500">
                L'OA pourra être affecté après la création de
                la compagnie, lorsque ses sections et
                utilisateurs auront été ajoutés.
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 sm:w-auto"
            >
              {saving ? "Ajout..." : "Ajouter"}
            </button>
          </div>
        </form>
      )}

      <div className="flex min-w-0 flex-col gap-3">
        {compagnies.map((compagnie) => (
          <div
            key={compagnie.id}
            className="group flex min-w-0 flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md sm:p-4 md:grid md:grid-cols-[90px_minmax(0,1fr)_auto] md:items-center md:gap-5"
          >
            {editingId === compagnie.id ? (
              <form
                onSubmit={handleEdit}
                className="col-span-full grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <div className="min-w-0">
                  <label
                    htmlFor={`edit-nom-${compagnie.id}`}
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Nom
                  </label>

                  <input
                    id={`edit-nom-${compagnie.id}`}
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        nom: event.target.value,
                      }))
                    }
                    className="box-border block h-11 w-full min-w-0 max-w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-gray-500 sm:h-10 sm:text-sm"
                  />
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor={`edit-image-${compagnie.id}`}
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    URL de l'image
                  </label>

                  <input
                    id={`edit-image-${compagnie.id}`}
                    type="text"
                    value={formData.imageUrl}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        imageUrl: event.target.value,
                      }))
                    }
                    className="box-border block h-11 w-full min-w-0 max-w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-gray-500 sm:h-10 sm:text-sm"
                  />
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor={`edit-ordre-${compagnie.id}`}
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Ordre
                  </label>

                  <input
                    id={`edit-ordre-${compagnie.id}`}
                    type="number"
                    min="1"
                    required
                    value={formData.ordre}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        ordre: Number(event.target.value),
                      }))
                    }
                    className="box-border block h-11 w-full min-w-0 max-w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-gray-500 sm:h-10 sm:text-sm"
                  />
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor={`edit-oa-${compagnie.id}`}
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    OAL de la compagnie
                  </label>

                  <select
                    id={`edit-oa-${compagnie.id}`}
                    required
                    value={formData.oaId}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        oaId: event.target.value,
                      }))
                    }
                    className="box-border block h-11 w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-white px-4 text-base outline-none focus:border-gray-500 sm:h-10 sm:text-sm"
                  >
                    <option value="">
                      Sélectionner un OAL de cette compagnie
                    </option>

                    {oaUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {[user.grade, user.lastName]
                          .filter(Boolean)
                          .join(" ") || user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 sm:w-auto"
                  >
                    {saving
                      ? "Enregistrement..."
                      : "Enregistrer"}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-2 sm:h-20 sm:w-20">
                  <img
                    src={compagnie?.imageUrl}
                    alt={`Logo ${compagnie?.nom}`}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Compagnie
                  </p>

                  <h2 className="wrap-break-words text-lg font-bold text-gray-900 md:text-xl">
                    {compagnie?.nom}
                  </h2>
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap md:w-auto md:items-center">
                  {isAdministrateur && (
                    <button
                      type="button"
                      onClick={() => startEdit(compagnie)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] sm:w-auto"
                    >
                      Modifier
                    </button>
                  )}

                  {isAdministrateur && (
                    <button
                      type="button"
                      onClick={() => handleDelete(compagnie)}
                      className="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 active:scale-[0.98] sm:w-auto"
                    >
                      Supprimer
                    </button>
                  )}

                  <Link
                    to={`/admin/compagnies/${compagnie.id}/sections`}
                    className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98] sm:w-auto"
                  >
                    Voir les sections
                  </Link>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {compagnies.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center sm:p-10">
          <p className="font-semibold text-gray-700">
            Aucune compagnie
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Aucune compagnie n'est actuellement enregistrée.
          </p>
        </div>
      )}
    </div>
  );
}

export default TableauCompagnie;