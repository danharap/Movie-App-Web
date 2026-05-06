"use client";

import { revalidateUsernameProfile, updateProfile } from "@/app/actions/social";
import { createClient } from "@/lib/supabase/client";
import { Check, Loader2, X, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

const BANNER_ASPECT = 21 / 9;
const BACKDROP_ASPECT = 16 / 9;
const BANNER_OUT = { w: 1680, h: 720 };
const BACKDROP_OUT = { w: 1920, h: 1080 };

async function cropToJpeg(
  imageSrc: string,
  pixelCrop: Area,
  outW: number,
  outH: number,
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
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
    outW,
    outH,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      0.88,
    );
  });
}

type CropKind = "banner" | "backdrop";

export function ProfileAppearance({
  userId,
  username,
  bannerUrl: initialBanner,
  profileBackgroundUrl: initialBg,
}: {
  userId: string;
  username: string | null;
  bannerUrl: string | null;
  profileBackgroundUrl: string | null;
}) {
  const router = useRouter();
  const [bannerUrl, setBannerUrl] = useState(initialBanner);
  const [bgUrl, setBgUrl] = useState(initialBg);

  useEffect(() => {
    setBannerUrl(initialBanner);
    setBgUrl(initialBg);
  }, [initialBanner, initialBg]);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropKind, setCropKind] = useState<CropKind | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function openFile(file: File | undefined, kind: CropKind) {
    if (!file) return;
    const maxMb = 12;
    if (file.size > maxMb * 1024 * 1024) {
      setStatus(`Image must be under ${maxMb} MB.`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setStatus("Please choose an image file.");
      return;
    }
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(URL.createObjectURL(file));
    setCropKind(kind);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setStatus(null);
  }

  function cancelCrop() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCropKind(null);
  }

  function confirmCrop() {
    if (!cropSrc || !croppedAreaPixels || !cropKind) return;

    const kind = cropKind;
    const src = cropSrc;
    const pixels = croppedAreaPixels;
    setCropSrc(null);
    setCropKind(null);

    setStatus("Uploading…");
    startTransition(async () => {
      try {
        const dims = kind === "banner" ? BANNER_OUT : BACKDROP_OUT;
        const blob = await cropToJpeg(src, pixels, dims.w, dims.h);
        URL.revokeObjectURL(src);

        const supabase = createClient();
        const path =
          kind === "banner" ? `${userId}/banner.jpg` : `${userId}/profile-bg.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, blob, { upsert: true, contentType: "image/jpeg" });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        const url = `${data.publicUrl}?t=${Date.now()}`;

        await updateProfile(
          kind === "banner"
            ? { banner_url: url }
            : { profile_background_url: url },
        );

        if (kind === "banner") setBannerUrl(url);
        else setBgUrl(url);

        setStatus(kind === "banner" ? "Banner saved." : "Background saved.");
        if (username) await revalidateUsernameProfile(username);
        router.refresh();
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "Upload failed.");
      }
    });
  }

  function clear(kind: CropKind) {
    setStatus(null);
    startTransition(async () => {
      try {
        const supabase = createClient();
        const path =
          kind === "banner" ? `${userId}/banner.jpg` : `${userId}/profile-bg.jpg`;
        await supabase.storage.from("avatars").remove([path]).catch(() => {});

        await updateProfile(
          kind === "banner"
            ? { banner_url: null }
            : { profile_background_url: null },
        );

        if (kind === "banner") setBannerUrl(null);
        else setBgUrl(null);

        setStatus(kind === "banner" ? "Banner removed." : "Background removed.");
        if (username) await revalidateUsernameProfile(username);
        router.refresh();
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "Could not remove.");
      }
    });
  }

  const aspect =
    cropKind === "banner" ? BANNER_ASPECT : cropKind === "backdrop" ? BACKDROP_ASPECT : 1;

  return (
    <>
      <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
          Profile look
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
          Add a wide banner and an optional backdrop for your profile and public URL — same idea as Letterboxd
          patron extras, using your own art.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-400">Banner</p>
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900/80">
              {bannerUrl ? (
                <Image
                  src={bannerUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width:896px) 100vw, 896px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-zinc-600">
                  21∶9 banner preview
                </div>
              )}
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => openFile(e.target.files?.[0], "banner")}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => bannerInputRef.current?.click()}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-indigo-400/30 hover:text-white disabled:opacity-50"
              >
                Upload banner
              </button>
              {bannerUrl ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => clear("banner")}
                  className="rounded-full px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-400">Page background</p>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900/80">
              {bgUrl ? (
                <Image
                  src={bgUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="400px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-[10px] text-zinc-600">
                  16∶9 backdrop (fills page behind content)
                </div>
              )}
            </div>
            <input
              ref={bgInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => openFile(e.target.files?.[0], "backdrop")}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => bgInputRef.current?.click()}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-indigo-400/30 hover:text-white disabled:opacity-50"
              >
                Upload backdrop
              </button>
              {bgUrl ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => clear("backdrop")}
                  className="rounded-full px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {status ? (
          <p className="mt-3 flex items-center gap-2 text-xs text-zinc-400" role="status">
            {isPending ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden /> : null}
            {status}
          </p>
        ) : null}
      </div>

      {cropSrc && cropKind && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <button
              type="button"
              onClick={cancelCrop}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <h2 className="text-sm font-semibold text-white">
              {cropKind === "banner" ? "Crop banner (21∶9)" : "Crop backdrop (16∶9)"}
            </h2>
            <button
              type="button"
              onClick={confirmCrop}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Save
            </button>
          </div>

          <div className="relative flex-1">
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape="rect"
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{ containerStyle: { background: "#09090b" } }}
            />
          </div>

          <div className="flex items-center justify-center gap-4 border-t border-white/10 px-6 py-4">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
              className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
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
              className="w-48 accent-indigo-400"
              aria-label="Zoom"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
              className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
