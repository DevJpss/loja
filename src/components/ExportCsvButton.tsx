"use client";

type Props = { csv: string; filename: string };

export default function ExportCsvButton({ csv, filename }: Props) {
  function download() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={!csv.trim()}
      className="inline-flex min-h-11 items-center border border-ink px-5 font-semibold hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      Exportar CSV
    </button>
  );
}
