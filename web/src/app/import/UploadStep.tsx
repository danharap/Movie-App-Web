"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, FileArchive, FileText, Folder, X, AlertCircle, Loader2 } from "lucide-react";
import {
  parseLetterboxdZip,
  parseLetterboxdFilesWithPaths,
  type ParsedImport,
} from "@/lib/letterboxd/parser";

interface UploadStepProps {
  onParsed: (data: ParsedImport) => void;
}

type UploadStatus = "idle" | "parsing" | "error";

/** Recursively read all files from a dropped FileSystemDirectoryEntry. */
async function readDirectoryEntry(entry: FileSystemDirectoryEntry): Promise<File[]> {
  const files: File[] = [];
  const reader = entry.createReader();

  const readBatch = (): Promise<FileSystemEntry[]> =>
    new Promise((res, rej) => reader.readEntries(res, rej));

  let batch: FileSystemEntry[];
  do {
    batch = await readBatch();
    for (const e of batch) {
      if (e.isFile) {
        const file = await new Promise<File>((res, rej) =>
          (e as FileSystemFileEntry).file(res, rej),
        );
        files.push(file);
      } else if (e.isDirectory) {
        const sub = await readDirectoryEntry(e as FileSystemDirectoryEntry);
        files.push(...sub);
      }
    }
  } while (batch.length > 0);

  return files;
}

/** Read files from a DataTransfer, traversing dropped folders if needed. */
async function readDroppedItems(dataTransfer: DataTransfer): Promise<File[]> {
  const items = Array.from(dataTransfer.items ?? []);
  const all: File[] = [];

  for (const item of items) {
    if (typeof item.webkitGetAsEntry === "function") {
      const entry = item.webkitGetAsEntry();
      if (!entry) continue;
      if (entry.isDirectory) {
        const sub = await readDirectoryEntry(entry as FileSystemDirectoryEntry);
        all.push(...sub);
      } else if (entry.isFile) {
        const file = item.getAsFile();
        if (file) all.push(file);
      }
    } else {
      const file = item.getAsFile();
      if (file) all.push(file);
    }
  }

  return all.length > 0 ? all : Array.from(dataTransfer.files);
}

export function UploadStep({ onParsed }: UploadStepProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

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
          // Use webkitRelativePath when available (folder picker / directory drop)
          const csvFiles = files.filter((f) => {
            const path =
              (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name;
            return path.endsWith(".csv");
          });

          if (csvFiles.length === 0) {
            throw new Error(
              "No CSV files found. Please upload the Letterboxd .zip, select the extracted folder, or pick the individual .csv files.",
            );
          }

          const inputs = csvFiles.map((f) => ({
            file: f,
            path:
              (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name,
          }));

          parsed = await parseLetterboxdFilesWithPaths(inputs);
        }

        if (parsed.watched.length === 0 && parsed.watchlist.length === 0) {
          throw new Error(
            "No importable data found. Make sure you're uploading a Letterboxd export (the folder or zip should contain diary.csv, watched.csv, etc.).",
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

  const handleFileList = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const arr = Array.from(files);
      setSelectedFiles(arr);
      processFiles(arr);
    },
    [processFiles],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = await readDroppedItems(e.dataTransfer);
      if (files.length === 0) return;
      setSelectedFiles(files);
      processFiles(files);
    },
    [processFiles],
  );

  const resetError = () => {
    setSelectedFiles([]);
    setStatus("idle");
    setError(null);
    // Reset inputs so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
    if (folderInputRef.current) folderInputRef.current.value = "";
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">Upload your export</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Drop your Letterboxd export — as a <strong className="text-zinc-300">.zip</strong>,
          an extracted <strong className="text-zinc-300">folder</strong>, or individual{" "}
          <strong className="text-zinc-300">.csv</strong> files
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
        className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 transition-all ${
          dragOver
            ? "border-amber-300/60 bg-indigo-400/5"
            : "border-white/15 bg-white/5"
        }`}
      >
        {/* Hidden inputs */}
        <input
          ref={inputRef}
          type="file"
          accept=".zip,.csv"
          multiple
          className="hidden"
          onChange={(e) => handleFileList(e.target.files)}
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-expect-error — webkitdirectory is non-standard but widely supported
          webkitdirectory=""
          multiple
          className="hidden"
          onChange={(e) => handleFileList(e.target.files)}
        />

        {status === "parsing" ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
            <p className="text-sm text-zinc-300">Parsing your export…</p>
          </>
        ) : (
          <>
            <div className="flex gap-3">
              <FileArchive className="h-8 w-8 text-zinc-500" />
              <Upload className="h-8 w-8 text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-zinc-300">
              Drop your export folder or files here
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/15 hover:text-white"
              >
                <FileArchive className="h-3.5 w-3.5" />
                Select .zip or .csv files
              </button>
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-400 transition hover:bg-indigo-500/15"
              >
                <Folder className="h-3.5 w-3.5" />
                Select extracted folder
              </button>
            </div>
          </>
        )}
      </div>

      {/* Selected files summary */}
      {selectedFiles.length > 0 && status !== "parsing" && (
        <div className="space-y-2">
          {selectedFiles.slice(0, 6).map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                {file.name.endsWith(".zip") ? (
                  <FileArchive className="h-4 w-4 text-indigo-400" />
                ) : (
                  <FileText className="h-4 w-4 text-zinc-400" />
                )}
                <span className="text-sm text-zinc-300 truncate max-w-[260px]">
                  {(file as File & { webkitRelativePath?: string }).webkitRelativePath ||
                    file.name}
                </span>
                <span className="text-xs text-zinc-600">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </div>
            </div>
          ))}
          {selectedFiles.length > 6 && (
            <p className="text-xs text-zinc-600 px-1">
              …and {selectedFiles.length - 6} more files
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {status === "error" && error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">Upload failed</p>
            <p className="mt-0.5 text-sm text-red-400/80">{error}</p>
            <button
              onClick={resetError}
              className="mt-2 text-xs text-red-400 underline hover:text-red-300 transition"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Help tip */}
      <div className="rounded-xl bg-white/5 p-4 text-sm text-zinc-500 space-y-1.5">
        <p>
          <strong className="text-zinc-400">Got the .zip?</strong> Use{" "}
          <em>Select .zip or .csv files</em> and pick it directly — no unzipping needed.
        </p>
        <p>
          <strong className="text-zinc-400">Already unzipped?</strong> Use{" "}
          <em>Select extracted folder</em> and pick the whole folder — all CSV files inside
          are read automatically.
        </p>
      </div>
    </div>
  );
}
