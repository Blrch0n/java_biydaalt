type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="paper mb-6 px-5 py-4 sm:px-6 sm:py-5">
      <h1 className="section-title text-2xl font-semibold sm:text-3xl">
        {title}
      </h1>
      <p className="muted-copy mt-2 text-sm sm:text-base">{description}</p>
    </header>
  );
}
