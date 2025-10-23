'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";

export default function Home() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(form: FormData) {
    setError(null);
    setDownloading(true);
    setPreviewUrl(null);
    try {
      const res = await fetch(`${API_BASE}/compress`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(`Gagal: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed.jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gagal mengompresi";
      setError(message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-background text-foreground">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-8 py-16 px-6 bg-background sm:items-start">
        <h1 className="text-3xl font-semibold">Squeezer</h1>

        <form
          className="flex w-full flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget as HTMLFormElement);
            await handleSubmit(form);
          }}
        >
          <div>
            <Label htmlFor="image">Gambar</Label>
            <Input
              id="image"
              type="file"
              name="image"
              accept="image/*"
              required
              className="mt-1"
            />
          </div>
          <div className="flex gap-4">
            <div>
              <Label htmlFor="quality">Quality (1-95)</Label>
              <Input
                id="quality"
                type="number"
                name="quality"
                defaultValue={85}
                min={1}
                max={95}
                className="mt-1 w-24"
              />
            </div>
            <div>
              <Label htmlFor="max_size">Max Size (px)</Label>
              <Input
                id="max_size"
                type="number"
                name="max_size"
                defaultValue={1920}
                min={256}
                max={10000}
                className="mt-1 w-28"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="progressive" name="progressive" defaultChecked />
              <Label htmlFor="progressive" className="text-sm">Progressive</Label>
            </div>
          </div>
          <Button type="submit" disabled={downloading} className="w-fit">
            {downloading ? "Memproses..." : "Kompres & Unduh"}
          </Button>
          {error && <p className="text-destructive">{error}</p>}
        </form>

        {previewUrl && (
          <section className="w-full">
            <h2 className="text-lg font-medium">Preview Hasil</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Compressed Preview" className="mt-2 max-h-96 rounded-md border border-border" />
          </section>
        )}
      </main>
    </div>
  );
}
