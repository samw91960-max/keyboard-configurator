interface PageShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-stone-500">Version 2 Mock Flow</p>
        <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{description}</p>
      </div>
      {children}
    </main>
  );
}
