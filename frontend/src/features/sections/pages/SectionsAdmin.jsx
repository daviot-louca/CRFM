import MainLayout from "@/components/layout/MainLayout";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSections } from "../hooks/useSections";
import { getSoaBySection } from "../../users/api/user.api";

function SectionsAdmin() {
  const { compagnieId } = useParams();
  const { sections, loading, error, addSection, editSection, removeSection } = useSections(compagnieId);
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
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );
  
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
      setActionError(err.response?.data?.message || "Impossible d'ajouter la section.");
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
      console.error("Impossible de charger les SOA de la section :", err);
      setSoaError("Impossible de charger les SOA de cette section.");
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
      setActionError(err.response?.data?.message || "Impossible de modifier la section.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (section) => {
    if (!window.confirm(`Supprimer définitivement la section « ${section.sectionName} » ?`)) return;

    try {
      setActionError(null);
      await removeSection(section.id);
    } catch (err) {
      setActionError(err.response?.data?.message || "Impossible de supprimer la section.");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <p className="text-sm font-medium text-gray-500">Chargement des sections...</p>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <p className="text-sm font-medium text-red-600">Impossible de charger les sections.</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full">
        <div className="mb-6 flex justify-between">
          <Link to="/admin/compagnies" className="text-sm font-medium text-gray-500 transition hover:text-gray-900">
            ← Retour aux compagnies
          </Link>
          {isAdministrateur&&(<button
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
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            {showAddForm ? "Annuler" : "Ajouter une section"}
          </button>)}
        </div>

        {actionError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{actionError}</p>
          </div>
        )}
        {soaError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{soaError}</p>
          </div>
        )}

        {showAddForm && (
          <form onSubmit={handleAdd} className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Ajouter une section</h2>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                required
                value={sectionName}
                onChange={(event) => setSectionName(event.target.value)}
                placeholder="Nom de la section"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500"
              />
              <button type="button" onClick={resetForm} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
                {saving ? "Ajout..." : "Ajouter"}
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-col gap-3">
          {sections.map((section) => (
            <div key={section.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              {editingId === section.id ? (
                <form onSubmit={handleEdit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Nom de la section</label>
                    <input
                      type="text"
                      required
                      value={sectionName}
                      onChange={(event) => setSectionName(event.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">SOA de la section</label>
                    <select
                      value={chefSectionId}
                      onChange={(event) => setChefSectionId(event.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500"
                    >
                      <option value="">Sélectionner un SOA de cette section</option>
                      {soaUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {[user.grade, user.lastName].filter(Boolean).join(" ") || user.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 sm:col-span-2 sm:justify-end">
                    <button type="button" onClick={resetForm} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                      Annuler
                    </button>
                    <button type="submit" disabled={saving} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
                      {saving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="font-semibold text-gray-900">{section.sectionName}</h2>

                  <div className="flex flex-wrap gap-2">
                    {isAdministrateur&&(<button type="button" onClick={() => startEdit(section)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                      Modifier
                    </button>)}
                    {isAdministrateur&&(<button type="button" onClick={() => handleDelete(section)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                      Supprimer
                    </button>)}
                    <Link to={`/admin/compagnies/${compagnieId}/sections/${section.id}/utilisateurs`} className="rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98]">
                      Voir les utilisateurs
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}

          {sections.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="text-sm text-gray-500">Aucune section pour cette compagnie.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default SectionsAdmin;