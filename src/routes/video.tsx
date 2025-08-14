import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { ShakaPlayer } from "~/components/shaka/shakaplayer";

export const Route = createFileRoute("/video")({
  component: VideoPage,
});

function VideoPage() {
  // A public DASH test manifest from Akamai/Google. Replace with any valid DASH URL.
  const demoSrc =
    "https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd";

  const [logs, setLogs] = React.useState<Array<{ ts: number; type: string; detail?: unknown }>>([]);
  const addLog = React.useCallback((type: string, detail?: unknown) => {
    setLogs((prev) => [{ ts: Date.now(), type, detail }, ...prev].slice(0, 200));
  }, []);
  const clearLogs = React.useCallback(() => setLogs([]), []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-zinc-900 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Video</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
            Demonstration of the unstyled ShakaPlayer component with theming support.
          </p>
        </div>

        <section className="w-full">
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-xs dark:border-zinc-700 dark:bg-zinc-900">
              <ShakaPlayer
                src={demoSrc}
                autoPlay={false}
                className="w-full aspect-video bg-black rounded-md"
                onReady={() => addLog('ready')}
                onShakaError={(err) => addLog('error', {
                  code: (err as any)?.code,
                  severity: (err as any)?.severity,
                  category: (err as any)?.category,
                  data: (err as any)?.data,
                })}
                onShakaBuffering={(buffering) => addLog('buffering', { buffering })}
                onShakaAdaptation={() => addLog('adaptation')}
                onShakaTracksChanged={() => addLog('trackschanged')}
                onShakaVariantChanged={(variant) => addLog('variantchanged', {
                  id: (variant as any)?.id,
                  bandwidth: (variant as any)?.bandwidth,
                  videoCodec: (variant as any)?.videoCodec,
                  audioCodec: (variant as any)?.audioCodec,
                })}
                onShakaTextChanged={() => addLog('textchanged')}
                onShakaTextTrackVisibility={(visible) => addLog('texttrackvisibility', { visible })}
                // Native video events
                onPlay={() => addLog('video:play')}
                onPause={() => addLog('video:pause')}
                onSeeking={() => addLog('video:seeking')}
                onSeeked={() => addLog('video:seeked')}
                onEnded={() => addLog('video:ended')}
                onLoadedMetadata={(e) => addLog('video:loadedmetadata', {
                  duration: (e.currentTarget as HTMLVideoElement).duration,
                  videoWidth: (e.currentTarget as HTMLVideoElement).videoWidth,
                  videoHeight: (e.currentTarget as HTMLVideoElement).videoHeight,
                })}
                onCanPlay={() => addLog('video:canplay')}
                onCanPlayThrough={() => addLog('video:canplaythrough')}
                onWaiting={() => addLog('video:waiting')}
                onStalled={() => addLog('video:stalled')}
                onProgress={(e) => {
                  const el = e.currentTarget as HTMLVideoElement;
                  const ranges = el.buffered;
                  const buffered = Array.from({ length: ranges?.length ?? 0 }, (_, i) => ({
                    start: ranges.start(i),
                    end: ranges.end(i),
                  }));
                  addLog('video:progress', { buffered });
                }}
                onDurationChange={(e) => addLog('video:durationchange', {
                  duration: (e.currentTarget as HTMLVideoElement).duration,
                })}
                onVolumeChange={(e) => addLog('video:volumechange', {
                  volume: (e.currentTarget as HTMLVideoElement).volume,
                  muted: (e.currentTarget as HTMLVideoElement).muted,
                })}
                onRateChange={(e) => addLog('video:ratechange', {
                  playbackRate: (e.currentTarget as HTMLVideoElement).playbackRate,
                })}
              />
              <p className="mt-3 text-xs text-gray-600 dark:text-zinc-400">
                If playback fails, verify your network allows access to the demo URL and check the console for Shaka
                error details.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-xs dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">Events (Shaka + video)</h2>
                <button
                  type="button"
                  onClick={clearLogs}
                  className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Clear
                </button>
              </div>
              <div className="h-80 md:max-h-[60vh] overflow-auto rounded bg-gray-50 dark:bg-zinc-950 p-2 text-xs">
                {logs.length === 0 ? (
                  <div className="text-gray-500 dark:text-zinc-400">No events yet.</div>
                ) : (
                  <ul className="space-y-1">
                    {logs.map((l, i) => {
                      const isVideo = l.type.startsWith('video:');
                      const name = isVideo ? l.type.replace(/^video:/, '') : l.type;
                      return (
                        <li key={i} className="font-mono break-words">
                          <span className="text-gray-500 dark:text-zinc-400">[{new Date(l.ts).toLocaleTimeString()}]</span>{' '}
                          <span
                            className={
                              'inline-block align-middle mr-2 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ' +
                              (isVideo
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300')
                            }
                          >
                            {isVideo ? 'Video' : 'Shaka'}
                          </span>
                          <span className="font-semibold">{name}</span>
                          {l.detail !== undefined && (
                            <>
                              {': '}
                              <span className="text-gray-700 dark:text-zinc-200">
                                {(() => {
                                  try {
                                    return JSON.stringify(l.detail);
                                  } catch {
                                    return String(l.detail);
                                  }
                                })()}
                              </span>
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
