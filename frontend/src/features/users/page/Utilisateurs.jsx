import MainLayout from "@/components/layout/MainLayout";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useUsers } from "../hooks/useUser.api";
import { getRoles } from "../api/role.api";

function Utilisateurs() {
  const { compagnieId, sectionId } = useParams();

  const { users, loading, error, addUser, editUser, removeUser } =
    useUsers(sectionId);

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
    setFormData({
      grade: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      roleId: "",
    });

    setShowAddForm(false);
    setEditingId(null);
    setActionError(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAdd = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setActionError(null);

      await addUser(formData);
      resetForm();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Impossible d'ajouter l'utilisateur."
      );
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
      setActionError(
        err.response?.data?.message ||
          "Impossible de modifier l'utilisateur."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (
      !window.confirm(
        `Supprimer définitivement ${
          user.grade || ""
        } ${user.lastName || "cet utilisateur"} ?`
      )
    ) {
      return;
    }

    try {
      setActionError(null);
      await removeUser(user.id);
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Impossible de supprimer l'utilisateur."
      );
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <p className="text-sm font-medium text-gray-500">
          Chargement des utilisateurs...
        </p>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <p className="text-sm font-medium text-red-600">
          Impossible de charger les utilisateurs.
        </p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full min-w-0 pb-4">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to={`/admin/compagnies/${compagnieId}/sections`}
            className="inline-flex min-h-10 items-center text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← Retour aux sections
          </Link>

          <button
            type="button"
            onClick={() => {
              if (showAddForm) {
                resetForm();
              } else {
                setEditingId(null);

                setFormData({
                  grade: "",
                  lastName: "",
                  email: "",
                  phoneNumber: "",
                  roleId: "",
                });

                setActionError(null);
                setShowAddForm(true);
              }
            }}
            className="min-h-11 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] sm:min-h-0 sm:w-auto sm:py-2.5"
          >
            {showAddForm ? "Annuler" : "Ajouter un utilisateur"}
          </button>
        </div>

        {/* Erreur action */}
        {actionError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm leading-relaxed font-medium text-red-700">
              {actionError}
            </p>
          </div>
        )}

        {/* Erreur rôles */}
        {rolesError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm leading-relaxed font-medium text-red-700">
              {rolesError}
            </p>
          </div>
        )}

        {/* Ajouter un utilisateur */}
        {showAddForm && (
          <form
            onSubmit={handleAdd}
            className="mb-6 w-full min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <h2 className="text-lg font-bold text-gray-900">
              Ajouter un utilisateur
            </h2>

            <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {/* Grade */}
              <div className="min-w-0">
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Grade
                </label>

                <input
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  placeholder="Grade"
                  className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 sm:h-10 sm:text-sm"
                />
              </div>

              {/* Nom */}
              <div className="min-w-0">
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Nom
                </label>

                <input
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Nom"
                  className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 sm:h-10 sm:text-sm"
                />
              </div>

              {/* Email */}
              <div className="min-w-0">
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Email
                </label>

                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 sm:h-10 sm:text-sm"
                />
              </div>

              {/* Téléphone */}
              <div className="min-w-0">
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Téléphone
                </label>

                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Téléphone"
                  inputMode="tel"
                  className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 sm:h-10 sm:text-sm"
                />
              </div>

              {/* Rôle */}
              <div className="min-w-0">
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Rôle
                </label>

                <select
                  name="roleId"
                  required
                  value={formData.roleId}
                  onChange={handleChange}
                  className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 sm:h-10 sm:text-sm"
                >
                  <option value="">Sélectionner un rôle</option>

                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions ajout */}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
          </form>
        )}

        {users.length > 0 ? (
          <>
            {/* MOBILE : cartes */}
            <div className="flex flex-col gap-3 sm:hidden">
              {users.map((user) =>
                editingId === user.id ? (
                  <form
                    key={user.id}
                    onSubmit={handleEdit}
                    className="w-full min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Modification
                      </p>

                      <h2 className="mt-1 break-words text-base font-bold text-gray-900">
                        {user.lastName || "Utilisateur"}
                      </h2>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-3">
                      {/* Grade */}
                      <div className="min-w-0">
                        <label className="mb-1.5 block text-xs font-medium text-gray-500">
                          Grade
                        </label>

                        <input
                          name="grade"
                          value={formData.grade}
                          onChange={handleChange}
                          placeholder="Grade"
                          className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 px-3 py-3 text-base outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 sm:text-sm"
                        />
                      </div>

                      {/* Nom */}
                      <div className="min-w-0">
                        <label className="mb-1.5 block text-xs font-medium text-gray-500">
                          Nom
                        </label>

                        <input
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Nom"
                          className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 px-3 py-3 text-base outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 sm:text-sm"
                        />
                      </div>

                      {/* Email */}
                      <div className="min-w-0">
                        <label className="mb-1.5 block text-xs font-medium text-gray-500">
                          Email
                        </label>

                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Email"
                          className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 px-3 py-3 text-base outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 sm:text-sm"
                        />
                      </div>

                      {/* Téléphone */}
                      <div className="min-w-0">
                        <label className="mb-1.5 block text-xs font-medium text-gray-500">
                          Téléphone
                        </label>

                        <input
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          placeholder="Téléphone"
                          inputMode="tel"
                          className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 px-3 py-3 text-base outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 sm:text-sm"
                        />
                      </div>

                      {/* Rôle */}
                      <div className="min-w-0">
                        <label className="mb-1.5 block text-xs font-medium text-gray-500">
                          Rôle
                        </label>

                        <select
                          name="roleId"
                          required
                          value={formData.roleId}
                          onChange={handleChange}
                          className="box-border block h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 sm:text-sm"
                        >
                          <option value="">
                            Sélectionner un rôle
                          </option>

                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.roleName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col-reverse gap-2">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="min-h-11 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Annuler
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="min-h-11 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving
                          ? "Enregistrement..."
                          : "Enregistrer"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <article
                    key={user.id}
                    className="w-full min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold uppercase text-gray-600">
                        {(user.lastName || "?").charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          {user.grade || "Militaire"}
                        </p>

                        <h2 className="mt-0.5 break-words text-base font-bold text-gray-900">
                          {user.lastName || "Nom non renseigné"}
                        </h2>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3 rounded-xl bg-gray-50 p-3">
                      <div className="min-w-0">
                        <span className="block text-xs font-medium text-gray-400">
                          Email
                        </span>

                        <span className="mt-0.5 block break-all text-sm text-gray-700">
                          {user.email || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="block text-xs font-medium text-gray-400">
                          Téléphone
                        </span>

                        <span className="mt-0.5 block text-sm text-gray-700">
                          {user.phoneNumber || "—"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(user)}
                        className="min-h-11 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100"
                      >
                        Modifier
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        className="min-h-11 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 active:bg-red-100"
                      >
                        Supprimer
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>

            {/* TABLETTE / DESKTOP */}
            <div className="hidden w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-5">
                        Grade
                      </th>

                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-5">
                        Nom
                      </th>

                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-5">
                        Contact
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-5">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) =>
                      editingId === user.id ? (
                        <tr key={user.id}>
                          <td colSpan="4" className="p-4 sm:p-5">
                            <form
                              onSubmit={handleEdit}
                              className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
                            >
                              <input
                                name="grade"
                                value={formData.grade}
                                onChange={handleChange}
                                placeholder="Grade"
                                className="box-border w-full min-w-0 max-w-full rounded-lg border border-gray-300 px-3 py-3 text-sm sm:py-2"
                              />

                              <input
                                name="lastName"
                                required
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Nom"
                                className="box-border w-full min-w-0 max-w-full rounded-lg border border-gray-300 px-3 py-3 text-sm sm:py-2"
                              />

                              <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className="box-border w-full min-w-0 max-w-full rounded-lg border border-gray-300 px-3 py-3 text-sm sm:py-2"
                              />

                              <input
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Téléphone"
                                className="box-border w-full min-w-0 max-w-full rounded-lg border border-gray-300 px-3 py-3 text-sm sm:py-2"
                              />

                              <select
                                name="roleId"
                                required
                                value={formData.roleId}
                                onChange={handleChange}
                                className="box-border w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm sm:py-2"
                              >
                                <option value="">
                                  Sélectionner un rôle
                                </option>

                                {roles.map((role) => (
                                  <option
                                    key={role.id}
                                    value={role.id}
                                  >
                                    {role.roleName}
                                  </option>
                                ))}
                              </select>

                              <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end lg:col-span-5">
                                <button
                                  type="button"
                                  onClick={resetForm}
                                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 sm:w-auto sm:py-2"
                                >
                                  Annuler
                                </button>

                                <button
                                  type="submit"
                                  disabled={saving}
                                  className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto sm:py-2"
                                >
                                  {saving
                                    ? "Enregistrement..."
                                    : "Enregistrer"}
                                </button>
                              </div>
                            </form>
                          </td>
                        </tr>
                      ) : (
                        <tr
                          key={user.id}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-700 sm:px-5">
                            {user.grade || "—"}
                          </td>

                          <td className="px-4 py-4 text-sm font-semibold text-gray-900 sm:px-5">
                            {user.lastName || "—"}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-600 sm:px-5">
                            {user.email ||
                              user.phoneNumber ||
                              "—"}
                          </td>

                          <td className="px-4 py-4 sm:px-5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(user)}
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 sm:px-4"
                              >
                                Modifier
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(user)}
                                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:px-4"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center shadow-sm sm:p-8">
            <p className="font-semibold text-gray-900">
              Aucun utilisateur
            </p>

            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Aucun utilisateur n'est actuellement rattaché à cette
              section.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Utilisateurs;