function ConducteurMobileLayout({
  title,
  subtitle,
  action,
  children,
}) {
  return (
    <div className="min-h-screen w-full min-w-0 bg-fond text-gray-950">
      <div className="mx-auto min-h-screen w-full min-w-0 max-w-6xl border-x border-gray-200 bg-fond">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+14px)] backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Conducteur
              </p>

              <h1 className="mt-1 wrap-break-word text-xl font-bold text-bleu sm:text-2xl">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-1 wrap-break-word text-sm text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>

            {action && (
              <div className="shrink-0">
                {action}
              </div>
            )}
          </div>
        </header>

        <main className="w-full min-w-0 px-4 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
          <div className="mx-auto w-full min-w-0 max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ConducteurMobileLayout;