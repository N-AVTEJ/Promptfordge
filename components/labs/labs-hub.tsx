"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FlaskConical,
  ArrowRight,
  BookOpen,
  Search,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CURRICULUM_MODULES } from "@/content/modules";
import { cn } from "@/lib/utils";

export function LabsHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "full" | "lite">("all");
  const [hoveredLabId, setHoveredLabId] = useState<string | null>(null);

  // Collect all labs grouped by module 1 to 12
  const groupedModules = useMemo(() => {
    return CURRICULUM_MODULES.map((mod) => {
      const matchingLabs = mod.labs.filter((lab) => {
        if (statusFilter !== "all" && lab.status !== statusFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const inTitle = lab.title.toLowerCase().includes(q);
          const inRoute = lab.route.toLowerCase().includes(q);
          const inModTitle = mod.title.toLowerCase().includes(q);
          const inTopics = mod.topics?.some((t) => t.toLowerCase().includes(q));
          const inTask =
            typeof lab.loadsTask === "string" && lab.loadsTask.toLowerCase().includes(q);
          if (!inTitle && !inRoute && !inModTitle && !inTopics && !inTask) {
            return false;
          }
        }
        return true;
      });

      return {
        module: mod,
        labs: matchingLabs,
      };
    }).filter((group) => group.labs.length > 0);
  }, [searchQuery, statusFilter]);

  const totalLabsCount = useMemo(
    () => CURRICULUM_MODULES.reduce((acc, m) => acc + m.labs.length, 0),
    []
  );

  const fullLabsCount = useMemo(
    () =>
      CURRICULUM_MODULES.reduce(
        (acc, m) => acc + m.labs.filter((l) => l.status === "full").length,
        0
      ),
    []
  );

  const liteLabsCount = totalLabsCount - fullLabsCount;

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="rounded-3xl border border-navy/10 bg-white p-8 sm:p-12 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-ultramarine/10 px-3.5 py-1 text-xs font-mono font-bold text-ultramarine border border-ultramarine/20">
              <FlaskConical className="h-4 w-4" />
              <span>Interactive Engineering Laboratories · {totalLabsCount} Labs Across {CURRICULUM_MODULES.length} Modules</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-navy font-sans">
              Laboratory Index
            </h1>
            <p className="text-sm sm:text-base text-navy/75 leading-[1.7] max-w-[68ch]">
              Every curriculum module couples mental models with at least one interactive visualizer.
              From 6-stage transformer tokenization to adversarial red-teaming and production evaluation pipelines.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-navy/10 bg-daylight p-5 shadow-xs shrink-0 text-center font-mono">
            <div className="p-2">
              <div className="text-2xl font-black text-navy">{totalLabsCount}</div>
              <div className="text-[11px] text-navy/60 uppercase">Total Labs</div>
            </div>
            <div className="border-x border-navy/10 p-2">
              <div className="text-2xl font-black text-ultramarine">{fullLabsCount}</div>
              <div className="text-[11px] text-navy/60 uppercase">Full Labs</div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-black text-mint-700">{liteLabsCount}</div>
              <div className="text-[11px] text-navy/60 uppercase">Lite Labs</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-navy/10 pt-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search labs, routes, topics, or modules..."
              className="w-full rounded-xl border border-navy/15 bg-daylight pl-10 pr-4 py-2 text-xs font-medium text-navy placeholder:text-navy/40 focus:border-ultramarine focus:outline-none focus:ring-1 focus:ring-ultramarine/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy text-xs font-mono"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-navy/50 mr-1 hidden sm:inline">
              Filter:
            </span>
            {(
              [
                { id: "all", label: `All (${totalLabsCount})` },
                { id: "full", label: `Full (${fullLabsCount})` },
                { id: "lite", label: `Lite (${liteLabsCount})` },
              ] as const
            ).map((filter) => {
              const active = statusFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                    active
                      ? "bg-ultramarine text-white shadow-xs"
                      : "bg-daylight text-navy/70 hover:bg-navy/5 hover:text-navy"
                  )}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Structured List Grouped by Module 1 to 12 */}
      {groupedModules.length === 0 ? (
        <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center shadow-xs space-y-3">
          <p className="text-sm font-semibold text-navy">
            No visual laboratories match your search & filter criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="text-xs gap-1.5 mt-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Search & Filters</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedModules.map(({ module: mod, labs }) => (
            <div
              key={mod.id}
              className="rounded-3xl border border-navy/10 bg-white shadow-sm overflow-hidden"
            >
              {/* Module Marker Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy/10 bg-daylight/60 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-navy px-3 py-1 font-mono text-xs font-bold text-white shadow-xs">
                    Module {String(mod.number).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="font-sans text-base font-bold text-navy">
                      {mod.title}
                    </h2>
                    <p className="text-xs font-mono text-ultramarine font-semibold">
                      {mod.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/academy/${mod.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-ultramarine hover:underline"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Module Overview & Lessons</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Module Labs Structured Entries */}
              <div className="divide-y divide-navy/10">
                {labs.map((lab) => {
                  const isHovered = hoveredLabId === lab.id;
                  const taskQuery = lab.loadsTask
                    ? `?task=${encodeURIComponent(
                        typeof lab.loadsTask === "string"
                          ? lab.loadsTask
                          : JSON.stringify(lab.loadsTask)
                      )}`
                    : "";
                  const labHref = `${lab.route}${taskQuery}`;

                  return (
                    <div
                      key={lab.id}
                      tabIndex={0}
                      onMouseEnter={() => setHoveredLabId(lab.id)}
                      onMouseLeave={() => setHoveredLabId(null)}
                      onFocus={() => setHoveredLabId(lab.id)}
                      onBlur={() => setHoveredLabId(null)}
                      className={cn(
                        "group p-6 transition-all outline-none",
                        isHovered ? "bg-ultramarine/[0.02]" : "hover:bg-daylight/40"
                      )}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Main Lab Info */}
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-sans text-lg font-bold text-navy">
                              {lab.title}
                            </h3>

                            {lab.status === "full" ? (
                              <span className="rounded-full bg-mint-100 border border-mint-300 px-2.5 py-0.5 font-mono text-[10px] font-bold text-mint-800">
                                Full Lab
                              </span>
                            ) : (
                              <span className="rounded-full bg-daylight border border-navy/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-navy/70">
                                Lite
                              </span>
                            )}

                            <span className="font-mono text-xs text-navy/40">
                              {lab.route}
                            </span>
                          </div>

                          {/* Practiced Topics Pills */}
                          {mod.topics && mod.topics.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[11px] font-mono text-navy/50 mr-1">
                                Practices:
                              </span>
                              {mod.topics.map((topic, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="rounded-md border border-navy/10 bg-daylight px-2 py-0.5 text-[10px] font-mono text-navy/75"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Lab Launch Action */}
                        <div className="flex items-center gap-3 shrink-0">
                          <Link
                            href={labHref}
                            className="inline-flex items-center gap-2 rounded-xl bg-ultramarine px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-ultramarine/90 transition-all group-hover:shadow-md"
                          >
                            <span>Launch Lab</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>

                      {/* Interactive Hover / Focus Preview Details */}
                      <div
                        className={cn(
                          "mt-4 rounded-2xl border transition-all overflow-hidden",
                          isHovered
                            ? "border-ultramarine/30 bg-white p-4 opacity-100 max-h-96 shadow-xs"
                            : "border-transparent bg-daylight/50 p-3 opacity-90 max-h-32 text-navy/70"
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ultramarine block">
                              Preloaded Task Specification
                            </span>
                            <p className="font-mono text-xs text-navy leading-relaxed font-medium">
                              {typeof lab.loadsTask === "string"
                                ? lab.loadsTask
                                : JSON.stringify(lab.loadsTask)}
                            </p>
                          </div>

                          <div className="text-right shrink-0 hidden sm:block">
                            <span className="font-mono text-[10px] text-navy/50 block">
                              Status Engine
                            </span>
                            <span className="font-mono text-xs font-semibold text-navy">
                              {lab.status === "full"
                                ? "Dedicated Interactive Studio"
                                : "Shared Execution Engine (Lite)"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
