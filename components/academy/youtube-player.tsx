"use client";

import * as React from "react";
import { Play, Pause, RotateCcw, Volume2, Maximize2, Video, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface YouTubePlayerRef {
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
}

export interface YouTubePlayerProps {
  youtubeId: string;
  title: string;
  onTimeUpdate?: (seconds: number) => void;
  className?: string;
  aspectRatio?: "16/9" | "4/3";
  duration?: number;
}

export const YouTubePlayer = React.forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  (
    {
      youtubeId,
      title,
      onTimeUpdate,
      className,
      aspectRatio = "16/9",
      duration = 720,
    },
    ref
  ) => {
    const isPlaceholder = !youtubeId || youtubeId.startsWith("TODO");
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const [origin, setOrigin] = React.useState<string>("");

    // Mock player state for placeholders
    const [currentTime, setCurrentTime] = React.useState(0);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [isMuted, setIsMuted] = React.useState(false);
    const [seekFeedback, setSeekFeedback] = React.useState<string | null>(null);
    const totalDuration = Math.max(720, duration);

    React.useEffect(() => {
      if (typeof window !== "undefined" && window.location.origin) {
        setOrigin(window.location.origin);
      }
    }, []);

    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // Imperative seek methods for parent / timestamp chips
    const seekTo = React.useCallback(
      (seconds: number) => {
        // Only clamp to totalDuration for mock placeholder mode; real videos seek freely
        const targetSeconds = isPlaceholder
          ? Math.max(0, Math.min(seconds, totalDuration))
          : Math.max(0, seconds);

        setCurrentTime(targetSeconds);
        onTimeUpdate?.(targetSeconds);

        // Visual flash feedback
        setSeekFeedback(`Seeked to ${formatTime(targetSeconds)}`);
        const timer = setTimeout(() => setSeekFeedback(null), 1800);

        if (iframeRef.current && iframeRef.current.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({
                event: "command",
                func: "seekTo",
                args: [targetSeconds, true],
              }),
              "*"
            );
          } catch {
            // Ignore postMessage cross-origin restrictions
          }
        }

        return () => clearTimeout(timer);
      },
      [isPlaceholder, onTimeUpdate, totalDuration]
    );

    const play = React.useCallback(() => {
      setIsPlaying(true);
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "playVideo", args: [] }),
            "*"
          );
        } catch {
          // Ignore
        }
      }
    }, []);

    const pause = React.useCallback(() => {
      setIsPlaying(false);
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
            "*"
          );
        } catch {
          // Ignore
        }
      }
    }, []);

    React.useImperativeHandle(
      ref,
      () => ({
        seekTo,
        play,
        pause,
      }),
      [seekTo, play, pause]
    );

    // Mock playback ticker when playing placeholder
    React.useEffect(() => {
      if (!isPlaying || !isPlaceholder) return;
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          const next = prev + 1;
          onTimeUpdate?.(next);
          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }, [isPlaying, isPlaceholder, onTimeUpdate, totalDuration]);

    const handleIframeLoad = () => {
      // Announce readiness to YouTube IFrame API
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "listening" }),
            "*"
          );
        } catch {
          // Ignore
        }
      }
    };

    const iframeSrc = React.useMemo(() => {
      if (isPlaceholder) return "";
      const base = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
        youtubeId
      )}?enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3`;
      return origin ? `${base}&origin=${encodeURIComponent(origin)}` : base;
    }, [isPlaceholder, youtubeId, origin]);

    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-forge-lg border border-forge-border bg-forge-black shadow-forge",
          className
        )}
      >
        <div
          className={cn(
            "relative w-full",
            aspectRatio === "4/3" ? "aspect-[4/3]" : "aspect-video"
          )}
        >
          {!isPlaceholder ? (
            /* Privacy-enhanced YouTube Iframe Embed */
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              title={title}
              loading="lazy"
              onLoad={handleIframeLoad}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            /* Sleek Studio Mock Video Player for TODO placeholders */
            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-forge-950 via-forge-surface to-forge-950 p-4 sm:p-6 select-none">
              {/* Top Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-forge bg-ember-500/20 text-ember-400">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-ember-400">
                      Studio Walkthrough
                    </span>
                    <span className="ml-2 font-mono text-[10px] text-forge-subtle">
                      ({youtubeId})
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-forge bg-forge-elevated/80 px-2 py-0.5 text-[11px] font-mono text-forge-muted border border-forge-border">
                  <Info className="h-3 w-3 text-cyan-400" />
                  <span>Placeholder Mode</span>
                </div>
              </div>

              {/* Center Play Button & Visualizer */}
              <div className="flex flex-col items-center justify-center py-4">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="group relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-ember-500/20 text-ember-400 border border-ember-500/40 shadow-ember-glow transition-all hover:scale-105 hover:bg-ember-500/30 focus:outline-none focus:ring-2 focus:ring-ember-500"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {isPlaying ? (
                    <Pause className="h-7 w-7 sm:h-8 sm:w-8 transition-transform group-hover:scale-110" />
                  ) : (
                    <Play className="ml-1 h-7 w-7 sm:h-8 sm:w-8 transition-transform group-hover:scale-110" />
                  )}
                </button>

                <p className="mt-4 text-center text-xs font-medium text-forge-muted max-w-sm">
                  {title}
                </p>

                {/* Animated Seek Banner */}
                {seekFeedback && (
                  <div className="mt-2 rounded-forge bg-ember-500/20 px-3 py-1 font-mono text-xs font-semibold text-ember-300 border border-ember-500/40 animate-pulse">
                    ⚡ {seekFeedback}
                  </div>
                )}
              </div>

              {/* Bottom Scrubber & Controls */}
              <div className="space-y-2">
                {/* Scrubber Progress Bar */}
                <div
                  className="relative h-2 w-full cursor-pointer rounded-full bg-forge-border"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = (e.clientX - rect.left) / rect.width;
                    seekTo(Math.round(ratio * totalDuration));
                  }}
                  role="slider"
                  aria-label="Video scrubber"
                  aria-valuenow={currentTime}
                  aria-valuemin={0}
                  aria-valuemax={totalDuration}
                >
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-ember-500 to-cyan-400 transition-all"
                    style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-forge-muted font-mono">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="hover:text-forge-text"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => seekTo(0)}
                      className="hover:text-forge-text"
                      title="Restart video"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <span>
                      {formatTime(currentTime)} / {formatTime(totalDuration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="hover:text-forge-text"
                    >
                      <Volume2 className={cn("h-4 w-4", isMuted && "opacity-40")} />
                    </button>
                    <button
                      type="button"
                      className="hover:text-forge-text"
                      onClick={() => seekTo(currentTime)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

YouTubePlayer.displayName = "YouTubePlayer";
