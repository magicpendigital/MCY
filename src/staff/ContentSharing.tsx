import { useState } from "react";
import { validPayload } from "../../supabase/functions/_shared/contentWorkspaceContract";
import { AreaPicker } from "./AreaPicker";
import { lessonAreas } from "../courses/lessonFinder";

// Owner 28/11: (A) invite an active teacher to view and comment on one MCY lesson or course, comment only, never edit or decide;
// (B) standardise the older MCY video lessons by saving new versions that add browse areas and tags. Old versions stay unchanged.
type Run = (body: Record<string, unknown>, write: boolean) => Promise<Record<string, unknown> | null>;
export type ShareState = {
  item_id: string; shareable: boolean;
  shares: { reviewer_id: string; label: string | null; expires_at: string }[];
  eligible: { user_id: string; label: string | null }[];
  notes: { seq: number; note: string; at: string; label: string | null }[];
};
const day = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? "" : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`; };
const asStrings = (v: unknown): string[] => Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];

export function OwnerShareSection({ share, run, disabled, onChanged }: { share: ShareState; run: Run; disabled: boolean; onChanged: (message: string) => Promise<void> }) {
  const free = share.eligible.filter(e => !share.shares.some(s => s.reviewer_id === e.user_id));
  const [who, setWho] = useState("");
  const [days, setDays] = useState(7);
  const chosen = free.some(e => e.user_id === who) ? who : "";
  const invite = async () => {
    if (!chosen) return;
    const data = await run({ action: "share_set", itemId: share.item_id, reviewerId: chosen, active: true, expiresInDays: days }, true);
    if (data?.receipt) { setWho(""); await onChanged(`Đã mời góp ý trong ${days} ngày. Giảng viên chỉ xem và góp ý; không sửa, không duyệt.`); }
  };
  const withdraw = async (reviewerId: string) => {
    const data = await run({ action: "share_set", itemId: share.item_id, reviewerId, active: false, expiresInDays: 1 }, true);
    if (data?.receipt) await onChanged("Đã thu hồi lời mời. Góp ý đã gửi vẫn được giữ.");
  };
  return <section className="owner-hub-share" aria-label="Mời giảng viên góp ý"><h4>Mời giảng viên góp ý</h4>
    <p className="owner-hub-note">Giảng viên được mời chỉ xem bài và gửi góp ý cho bạn. Họ không sửa, không duyệt; bạn quyết định và tự lưu phiên bản mới nếu cần.</p>
    {share.shares.length > 0 && <ul aria-label="Đang được mời">{share.shares.map(s => <li key={s.reviewer_id}>{s.label ?? "Giảng viên"} · đến {day(s.expires_at)} <button type="button" disabled={disabled} onClick={() => void withdraw(s.reviewer_id)}>Thu hồi</button></li>)}</ul>}
    {free.length > 0 ? <div className="owner-hub-share-form">
      <label className="owner-field">Giảng viên<select aria-label="Giảng viên được mời" value={chosen} disabled={disabled} onChange={e => setWho(e.target.value)}><option value="">Chọn giảng viên</option>{free.map(e => <option key={e.user_id} value={e.user_id}>{e.label ?? "Giảng viên"}</option>)}</select></label>
      <label className="owner-field">Thời hạn<select aria-label="Thời hạn lời mời" value={days} disabled={disabled} onChange={e => setDays(Number(e.target.value))}>{[1, 7, 14, 30].map(n => <option key={n} value={n}>{n} ngày</option>)}</select></label>
      <button type="button" className="owner-primary" disabled={disabled || !chosen} onClick={() => void invite()}>Mời góp ý</button>
    </div> : share.shares.length === 0 && <p>Chưa có giảng viên đang hoạt động để mời.</p>}
    {share.notes.length > 0 && <section aria-label="Góp ý của giảng viên"><h4>Góp ý của giảng viên</h4><ul>{share.notes.map((n, i) => <li key={i}><small>{n.label ?? "Giảng viên"} · phiên bản {n.seq} · {day(n.at)}</small><br />{n.note}</li>)}</ul></section>}
  </section>;
}

type Legacy = { item_id: string; seq: number; title: string; payload: Record<string, unknown> };
type RowState = { areas: string[]; tags: string; picked: boolean };
const tagList = (s: string) => s.split(",").map(t => t.trim()).filter(Boolean);

export function LegacyLessonsPanel({ items, run, disabled, onDone, onClose }: { items: Legacy[]; run: Run; disabled: boolean; onDone: (message: string, stopped: boolean) => Promise<void>; onClose: () => void }) {
  const [rows, setRows] = useState<Record<string, RowState>>(() => Object.fromEntries(items.map(i => [i.item_id, { areas: lessonAreas({ title: i.title }, "gentle"), tags: asStrings(i.payload.tags).join(", "), picked: false }])));
  const [confirm, setConfirm] = useState(false);
  const [progress, setProgress] = useState("");
  const [working, setWorking] = useState(false);
  const picked = items.filter(i => rows[i.item_id]?.picked);
  const patch = (id: string, p: Partial<RowState>) => setRows(r => ({ ...r, [id]: { ...r[id], ...p } }));
  const payloadFor = (i: Legacy) => {
    const { tags: _old, ...rest } = i.payload; void _old;
    const tags = tagList(rows[i.item_id].tags);
    return { ...rest, areas: rows[i.item_id].areas, ...(tags.length ? { tags } : {}) };
  };
  const bad = picked.filter(i => !validPayload("video_lesson", payloadFor(i)));

  // One lesson at a time with the Owner's own session; the first refusal stops the batch so nothing is retried blindly.
  const saveAll = async () => {
    setConfirm(false); setWorking(true);
    let done = 0, stop = "";
    try {
      for (const i of picked) {
        setProgress(`Đang lưu ${done + 1}/${picked.length}: ${i.title}`);
        const saved = await run({ action: "save_content", itemId: i.item_id, kind: "video_lesson", title: i.title, payload: payloadFor(i), expectedSeq: i.seq }, true);
        const receipt = saved?.receipt as { seq?: number } | undefined;
        if (!receipt || !Number.isInteger(receipt.seq)) { stop = `Dừng ở "${i.title}": chưa lưu được bài này.`; break; }
        const sent = await run({ action: "submit_content", itemId: i.item_id, expectedSeq: receipt.seq }, true);
        if (!sent?.receipt) { stop = `Dừng ở "${i.title}": đã lưu nháp nhưng chưa gửi duyệt (mở bài để gửi).`; break; }
        done++;
      }
    } finally { setWorking(false); setProgress(""); }
    const kept = "Phiên bản cũ không đổi; bài đang hiện cho học viên vẫn hiện bản cũ cho đến khi bạn duyệt và bật bản mới.";
    await onDone(stop ? `Đã tạo ${done}/${picked.length} phiên bản mới. ${stop} Không tự gửi lại; tải lại để đối chiếu. ${kept}` : `Đã tạo ${done} phiên bản mới có mục tìm bài và gửi vào hàng chờ duyệt. ${kept}`, Boolean(stop));
  };

  return <section className="owner-hub-legacy" aria-label="Chuẩn hoá bài video cũ">
    <div className="owner-hub-detail-head"><div><span className="owner-kicker">CHUẨN HOÁ</span><h3>Bài video MCY chưa có mục tìm bài</h3>
      <p>{items.length} bài. Mỗi bài được lưu thành phiên bản mới có thêm mục tìm bài và thẻ, rồi gửi vào hàng chờ để bạn duyệt như thường. Phiên bản cũ giữ nguyên.</p></div>
      <button type="button" onClick={onClose} disabled={working}>Đóng</button></div>
    {items.length === 0 ? <p>Mọi bài video MCY đã có mục tìm bài.</p> : <>
      <p className="owner-hub-note">Ô đã đánh dấu sẵn là <strong>gợi ý đoán từ tên bài</strong>, chưa phải quyết định. Hãy xem lại từng bài trước khi lưu.</p>
      <label className="owner-hub-legacy-all"><input type="checkbox" disabled={disabled || working} checked={picked.length === items.length} onChange={e => setRows(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, { ...v, picked: e.target.checked }])))} /> Chọn tất cả ({picked.length}/{items.length})</label>
      <ul className="owner-hub-legacy-list">{items.map(i => <li key={i.item_id}>
        <label className="owner-hub-legacy-pick"><input type="checkbox" aria-label={`Chọn ${i.title}`} disabled={disabled || working} checked={rows[i.item_id].picked} onChange={e => patch(i.item_id, { picked: e.target.checked })} /> <strong>{i.title}</strong> <small>phiên bản {i.seq}</small></label>
        <AreaPicker value={rows[i.item_id].areas} disabled={disabled || working} onChange={areas => patch(i.item_id, { areas })} />
        <label className="owner-field">Thẻ (cách nhau bằng dấu phẩy, tối đa 8)<input aria-label={`Thẻ của ${i.title}`} maxLength={340} disabled={disabled || working} value={rows[i.item_id].tags} onChange={e => patch(i.item_id, { tags: e.target.value })} /></label>
      </li>)}</ul>
      {bad.length > 0 && <p className="owner-error" role="alert">Kiểm lại thẻ của: {bad.map(i => i.title).join(", ")} (tối đa 8 thẻ, mỗi thẻ tối đa 40 ký tự).</p>}
      {progress && <p role="status">{progress}</p>}
      {!confirm ? <button type="button" className="owner-primary" disabled={disabled || working || picked.length === 0 || bad.length > 0} onClick={() => setConfirm(true)}>Lưu và gửi duyệt {picked.length} bài</button>
        : <div role="alertdialog" aria-label="Xác nhận chuẩn hoá"><p><strong>Tạo {picked.length} phiên bản mới và gửi duyệt?</strong> Không duyệt và không đổi gì học viên đang thấy.</p>
          <button type="button" className="owner-primary" disabled={working} onClick={() => void saveAll()}>Xác nhận</button> <button type="button" onClick={() => setConfirm(false)}>Hủy</button></div>}
    </>}
  </section>;
}
