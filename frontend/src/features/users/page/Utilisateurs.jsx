import MainLayout from "@/components/layout/MainLayout";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useUsers } from "../hooks/useUser.api";
import { getRoles } from "../api/role.api";

function Utilisateurs() {
  const { compagnieId, sectionId } = useParams();

  const { users, loading, error, addUser, editUser, removeUser } = useUsers(sectionId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [rolesError, setRolesError] = useState(null);
  const [formData, setFormData] = useState({
    grade: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    roleId: "",
  });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
        setRolesError(null);
      } catch (err) {
        console.error("Impossible de charger les rôles :", err);
        setRolesError("Impossible de charger les rôles.");
      }
    };

    loadRoles();
  }, []);

  const resetForm = () => {
    setFormData({ grade: "", lastName: "", email: "", phoneNumber: "", roleId: "" });
    setShowAddForm(false);
    setEditingId(null);
    setActionError(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setActionError(null);
      await addUser(formData);
      resetForm();
    } catch (err) {
      setActionError(err.response?.data?.message || "Impossible d'ajouter l'utilisateur.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (user) => {
    setShowAddForm(false);
    setEditingId(user.id);
    setActionError(null);
    setFormData({
      grade: user.grade || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      roleId: user.roleId || "",
    });
  };

  const handleEdit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setActionError(null);
      await editUser(editingId, formData);
      resetForm();
    } catch (err) {
      setActionError(err.response?.data?.message || "Impossible de modifier l'utilisateur.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Supprimer définitivement ${user.grade || ""} ${user.lastName || "cet utilisateur"} ?`)) return;

    try {
      setActionError(null);
      await removeUser(user.id);
    } catch (err) {
      setActionError(err.response?.data?.message || "Impossible de supprimer l'utilisateur.");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <p className="text-sm font-medium text-gray-500">Chargement des utilisateurs...</p>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <p className="text-sm font-medium text-red-600">Impossible de charger les utilisateurs.</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <Link to={`/admin/compagnies/${compagnieId}/sections`} className="text-sm font-medium text-gray-500 transition hover:text-gray-900">
            ← Retour aux sections
          </Link>
          <button
            type="button"
            onClick={() => {
              if (showAddForm) {
                resetForm();
              } else {
                setEditingId(null);
                setFormData({ grade: "", lastName: "", email: "", phoneNumber: "", roleId: "" });
                setActionError(null);
                setShowAddForm(true);
              }
            }}
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            {showAddForm ? "Annuler" : "Ajouter un utilisateur"}
          </button>
        </div>

        {actionError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{actionError}</p>
          </div>
        )}

        {rolesError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{rolesError}</p>
          </div>
        )}

        {showAddForm && (
          <form onSubmit={handleAdd} className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Ajouter un utilisateur</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <input name="grade" value={formData.grade} onChange={handleChange} placeholder="Grade" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500" />
              <input name="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Nom" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500" />
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500" />
              <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Téléphone" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500" />
              <select
                name="roleId"
                required
                value={formData.roleId}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500"
              >
                <option value="">Sélectionner un rôle</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={resetForm} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Annuler</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">{saving ? "Ajout..." : "Ajouter"}</button>
            </div>
          </form>
        )}

        {users.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Grade</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Nom</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Contact</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {users.map((user) =>
                    editingId === user.id ? (
                      <tr key={user.id}>
                        <td colSpan="4" className="p-5">
                          <form onSubmit={handleEdit} className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
                            <input name="grade" value={formData.grade} onChange={handleChange} placeholder="Grade" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                            <input name="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Nom" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                            <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Téléphone" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                            <select
                              name="roleId"
                              required
                              value={formData.roleId}
                              onChange={handleChange}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                              <option value="">Sélectionner un rôle</option>
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.roleName}
                                </option>
                              ))}
                            </select>
                            <div className="flex gap-2 lg:col-span-5 lg:justify-end">
                              <button type="button" onClick={resetForm} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Annuler</button>
                              <button type="submit" disabled={saving} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Enregistrement..." : "Enregistrer"}</button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    ) : (
                      <tr key={user.id} className="transition hover:bg-gray-50">
                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-700">{user.grade || "—"}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">{user.lastName || "—"}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{user.email || user.phoneNumber || "—"}</td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => startEdit(user)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100">Modifier</button>
                            <button type="button" onClick={() => handleDelete(user)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="font-semibold text-gray-900">Aucun utilisateur</p>
            <p className="mt-1 text-sm text-gray-500">Aucun utilisateur n'est actuellement rattaché à cette section.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Utilisateurs;
