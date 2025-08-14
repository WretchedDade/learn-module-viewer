import React, { useEffect, useRef, useImperativeHandle } from "react";

// Common native video event names we want to support in a map form
type VideoEventName =
    | "abort"
    | "canplay"
    | "canplaythrough"
    | "durationchange"
    | "emptied"
    | "ended"
    | "error"
    | "loadeddata"
    | "loadedmetadata"
    | "loadstart"
    | "pause"
    | "play"
    | "playing"
    | "progress"
    | "ratechange"
    | "seeked"
    | "seeking"
    | "stalled"
    | "suspend"
    | "timeupdate"
    | "volumechange"
    | "waiting";

type VideoEventHandlers = Partial<Record<VideoEventName, (ev: Event) => void>>;

type ShakaPlayerProps = Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "src"> & {
    // Manifest URL for Shaka to load (DASH/HLS)
    src: string;
    // Callback when player and video are ready after load
    onReady?: (ctx: { player: shaka.Player; video: HTMLVideoElement }) => void;
    // Strongly-typed Shaka event callbacks
    onShakaError?: (error: shaka.util.Error) => void;
    onShakaBuffering?: (buffering: boolean) => void;
    onShakaAdaptation?: () => void;
    onShakaTracksChanged?: () => void;
    // Control whether to initialize the Shaka UI overlay. Defaults to true.
    useUIOverlay?: boolean;
    onShakaVariantChanged?: (variant: shaka.extern.Variant) => void;
    onShakaTextChanged?: () => void;
    onShakaTextTrackVisibility?: (visible: boolean) => void;
};

export const ShakaPlayer = React.forwardRef<HTMLVideoElement, ShakaPlayerProps>(
    (
        {
            src,
            autoPlay,
            onReady,
            onShakaError,
            onShakaBuffering,
            onShakaAdaptation,
            onShakaTracksChanged,
            onShakaVariantChanged,
            onShakaTextChanged,
            onShakaTextTrackVisibility,
            useUIOverlay = true,
            ...props
        },
        ref,
    ) => {
        const containerRef = useRef<HTMLDivElement | null>(null);
        const videoRef = useRef<HTMLVideoElement | null>(null);
        const playerRef = useRef<shaka.Player | null>(null);
        // UI overlay type isn't exported in a friendly way; use any to avoid type friction.
        const overlayRef = useRef<any | null>(null);
        const shakaListenersRef = useRef<Array<[string, EventListener]>>([]);
        const videoListenersRef = useRef<Array<[VideoEventName, EventListener]>>([]);
        // Keep latest callbacks without causing effect to re-run
        const cbRef = useRef({
            onReady,
            onShakaError,
            onShakaBuffering,
            onShakaAdaptation,
            onShakaTracksChanged,
            onShakaVariantChanged,
            onShakaTextChanged,
            onShakaTextTrackVisibility,
        });
        cbRef.current = {
            onReady,
            onShakaError,
            onShakaBuffering,
            onShakaAdaptation,
            onShakaTracksChanged,
            onShakaVariantChanged,
            onShakaTextChanged,
            onShakaTextTrackVisibility,
        };

        // Expose the underlying <video> element to parent refs
        useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement, []);

        useEffect(() => {
            let destroyed = false;
            // token to prevent race conditions across rapid re-inits
            const initToken = Symbol("shaka-init");
            (playerRef as any)._initToken = initToken;

            const init = async () => {
                if (typeof window === "undefined") return; // SSR guard
                if (!src) return;

                try {
                    // Dynamically import Shaka on the client to avoid SSR 'document is not defined'
                    const { default: Shaka } = await import("shaka-player/dist/shaka-player.ui");
                    // Optionally import the controls CSS when using the UI overlay
                    // Note: dynamic import of CSS is supported by Vite
                    // We'll import it only if overlay is requested to avoid SSR issues
                    
                    // Install browser polyfills
                    Shaka.polyfill.installAll();

                    if (!Shaka.Player.isBrowserSupported()) {
                        // eslint-disable-next-line no-console
                        console.error("Shaka: Browser not supported");
                        return;
                    }

                    // Create or recreate the player when src changes
                    if (playerRef.current) {
                        try {
                            await playerRef.current.destroy();
                        } catch {
                            // ignore destroy errors
                        }
                        playerRef.current = null;
                    }

                    if (!videoRef.current) return;

                    // Create player without binding a media element (deprecated)
                    const player = new Shaka.Player();
                    playerRef.current = player;

                    // Clear any prior listeners
                    shakaListenersRef.current.forEach(([name, listener]) => {
                        try {
                            player.removeEventListener(name as any, listener as any);
                        } catch {}
                    });
                    shakaListenersRef.current = [];

                    videoListenersRef.current.forEach(([name, listener]) => {
                        try {
                            videoRef.current?.removeEventListener(name, listener);
                        } catch {}
                    });
                    videoListenersRef.current = [];

                    // Shaka: error
            if (cbRef.current.onShakaError) {
                        const listener: EventListener = (e: Event) => {
                const err = (e as any)?.detail as shaka.util.Error;
                cbRef.current.onShakaError?.(err);
                        };
                        player.addEventListener("error" as any, listener as any);
                        shakaListenersRef.current.push(["error", listener]);
                    } else {
                        // Fallback logging if no handler provided, with decoded names
                        const fallbackErrorListener: EventListener = (event: Event) => {
                const err = (event as any)?.detail as shaka.util.Error | undefined;
                            const mapName = (
                                obj: Record<string, number> | undefined,
                                val: number | undefined,
                            ) => {
                                if (!obj || val == null) return undefined;
                                const found = Object.entries(obj).find(([, v]) => v === val);
                                return found?.[0];
                            };
                const Severity = (Shaka as any)?.util?.Error?.Severity as
                                | Record<string, number>
                                | undefined;
                const Category = (Shaka as any)?.util?.Error?.Category as
                                | Record<string, number>
                                | undefined;
                const Code = (Shaka as any)?.util?.Error?.Code as Record<string, number> | undefined;
                            // eslint-disable-next-line no-console
                            console.error("Shaka Player Error:", {
                                severity: mapName(Severity, err?.severity) ?? err?.severity,
                                category: mapName(Category, err?.category) ?? err?.category,
                                code: mapName(Code, err?.code) ?? err?.code,
                                raw: err ?? event,
                            });
                        };
                        player.addEventListener("error" as any, fallbackErrorListener as any);
                        shakaListenersRef.current.push(["error", fallbackErrorListener]);
                    }

                    // Shaka: buffering
            if (cbRef.current.onShakaBuffering) {
                        const listener: EventListener = (e: Event) => {
                            const buffering = Boolean((e as any)?.buffering);
                cbRef.current.onShakaBuffering?.(buffering);
                        };
                        player.addEventListener("buffering" as any, listener as any);
                        shakaListenersRef.current.push(["buffering", listener]);
                    }

                    // Shaka: adaptation
                    if (cbRef.current.onShakaAdaptation) {
                        const listener: EventListener = () => cbRef.current.onShakaAdaptation?.();
                        player.addEventListener("adaptation" as any, listener as any);
                        shakaListenersRef.current.push(["adaptation", listener]);
                    }

                    // Shaka: tracks changed
                    if (cbRef.current.onShakaTracksChanged) {
                        const listener: EventListener = () => cbRef.current.onShakaTracksChanged?.();
                        player.addEventListener("trackschanged" as any, listener as any);
                        shakaListenersRef.current.push(["trackschanged", listener]);
                    }

                    // Shaka: current variant changed
            if (cbRef.current.onShakaVariantChanged) {
                        const listener: EventListener = (e: Event) => {
                            const variant = (e as any)?.variant as shaka.extern.Variant;
                if (variant) cbRef.current.onShakaVariantChanged?.(variant);
                        };
                        player.addEventListener("variantchanged" as any, listener as any);
                        shakaListenersRef.current.push(["variantchanged", listener]);
                    }

                    // Shaka: text changed
                    if (cbRef.current.onShakaTextChanged) {
                        const listener: EventListener = () => cbRef.current.onShakaTextChanged?.();
                        player.addEventListener("textchanged" as any, listener as any);
                        shakaListenersRef.current.push(["textchanged", listener]);
                    }

                    // Shaka: text track visibility
            if (cbRef.current.onShakaTextTrackVisibility) {
                        const listener: EventListener = (e: Event) => {
                            const visible = Boolean((e as any)?.visible);
                cbRef.current.onShakaTextTrackVisibility?.(visible);
                        };
                        player.addEventListener("texttrackvisibility" as any, listener as any);
                        shakaListenersRef.current.push(["texttrackvisibility", listener]);
                    }

                    // Attach to the media element before creating the overlay
                    await player.attach(videoRef.current);

                    // Optional UI overlay if available (after attach)
                    if (useUIOverlay) {
                        // Load overlay CSS only when used
                        await import("shaka-player/dist/controls.css");
                        try {
                            const anyShaka: any = Shaka as unknown as any;
                            if (
                                containerRef.current &&
                                anyShaka?.ui?.Overlay &&
                                typeof anyShaka.ui.Overlay === "function"
                            ) {
                                overlayRef.current = new anyShaka.ui.Overlay(
                                    player,
                                    containerRef.current,
                                    videoRef.current,
                                );
                            }
                        } catch {
                            // If UI overlay fails, just proceed with the raw player
                        }
                    }

                    // Load the manifest after overlay is created
                    try {
                        // If a re-init started, bail without throwing
                        if ((playerRef as any)._initToken !== initToken) return;
                        await player.load(src);
                    } catch (err: any) {
                        const code = err?.code as number | undefined;
                        // 7000 = OPERATION_ABORTED (load interrupted). Treat as benign if init was superseded.
                        if (code === 7000 || (err && (err as any).code === (Shaka as any)?.util?.Error?.Code?.OPERATION_ABORTED)) {
                            return;
                        }
                        throw err;
                    }

                    // Autoplay if requested
                    if (autoPlay && videoRef.current) {
                        try {
                            await videoRef.current.play();
                        } catch {
                            // Autoplay may be blocked; ignore
                        }
                    }

                    // Notify ready
                    if (cbRef.current.onReady && videoRef.current) {
                        cbRef.current.onReady({ player, video: videoRef.current });
                    }
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error("Shaka initialization failed:", e);
                }
            };

            init();

            // Cleanup when src changes or component unmounts
            return () => {
                destroyed = true;
                try {
                    if (overlayRef.current && typeof overlayRef.current.destroy === "function") {
                        overlayRef.current.destroy();
                    }
                } catch {
                    // ignore overlay destroy errors
                } finally {
                    overlayRef.current = null;
                }

                // Detach native video listeners (only if some were attached elsewhere)
                if (videoRef.current) {
                    videoListenersRef.current.forEach(([name, listener]) => {
                        try {
                            videoRef.current?.removeEventListener(name, listener);
                        } catch {}
                    });
                    videoListenersRef.current = [];
                }

                // Detach shaka listeners then destroy
                if (playerRef.current) {
                    shakaListenersRef.current.forEach(([name, listener]) => {
                        try {
                            playerRef.current?.removeEventListener(name as any, listener as any);
                        } catch {}
                    });
                    shakaListenersRef.current = [];

                    playerRef.current.destroy().catch(() => void 0);
                    playerRef.current = null;
                }
            };
    }, [src, autoPlay, useUIOverlay]);

        return (
            <div ref={containerRef} style={{ width: "100%" }}>
                <video
                    ref={videoRef}
                    // Leave src empty; Shaka manages MediaSource attachments
                    {...props}
                />
            </div>
        );
    },
);

export default ShakaPlayer;
