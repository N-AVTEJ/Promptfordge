"use client";

import * as React from "react";
import { Play, Pause, Video, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface YouTubeEmbedRef {
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
}

export interface YouTubeEmbedProps {
  youtubeId?: string | null;
  title: string;
  onTimeUpdate?: (seconds: number) => void;
  className?: string;
  duration?: number;
}

export const YouTubeEmbed = React.forwardRef<YouTubeEmbedRef, YouTubeEmbedProps>(
  (
    {
      youtubeId,
      title,
      onTimeUpdate,
      className,
      duration = 720,
    },
    ref
  ) => {
    const isPlaceholder =
      !youtubeId ||
      youtubeId === "TODO" ||
      youtubeId.startsWith("TODO") ||
      youtubeId.trim() === "";

    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [seekFeedback, setSeekFeedback] = React.useState<string | null>(null);
    const totalDuration = Math.max(720, duration);

    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const seekTo = React.useCallback(
      (seconds: number) => {
        const targetSeconds = Math.max(0, seconds);
        setCurrentTime(targetSeconds);
        onTimeUpdate?.(targetSeconds);

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
      [onTimeUpdate]
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

    // Mock ticker for placeholder mode
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

    const iframeSrc = React.useMemo(() => {
      if (isPlaceholder || !youtubeId) return "";
      return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
        youtubeId
      )}?enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3`;
    }, [isPlaceholder, youtubeId]);

    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-indigo-950/10 bg-white shadow-card transition-shadow hover:shadow-card-hover",
          className
        )}
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-cream">
          {!isPlaceholder ? (
            /* Privacy-enhanced YouTube Iframe Embed */
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              title={title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0 rounded-2xl"
            />
          ) : (
            /* Friendly "Video coming soon" Card with Thumbnail Placeholder */
            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-br from-butter/60 via-cream to-lavender/40 p-6 sm:p-8 select-none">
              {/* Top Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-coral/30 bg-coral/10 text-coral">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-sans text-xs font-bold uppercase tracking-wider text-coral">
                      Lesson Studio Preview
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-violet/30 bg-violet/10 px-3 py-1 text-xs font-semibold text-violet">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Video coming soon</span>
                </div>
              </div>

              {/* Center Friendly Thumbnail Placeholder */}
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="group relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-coral text-white shadow-coral-glow transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-coral"
                  aria-label={isPlaying ? "Pause simulated walkthrough" : "Play simulated walkthrough"}
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="ml-1 h-8 w-8" />
                  )}
                </button>

                <h3 className="mt-4 max-w-md font-sans text-base sm:text-lg font-bold text-indigo">
                  {title}
                </h3>

                <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-indigo-900/70">
                  Full studio video walkthrough is in post-production. You can explore the structured notes, timestamp index, and live challenge below right now!
                </p>

                {seekFeedback && (
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-coral/30 bg-coral/10 px-3 py-1 font-mono text-xs font-semibold text-coral animate-pulse">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{seekFeedback}</span>
                  </div>
                )}
              </div>

              {/* Bottom Scrubber & Controls */}
              <div className="space-y-2">
                <div
                  className="relative h-2 w-full cursor-pointer rounded-full bg-indigo-950/10 overflow-hidden"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
                    seekTo(Math.round(fraction * totalDuration));
                  }}
                  role="slider"
                  aria-label="Simulation Scrubber"
                  aria-valuenow={currentTime}
                  aria-valuemin={0}
                  aria-valuemax={totalDuration}
                  tabIndex={0}
                >
                  <div
                    className="h-full bg-coral transition-all duration-150 rounded-full"
                    style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between font-mono text-[11px] text-indigo-900/60">
                  <span>{formatTime(currentTime)}</span>
                  <span className="flex items-center gap-1 text-teal font-medium">
                    <Sparkles className="h-3 w-3" /> Interactive simulation mode
                  </span>
                  <span>{formatTime(totalDuration)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

YouTubeEmbed.displayName = "YouTubeEmbed";

// Re-export as YouTubePlayer for seamless backwards compatibility
export const YouTubePlayer = YouTubeEmbed;
