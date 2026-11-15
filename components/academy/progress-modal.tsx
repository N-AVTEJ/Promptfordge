"use client";

import * as React from "react";
import {
  Download,
  Upload,
  Copy,
  Check,
  RotateCcw,
  X,
  FileJson,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/storage/progress";

export interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProgressModal({ isOpen, onClose }: ProgressModalProps) {
  const { progress, exportJson, importJson, downloadFile, reset } = useProgress();

  const [activeTab, setActiveTab] = React.useState<"export" | "import" | "reset">("export");
  const [copied, setCopied] = React.useState(false);
  const [pasteJsonInput, setPasteJsonInput] = React.useState("");
  const [importStatus, setImportStatus] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    const raw = exportJson();
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || "";
      const res = importJson(content);
      if (res.success) {
        setImportStatus({
          success: true,
          message: `Successfully restored ${res.progress?.completedLessonIds.length || 0} completed lessons and ${Object.keys(res.progress?.quizScores || {}).length} quiz scores.`,
        });
        setPasteJsonInput("");
      } else {
        setImportStatus({
          success: false,
          message: res.error || "Failed to import JSON.",
        });
      }
    };
    reader.onerror = () => {
      setImportStatus({
        success: false,
        message: "Failed to read the selected file.",
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handlePasteImport = () => {
    if (!pasteJsonInput.trim()) {
      setImportStatus({
        success: false,
        message: "Please enter JSON content to import.",
      });
      return;
    }
    const res = importJson(pasteJsonInput);
    if (res.success) {
      setImportStatus({
        success: true,
        message: `Successfully restored ${res.progress?.completedLessonIds.length || 0} completed lessons and ${Object.keys(res.progress?.quizScores || {}).length} quiz scores.`,
      });
      setPasteJsonInput("");
    } else {
      setImportStatus({
        success: false,
        message: res.error || "Failed to parse and import JSON.",
      });
    }
  };

  const handleResetConfirm = () => {
    reset();
    setImportStatus({
      success: true,
      message: "All curriculum progress has been reset to defaults.",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="progress-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-indigo-950/10 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-950/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-coral" />
            <h3 id="progress-modal-title" className="text-base font-bold text-indigo">
              Curriculum Progress Management
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-indigo-900/60 hover:bg-indigo-950/5 hover:text-indigo"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-indigo-950/10 bg-cream/50 px-6 pt-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("export");
              setImportStatus(null);
            }}
            className={cn(
              "px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors",
              activeTab === "export"
                ? "border-coral text-coral"
                : "border-transparent text-indigo-900/60 hover:text-indigo"
            )}
          >
            Export Progress
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("import");
              setImportStatus(null);
            }}
            className={cn(
              "px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors",
              activeTab === "import"
                ? "border-coral text-coral"
                : "border-transparent text-indigo-900/60 hover:text-indigo"
            )}
          >
            Import Progress
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("reset");
              setImportStatus(null);
            }}
            className={cn(
              "px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors",
              activeTab === "reset"
                ? "border-rose-500 text-rose-600"
                : "border-transparent text-indigo-900/60 hover:text-indigo"
            )}
          >
            Reset
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          {importStatus && (
            <div
              className={cn(
                "flex items-start gap-2.5 rounded-xl p-3 border",
                importStatus.success
                  ? "bg-teal/10 border-teal/30 text-teal"
                  : "bg-rose-50 border-rose-300 text-rose-700"
              )}
            >
              {importStatus.success ? (
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-teal" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              )}
              <span className="leading-relaxed">{importStatus.message}</span>
            </div>
          )}

          {activeTab === "export" && (
            <div className="space-y-4">
              <p className="text-indigo-900/70 leading-relaxed">
                Save your completed lesson checkmarks and quiz scores into a lightweight JSON file or copy raw text to restore on another device.
              </p>

              <div className="rounded-xl bg-cream p-4 font-mono text-[11px] text-indigo border border-indigo-950/10 space-y-1">
                <div>Completed lessons: {progress.completedLessonIds.length}</div>
                <div>Quiz results recorded: {Object.keys(progress.quizScores || {}).length}</div>
                <div>Last updated: {new Date(progress.updatedAt || Date.now()).toLocaleString()}</div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  onClick={downloadFile}
                  className="flex items-center gap-2 text-xs"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Backup JSON</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCopyJson}
                  className="flex items-center gap-2 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-teal" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Raw JSON</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "import" && (
            <div className="space-y-4">
              <p className="text-indigo-900/70 leading-relaxed">
                Restore your previous progress by uploading a backup file or pasting JSON content.
              </p>

              <div>
                <label
                  htmlFor="progress-file-input"
                  className="block text-xs font-semibold text-indigo mb-1.5"
                >
                  Upload JSON File
                </label>
                <input
                  id="progress-file-input"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-indigo-900/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-coral file:text-white hover:file:bg-coral-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="paste-json-input"
                  className="block text-xs font-semibold text-indigo"
                >
                  Or Paste JSON Directly
                </label>
                <textarea
                  id="paste-json-input"
                  rows={4}
                  value={pasteJsonInput}
                  onChange={(e) => setPasteJsonInput(e.target.value)}
                  placeholder='{"completedLessonIds": [...], "quizScores": {...}}'
                  className="w-full rounded-xl border border-indigo-950/15 bg-cream p-3 font-mono text-[11px] text-indigo placeholder:text-indigo-900/40 focus:border-coral focus:outline-none"
                />
              </div>

              <Button
                onClick={handlePasteImport}
                className="w-full flex items-center justify-center gap-2 text-xs"
              >
                <Upload className="h-4 w-4" />
                <span>Import and Restore Progress</span>
              </Button>
            </div>
          )}

          {activeTab === "reset" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex items-start gap-2.5 text-rose-800">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Caution: Irreversible Action</span>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    This will clear all completed lesson records, saved quiz scores, and telemetry timestamps stored in this browser session.
                  </p>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={handleResetConfirm}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Confirm Reset All Progress</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
