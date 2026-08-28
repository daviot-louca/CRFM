function ConducteurMobileLayout({ title, subtitle, action, children }) {
  return (
    <div className="min-h-screen bg-fond text-gray-950">
      <div className="mx-auto min-h-screen w-full max-w-md border-x border-gray-200 bg-fond">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+14px)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Conducteur
              </p>
              <h1 className="mt-1 break-words text-xl font-bold text-bleu">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 break-words text-sm text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        </header>

        <main className="px-4 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default ConducteurMobileLayout;
