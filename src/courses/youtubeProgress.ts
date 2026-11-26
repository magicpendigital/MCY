// Best-effort playback progress for the embedded YouTube lessons, using the official IFrame Player API.
// The API script is loaded only after the learner presses Play (the player itself is loaded then too). Progress is
// reported to the caller, which keeps it on the device; nothing here sends data to MCY. If the API does not answer
// (offline, blocked, a WebView that withholds it) the caller simply gets no progress and the lesson still plays.

export type PlaybackState = "playing" | "paused" | "ended" | "other";
export type PlaybackProgress = { watchedSeconds: number; durationSeconds: number; completed: boolean; state: PlaybackState };

/** A pause, seek or stalled tick must not count as watched time; the poll runs about once a second. */
const MAX_COUNTED_GAP_SECONDS = 2.5;
const COMPLETE_RATIO = 0.85;
const ENDED_MIN_RATIO = 0.6;

/** Counts only time that actually played forward, so seeking to the end does not read as "watched". */
export class WatchAccumulator {
  watchedSeconds = 0;
  private last: number | null = null;
  private duration = 0;
  private ended = false;

  tick(currentTime: number, playing: boolean, duration: number) {
    if (Number.isFinite(duration) && duration > 0) this.duration = duration;
    if (!Number.isFinite(currentTime)) return;
    if (playing && this.last !== null) {
      const gap = currentTime - this.last;
      if (gap > 0 && gap <= MAX_COUNTED_GAP_SECONDS) this.watchedSeconds += gap;
    }
    this.last = currentTime;
  }
  markEnded() { this.ended = true; }
  summary(state: PlaybackState): PlaybackProgress {
    const watched = Math.round(this.watchedSeconds * 10) / 10;
    const completed = this.duration > 0 && (watched >= this.duration * COMPLETE_RATIO || (this.ended && watched >= this.duration * ENDED_MIN_RATIO));
    return { watchedSeconds: watched, durationSeconds: Math.round(this.duration * 10) / 10, completed, state };
  }
}

type YTPlayer = { getCurrentTime(): number; getDuration(): number; getPlayerState(): number; loadVideoById?: (videoId: string) => void };
type YTNamespace = { Player: new (frame: HTMLIFrameElement, options: { events: { onReady?: () => void; onStateChange?: (event: { data: number }) => void; onError?: () => void } }) => YTPlayer };
declare global { interface Window { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void } }

const STATE = { ENDED: 0, PLAYING: 1, PAUSED: 2 } as const;
let apiPromise: Promise<YTNamespace> | null = null;

export function loadYouTubeApi(timeoutMs = 10_000): Promise<YTNamespace> {
  if (typeof window === "undefined") return Promise.reject(new Error("no_window"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    const timer = window.setTimeout(() => { apiPromise = null; reject(new Error("api_timeout")); }, timeoutMs);
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      window.clearTimeout(timer);
      if (window.YT?.Player) resolve(window.YT); else { apiPromise = null; reject(new Error("api_missing")); }
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => { window.clearTimeout(timer); apiPromise = null; reject(new Error("api_blocked")); };
    document.head.appendChild(script);
  });
  return apiPromise;
}

/**
 * Starts reporting progress for an already-loaded YouTube iframe (its src must carry enablejsapi=1).
 * Returns a stop function. It never destroys the player, because that would remove the iframe React owns.
 */
export function trackPlayback(frame: HTMLIFrameElement, onProgress: (progress: PlaybackProgress) => void, onUnavailable: () => void): () => void {
  let stopped = false;
  let timer: number | undefined;
  const accumulator = new WatchAccumulator();
  let lastState: PlaybackState = "other";
  let ticks = 0;

  const toState = (code: number): PlaybackState => code === STATE.PLAYING ? "playing" : code === STATE.PAUSED ? "paused" : code === STATE.ENDED ? "ended" : "other";
  void loadYouTubeApi().then(YT => {
    if (stopped) return;
    let player: YTPlayer | null = null;
    const sample = (forceReport: boolean) => {
      if (stopped || !player) return;
      let state: PlaybackState;
      try {
        state = toState(player.getPlayerState());
        accumulator.tick(player.getCurrentTime(), state === "playing", player.getDuration());
      } catch { return; }
      if (state === "ended") accumulator.markEnded();
      ticks += 1;
      if (forceReport || state !== lastState || (state === "playing" && ticks % 5 === 0)) {
        lastState = state;
        onProgress(accumulator.summary(state));
      }
    };
    const start = () => {
      if (stopped || timer !== undefined) return;
      timer = window.setInterval(() => sample(false), 1000);
    };
    try {
      player = new YT.Player(frame, { events: { onReady: start, onStateChange: () => sample(true), onError: () => { if (!stopped) onUnavailable(); } } });
    } catch {
      if (!stopped) onUnavailable();
    }
  }).catch(() => { if (!stopped) onUnavailable(); });

  return () => { stopped = true; if (timer !== undefined) window.clearInterval(timer); };
}

export type SequencePlayerHandlers = {
  /** Progress of the clip that is loaded now, as trackPlayback reports it. */
  onProgress: (progress: PlaybackProgress) => void;
  /** The loaded clip reached its end (reported once per clip). */
  onEnded: () => void;
  /** The player API cannot be used: the caller must offer a manual "next" control. */
  onUnavailable: () => void;
};
export type SequencePlayer = {
  /** Loads the next clip in the same player, which keeps the chance of autoplay; false when that is not possible. */
  load: (videoId: string) => boolean;
  stop: () => void;
};

/**
 * Like trackPlayback, but for a Chút sequence: it also reports the end of each clip and can switch the clip inside the
 * same iframe. Never destroys the player (React owns the iframe). If the API never answers, onUnavailable is called.
 */
export function controlSequencePlayer(frame: HTMLIFrameElement, handlers: SequencePlayerHandlers): SequencePlayer {
  let stopped = false;
  let timer: number | undefined;
  let player: YTPlayer | null = null;
  let ready = false;
  let accumulator = new WatchAccumulator();
  let lastState: PlaybackState = "other";
  let endedReported = false;
  let ticks = 0;
  const toState = (code: number): PlaybackState => code === STATE.PLAYING ? "playing" : code === STATE.PAUSED ? "paused" : code === STATE.ENDED ? "ended" : "other";
  const sample = (forceReport: boolean) => {
    if (stopped || !player) return;
    let state: PlaybackState;
    try {
      state = toState(player.getPlayerState());
      accumulator.tick(player.getCurrentTime(), state === "playing", player.getDuration());
    } catch { return; }
    if (state === "ended") accumulator.markEnded();
    ticks += 1;
    if (forceReport || state !== lastState || (state === "playing" && ticks % 5 === 0)) {
      lastState = state;
      handlers.onProgress(accumulator.summary(state));
    }
    if (state === "ended" && !endedReported) { endedReported = true; handlers.onEnded(); }
    if (state === "playing") endedReported = false;
  };
  void loadYouTubeApi().then(YT => {
    if (stopped) return;
    try {
      player = new YT.Player(frame, { events: {
        onReady: () => { ready = true; if (!stopped && timer === undefined) timer = window.setInterval(() => sample(false), 1000); },
        onStateChange: () => sample(true),
        onError: () => { if (!stopped) handlers.onUnavailable(); },
      } });
    } catch {
      if (!stopped) handlers.onUnavailable();
    }
  }).catch(() => { if (!stopped) handlers.onUnavailable(); });

  return {
    load: videoId => {
      if (stopped || !player || !ready || typeof player.loadVideoById !== "function") return false;
      try { player.loadVideoById(videoId); } catch { return false; }
      accumulator = new WatchAccumulator();
      lastState = "other";
      // The old clip may still read "ended" for a moment: the new one must play before its end can count.
      endedReported = true;
      ticks = 0;
      return true;
    },
    stop: () => { stopped = true; if (timer !== undefined) window.clearInterval(timer); },
  };
}
