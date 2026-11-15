"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Bookmark,
  Plus,
  Search,
  Tag,
  History,
  RotateCcw,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Split,
  TrendingUp,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  SavedPrompt,
  PromptVersion,
  getSavedPrompts,
  savePrompt,
  restorePromptVersion,
  deleteSavedPrompt,
  exportLibraryJson,
  importLibraryJson,
} from "@/lib/storage/library";
import { computeLineDiff, DiffResult } from "@/lib/engine/diff";

// Seed data if library is empty
const INITIAL_SEED_PROMPTS: SavedPrompt[] = [
  {
    id: "prompt_seed_canine",
    title: "Canine Behavior & Nutrition Synthesis",
    content: `You are an authoritative Veterinary Behavioral Specialist and Canine Nutritionist.

### Context & Target Audience:
This guide is engineered for prospective and first-time dog owners preparing for adoption.
Address foundational concepts without talking down, while avoiding unnecessary jargon.

### Core Directive:
Provide a comprehensive, evidence-grounded synthesis on canine care, behavioral traits, and responsible ownership.

### Required Sections:
1. **Executive Overview**: Define core principles and significance in 2 concise paragraphs.
2. **Key Architectural Pillars**: Itemize 3 to 4 critical dimensions with real-world examples.
3. **Common Pitfalls & Mitigations**: List 3 frequent misunderstandings and how to prevent them.
4. **Actionable Checklist**: Step-by-step verification points for immediate execution.`,
    tags: ["canine", "structured", "production", "v5"],
    notes: "Evolved through PromptForge Optimizer from a weak prompt to an evidence-backed structure.",
    createdAt: 1715000000000,
    updatedAt: 1715003600000,
    currentVersionId: "ver_seed_canine_v3",
    versions: [
      {
        id: "ver_seed_canine_v1",
        versionNumber: 1,
        content: "write about dogs",
        notes: "Initial weak prompt: Vague directives, zero context, no constraints.",
        timestamp: 1715000000000,
        metrics: {
          relevance: 3,
          clarity: 3,
          correctness: 4,
          constraintFollowing: 2,
          wordCount: 3,
          tokens: 18,
          latencyMs: 380,
        },
      },
      {
        id: "ver_seed_canine_v2",
        versionNumber: 2,
        content: `You are a veterinarian. Explain how to care for a new dog for first-time owners.
List the main health, dietary, and training steps with bullet points.`,
        notes: "Added basic persona and context, but lacked formal constraints and verification schema.",
        timestamp: 1715001800000,
        metrics: {
          relevance: 4,
          clarity: 4,
          correctness: 4,
          constraintFollowing: 3,
          wordCount: 29,
          tokens: 45,
          latencyMs: 440,
        },
      },
      {
        id: "ver_seed_canine_v3",
        versionNumber: 3,
        content: `You are an authoritative Veterinary Behavioral Specialist and Canine Nutritionist.

### Context & Target Audience:
This guide is engineered for prospective and first-time dog owners preparing for adoption.
Address foundational concepts without talking down, while avoiding unnecessary jargon.

### Core Directive:
Provide a comprehensive, evidence-grounded synthesis on canine care, behavioral traits, and responsible ownership.

### Required Sections:
1. **Executive Overview**: Define core principles and significance in 2 concise paragraphs.
2. **Key Architectural Pillars**: Itemize 3 to 4 critical dimensions with real-world examples.
3. **Common Pitfalls & Mitigations**: List 3 frequent misunderstandings and how to prevent them.
4. **Actionable Checklist**: Step-by-step verification points for immediate execution.`,
        notes: "Production prompt: Multi-section architecture, target audience boundaries, and checklist.",
        timestamp: 1715003600000,
        metrics: {
          relevance: 5,
          clarity: 5,
          correctness: 5,
          constraintFollowing: 5,
          wordCount: 98,
          tokens: 140,
          latencyMs: 520,
        },
      },
    ],
  },
  {
    id: "prompt_seed_security",
    title: "OWASP API Security Audit Blueprint",
    content: `You are a Principal Application Security Architect conducting a static vulnerability audit.

### Target:
Evaluate the provided API route handler against OWASP Top 10 API Security Risks (2023).

### Strict Output Schema:
| Vulnerability ID | Vulnerability Name | Severity | Remediation Code Blueprint |
| :--- | :--- | :--- | :--- |

Negative Constraint: Do not include introductory pleasantries or closing disclaimers.`,
    tags: ["security", "audit", "owasp", "structured"],
    notes: "High-compliance prompt template for security code review.",
    createdAt: 1715010000000,
    updatedAt: 1715012000000,
    currentVersionId: "ver_seed_sec_v2",
    versions: [
      {
        id: "ver_seed_sec_v1",
        versionNumber: 1,
        content: "Check this code for security bugs and tell me what is wrong.",
        notes: "Initial informal request.",
        timestamp: 1715010000000,
        metrics: {
          relevance: 3,
          clarity: 3,
          correctness: 4,
          constraintFollowing: 2,
          wordCount: 11,
          tokens: 22,
          latencyMs: 360,
        },
      },
      {
        id: "ver_seed_sec_v2",
        versionNumber: 2,
        content: `You are a Principal Application Security Architect conducting a static vulnerability audit.

### Target:
Evaluate the provided API route handler against OWASP Top 10 API Security Risks (2023).

### Strict Output Schema:
| Vulnerability ID | Vulnerability Name | Severity | Remediation Code Blueprint |
| :--- | :--- | :--- | :--- |

Negative Constraint: Do not include introductory pleasantries or closing disclaimers.`,
        notes: "Enforced OWASP framework alignment and markdown matrix format.",
        timestamp: 1715012000000,
        metrics: {
          relevance: 5,
          clarity: 5,
          correctness: 5,
          constraintFollowing: 5,
          wordCount: 52,
          tokens: 88,
          latencyMs: 490,
        },
      },
    ],
  },
];

export function LibraryView() {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Version Diff selectors
  const [diffVersionAId, setDiffVersionAId] = useState<string>("");
  const [diffVersionBId, setDiffVersionBId] = useState<string>("");

  // Metric trajectory chart metric selector
  const [selectedMetric, setSelectedMetric] = useState<string>("clarity");

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"new" | "edit">("new");
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorTags, setEditorTags] = useState("");
  const [editorNotes, setEditorNotes] = useState("");

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const [copiedNotification, setCopiedNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load prompts from storage on mount
  useEffect(() => {
    const loaded = getSavedPrompts();
    if (loaded.length === 0) {
      // Seed initial data with full version histories
      INITIAL_SEED_PROMPTS.forEach((p) => {
        savePrompt({
          id: p.id,
          title: p.title,
          content: p.content,
          tags: p.tags,
          notes: p.notes,
          versions: p.versions,
        });
      });
      const reloaded = getSavedPrompts();
      setPrompts(reloaded);
      if (reloaded.length > 0) {
        setSelectedPromptId(reloaded[0].id);
      }
    } else {
      setPrompts(loaded);
      if (loaded.length > 0) {
        setSelectedPromptId(loaded[0].id);
      }
    }
  }, []);

  const selectedPrompt = useMemo(() => {
    return prompts.find((p) => p.id === selectedPromptId);
  }, [prompts, selectedPromptId]);

  // Sync Diff version selectors whenever selectedPrompt changes, preserving valid user choices
  useEffect(() => {
    if (selectedPrompt && selectedPrompt.versions && selectedPrompt.versions.length > 0) {
      const vers = selectedPrompt.versions;
      const verIds = new Set(vers.map((v) => v.id));
      const hasValidA = diffVersionAId && verIds.has(diffVersionAId);
      const hasValidB = diffVersionBId && verIds.has(diffVersionBId);

      if (!hasValidA || !hasValidB) {
        if (vers.length >= 2) {
          setDiffVersionAId(vers[0].id);
          setDiffVersionBId(vers[vers.length - 1].id);
        } else {
          setDiffVersionAId(vers[0].id);
          setDiffVersionBId(vers[0].id);
        }
      }
    }
  }, [selectedPrompt, diffVersionAId, diffVersionBId]);

  // Filtered prompt list
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    prompts.forEach((p: SavedPrompt) => p.tags.forEach((t: string) => tagsSet.add(t)));
    return Array.from(tagsSet).sort();
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((p: SavedPrompt) => {
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag =
        selectedTag === "all" || p.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [prompts, searchQuery, selectedTag]);

  // Diff between Version A and Version B
  const computedDiff = useMemo<DiffResult | null>(() => {
    if (!selectedPrompt || !selectedPrompt.versions) return null;
    const verA = selectedPrompt.versions.find((v: PromptVersion) => v.id === diffVersionAId);
    const verB = selectedPrompt.versions.find((v: PromptVersion) => v.id === diffVersionBId);

    if (!verA || !verB) return null;
    return computeLineDiff(verA.content, verB.content);
  }, [selectedPrompt, diffVersionAId, diffVersionBId]);

  // Metric trajectory chart data
  const chartData = useMemo(() => {
    if (!selectedPrompt || !selectedPrompt.versions) return [];
    return selectedPrompt.versions.map((v: PromptVersion) => {
      let metricVal = 0;
      switch (selectedMetric) {
        case "clarity":
          metricVal = v.metrics?.clarity ?? 4;
          break;
        case "relevance":
          metricVal = v.metrics?.relevance ?? 4;
          break;
        case "correctness":
          metricVal = v.metrics?.correctness ?? 4;
          break;
        case "constraints":
          metricVal = v.metrics?.constraintFollowing ?? 3;
          break;
        case "wordCount":
          metricVal = v.metrics?.wordCount ?? v.content.split(/\s+/).filter(Boolean).length;
          break;
        case "tokens":
          metricVal = v.metrics?.tokens ?? Math.round(v.content.length / 4);
          break;
        case "latency":
          metricVal = v.metrics?.latencyMs ?? 400;
          break;
      }

      return {
        versionLabel: `v${v.versionNumber}`,
        value: metricVal,
        date: new Date(v.timestamp).toLocaleDateString(),
        notes: v.notes || "",
      };
    });
  }, [selectedPrompt, selectedMetric]);

  // Handle Restore
  // CRITICAL ACCEPTANCE: "Restoring an old version creates a new version rather than deleting history."
  const handleRestore = (versionId: string) => {
    if (!selectedPrompt) return;

    try {
      const restored = restorePromptVersion(selectedPrompt.id, versionId);
      const updatedList = getSavedPrompts();
      setPrompts(updatedList);
      setSelectedPromptId(restored.id);

      const restoredVer = restored.versions?.[restored.versions.length - 1];
      setToastMessage(
        `Successfully restored to new Version ${restoredVer?.versionNumber}! Complete history preserved.`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : "Restore failed.");
    }
  };

  // Handle Delete
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this prompt from the library?")) return;

    deleteSavedPrompt(id);
    const updated = getSavedPrompts();
    setPrompts(updated);
    if (selectedPromptId === id) {
      setSelectedPromptId(updated[0]?.id || null);
    }
  };

  // Handle Editor Save
  const handleSaveEditor = () => {
    if (!editorContent.trim()) return;

    const tags = editorTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const promptData = {
      id: editorMode === "edit" && selectedPrompt ? selectedPrompt.id : undefined,
      title: editorTitle.trim() || "Untitled Prompt",
      content: editorContent,
      tags,
      notes: editorNotes.trim() || (editorMode === "edit" ? "Updated prompt" : "Initial creation"),
    };

    const saved = savePrompt(promptData);
    const updatedList = getSavedPrompts();
    setPrompts(updatedList);
    setSelectedPromptId(saved.id);
    setIsEditorOpen(false);

    setToastMessage(`Saved! Created Version ${saved.versions?.length || 1}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open Editor for new or edit
  const openNewEditor = () => {
    setEditorMode("new");
    setEditorTitle("");
    setEditorContent("");
    setEditorTags("");
    setEditorNotes("");
    setIsEditorOpen(true);
  };

  const openEditEditor = () => {
    if (!selectedPrompt) return;
    setEditorMode("edit");
    setEditorTitle(selectedPrompt.title);
    setEditorContent(selectedPrompt.content);
    setEditorTags(selectedPrompt.tags.join(", "));
    setEditorNotes("");
    setIsEditorOpen(true);
  };

  // Handle Export
  const handleExport = () => {
    const jsonStr = exportLibraryJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promptforge-library-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMessage("Exported library JSON successfully!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Import
  const handleImport = () => {
    const result = importLibraryJson(importJsonText, importMode);
    if (result.success) {
      const updated = getSavedPrompts();
      setPrompts(updated);
      if (updated.length > 0) {
        setSelectedPromptId(updated[0].id);
      }
      setIsImportModalOpen(false);
      setImportJsonText("");
      setImportStatus(null);
      setToastMessage(`Imported ${result.importedCount} prompts successfully!`);
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setImportStatus(result.error || "Import failed.");
    }
  };

  // Copy Content
  const handleCopyContent = () => {
    if (!selectedPrompt) return;
    navigator.clipboard.writeText(selectedPrompt.content);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-forge-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ember-400 mb-1">
            <Bookmark className="h-4 w-4" />
            <span>Module 5 · Production Prompt Library & Version Control</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-forge-text sm:text-4xl">
            Prompt Library & Version Timeline
          </h1>
          <p className="mt-1 text-sm text-forge-muted max-w-3xl leading-relaxed">
            Store and version production prompt blueprints. Every save creates an immutable version. Inspect line-by-line diffs between any two versions, track quality metrics across revisions, and restore past versions with non-destructive preservation.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Button
            size="sm"
            onClick={openNewEditor}
            className="bg-gradient-to-r from-ember-600 to-amber-600 hover:from-ember-500 hover:to-amber-500 text-white font-mono text-xs shadow flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Prompt</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            className="border-forge-border bg-forge-elevated text-forge-text hover:bg-forge-surface font-mono text-xs flex items-center gap-1.5"
          >
            <Upload className="h-3.5 w-3.5 text-cyan-400" />
            <span>Import</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            className="border-forge-border bg-forge-elevated text-forge-text hover:bg-forge-surface font-mono text-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5 text-ember-400" />
            <span>Export All</span>
          </Button>
          <Link
            href="/labs/optimize"
            className="rounded-md border border-cyan-500/40 bg-cyan-950/20 px-3 py-1.5 text-xs font-mono text-cyan-300 hover:bg-cyan-900/30 flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" />
            <span>Optimizer Lab →</span>
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs font-mono text-emerald-300 flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </motion.div>
      )}

      {/* Search & Tag Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-forge-surface p-3 rounded-lg border border-forge-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-forge-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts by title, content, or tags..."
            className="w-full rounded-md border border-forge-border bg-forge-elevated pl-9 pr-3 py-1.5 text-xs font-mono text-forge-text placeholder:text-forge-subtle focus:border-ember-500 focus:outline-none"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-forge-subtle text-[11px] mr-1">Filter:</span>
          <button
            type="button"
            onClick={() => setSelectedTag("all")}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
              selectedTag === "all"
                ? "border-ember-500 bg-ember-950/40 text-ember-300 font-bold"
                : "border-forge-border bg-forge-elevated text-forge-muted hover:text-white"
            }`}
          >
            All ({prompts.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                selectedTag === tag
                  ? "border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold"
                  : "border-forge-border bg-forge-elevated text-forge-muted hover:text-white"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Catalog List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-forge-muted flex items-center justify-between">
            <span>Saved Prompts ({filteredPrompts.length})</span>
            <span className="text-[10px] text-forge-subtle">Stored in localStorage</span>
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredPrompts.length === 0 ? (
              <div className="rounded-lg border border-forge-border bg-forge-surface p-8 text-center space-y-2">
                <Bookmark className="h-6 w-6 text-forge-subtle mx-auto" />
                <div className="text-xs font-mono text-forge-muted">
                  No matching prompts found.
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openNewEditor}
                  className="text-xs font-mono border-forge-border"
                >
                  Create First Prompt
                </Button>
              </div>
            ) : (
              filteredPrompts.map((item) => {
                const isSelected = item.id === selectedPromptId;
                const versionCount = item.versions?.length || 1;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPromptId(item.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-ember-500 bg-ember-950/20 ring-1 ring-ember-500/50 shadow-md"
                        : "border-forge-border bg-forge-surface hover:border-ember-500/30 hover:bg-forge-surface/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono ${
                            isSelected
                              ? "border-ember-500/50 text-ember-300"
                              : "border-forge-border text-forge-muted"
                          }`}
                        >
                          v{versionCount} ({versionCount} {versionCount === 1 ? "version" : "versions"})
                        </Badge>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          title="Delete prompt"
                          className="text-forge-subtle hover:text-rose-400 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <h4 className="mt-2 text-sm font-bold text-forge-text line-clamp-1">
                        {item.title}
                      </h4>

                      <p className="mt-1 text-xs text-forge-muted font-mono line-clamp-2 leading-relaxed">
                        {item.content}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-forge-border/60 flex items-center justify-between text-[10px] font-mono text-forge-subtle">
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.tags.slice(0, 3).map((t: string) => (
                          <span key={t} className="text-cyan-400/90">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Prompt Detail, Version Timeline, Chart, & Diff (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPrompt ? (
            <div className="space-y-6">
              {/* Selected Prompt Header & Actions */}
              <Card className="border-forge-border bg-forge-surface p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-forge-border/60 pb-3">
                  <div>
                    <h2 className="text-xl font-bold text-forge-text font-mono">
                      {selectedPrompt.title}
                    </h2>
                    <div className="mt-1 flex items-center gap-3 text-xs font-mono text-forge-muted flex-wrap">
                      <span>
                        Current: <strong>v{selectedPrompt.versions?.length || 1}</strong>
                      </span>
                      <span>•</span>
                      <span>Created {new Date(selectedPrompt.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Updated {new Date(selectedPrompt.updatedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={openEditEditor}
                      className="border-forge-border bg-forge-elevated text-xs font-mono hover:text-white"
                    >
                      Create New Version (Edit)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyContent}
                      className="border-forge-border bg-forge-elevated text-xs font-mono flex items-center gap-1"
                    >
                      {copiedNotification ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-forge-muted" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Active Prompt Content */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-forge-muted">
                    <span>Active Version Content:</span>
                    <span>
                      {selectedPrompt.content.split(/\s+/).filter(Boolean).length} words · {selectedPrompt.content.length} characters
                    </span>
                  </div>
                  <pre className="rounded-xl border border-indigo/10 bg-cream/70 p-4 text-xs font-mono text-indigo whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {selectedPrompt.content}
                  </pre>
                </div>

                {/* Tags & Notes */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-mono pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Tag className="h-3.5 w-3.5 text-forge-subtle" />
                    {selectedPrompt.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded bg-forge-elevated px-2 py-0.5 text-[11px] text-cyan-300 border border-forge-border"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  {selectedPrompt.notes && (
                    <div className="text-[11px] text-forge-muted italic">
                      Note: {selectedPrompt.notes}
                    </div>
                  )}
                </div>
              </Card>

              {/* Version Metric Trajectory Chart */}
              <Card className="border-forge-border bg-forge-surface p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-bold font-mono text-forge-text">
                      Metric Trajectory Across Versions
                    </h3>
                  </div>

                  {/* Metric Choice Dropdown */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-forge-muted">Metric:</span>
                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value)}
                      className="rounded border border-forge-border bg-forge-elevated px-2.5 py-1 text-xs text-forge-text focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="clarity">Clarity (1-5)</option>
                      <option value="relevance">Relevance (1-5)</option>
                      <option value="correctness">Correctness (1-5)</option>
                      <option value="constraints">Constraints (1-5)</option>
                      <option value="wordCount">Word Count</option>
                      <option value="tokens">Total Tokens</option>
                      <option value="latency">Latency (ms)</option>
                    </select>
                  </div>
                </div>

                {/* Recharts Trajectory Line Chart */}
                <div className="h-48 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="versionLabel"
                        stroke="#5A6272"
                        fontSize={11}
                        fontFamily="monospace"
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#5A6272"
                        fontSize={11}
                        fontFamily="monospace"
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          fontFamily: "monospace",
                          fontSize: "11px",
                          color: "#1E1B4B",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={selectedMetric}
                        stroke="#00E5FF"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#FF7A1A", stroke: "#07080B", strokeWidth: 1.5 }}
                        activeDot={{ r: 6, fill: "#00E5FF" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Version Timeline with Non-Destructive Restore */}
              <Card className="border-forge-border bg-forge-surface p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-forge-border pb-3">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-ember-400" />
                    <h3 className="text-sm font-bold font-mono text-forge-text">
                      Version Timeline ({selectedPrompt.versions?.length || 1} Revisions)
                    </h3>
                  </div>
                  <div className="text-[11px] font-mono text-cyan-400">
                    Restoring creates a new version (history preserved)
                  </div>
                </div>

                <div className="space-y-3 font-mono">
                  {selectedPrompt.versions &&
                    [...selectedPrompt.versions].reverse().map((ver) => {
                      const isCurrent = ver.id === selectedPrompt.currentVersionId;

                      return (
                        <div
                          key={ver.id}
                          className={`rounded-lg border p-3.5 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                            isCurrent
                              ? "border-ember-500/60 bg-ember-950/20"
                              : "border-forge-border bg-forge-elevated/60"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  isCurrent
                                    ? "border-ember-500 text-ember-300 font-bold"
                                    : "border-forge-border text-forge-muted"
                                }`}
                              >
                                Version {ver.versionNumber}
                              </Badge>
                              {isCurrent && (
                                <span className="text-[10px] font-bold text-ember-400">
                                  ● ACTIVE
                                </span>
                              )}
                              <span className="text-[11px] text-forge-subtle">
                                {new Date(ver.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-forge-text font-sans line-clamp-1">
                              {ver.notes || "Version draft"}
                            </p>
                            <div className="text-[11px] text-forge-muted">
                              {ver.content.split(/\s+/).filter(Boolean).length} words ·{" "}
                              {ver.metrics?.clarity ? `Clarity ${ver.metrics.clarity}/5` : "Unrated"}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            {!isCurrent && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRestore(ver.id)}
                                className="border-amber-500/40 text-amber-300 bg-amber-950/20 hover:bg-amber-900/30 text-xs font-mono flex items-center gap-1"
                              >
                                <RotateCcw className="h-3 w-3" />
                                <span>Restore as New Version</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card>

              {/* Version Diff Between Any Two Versions */}
              {selectedPrompt.versions && selectedPrompt.versions.length >= 2 && (
                <Card className="border-forge-border bg-forge-surface p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-forge-border pb-3">
                    <div className="flex items-center gap-2">
                      <Split className="h-4 w-4 text-cyan-400" />
                      <h3 className="text-sm font-bold font-mono text-forge-text">
                        Diff Between Any Two Versions
                      </h3>
                    </div>

                    {/* Version Pair Selectors */}
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <select
                        value={diffVersionAId}
                        onChange={(e) => setDiffVersionAId(e.target.value)}
                        className="rounded border border-forge-border bg-forge-elevated px-2 py-1 text-xs text-forge-text focus:outline-none"
                      >
                        {selectedPrompt.versions.map((v: PromptVersion) => (
                          <option key={v.id} value={v.id}>
                            Version {v.versionNumber} ({new Date(v.timestamp).toLocaleDateString()})
                          </option>
                        ))}
                      </select>

                      <span className="text-forge-muted font-bold">→</span>

                      <select
                        value={diffVersionBId}
                        onChange={(e) => setDiffVersionBId(e.target.value)}
                        className="rounded border border-forge-border bg-forge-elevated px-2 py-1 text-xs text-forge-text focus:outline-none"
                      >
                        {selectedPrompt.versions.map((v: PromptVersion) => (
                          <option key={v.id} value={v.id}>
                            Version {v.versionNumber} ({new Date(v.timestamp).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Diff Summary Badge */}
                  {computedDiff && (
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">+{computedDiff.summary.added} added</span>
                        <span className="text-rose-400">-{computedDiff.summary.removed} removed</span>
                        <span className="text-amber-400">~{computedDiff.summary.modified} modified</span>
                        <span className="text-forge-subtle">={computedDiff.summary.unchanged} unchanged</span>
                      </div>
                    </div>
                  )}

                  {/* Diff Lines Render */}
                  <div className="rounded-xl border border-indigo/10 bg-cream/70 overflow-hidden font-mono text-xs max-h-96 overflow-y-auto">
                    {computedDiff &&
                      computedDiff.lines.map((line, idx) => {
                        let bgClass = "bg-transparent";
                        let textClass = "text-forge-muted";
                        let symbol = " ";

                        if (line.type === "added") {
                          bgClass = "bg-emerald-950/30 text-emerald-300";
                          textClass = "text-emerald-300 font-medium";
                          symbol = "+";
                        } else if (line.type === "removed") {
                          bgClass = "bg-rose-950/30 text-rose-300";
                          textClass = "text-rose-300 line-through opacity-80";
                          symbol = "-";
                        } else if (line.type === "modified") {
                          bgClass = "bg-amber-950/25 text-amber-200";
                          textClass = "text-amber-200";
                          symbol = "~";
                        }

                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-3 px-3 py-1.5 transition-colors ${bgClass}`}
                          >
                            <div className="w-5 shrink-0 text-right select-none text-forge-subtle text-[11px]">
                              {line.improvedLineNumber ?? line.originalLineNumber ?? idx + 1}
                            </div>
                            <div className="w-3 shrink-0 font-bold select-none text-center">
                              {symbol}
                            </div>
                            <div className={`flex-1 break-words whitespace-pre-wrap ${textClass}`}>
                              {line.type === "modified" && line.oldText ? (
                                <div>
                                  <div className="line-through text-rose-400/80 mb-0.5">
                                    - {line.oldText}
                                  </div>
                                  <div className="text-emerald-300">
                                    + {line.newText || line.text}
                                  </div>
                                </div>
                              ) : (
                                line.text
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card className="border-forge-border bg-forge-surface p-12 text-center space-y-3">
              <Bookmark className="h-8 w-8 text-forge-subtle mx-auto" />
              <h3 className="text-base font-bold font-mono text-forge-text">
                Select a Prompt
              </h3>
              <p className="text-xs text-forge-muted max-w-sm mx-auto">
                Choose a prompt from the catalog on the left to inspect its version timeline, trajectory chart, and diff.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Editor Modal (New or Edit) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-xl border border-forge-border bg-forge-surface p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-forge-border pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-ember-400" />
                <h3 className="text-lg font-bold text-forge-text font-mono">
                  {editorMode === "new" ? "Create New Prompt" : "Create New Version (Edit Prompt)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-forge-muted hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-forge-muted">Prompt Title</label>
                <input
                  type="text"
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  placeholder="e.g. Production Data Extraction Schema"
                  className="w-full rounded-md border border-forge-border bg-forge-elevated p-2 text-forge-text focus:border-ember-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-forge-muted">Prompt Content</label>
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  placeholder="Type your system/user prompt..."
                  rows={8}
                  className="w-full rounded-md border border-forge-border bg-forge-elevated p-3 text-forge-text focus:border-ember-500 focus:outline-none font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-forge-muted">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editorTags}
                    onChange={(e) => setEditorTags(e.target.value)}
                    placeholder="e.g. structured, json, audit"
                    className="w-full rounded-md border border-forge-border bg-forge-elevated p-2 text-forge-text focus:border-ember-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-forge-muted">Version Note / Commit Message</label>
                  <input
                    type="text"
                    value={editorNotes}
                    onChange={(e) => setEditorNotes(e.target.value)}
                    placeholder="e.g. Added negative constraints"
                    className="w-full rounded-md border border-forge-border bg-forge-elevated p-2 text-forge-text focus:border-ember-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditorOpen(false)}
                className="border-forge-border text-forge-muted"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEditor}
                className="bg-ember-600 hover:bg-ember-500 text-white font-mono text-xs"
              >
                {editorMode === "new" ? "Save Prompt" : "Save as New Version"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl rounded-xl border border-forge-border bg-forge-surface p-6 shadow-2xl space-y-4 font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-forge-border pb-3">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-forge-text">
                  Import Prompts JSON
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-forge-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-forge-muted">
                  Paste JSON Export or Array of Prompts:
                </label>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='{"prompts": [ ... ]}'
                  rows={8}
                  className="w-full rounded-md border border-forge-border bg-forge-elevated p-3 text-forge-text focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="text-forge-muted">Import Strategy:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={importMode === "merge"}
                    onChange={() => setImportMode("merge")}
                  />
                  <span>Merge (Preserve existing)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={importMode === "replace"}
                    onChange={() => setImportMode("replace")}
                  />
                  <span>Replace (Overwrite all)</span>
                </label>
              </div>

              {importStatus && (
                <div className="rounded border border-rose-500/40 bg-rose-950/20 p-2.5 text-rose-300">
                  {importStatus}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(false)}
                className="border-forge-border text-forge-muted"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleImport}
                disabled={!importJsonText.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs"
              >
                Execute Import
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
