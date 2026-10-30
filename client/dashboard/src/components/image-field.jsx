"use client";
import { ImageUp, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import config from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { imageSrc } from "@/lib/image-src";
import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

const MAX_MB = 5;

// One picture for a section: upload a file (PNG, JPG, WebP or SVG) or paste a
// full address. `value` is what is saved: the path the server returns
// (public/images/…) or a full https:// address. A picture that fails to load is
// only reported; the saved value is never cleared by the preview.
export default function ImageField({ value, onChange }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [broken, setBroken] = useState(false);

  const pick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\//.test(file.type) && !/\.(svg|png|jpe?g|webp)$/i.test(file.name)) return setError("Choose an image file.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`The picture is larger than ${MAX_MB} MB.`);
    setError("");
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await http().post(`${config.api_base}${endpoints.files.upload}`, body, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setBroken(false);
      onChange(response.data.path[0]);
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const src = imageSrc(value);
  return (
    <div className="space-y-2">
      <input ref={input} type="file" accept="image/*,.svg" className="sr-only" aria-label="Upload picture" onChange={pick} />
      {value ? (
        <div className="relative overflow-hidden rounded-md border bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="mx-auto block max-h-56 w-auto max-w-full object-contain" onError={() => setBroken(true)} onLoad={() => setBroken(false)} />
          <Button type="button" variant="secondary" size="icon" className="absolute right-2 top-2" onClick={() => onChange("")} aria-label="Remove picture">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
      {broken && <p className="text-xs text-amber-600">The picture could not be shown from the address below. The address is still saved; check it opens in the browser.</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
          {busy ? "Uploading…" : value ? "Replace picture" : "Upload picture"}
        </Button>
      </div>
      <div className="space-y-1">
        <Input value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder="…or paste a full address, e.g. https://…/plan.png" aria-label="Picture address" />
        {value ? <p className="break-all text-xs text-muted-foreground">Full address: {src}</p> : null}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
