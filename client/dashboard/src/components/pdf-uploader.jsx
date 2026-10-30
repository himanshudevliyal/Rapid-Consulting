"use client";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import config from "@/config";
import { Button } from "@/components/ui/button";
import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

const MAX_MB = 20;

// Upload one PDF to the server. `value` is the saved file path, `onChange(path | null)`.
// The website shows the PDF as a link that opens it in a new tab.
export default function PdfUploader({ value, onChange }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) return setError("Choose a PDF file.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`The PDF is larger than ${MAX_MB} MB.`);
    setError("");
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await http().post(`${config.api_base}${endpoints.files.upload}`, body, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      onChange(response.data.path[0]);
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      if (value) await http().delete(`${endpoints.files.getFiles}?file_path=${value}`);
    } catch {
      /* the link is removed from the record even if the file is already gone */
    }
    onChange(null);
  };

  const name = value ? String(value).split("/").pop() : "";
  return (
    <div className="space-y-2">
      <input ref={input} type="file" accept="application/pdf,.pdf" className="sr-only" aria-label="Upload PDF" onChange={pick} />
      {value ? (
        <div className="flex items-center justify-between gap-2 rounded-md border p-3 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{name}</span>
          </span>
          <Button type="button" variant="outline" size="icon" onClick={remove} aria-label="Remove PDF">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {busy ? "Uploading…" : "Upload PDF"}
        </Button>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-muted-foreground">Max {MAX_MB} MB. On the website it appears as a link that opens the PDF in a new tab.</p>
    </div>
  );
}
