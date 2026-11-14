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

  // Close on Escape
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
    // Reset input value so re-selecting same file triggers onChange
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="progress-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-forge-xl border border-forge-border bg-forge-surface shadow-forge overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-forge-border px-6 py-4">
          <div className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-ember-400" />
            <h3 id="progress-modal-title" className="text-base font-bold text-forge-text">
              Curriculum Progress Management
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-forge p-1 text-forge-muted hover:bg-forge-elevated hover:text-forge-text"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-forge-border bg-forge-elevated/50 px-6 pt-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("export");
              setImportStatus(null);
            }}
            className={cn(
              "px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors",
              activeTab === "export"
                ? "border-ember-500 text-ember-400"
                : "border-transparent text-forge-muted hover:text-forge-text"
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
                ? "border-ember-500 text-ember-400"
                : "border-transparent text-forge-muted hover:text-forge-text"
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
                ? "border-red-500 text-red-400"
                : "border-transparent text-forge-muted hover:text-forge-text"
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
                "flex items-start gap-2.5 rounded-forge p-3 border",
                importStatus.success
                  ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                  : "bg-red-950/30 border-red-500/40 text-red-300"
              )}
            >
              {importStatus.success ? (
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {activeTab === "export" && (
            <div className="space-y-4">
              <p className="text-forge-muted leading-relaxed">
                Export your entire PromptForge Academy progress (completed lessons, quiz best scores, and last visited position) as a standalone JSON file.
              </p>

              <div className="rounded-forge bg-forge-black p-3 font-mono text-[11px] text-forge-muted border border-forge-border space-y-1">
                <div>Completed Lessons: {progress.completedLessonIds.length}</div>
                <div>Quizzes Passed: {Object.keys(progress.quizScores || {}).length}</div>
                <div>Last Visited: {progress.lastVisited?.lessonId || "None"}</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  onClick={downloadFile}
                  className="flex-1 flex items-center justify-center gap-2 bg-ember-500 hover:bg-ember-600 text-white shadow-ember-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Download JSON File</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCopyJson}
                  className="flex items-center justify-center gap-2 border-forge-border hover:bg-forge-elevated"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Copied JSON</span>
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
              <p className="text-forge-muted leading-relaxed">
                Restore your curriculum progress by uploading a downloaded JSON file, or paste raw JSON into the box below.
              </p>

              {/* File Upload Button */}
              <div>
                <label className="flex flex-col items-center justify-center rounded-forge border border-dashed border-forge-border bg-forge-elevated/40 p-4 cursor-pointer hover:border-ember-500/50 hover:bg-forge-elevated transition-colors">
                  <Upload className="h-6 w-6 text-ember-400 mb-2" />
                  <span className="font-semibold text-forge-text">Upload JSON File</span>
                  <span className="text-[11px] text-forge-subtle mt-0.5">
                    Click to select .json export from your device
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Paste JSON */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-forge-muted">
                  Or Paste JSON Text:
                </label>
                <textarea
                  value={pasteJsonInput}
                  onChange={(e) => setPasteJsonInput(e.target.value)}
                  placeholder='{"app": "promptforge", "version": 1, ...}'
                  rows={4}
                  className="w-full rounded-forge border border-forge-border bg-forge-black p-3 font-mono text-[11px] text-forge-text placeholder:text-forge-subtle focus:border-ember-500 focus:outline-none"
                />
                <Button
                  onClick={handlePasteImport}
                  disabled={!pasteJsonInput.trim()}
                  className="w-full bg-ember-500 hover:bg-ember-600 text-white disabled:opacity-50"
                >
                  Import From Text
                </Button>
              </div>
            </div>
          )}

          {activeTab === "reset" && (
            <div className="space-y-4">
              <div className="rounded-forge bg-red-950/20 border border-red-500/30 p-3 text-red-300 space-y-1">
                <strong className="block text-red-200">Warning: Irreversible Action</strong>
                <p>
                  Resetting will wipe all completed lesson marks, quiz scores, and history from your browser local storage.
                </p>
              </div>

              <Button
                variant="destructive"
                onClick={handleResetConfirm}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Confirm & Reset All Progress</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
