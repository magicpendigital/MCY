import { useCallback, useEffect, useRef, useState } from "react";
import { getAccountBoundSupabaseClient } from "../backend/supabase";
import "./owner.css";

// Owner 28/11, sharing option A: MCY lessons and courses the Owner invited this teacher to comment on. View and comment only:
// the teacher never edits or decides; the Owner reads the comments and saves any new version. An older server without
// sharing answers nothing, and this panel then stays hidden.
type Shared = { item_id: string; kind: string; expires_at: string; seq: number; title: string; payload: Record<string, unknown>; notes: { seq: number; note: string; at: string }[] };
const day = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? "" : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`; };
const errorText: Record<string, string> = {
  content_conflict: "Bài vừa có phiên bản mới. Danh sách đã tải lại; hãy đọc bản mới rồi gửi góp ý.",
  content_limit_reached: "Đã đạt giới hạn góp ý trong 24 giờ. Thử lại sau.",
  content_access_required: "Lời mời góp ý bài này đã hết hạn hoặc đã được thu hồi.",
  invalid_note: "Góp ý cần từ 1 đến 1000 ký tự.",
};
const validItem = (x: unknown): x is Shared => !!x && typeof x === "object" && typeof (x as Shared).item_id === "string" && Number.isInteger((x as Shared).seq)
  && typeof (x as Shared).title === "string" && Array.isArray((x as Shared).notes);

export default function TeacherSharedPanel({ userId }: { userId: string }) {
  const [items, setItems] = useState<Shared[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const account = useRef(userId); account.current = userId;

  const invoke = useCallback(async (body: Record<string, unknown>): Promise<{ data: Record<string, unknown> | null; code: string }> => {
    const actor = userId;
    try {
      const client = await getAccountBoundSupabaseClient(actor);
      const { data, error: failure } = await client.functions.invoke("owner-control-plane", { body });
      if (account.current !== actor) return { data: null, code: "stale" };
      if (failure) {
        let code = "";
        const response = (failure as { context?: unknown }).context;
        if (response instanceof Response) { try { code = (await response.clone().json()).error ?? ""; } catch { /* unknown */ } }
        return { data: null, code };
      }
      return { data: data && typeof data === "object" ? data as Record<string, unknown> : null, code: "" };
    } catch { return { data: null, code: "network" }; }
  }, [userId]);

  const load = useCallback(async () => {
    const { data } = await invoke({ action: "shared_list" });
    if (data && Array.isArray(data.items)) setItems(data.items.filter(validItem));
  }, [invoke]);
  useEffect(() => { setItems(null); void load(); }, [load]);

  const send = async (item: Shared) => {
    const note = (drafts[item.item_id] ?? "").trim();
    if (!note || busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const { data, code } = await invoke({ action: "share_note", itemId: item.item_id, seq: item.seq, note });
      if (data?.receipt) { setDrafts(d => ({ ...d, [item.item_id]: "" })); setNotice("Đã gửi góp ý cho Owner."); await load(); return; }
      setError(errorText[code] ?? "Chưa xác định góp ý đã được gửi hay chưa. Tải lại để đối chiếu trước khi gửi lại.");
      if (code === "content_conflict" || code === "content_access_required" || !errorText[code]) await load();
    } finally { setBusy(false); }
  };

  if (items === null) return null;
  return <section className="owner-panel owner-teacher-content teacher-shared" aria-label="Bài MCY được mời góp ý">
    <div className="owner-panel-heading"><div><span className="owner-kicker">GÓP Ý</span><h2>Bài MCY được mời góp ý</h2>
      <p>Bạn chỉ xem và góp ý. Owner quyết định và tự sửa bài; góp ý không làm thay đổi bài hay kết quả duyệt.</p></div></div>
    {error && <p className="owner-error" role="alert">{error}</p>}
    {notice && <p className="owner-success" role="status">{notice}</p>}
    {items.length === 0 ? <p>Chưa có bài nào được mời góp ý.</p> : <ul className="teacher-shared-list">{items.map(item => {
      const p = item.payload, youtube = typeof p.youtubeId === "string" ? p.youtubeId : "";
      return <li key={item.item_id}><article aria-label={`Góp ý · ${item.title}`}>
        <span className="owner-kicker">{item.kind === "course_group" ? "KHÓA HỌC MCY" : "BÀI VIDEO MCY"}</span>
        <h3>{item.title}</h3>
        <p><small>Phiên bản {item.seq} · lời mời đến {day(item.expires_at)}</small></p>
        {typeof p.summary === "string" && <p>{p.summary}</p>}
        {youtube && <p><a href={`https://www.youtube.com/watch?v=${encodeURIComponent(youtube)}`} target="_blank" rel="noreferrer noopener">Xem trên YouTube</a>{typeof p.durationLabel === "string" ? ` · ${p.durationLabel}` : ""}</p>}
        {item.kind === "course_group" && Array.isArray(p.lessonIds) && <p><small>{p.lessonIds.length} bài trong khóa</small></p>}
        {item.notes.length > 0 && <section aria-label="Góp ý bạn đã gửi"><h4>Góp ý bạn đã gửi</h4><ul>{item.notes.map((n, i) => <li key={i}><small>Phiên bản {n.seq} · {day(n.at)}</small><br />{n.note}</li>)}</ul></section>}
        <label className="owner-field">Góp ý cho Owner<textarea aria-label={`Góp ý cho ${item.title}`} maxLength={1000} disabled={busy} value={drafts[item.item_id] ?? ""} onChange={e => setDrafts(d => ({ ...d, [item.item_id]: e.target.value }))} /></label>
        <button type="button" className="owner-primary" disabled={busy || !(drafts[item.item_id] ?? "").trim()} onClick={() => void send(item)}>Gửi góp ý</button>
      </article></li>;
    })}</ul>}
  </section>;
}
