import { useCallback, useEffect, useRef, useState } from "react";
import { getAccountBoundSupabaseClient } from "../backend/supabase";
import { validDisplayConfig, type DisplayConfig } from "../../supabase/functions/_shared/contentWorkspaceContract";
import "./owner.css";

// Owner display configuration (phase 2b): what each Khám phá section shows and in which order, general policies, the
// Editor's choice slots, the review rules, and the change log. It stores the configuration; the learner app reads it only
// when a later phase publishes a snapshot, so nothing here changes what learners see today.
type LogEntry = { kind: "config" | "visibility"; subject: string; before: unknown; after: unknown; at: string };
type Shown = { item_id: string; seq: number; effective: boolean };
type Row = { item_id: string; title: string; kind: string };
const sectionLabel: Record<string, string> = { editors_choice: "Lựa chọn của biên tập (tối đa 3 ô)", video_groups: "Nhóm bài video (nội dung chính)", quick_find: "Tìm nhanh một bài", reading: "Bài đọc có hình (đọc thêm)" };
const kindLabel: Record<string, string> = { video_lesson: "Bài video", course_group: "Nhóm khóa", reading_unit: "Bài đọc", screen_text: "Văn bản màn hình" };
const errorText: Record<string, string> = {
  display_conflict: "Cấu hình vừa được thay đổi ở nơi khác. Tải lại trước khi lưu tiếp.",
  editors_choice_not_shown: "Chỉ chọn được nội dung đang hiển thị (đã duyệt và đã bật hiển thị sau lần duyệt gần nhất).",
  invalid_display_config: "Cấu hình chưa hợp lệ. Bài đọc luôn phải nằm dưới nhóm video.",
  owner_access_required: "Chỉ Owner đổi được cấu hình hiển thị.",
  content_limit_reached: "Đã đạt giới hạn thao tác trong 24 giờ. Thử lại sau.",
};

export default function DisplayConfigPanel({ userId }: { userId: string }) {
  const [version, setVersion] = useState(0);
  const [saved, setSaved] = useState<DisplayConfig | null>(null);
  const [config, setConfig] = useState<DisplayConfig | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [shown, setShown] = useState<Shown[]>([]);
  const [titles, setTitles] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const pending = useRef(false);
  const generation = useRef(0);
  const account = useRef(userId); account.current = userId;

  const call = useCallback(async (body: Record<string, unknown>, write: boolean) => {
    if (pending.current) return null;
    pending.current = true; setBusy(true); setError("");
    const tick = ++generation.current, actor = userId;
    const valid = () => tick === generation.current && account.current === actor;
    try {
      const client = await getAccountBoundSupabaseClient(actor);
      if (!valid()) return null;
      const { data, error: failure } = await client.functions.invoke("owner-control-plane", { body });
      if (!valid()) return null;
      if (failure) {
        let code = "";
        const response = (failure as { context?: unknown }).context;
        if (response instanceof Response) { try { code = (await response.clone().json()).error ?? ""; } catch { /* unknown */ } }
        if (!valid()) return null;
        if (errorText[code]) { setError(errorText[code]); if (code === "display_conflict") setStale(true); return null; }
        if (write) setStale(true);
        setError(write ? "Chưa xác định cấu hình đã được lưu hay chưa. Tải lại để đối chiếu; không tự gửi lại." : "Chưa đọc được cấu hình từ máy chủ. Thử tải lại.");
        return null;
      }
      return (data ?? {}) as Record<string, unknown>;
    } catch {
      if (valid()) { if (write) setStale(true); setError(write ? "Chưa xác định cấu hình đã được lưu hay chưa. Tải lại để đối chiếu; không tự gửi lại." : "Chưa kết nối được máy chủ."); }
      return null;
    } finally { if (valid()) { pending.current = false; setBusy(false); } }
  }, [userId]);

  const load = useCallback(async () => {
    const data = await call({ action: "read_display" }, false);
    if (data && typeof data.version_no === "number" && validDisplayConfig(data.config)) {
      setVersion(data.version_no); setSaved(data.config); setConfig(data.config); setStale(false);
      setLog(Array.isArray(data.log) ? data.log as LogEntry[] : []); setShown(Array.isArray(data.visibility) ? data.visibility as Shown[] : []);
      const list = await call({ action: "list_content" }, false);
      if (list && Array.isArray(list.items)) setTitles((list.items as Row[]).map(r => ({ item_id: r.item_id, title: r.title, kind: r.kind })));
    }
  }, [call]);
  useEffect(() => { void load(); return () => { generation.current++; pending.current = false; }; }, [userId, load]);

  const dirty = Boolean(config && saved && JSON.stringify(config) !== JSON.stringify(saved));
  const titleOf = (id: string) => titles.find(t => t.item_id === id)?.title ?? id;
  const candidates = shown.filter(s => s.effective).map(s => s.item_id);
  const move = (i: number, d: -1 | 1) => {
    if (!config) return;
    const next = [...config.discover_order], j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    if (next.indexOf("video_groups") > next.indexOf("reading")) return;           // product rule: reading never above the video groups
    setConfig({ ...config, discover_order: next });
  };
  const slot = (i: number, id: string) => {
    if (!config) return;
    const next = [...config.editors_choice]; if (id) next[i] = id; else next.splice(i, 1);
    setConfig({ ...config, editors_choice: next.filter((v, k) => v && next.indexOf(v) === k).slice(0, 3) });
  };
  const save = async () => {
    if (!config || !dirty || stale) return;
    const data = await call({ action: "save_display", expectedVersion: version, config }, true);
    if (data?.receipt) { setNotice(`Đã lưu cấu hình và ghi nhật ký. ${data.snapshotSynced === true ? "Bản công khai cho học viên đã cập nhật; app thấy thay đổi ở lần mở sau." : data.snapshotSynced === false ? "Chưa cập nhật được bản công khai nên học viên chưa thấy thay đổi này." : "Máy chủ này chưa bật bản công khai; app học viên dùng nội dung đi kèm."}`); await load(); }
  };

  return <section className="owner-panel owner-display" aria-label="Cấu hình hiển thị trên app">
    <div className="owner-panel-heading"><div><span className="owner-kicker">HIỂN THỊ</span><h2>Cấu hình hiển thị trên app</h2>
      <p>Mỗi khu trong Khám phá hiện gì, theo thứ tự nào, chính sách chung và quy tắc duyệt. Mọi thay đổi được ghi nhật ký. Cấu hình được lưu trước; app đọc nó ở giai đoạn sau.</p></div></div>
    {busy && <p role="status">Đang đối chiếu với máy chủ…</p>}
    {error && <p className="owner-error" role="alert">{error}</p>}
    {notice && <p className="owner-success" role="status">{notice}</p>}
    {stale && <p className="owner-inline-warning" role="alert">Cần tải lại trước khi lưu tiếp. <button type="button" onClick={() => { setError(""); void load(); }}>Tải lại</button></p>}

    {config && <>
      <fieldset className="owner-display-group" disabled={busy || stale}><legend>Khám phá: thứ tự các khu</legend>
        <ol>{config.discover_order.map((id, i) => <li key={id}>
          <span>{i + 1}. {sectionLabel[id]}</span>
          <button type="button" aria-label={`Đưa lên: ${sectionLabel[id]}`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
          <button type="button" aria-label={`Đưa xuống: ${sectionLabel[id]}`} disabled={i === config.discover_order.length - 1} onClick={() => move(i, 1)}>↓</button></li>)}</ol>
        <p className="owner-hub-note">Quy tắc sản phẩm: video là trọng tâm. Bài đọc luôn nằm dưới nhóm video và nhỏ hơn; không cho kéo bài đọc lên trên.</p>
      </fieldset>

      <fieldset className="owner-display-group" disabled={busy || stale}><legend>Lựa chọn của biên tập</legend>
        {[0, 1, 2].map(i => <label className="owner-field" key={i}>Ô {i + 1}
          <select aria-label={`Ô lựa chọn ${i + 1}`} value={config.editors_choice[i] ?? ""} onChange={e => slot(i, e.target.value)}>
            <option value="">(trống)</option>
            {config.editors_choice[i] && !candidates.includes(config.editors_choice[i]) && <option value={config.editors_choice[i]}>{titleOf(config.editors_choice[i])} (không còn hiển thị)</option>}
            {candidates.map(id => <option key={id} value={id}>{titleOf(id)}</option>)}</select></label>)}
        {candidates.length === 0 && <p className="owner-hub-note">Chưa có nội dung nào đang hiển thị. Duyệt một nội dung rồi bật “Hiển thị cho học viên” trong tab Nội dung.</p>}
      </fieldset>

      <fieldset className="owner-display-group" disabled={busy || stale}><legend>Chính sách chung</legend>
        <label><input type="checkbox" checked={config.policies.show_teacher_names} onChange={e => setConfig({ ...config, policies: { ...config.policies, show_teacher_names: e.target.checked } })} /> Hiện tên tác giả giảng viên (chỉ khi hồ sơ đã kích hoạt)</label>
        <label><input type="checkbox" checked={config.policies.ai_image_label} onChange={e => setConfig({ ...config, policies: { ...config.policies, ai_image_label: e.target.checked } })} /> Gắn nhãn “Hình AI minh họa”</label>
        <p className="owner-hub-note">Cho phép bài đọc chỉ có chữ được đặt riêng ở màn “Hiển thị cho học viên” của bài đọc.</p>
      </fieldset>

      <fieldset className="owner-display-group" disabled={busy || stale}><legend>Quy tắc duyệt</legend>
        {(Object.keys(kindLabel) as (keyof DisplayConfig["review_rules"])[]).map(k => <label key={k}>
          <input type="checkbox" checked={config.review_rules[k].owner_self_review} onChange={e => setConfig({ ...config, review_rules: { ...config.review_rules, [k]: { owner_self_review: e.target.checked } } })} /> {kindLabel[k]}: Owner được tự duyệt nội dung do chính mình soạn</label>)}
        <p className="owner-hub-note">Tắt thì Owner không duyệt được nội dung MCY của loại đó. Hiện chưa có người duyệt thứ hai, nên tắt nghĩa là loại đó tạm dừng duyệt. Nội dung giảng viên luôn do Owner duyệt. AI chỉ có thể gợi ý, không bao giờ tự duyệt (chưa có tính năng gợi ý duyệt).</p>
      </fieldset>

      <div className="owner-form-footer"><span>Phiên bản cấu hình {version}{dirty ? " · có thay đổi chưa lưu" : ""}</span>
        <button type="button" className="owner-primary" disabled={!dirty || busy || stale} onClick={() => void save()}>Lưu cấu hình</button>
        <button type="button" disabled={!dirty || busy} onClick={() => setConfig(saved)}>Hoàn tác thay đổi</button></div>

      <section className="owner-display-log" aria-label="Nhật ký thay đổi"><h3>Nhật ký thay đổi</h3>
        {log.length === 0 ? <p className="owner-hub-note">Chưa có thay đổi nào.</p> : <ul>{log.map((e, i) => <li key={i}>
          <strong>{new Date(e.at).toLocaleString("vi-VN")}</strong> · {e.kind === "config" ? "Đổi cấu hình hiển thị" : `Hiển thị ${e.after === true ? "bật" : "tắt"}: ${titleOf(e.subject.split("#")[0])} (phiên bản ${e.subject.split("#")[1] ?? "?"})`}</li>)}</ul>}
      </section>
    </>}
  </section>;
}
