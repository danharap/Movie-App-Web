"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, FileArchive, FileText, X, AlertCircle, Loader2 } from "lucide-react";
import {
  parseLetterboxdZip,
  parseLetterboxdFiles,
  type ParsedImport,
} from "@/lib/letterboxd/parser";

interface UploadStepProps {
  onParsed: (data: ParsedImport) => void;
}

type UploadStatus = "idle" | "parsing" | "error";

export function UploadStep({ onParsed }: UploadStepProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: File[]) => {
      setStatus("parsing");
      setError(null);
      try {
        let parsed: ParsedImport;

        const zipFile = files.find((f) => f.name.endsWith(".zip"));
        if (zipFile) {
          const buffer = await zipFile.arrayBuffer();
          parsed = parseLetterboxdZip(buffer);
        } else {
          const csvFiles = files.filter((f) => f.name.endsWith(".csv"));
          if (csvFiles.length === 0) {
            throw new Error(
              "No valid files found. Please upload a Letterboxd .zip export or individual .csv files.",
            );
          }
          parsed = await parseLetterboxdFiles(csvFiles);
        }

        if (parsed.watched.length === 0 && parsed.watchlist.length === 0) {
          throw new Error(
            "No importable data found in the uploaded files. Make sure you're uploading a Letterboxd export.",
          );
        }

        onParsed(parsed);
      } catch (err) {
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Something went wrong parsing your files.",
        );
      }
    },
    [onParsed],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const arr = Array.from(files);
      setSelectedFiles(arr);
      processFiles(arr);
    },
    [processFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setStatus("idle");
    setError(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">Upload your export</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Drop your Letterboxd <strong className="text-zinc-300">.zip</strong> export or
          individual <strong className="text-zinc-300">.csv</strong> files
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 transition-all ${
          dragOver
            ? "border-amber-300/60 bg-amber-300/5"
            : "border-white/15 bg-white/5 hover:border-white/25 hover:bg-white/[0.07]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip,.csv"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {status === "parsing" ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-amber-300" />
            <p className="text-sm text-zinc-300">Parsing your export…</p>
          </>
        ) : (
          <>
            <div className="flex gap-3">
              <FileArchive className="h-8 w-8 text-zinc-500" />
              <Upload className="h-8 w-8 text-zinc-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-300">
                Drop files here, or click to browse
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Accepts <code className="text-zinc-400">.zip</code> (full export) or multiple{" "}
                <code className="text-zinc-400">.csv</code> files
              </p>
            </div>
          </>
        )}
      </div>

      {/* Selected files list */}
      {selectedFiles.length > 0 && status !== "parsing" && (
        <div className="space-y-2">
          {selectedFiles.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                {file.name.endsWith(".zip") ? (
                  <FileArchive className="h-4 w-4 text-amber-300" />
                ) : (
                  <FileText className="h-4 w-4 text-zinc-400" />
                )}
                <span className="text-sm text-zinc-300 truncate max-w-[260px]">{file.name}</span>
                <span className="text-xs text-zinc-600">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="rounded p-0.5 text-zinc-600 hover:text-zinc-300 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {status === "error" && error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-300">Upload failed</p>
            <p className="mt-0.5 text-sm text-red-400/80">{error}</p>
          </div>
        </div>
      )}

      {/* Help tip */}
      <div className="rounded-xl bg-white/5 p-4 text-sm text-zinc-500">
        <strong className="text-zinc-400">Tip:</strong> You can upload the{" "}
        <strong className="text-zinc-300">.zip file directly</strong> from Letterboxd — no need
        to unzip it first. If you already extracted it, just select all the{" "}
        <code className="text-zinc-400">.csv</code> files at once.
      </div>
    </div>
  );
}
