type LoadingBlockProps = {
  label?: string;
};

export function LoadingBlock({ label = "Loading..." }: LoadingBlockProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
      {label}
    </div>
  );
}
