import { useMemo, useState } from "react";

const acceptedHeaders = ["name", "sku", "stock", "lowStockThreshold"];

export const InventoryImportModal = ({
  open,
  busy,
  onClose,
  onImportRows,
  onImportSheet
}) => {
  const [sheetUrl, setSheetUrl] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");

  const previewText = useMemo(() => {
    if (!parsedRows.length) {
      return "";
    }

    return `Ready to import ${parsedRows.length} row(s) from ${fileName}. Existing products with the same SKU will be updated.`;
  }, [fileName, parsedRows]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-950">Import inventory</h3>
            <p className="mt-1 text-sm text-slate-500">
              Upload an Excel or CSV file, or paste a public Google Sheet link to bulk-create inventory.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Spreadsheet upload
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Supports `.xlsx`, `.xls`, and `.csv`. The first sheet is imported.
            </p>

            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center transition hover:border-teal-400 hover:bg-teal-50/30">
              <span className="text-sm font-bold text-slate-700">
                {fileName ? fileName : "Choose a spreadsheet file"}
              </span>
              <span className="mt-2 text-xs text-slate-500">
                Required columns: {acceptedHeaders.join(", ")}
              </span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={async (event) => {
                  const nextFile = event.target.files?.[0];

                  if (!nextFile) {
                    return;
                  }

                  setMessage("");

                  try {
                    const XLSX = await import("xlsx");
                    const buffer = await nextFile.arrayBuffer();
                    const workbook = XLSX.read(buffer, { type: "array" });
                    const firstSheetName = workbook.SheetNames[0];
                    const firstSheet = workbook.Sheets[firstSheetName];
                    const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

                    if (rows.length === 0) {
                      throw new Error("The spreadsheet did not contain any rows to import.");
                    }

                    setFileName(nextFile.name);
                    setParsedRows(rows);
                    setMessage("");
                  } catch (error) {
                    setFileName("");
                    setParsedRows([]);
                    setMessage(error.message || "Could not read that spreadsheet.");
                  }
                }}
              />
            </label>

            {previewText ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {previewText}
              </div>
            ) : null}

            <button
              type="button"
              disabled={busy || parsedRows.length === 0}
              className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
              onClick={async () => {
                setMessage("");

                try {
                  await onImportRows({
                    rows: parsedRows,
                    sourceLabel: fileName || "Spreadsheet upload"
                  });
                } catch (error) {
                  setMessage(error.message);
                }
              }}
            >
              {busy ? "Importing..." : "Import spreadsheet"}
            </button>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Google Sheet
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Paste a public Google Sheet link. Products are created or updated by SKU.
            </p>

            <div className="mt-5 space-y-3">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal-600 focus:shadow-[0_0_0_4px_rgba(15,118,110,0.1)]"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetUrl}
                onChange={(event) => setSheetUrl(event.target.value)}
              />
              <p className="text-xs text-slate-500">
                The sheet must be shared publicly or published to the web, and include columns:
                {` ${acceptedHeaders.join(", ")}`}.
              </p>
              <button
                type="button"
                disabled={busy || !sheetUrl.trim()}
                className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-600 disabled:opacity-60"
                onClick={async () => {
                  setMessage("");

                  try {
                    await onImportSheet({
                      sheetUrl: sheetUrl.trim(),
                      sourceLabel: "Google Sheet"
                    });
                  } catch (error) {
                    setMessage(error.message);
                  }
                }}
              >
                {busy ? "Importing..." : "Import from Google Sheet"}
              </button>
            </div>
          </section>
        </div>

        {message ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
};
