type StatusMessageProps = {
  type: "success" | "error";
  message: string;
};

export function StatusMessage({ type, message }: StatusMessageProps) {
  const classes =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${classes}`}>{message}</div>
  );
}
