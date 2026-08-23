
function BoutonProfile() {
  return (
    <div className="bg-gris-clair rounded-lg flex px-2 py-1 gap-3">
        {/**photo de profile */}
      <div className="bg-gris-fonce rounded-full p-4">
        NO
      </div>
      <div className="flex flex-col justify-around pr-3">
        <div><p className="text-gray-600 text-sm">Nom</p></div>
        <div><p className="text-gray-500 text-sm">Admin</p></div>
      </div>
    </div>
  )
}

export default BoutonProfile
