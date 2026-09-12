import MainLayout from "@/components/layout/MainLayout";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSections } from "../hooks/useSections";
import { getSoaBySection } from "../../users/api/user.api";

function SectionsAdmin() {
  const { compagnieId } = useParams();

  const {
    sections,
    loading,
    error,
    addSection,
    editSection,
    removeSection,
  } = useSections(compagnieId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sectionName, setSectionName] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [chefSectionId, setChefSectionId] = useState("");
  const [soaUsers, setSoaUsers] = useState([]);
  const [soaError, setSoaError] = useState(null);

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
    setSectionName("");
    setChefSectionId("");
    setSoaUsers([]);
    setSoaError(null);
    setShowAddForm(false);
    setEditingId(null);
    setActionError(null);
  };

  const handleAdd = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setActionError(null);

      await addSection({ sectionName });

      resetForm();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Impossible d'ajouter la section."
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = async (section) => {
    setShowAddForm(false);
    setEditingId(section.id);
    setSectionName(section.sectionName || "");
    setChefSectionId(section.chefSectionId || "");
    setActionError(null);
    setSoaError(null);
    setSoaUsers([]);

    try {
      const users = await getSoaBySection(section.id);

      setSoaUsers(users);
    } catch (err) {
      console.error(
        "Impossible de charger les SOA de la section :",
        err
      );

      setSoaError(
        "Impossible de charger les SOA de cette section."
      );
    }
  };

  const handleEdit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setActionError(null);

      await editSection(editingId, {
        sectionName,
        chefSectionId: chefSectionId || null,
      });

      resetForm();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Impossible de modifier la section."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (section) => {
    if (
      !window.confirm(
        `Supprimer définitivement la section « ${section.sectionName} » ?`
      )
    ) {
      return;
    }

    try {
      setActionError(null);

      await removeSection(section.id);
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Impossible de supprimer la section."
      );
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <p className="text-sm font-medium text-gray-500">
          Chargement des sections...
        </p>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <p className="text-sm font-medium text-red-600">
          Impossible de charger les sections.
        </p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full min-w-0 pb-4">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Link
            to="/admin/compagnies"
            className="inline-flex min-h-10 items-center text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← Retour aux compagnies
          </Link>

          {isAdministrateur && (
            <button
              type="button"
              onClick={() => {
                if (showAddForm) {
                  resetForm();
                } else {
                  setEditingId(null);
                  setSectionName("");
                  setActionError(null);
                  setShowAddForm(true);
                }
              }}
              className="min-h-11 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] sm:min-h-0 sm:w-auto sm:py-2.5"
            >
              {showAddForm
                ? "Annuler"
                : "Ajouter une section"}
            </button>
          )}
        </div>

        {/* Erreur action */}
        {actionError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm leading-relaxed font-medium text-red-700">
              {actionError}
            </p>
          </div>
        )}

        {/* Erreur SOA */}
        {soaError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm leading-relaxed font-medium text-red-700">
              {soaError}
            </p>
          </div>
        )}

        {/* Ajouter une section */}
        {showAddForm && (
          <form
            onSubmit={handleAdd}
            className="mb-6 w-full min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <h2 className="text-lg font-bold text-gray-900">
              Ajouter une section
            </h2>

            <div className="mt-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label className="mb-1.5 block text-xs font-medium text-gray-500 sm:text-sm">
                  Nom de la section
                </label>

                <input
                  type="text"
                  required
                  value={sectionName}
                  onChange={(event) =>
                    setSectionName(event.target.value)
                  }
                  placeholder="Nom de la section"
                  className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 sm:h-10 sm:text-sm"
                />
              </div>

              <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  onClick={resetForm}
                  className="min-h-11 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:min-h-0 sm:w-auto sm:py-2.5"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-11 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:w-auto sm:py-2.5"
                >
                  {saving ? "Ajout..." : "Ajouter"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Liste des sections */}
        <div className="flex min-w-0 flex-col gap-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="w-full min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
            >
              {editingId === section.id ? (
                <form
                  onSubmit={handleEdit}
                  className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  {/* Nom */}
                  <div className="min-w-0">
                    <label className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm">
                      Nom de la section
                    </label>

                    <input
                      type="text"
                      required
                      value={sectionName}
                      onChange={(event) =>
                        setSectionName(event.target.value)
                      }
                      className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 sm:h-10 sm:text-sm"
                    />
                  </div>

                  {/* SOA */}
                  <div className="min-w-0">
                    <label className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm">
                      SOA de la section
                    </label>

                    <select
                      value={chefSectionId}
                      onChange={(event) =>
                        setChefSectionId(event.target.value)
                      }
                      className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-4 text-base outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 sm:h-10 sm:text-sm"
                    >
                      <option value="">
                        Sélectionner un SOA de cette section
                      </option>

                      {soaUsers.map((user) => (
                        <option
                          key={user.id}
                          value={user.id}
                        >
                          {[
                            user.grade,
                            user.lastName,
                          ]
                            .filter(Boolean)
                            .join(" ") || user.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Actions modification */}
                  <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="min-h-11 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:min-h-0 sm:w-auto sm:py-2"
                    >
                      Annuler
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="min-h-11 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:w-auto sm:py-2"
                    >
                      {saving
                        ? "Enregistrement..."
                        : "Enregistrer"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                  <h2 className="min-w-0 wrap-break-word text-base font-semibold text-gray-900 sm:text-lg">
                    {section.sectionName}
                  </h2>

                  <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
                    {isAdministrateur && (
                      <button
                        type="button"
                        onClick={() => startEdit(section)}
                        className="min-h-11 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:min-h-0 sm:w-auto sm:py-2"
                      >
                        Modifier
                      </button>
                    )}

                    {isAdministrateur && (
                      <button
                        type="button"
                        onClick={() => handleDelete(section)}
                        className="min-h-11 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:min-h-0 sm:w-auto sm:py-2"
                      >
                        Supprimer
                      </button>
                    )}

                    <Link
                      to={`/admin/compagnies/${compagnieId}/sections/${section.id}/utilisateurs`}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98] sm:min-h-0 sm:w-auto sm:py-2.5"
                    >
                      Voir les utilisateurs
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}

          {sections.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center sm:p-8">
              <p className="text-sm leading-relaxed text-gray-500">
                Aucune section pour cette compagnie.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default SectionsAdmin;