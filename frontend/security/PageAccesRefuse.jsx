import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
export default function PageAccesRefuse() {
  const navigate = useNavigate();

  const handleRetour = () => {
    navigate(-1);
  };

  return (
    <MainLayout>
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-lg">

        <div className="mb-6 text-7xl font-extrabold text-red-600">
          403
        </div>

        <h1 className="mb-3 text-3xl font-bold text-slate-900">
          Accès refusé
        </h1>

        <p className="mb-8 text-gray-600">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>

        <button
          type="button"
          onClick={handleRetour}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Retour
        </button>

      </div>
    </div>
    </MainLayout>
  );
}