"use client";

import { updateProfile } from "@/app/actions/social";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";

export function AvatarUpload({
  userId,
  currentUrl,
  displayName,
}: {
  userId: string;
  currentUrl: string | null;
  displayName: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const maxMb = 5;
    if (file.size > maxMb * 1024 * 1024) {
      setStatus(`Image must be under ${maxMb}MB.`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setStatus("Please upload an image file.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setStatus("Uploading…");

    startTransition(async () => {
      try {
        const supabase = createClient();
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${userId}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, file, { upsert: true, contentType: file.type });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        // Bust CDN cache with a timestamp
        const url = `${data.publicUrl}?t=${Date.now()}`;

        await updateProfile({ avatar_url: url });
        setStatus("Avatar saved.");
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "Upload failed.");
        setPreview(currentUrl);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
        className="group relative h-20 w-20 overflow-hidden rounded-full bg-zinc-800 ring-2 ring-white/10 transition hover:ring-amber-200/40 disabled:opacity-60"
        aria-label="Change avatar"
      >
        {preview ? (
          <Image
            src={preview}
            alt={displayName}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-amber-200 select-none">
            {displayName.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
          <span className="text-xs font-medium text-white">Change</span>
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
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
  );
}
