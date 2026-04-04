type StatusMessageProps = {
  type: "success" | "error";
  message: string;
};

export function StatusMessage({ type, message }: StatusMessageProps) {
  const classes =
    type === "success"
      ? "border border-emerald-700/20 bg-emerald-50 text-emerald-800"
      : "border border-rose-800/20 bg-rose-50 text-rose-800";

  return (
    <div className={`rounded-xl px-3 py-2 text-sm ${classes}`}>{message}</div>
  );
}
