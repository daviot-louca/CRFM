function BoutonProfile() {
  return (
    <div className="flex w-full max-w-xs items-center gap-2 rounded-lg bg-gris-clair px-2 py-1 sm:w-auto sm:gap-3">
      {/** photo de profile */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gris-fonce text-xs font-semibold sm:h-10 sm:w-10 sm:text-sm">
        NO
      </div>

      <div className="min-w-0 flex flex-col justify-around pr-1 sm:pr-3">
        <p className="truncate text-xs text-gray-600 sm:text-sm">
          Nom
        </p>

        <p className="truncate text-xs text-gray-500 sm:text-sm">
          Admin
        </p>
      </div>
    </div>
  )
}

export default BoutonProfile