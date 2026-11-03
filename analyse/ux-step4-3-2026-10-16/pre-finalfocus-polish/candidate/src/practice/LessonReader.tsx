import { useEffect, useRef, useState } from "react";
import type { LessonSection } from "../../supabase/functions/_shared/practiceContract";
import "./practice.css";

export function LessonReader({ sections, active, draft = false }: { sections: LessonSection[]; active: boolean; draft?: boolean }) {
  const [index, setIndex] = useState(0);
  const audio = useRef<HTMLAudioElement>(null);
  const section = sections[index] ?? sections[0];
  useEffect(() => {
    const pause = () => { audio.current?.pause(); };
    if (!active) pause();
    const onVisibility = () => { if (document.hidden) pause(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { pause(); document.removeEventListener("visibilitychange", onVisibility); };
  }, [active, index]);
  if (!section) return null;
  return <section className="mcy-lesson-reader" aria-label={draft ? "Bài học mẫu để review" : "Nội dung buổi tập"}>
    <img src={section.image} alt={section.title} loading="lazy" />
    <nav aria-label="Các phần của bài học">{sections.map((s, i) => <button key={s.id} aria-pressed={i === index} onClick={() => { audio.current?.pause(); setIndex(i); }}>{i + 1}<span>{s.title}</span></button>)}</nav>
    <div className="mcy-lesson-copy"><span className="mcy-tag">PHẦN {index + 1} / {sections.length}</span><h2>{section.title}</h2><p>{section.text}</p>
      {active && section.audio ? <><p className="mcy-lesson-audio-label">{draft ? "Audio mẫu · giọng tổng hợp tiếng Anh. Text tiếng Việt ở trên." : `Audio bài học · ${section.audioLocale === "en-US" ? "tiếng Anh" : "tiếng Việt"}`}</p><audio key={section.audio} ref={audio} src={section.audio} controls preload="none" aria-label={`Audio: ${section.title}`} /></> : <p className="mcy-lesson-audio-label">Bạn có thể đọc nội dung ở trên; phần này chưa có audio.</p>}
    </div>
  </section>;
}
