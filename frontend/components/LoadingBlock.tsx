type LoadingBlockProps = {
  label?: string;
};

export function LoadingBlock({ label = "Ачаалж байна..." }: LoadingBlockProps) {
  return (
    <div className="paper muted-copy px-4 py-3 text-sm">
      {label}
    </div>
  );
}
