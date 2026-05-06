"use client";

import { updateProfile } from "@/app/actions/social";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useCallback, useRef, useState, useTransition } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { ZoomIn, ZoomOut, Check, X, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Canvas crop helper
// ---------------------------------------------------------------------------

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const size = 400; // output 400×400px
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/jpeg",
      0.9,
    );
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AvatarUpload({
  userId,
  currentUrl,
  displayName,
}: {
  userId: string;
  currentUrl: string | null;
  displayName: string;
}) {
  const [liveUrl, setLiveUrl] = useState<string | null>(currentUrl);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Crop modal state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function handleFileSelect(file: File) {
    const maxMb = 10;
    if (file.size > maxMb * 1024 * 1024) {
      setStatus(`Image must be under ${maxMb} MB.`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setStatus("Please select an image file.");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setStatus(null);
  }

  function cancelCrop() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function confirmCrop() {
    if (!cropSrc || !croppedAreaPixels) return;

    setStatus("Uploading…");
    setCropSrc(null);

    startTransition(async () => {
      try {
        const blob = await getCroppedBlob(cropSrc, croppedAreaPixels);
        URL.revokeObjectURL(cropSrc);

        const supabase = createClient();
        const path = `${userId}/avatar.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, blob, { upsert: true, contentType: "image/jpeg" });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        // Bust CDN cache with timestamp so Next.js Image picks up the new file
        const url = `${data.publicUrl}?t=${Date.now()}`;

        await updateProfile({ avatar_url: url });

        // Update local preview to the real CDN URL (not the blob)
        setLiveUrl(url);
        setStatus("Avatar saved.");
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "Upload failed.");
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <>
      {/* Avatar button */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
          className="group relative h-20 w-20 overflow-hidden rounded-full bg-zinc-800 ring-2 ring-white/10 transition hover:ring-amber-200/40 disabled:opacity-60"
          aria-label="Change avatar"
        >
          {liveUrl ? (
            <Image
              src={liveUrl}
              alt={displayName}
              fill
              className="object-cover"
              sizes="80px"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-amber-200 select-none">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <span className="text-xs font-medium text-white">Change</span>
            )}
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
          }}
        />

        {status ? (
          <p className="text-xs text-zinc-400" role="status">
            {status}
          </p>
        ) : (
          <p className="text-xs text-zinc-600">Click to change</p>
        )}
      </div>

      {/* Crop modal */}
      {cropSrc && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <button
              onClick={cancelCrop}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <h2 className="text-sm font-semibold text-white">Crop photo</h2>
            <button
              onClick={confirmCrop}
              className="flex items-center gap-1.5 rounded-full bg-amber-200/90 px-4 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-amber-200 transition"
            >
              <Check className="h-4 w-4" />
              Save
            </button>
          </div>

          {/* Cropper canvas */}
          <div className="relative flex-1">
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { background: "#09090b" },
              }}
            />
          </div>

          {/* Zoom controls */}
          <div className="flex items-center justify-center gap-4 border-t border-white/10 px-6 py-4">
            <button
              onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
              className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-48 accent-amber-300"
              aria-label="Zoom"
            />
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
              className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
