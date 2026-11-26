import { useEffect, useRef, useState } from "react";
import { PlayIcon } from "@radix-ui/react-icons";
import { MobileScroll, useFlow } from "../../mobile";
import { useRoutes } from "../../app/navigation";
import { Header } from "../../app/ui/Header";
import { buildChutSequence, chutRegion, remainingLabel, type ChutSequence } from "../../chut/sequences";
import { finishChutRun, setChutClipCount, useChutRun } from "../../chut/chutRun";
import { loadChutMemory, updateChutMemory, withAutoAdvance } from "../../chut/chutMemory";
import { controlSequencePlayer, type SequencePlayer } from "../../courses/youtubeProgress";
import { recordLessonOpened, recordLessonProgress } from "../../courses/lessonMemory";
import { lessonThumbnailUrl } from "../../courses/lessonThumbnail";

const COUNTDOWN_SECONDS = 3;
const STALL_MS = 6000;
const FRAME_TIMEOUT_MS = 12_000;

export function ChutSequenceHeader() {
  const run = useChutRun();
  const region = chutRegion(run?.regionId);
  const title = region ? (run && run.clipCount ? `${region.label} · chuỗi ${run.clipCount} bài` : region.label) : "Chút";
  return <Header title={title} back />;
}

function Poster({ youtubeId, title, duration }: { youtubeId: string; title: string; duration: string }) {
  const [failed, setFailed] = useState(false);
  const url = lessonThumbnailUrl(youtubeId);
  return <span className="mcy-chut-poster" aria-hidden="true">
    {url && !failed ? <img src={url} alt="" loading="lazy" decoding="async" draggable={false} referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : null}
    <strong>{title}</strong><small>{duration}</small>
  </span>;
}

// Chút slice 1: plays a fixed sequence of short clips in the app. The learner presses Play on the first clip; when a clip
// ends, a 3-second countdown (with "Dừng lại" / "Tiếp ngay") moves to the next one inside the same player when the
// YouTube API allows it. Without the API, or when autoplay is blocked, a manual "Bài tiếp" button is shown.
// "Dừng chuỗi" always goes to the end screen, marked as ended early.
// Honesty: a clip counts as watched only when the player reports it ended or played to the completion ratio. Without
// the YouTube API there is no such signal, so the learner's own tap ("Bài tiếp" / "Xong chuỗi") is the only evidence.
export function ChutSequenceScreen() {
  const flow = useFlow();
  const routes = useRoutes();
  const run = useChutRun();
  const region = chutRegion(run?.regionId);
  const [sequence, setSequence] = useState<ChutSequence | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [frameNonce, setFrameNonce] = useState(0);
  const [loadedFrame, setLoadedFrame] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [stalled, setStalled] = useState(false);
  const [offline, setOffline] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(() => loadChutMemory().autoAdvance);
  const [reducedMotion] = useState(() => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const frameHolder = useRef<HTMLDivElement | null>(null);
  const player = useRef<SequencePlayer | null>(null);
  const finished = useRef(false);
  const lastPlayingAt = useRef(0);
  const seen = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!region) return;
    let active = true;
    setFailed(false);
    void import("../../courses/contentSnapshot").then(async snapshot => {
      const { courses } = await snapshot.loadCatalog();
      if (!active) return;
      const built = buildChutSequence(courses, region);
      setSequence(built);
      setChutClipCount(built.clips.length);
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [region, attempt]);

  const clips = sequence?.clips ?? [];
  const clip = clips[index];
  const frameClip = clips[frameIndex];
  const frameKey = `${frameIndex}-${frameNonce}`;
  const hasNext = index < clips.length - 1;

  // Latest values for the player callbacks, which outlive a render.
  const latest = useRef({ index, clips, autoAdvance, hasNext, apiUnavailable });
  latest.current = { index, clips, autoAdvance, hasNext, apiUnavailable };

  const finish = (stoppedByLearner: boolean) => {
    if (finished.current || !sequence) return;
    finished.current = true;
    player.current?.stop();
    const watchedClips = clips.filter((_, position) => seen.current.has(position));
    const watched = watchedClips.length;
    const endedEarly = stoppedByLearner || watched < clips.length;
    finishChutRun({ total: clips.length, watched, endedEarly, seconds: watchedClips.reduce((total, item) => total + item.seconds, 0) });
    flow.replace(routes.chutEnd);
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  const advance = () => {
    const { index: current, clips: list, apiUnavailable: noSignal } = latest.current;
    if (noSignal) seen.current.add(current);
    const next = list[current + 1];
    if (!next) { finishRef.current(false); return; }
    setCountdown(null);
    setWaiting(false);
    setStalled(false);
    lastPlayingAt.current = 0;
    recordLessonOpened({ courseId: next.courseId, lessonId: next.lessonId });
    setIndex(current + 1);
    // Same player first: a clip loaded by the API is more likely to start without another tap.
    if (!player.current?.load(next.lesson.youtubeId)) {
      setFrameIndex(current + 1);
      setLoadedFrame(null);
    }
  };
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  // Bind the player to the iframe once it has loaded; a new iframe (fallback path) binds again.
  useEffect(() => {
    if (!started || loadedFrame !== frameKey) return;
    const frame = frameHolder.current?.querySelector<HTMLIFrameElement>("iframe");
    if (!frame) return;
    const control = controlSequencePlayer(frame, {
      onProgress: progress => {
        if (progress.state === "playing") { lastPlayingAt.current = Date.now(); setStalled(false); }
        if (progress.completed) seen.current.add(latest.current.index);
        const current = latest.current.clips[latest.current.index];
        if (current) recordLessonProgress({ courseId: current.courseId, lessonId: current.lessonId }, progress);
      },
      onEnded: () => {
        seen.current.add(latest.current.index);
        if (!latest.current.hasNext) { finishRef.current(false); return; }
        if (latest.current.autoAdvance) setCountdown(COUNTDOWN_SECONDS);
        else setWaiting(true);
      },
      onUnavailable: () => setApiUnavailable(true),
    });
    player.current = control;
    return () => { control.stop(); if (player.current === control) player.current = null; };
  }, [started, loadedFrame, frameKey]);

  // The countdown: one step per second, then the next clip.
  useEffect(() => {
    if (countdown === null) return;
    const timer = window.setTimeout(() => {
      if (countdown <= 1) advanceRef.current();
      else setCountdown(countdown - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  // After a switch, a clip that has not started playing (autoplay blocked) gets the manual button.
  useEffect(() => {
    if (!started || index === 0) return;
    const timer = window.setTimeout(() => { if (!lastPlayingAt.current) setStalled(true); }, STALL_MS);
    return () => window.clearTimeout(timer);
  }, [started, index]);

  // An iframe that never loads is treated like a missing connection.
  useEffect(() => {
    if (!started || loadedFrame === frameKey) return;
    const timer = window.setTimeout(() => setOffline(true), FRAME_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [started, loadedFrame, frameKey]);

  useEffect(() => () => { player.current?.stop(); }, []);

  if (!region) return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-chut-page"><button type="button" className="mcy-quiet-link" onClick={() => flow.pop()}>Đổi vùng</button></main></MobileScroll>;
  if (!sequence) return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-chut-page">
    <div className="mcy-inline-note" role={failed ? "alert" : "status"}>{failed ? "Chưa có mạng nên chưa phát được video. Bạn thử lại khi có mạng." : "Đang mở bài học…"}</div>
    {failed && <button type="button" className="mcy-quiet-link" onClick={() => setAttempt(value => value + 1)}>Thử lại</button>}
  </main></MobileScroll>;

  const play = () => {
    if (!clip) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) { setOffline(true); return; }
    setOffline(false);
    recordLessonOpened({ courseId: clip.courseId, lessonId: clip.lessonId });
    setFrameIndex(index);
    setLoadedFrame(null);
    setStarted(true);
  };
  const retry = () => {
    setOffline(false);
    if (!started) { play(); return; }
    setLoadedFrame(null);
    setFrameNonce(value => value + 1);
  };
  const toggleAutoAdvance = () => {
    const next = !autoAdvance;
    setAutoAdvance(next);
    updateChutMemory(memory => withAutoAdvance(memory, next));
    if (!next && countdown !== null) { setCountdown(null); setWaiting(true); }
  };
  const stopCountdown = () => { setCountdown(null); setWaiting(true); };
  const showNextButton = started && hasNext && countdown === null && (waiting || !autoAdvance || apiUnavailable || stalled);
  // Without the API the last clip never reports its end, so the learner says when they are done.
  const showDoneButton = started && !hasNext && countdown === null && apiUnavailable;
  const done = () => { seen.current.add(index); finish(false); };
  const upcoming = clips.slice(index + 1);
  const regionLower = region.label.toLowerCase();

  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-chut-page" data-testid="chut-sequence">
    {sequence.fallback && <p className="mcy-chut-fallback" role="note" data-testid="chut-fallback">Mình chưa có bài khớp với lựa chọn này. Đây là vài bài nhẹ nhàng chung.</p>}
    {clip ? <>
      <div ref={frameHolder} className={`mcy-chut-video mcy-chut-video-${(started && frameClip ? frameClip : clip).lesson.orientation}`} data-testid="chut-video">
        {started && frameClip && !offline
          ? <iframe key={frameKey} data-clip={frameClip.lessonId} title={frameClip.lesson.title} src={`https://www.youtube-nocookie.com/embed/${frameClip.lesson.youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&fs=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`} loading="eager" allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" onLoad={() => setLoadedFrame(frameKey)} allowFullScreen />
          : <button type="button" className="mcy-chut-play" onClick={play} aria-label={`Phát bài học: ${clip.lesson.title}`}>
            <Poster youtubeId={clip.lesson.youtubeId} title={clip.lesson.title} duration={clip.lesson.duration} />
            <span className="mcy-chut-play-label"><PlayIcon aria-hidden="true" />Phát</span>
          </button>}
      </div>
      {offline && <div className="mcy-chut-offline" role="alert"><p>Chưa có mạng nên chưa phát được video. Bạn thử lại khi có mạng.</p><button type="button" className="mcy-chut-secondary" onClick={retry}>Thử lại</button></div>}
      <div className="mcy-chut-progress" data-testid="chut-progress"><strong aria-live="polite">Bài {index + 1} trên {clips.length}</strong><span>còn khoảng {remainingLabel(clips, index)}</span></div>
      <h2 className="mcy-chut-clip-title">{clip.lesson.title}</h2>
      {!started && <p className="mcy-chut-hint">Bạn tự bấm Phát ở bài đầu</p>}
      {countdown !== null && <section className="mcy-chut-countdown" data-testid="chut-countdown" aria-label="Chuyển sang bài tiếp">
        <div role="status" aria-live="polite"><strong>Bài {index + 1} vừa xong</strong><span>Bài tiếp sau {countdown} giây</span></div>
        {!reducedMotion && <span className="mcy-chut-countdown-bar" aria-hidden="true"><span key={index} /></span>}
        <div className="mcy-chut-countdown-actions"><button type="button" className="mcy-chut-secondary" onClick={stopCountdown}>Dừng lại</button><button type="button" className="mcy-chut-primary" onClick={() => advanceRef.current()}>Tiếp ngay</button></div>
      </section>}
      <div className="mcy-chut-controls">
        {showNextButton && <button type="button" className="mcy-chut-primary" onClick={() => advanceRef.current()}>Bài tiếp</button>}
        {showDoneButton && <button type="button" className="mcy-chut-primary" onClick={done}>Xong chuỗi</button>}
        <button type="button" className="mcy-chut-secondary" onClick={() => finish(true)}>Dừng chuỗi</button>
      </div>
      <div className="mcy-chut-toggle">
        <button type="button" role="switch" aria-checked={autoAdvance} aria-describedby="chut-toggle-help" onClick={toggleAutoAdvance}><span className="mcy-chut-toggle-copy"><strong>Tự chuyển sang bài tiếp</strong><small>Mỗi lần chuyển có 3 giây để bạn dừng.</small></span><span className="mcy-chut-switch" aria-hidden="true"><span /></span></button>
        <p id="chut-toggle-help">Tắt thì Chút chờ bạn bấm “Bài tiếp”. Lựa chọn này chỉ lưu trên máy này.</p>
      </div>
      <p className="mcy-chut-reason"><b>Chút:</b> Vì bạn chọn {regionLower}. Gợi ý theo quy tắc, chưa dùng AI. Dừng nếu đau tăng.</p>
      {upcoming.length > 0 && <section className="mcy-chut-upcoming" aria-labelledby="chut-upcoming-heading">
        <h3 id="chut-upcoming-heading">SẮP TỚI</h3>
        <ol>{upcoming.map((item, offset) => <li key={`${item.courseId}-${item.lessonId}`}><span className="mcy-chut-upcoming-number">{index + offset + 2}</span><span><strong>{item.lesson.title}</strong><small>{item.lesson.duration}</small></span></li>)}</ol>
      </section>}
    </> : null}
    <button type="button" className="mcy-quiet-link" onClick={() => flow.pop()}>Đổi vùng</button>
  </main></MobileScroll>;
}
