import { useState } from "react";
import useAuth from "../hooks/useAuth";
import {useNavigate} from "react-router-dom";

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
      localStorage.setItem("token", result.token);
      console.log("Connexion réussie :", result.user.roleId);
      const role = result.user.role.roleName;
      if (role === "administrateur") {
        navigate("/admin/tableau-de-bord");
      } else if (role === "OAL") {
        navigate("/oal");
      } else if (role === "SOA") {
        navigate("/soa");
      } else if (role === "conducteur") {
        navigate("/conducteur");
      }
    } catch (error) {
      console.error("Status :", error.response?.status);
      console.error("Réponse backend :", error.response?.data);
      console.error("Erreur :", error);
    }
  };
  return (
    <main className="bg-bleu min-h-screen flex items-start justify-center">
      <section className="w-full max-w-178 min-h-screen px-10 py-16 flex flex-col items-center">
        <h1 className="mt-8 text-8xl font-bold tracking-tight text-jaune">
          CRFM
        </h1>

        <form
          className="mt-32 w-full max-w-68 flex flex-col gap-5"
          onSubmit={handleSubmit}>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            type="text"
            placeholder="numéro de téléphone"
            className="h-7 w-full rounded-[5px] bg-gris-clair px-2 text-[10px] text-black outline-none placeholder:text-black"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="mot de passe"
            className="h-7 w-full rounded-[5px] bg-gris-clair px-2 text-[10px] text-black outline-none placeholder:text-black"
          />

          <button
            type="submit"
            className="mx-auto mt-0 rounded-lg bg-gris-fonce px-3 py-2 text-[9px] text-white"
          >
            Se connecter
          </button>
        </form>

        <img
          src="/images/logoCompagnie/logoBataillon.webp"
          alt="Logo BCP"
          className="mt-auto w-77"
        />
      </section>
    </main>
  );
}

export default PageConnexion;