import { useMissions2 } from "../hooks/useMissions2";
import MainLayout from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";

function CreerMission4Admin() {
  const navigate = useNavigate();
  const {
    groupesManuels = [],
    creerGroupeManuel,
    setSoa,
    toggleConducteur,
    usersDisponibles = [],
  } = useMissions2();

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Commandement</h1>
        <div className="flex gap-4 overflow-x-auto pb-4">

          {groupesManuels.map((groupe, index) => (
            <div
              key={groupe.id}
              className="w-80 shrink-0 border rounded-lg p-4 flex flex-col gap-2"
            >
              <h2 className="font-semibold text-lg">{groupe.nom}</h2>
              {(groupe.societe || groupe.section) && (
                <p className="text-sm text-gray-600">
                  {groupe.societe ? `Société: ${groupe.societe}` : ""}
                  {groupe.societe && groupe.section ? " - " : ""}
                  {groupe.section ? `Section: ${groupe.section}` : ""}
                </p>
              )}
              <p className="text-sm font-medium">SOA</p>
              <select
                className="w-full rounded border p-2"
                value={groupe.soaId ?? ""}
                onChange={(e) => setSoa(index, e.target.value)}
              >
                <option value="">Sélectionner un SOA</option>
                {(groupe.users ?? []).map((userId) => {
                  const user = usersDisponibles.find((u) => u.id === userId);
                  if (!user) return null;

                  const memeCompagnie =
                    !groupe.societe ||
                    user.compagnieName === groupe.societe ||
                    user.compagnie?.compagnieName === groupe.societe;

                  const estSOA = user.roleName === "SOA" || user.role?.roleName === "SOA";

                  if (!memeCompagnie || !estSOA) return null;

                  return (
                    <option key={user.id} value={user.id}>
                      {`${user.grade ? `${user.grade} ` : ""}${user.nom ?? user.lastname ?? ""} ${user.prenom ?? user.firstname ?? ""}`.trim()}
                    </option>
                  );
                })}
              </select>

              <p className="mt-4 text-sm font-medium">Conducteurs</p>
              <div className="space-y-2">
                {(groupe.users ?? []).map((userId) => {
                  const user = usersDisponibles.find((u) => u.id === userId);
                  if (!user) return null;

                  return (
                    <label key={user.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={(groupe.conducteurIds ?? []).includes(user.id)}
                        onChange={() => toggleConducteur(index, user.id)}
                      />
                      {`${user.grade ? `${user.grade} ` : ""}${user.nom ?? user.lastname ?? ""} ${user.prenom ?? user.firstname ?? ""}`.trim()}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="w-80 shrink-0 border-2 border-dashed rounded-lg p-4 flex items-start justify-center min-h-[600px]">
            <button
              onClick={creerGroupeManuel}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              + Ajouter un groupe
            </button>
          </div>
        </div>
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded border px-4 py-2 hover:bg-gray-100"
          >
            Précédent
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/validation-missions")}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Suivant
          </button>
        </div>
      </div>
    </MainLayout>
  );
}

export default CreerMission4Admin;
