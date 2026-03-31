type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-semibold text-slate-900">
        {title}
      </h1>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </header>
  );
}
