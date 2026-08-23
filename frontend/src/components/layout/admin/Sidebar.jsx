import { NavLink } from "react-router-dom"
import logoBataillon from "/images/logoCompagnie/logoBataillon.webp"
function Sidebar() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-center items-center m-2">
        <img src={logoBataillon} alt="logo du bataillon" width={100} />
      </div>
      <div className="bg-gris-fonce p-2 rounded-sm mx-4 hover:bg-gris-clair text-gris-clair hover:text-gris-fonce transition-all duration-300">
        <NavLink to="/admin/missions">
          <h2>Missions</h2>
        </NavLink>
      </div>
      <div className="bg-gris-fonce p-2 rounded-sm mx-4 hover:bg-gris-clair text-gris-clair hover:text-gris-fonce transition-all duration-300">
        <NavLink to="/admin/vehicules">
          <h2>Véhicules</h2>
        </NavLink>
      </div>
      <div className="bg-gris-fonce p-2 rounded-sm mx-4 hover:bg-gris-clair text-gris-clair hover:text-gris-fonce transition-all duration-300">
        <NavLink to="/admin/compagnies">
          <h2>Compagnies/Personnel</h2>
        </NavLink>
      </div>
      <div className="bg-gris-fonce p-2 rounded-sm mx-4 hover:bg-gris-clair text-gris-clair hover:text-gris-fonce transition-all duration-300">
        <NavLink to="/admin/tableau-de-bord">
          <h2>Tableau de bord</h2>
        </NavLink>
      </div>
      <div className="bg-gris-fonce p-2 rounded-sm mx-4 hover:bg-gris-clair text-gris-clair hover:text-gris-fonce transition-all duration-300">
        <NavLink to="/admin/messagerie">
          <h2>Messagerie</h2>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
