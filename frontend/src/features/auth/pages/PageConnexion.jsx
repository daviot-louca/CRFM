import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

function PageConnexion() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      phoneNumber,
      password,
    };

    try {
      const result = await loginUser(data);

      // Token d'authentification
      localStorage.setItem("token", result.token);

      // Informations du profil
      localStorage.setItem(
        "user",
        JSON.stringify(result.user),
      );

      localStorage.setItem(
        "userGrade",
        result.user.grade ?? "",
      );

      localStorage.setItem(
        "userLastName",
        result.user.lastName ?? "",
      );

      localStorage.setItem(
        "userRole",
        result.user.role?.roleName ?? "",
      );

      const role = result.user.role.roleName;

      if (role === "administrateur") {
        navigate("/admin/tableau-de-bord");
      } else if (role === "OAL") {
        navigate("/admin/tableau-de-bord");
      } else if (role === "SOA") {
        navigate("/admin/tableau-de-bord");
      } else if (role === "conducteur") {
        navigate("/conducteur");
      }
    } catch (error) {
      console.error(
        "Status :",
        error.response?.status,
      );

      console.error(
        "Réponse backend :",
        error.response?.data,
      );

      console.error(
        "Erreur :",
        error,
      );
    }
  };

  return (
    <main className="flex min-h-screen w-full items-start justify-center bg-bleu px-4 sm:px-6">
      <section className="box-border flex min-h-screen w-full max-w-2xl flex-col items-center px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16">
        <h1 className="mt-6 text-center text-5xl font-bold tracking-tight text-jaune sm:mt-8 sm:text-6xl md:text-7xl lg:text-8xl">
          CRFM
        </h1>

        <form
          className="mt-16 flex w-full max-w-sm flex-col gap-4 sm:mt-24 sm:gap-5 md:mt-28"
          onSubmit={handleSubmit}
        >
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            type="text"
            inputMode="tel"
            autoComplete="tel"
            placeholder="numéro de téléphone"
            className="box-border h-11 w-full rounded-[5px] bg-gris-clair px-3 text-base text-black outline-none placeholder:text-black focus:ring-2 focus:ring-jaune/80 sm:h-10 sm:px-3 sm:text-sm"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            placeholder="mot de passe"
            className="box-border h-11 w-full rounded-[5px] bg-gris-clair px-3 text-base text-black outline-none placeholder:text-black focus:ring-2 focus:ring-jaune/80 sm:h-10 sm:px-3 sm:text-sm"
          />

          <button
            type="submit"
            className="mx-auto mt-2 min-h-11 w-full rounded-lg bg-gris-fonce px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gris-fonce/80 sm:mt-0 sm:w-auto sm:min-h-0 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Se connecter
          </button>
        </form>

        <img
          src="/images/logoCompagnie/logoBataillon.webp"
          alt="Logo BCP"
          className="mt-20 w-32 max-w-full sm:mt-auto sm:w-48 md:w-56 lg:w-64"
        />
      </section>
    </main>
  );
}

export default PageConnexion;