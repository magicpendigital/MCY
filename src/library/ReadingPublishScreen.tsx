import { useCallback, useEffect, useRef, useState } from "react";
import { MobileScroll } from "../mobile";
import { readPublication, setDefaultTextOnly, setUnitPublication, type PublicationChange, type PublicationList, type PublicationReason, type PublicationUnit, type TextOnlyMode } from "./readingPublicationApi";
import "./reading-learner.css";

// Reviewer screen "Hiển thị cho học viên" (design board 6). Approval records a decision; only this switch, together with
// the server's image and wording checks, makes a unit visible to learners. Every switch starts off.
const reasonText: Record<PublicationReason, string> = {
  ok: "Đang hiện cho học viên",
  not_approved: "Chưa duyệt đúng phiên bản này",
  switch_off: "Đang tắt",
  needs_images: "Giữ lại: còn thiếu hình",
  copy_pass: "Giữ lại: lời văn cần biên tập lại và duyệt lại",
  media_unverified: "Giữ lại: hình chưa đủ điều kiện",
  media_copy_failed: "Chưa đăng được hình, hãy thử lại",
  upload_failed: "Chưa đăng được bài, hãy thử lại",
};
const imageText = { complete: "đủ hình ở mọi bước", partial: "chỉ một phần bước có hình", none: "không có hình" } as const;
const errorText = (code: string) => code === "unit_not_approved" ? "Bài này chưa được duyệt ở phiên bản hiện tại." : code === "reading_publication_limit_reached" ? "Bạn đã đổi quá nhiều lần hôm nay. Hãy thử lại sau." : "Chưa lưu được. Hãy kiểm tra kết nối rồi thử lại.";

export default function ReadingPublishScreen({ userId }: { userId: string }) {
  const [list, setList] = useState<PublicationList | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<PublicationUnit | null>(null);
  const [message, setMessage] = useState("");
  const account = useRef(userId);
  account.current = userId;

  const load = useCallback(() => {
    void readPublication(userId).then(result => { if (account.current === userId) setList(result); });
  }, [userId]);
  useEffect(() => { setList(null); load(); }, [load]);

  const apply = async (run: () => Promise<PublicationChange>) => {
    setBusy(true); setMessage("");
    const result = await run();
    if (account.current !== userId) return;
    setBusy(false); setConfirming(null);
    if (result.status === "error") setMessage(errorText(result.code));
    else if (!result.synced) setMessage("Đã lưu lựa chọn nhưng chưa đăng được lên cho học viên. Hãy thử lại sau ít phút.");
    load();
  };

  const data = list?.status === "allowed" ? list : null;
  const shown = data?.units.filter(unit => unit.show).length ?? 0;
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-rl-page">
    <div className="mcy-eyebrow">DÀNH CHO BIÊN TẬP</div>
    <h1>Hiển thị cho học viên</h1>
    <p className="mcy-lead">Duyệt xong, bài chỉ hiện cho học viên khi bạn bật. Hình và chữ của bài đang bật là công khai.</p>
    {!list && <p className="mcy-inline-note" role="status">Đang tải…</p>}
    {list?.status === "unavailable" && <div className="mcy-form-error" role="alert">Chưa tải được. Hãy kiểm tra kết nối.<button className="mcy-quiet-link" onClick={() => { setList(null); load(); }}>Thử lại</button></div>}
    {list?.status === "denied" && <p className="mcy-inline-note" role="status">Tài khoản này không có bài nào để cấu hình.</p>}
    {message && <div className="mcy-form-error" role="alert">{message}</div>}
    {data && <>
      {data.canSetDefault && <fieldset className="mcy-rp2-policy" disabled={busy}>
        <legend>Với bài còn bước chưa có hình</legend>
        {([false, true] as const).map(value => <label key={String(value)} className={data.defaultTextOnlyAllowed === value ? "on" : ""}>
          <input type="radio" name="text-only-default" checked={data.defaultTextOnlyAllowed === value} onChange={() => { void apply(() => setDefaultTextOnly(userId, value)); }} />
          <span><strong>{value ? "Cho phép hiện chỉ chữ" : "Chỉ hiện khi đủ hình"}</strong><small>{value ? "Bài thiếu hình vẫn hiện với nhãn “Chỉ chữ”. Bạn vẫn đổi được cho từng bài." : "Bài còn thiếu hình được giữ lại cho đến khi bổ sung."}</small></span>
        </label>)}
      </fieldset>}
      <p className="mcy-rp2-count" role="status">{shown} bài đang hiện · {data.units.length - shown} bài giữ lại hoặc đang tắt</p>
      {data.units.length === 0 && <p className="mcy-inline-note" role="status">Chưa có bài nào được giao cho tài khoản này.</p>}
      <div className="mcy-rp2-list">{data.units.map(unit => <div key={unit.id} className="mcy-rp2-row">
        <div className="mcy-rp2-main">
          <strong>{unit.title}</strong>
          <small>{unit.decision === "approved" ? "Đã duyệt" : "Chưa duyệt"} · {unit.steps} bước · {imageText[unit.images]}</small>
          <small className={unit.show ? "good" : "held"}>{reasonText[unit.reason]}</small>
          {unit.decision === "approved" && unit.images !== "complete" && <label className="mcy-rp2-mode">Bài này chưa đủ hình
            <select value={unit.textOnlyMode} disabled={busy} onChange={event => { void apply(() => setUnitPublication(userId, unit, unit.switchOn, event.target.value as TextOnlyMode)); }}>
              <option value="inherit">Theo cài đặt chung</option><option value="allow">Cho phép hiện chỉ chữ</option><option value="require">Giữ lại cho đến khi đủ hình</option>
            </select></label>}
        </div>
        <button type="button" role="switch" aria-checked={unit.switchOn} aria-label={`Hiện cho học viên: ${unit.title}`} className={`mcy-rp2-switch${unit.switchOn ? " on" : ""}`} disabled={busy || unit.decision !== "approved"}
          onClick={() => { if (unit.switchOn) void apply(() => setUnitPublication(userId, unit, false, unit.textOnlyMode)); else setConfirming(unit); }}><span /></button>
      </div>)}</div>
      {confirming && <div className="mcy-rp2-confirm" role="alertdialog" aria-labelledby="rp2-confirm-title" aria-describedby="rp2-confirm-body">
        <strong id="rp2-confirm-title">Hiện công khai bài này?</strong>
        <p id="rp2-confirm-body">Chữ và hình của “{confirming.title}” sẽ công khai cho mọi học viên và khách. Hình do AI tạo. Chỉ bật khi bạn đã sẵn sàng; bạn tắt lại được bất cứ lúc nào.</p>
        <div><button type="button" className="ghost" onClick={() => setConfirming(null)}>Để sau</button>
          <button type="button" className="primary" disabled={busy} onClick={() => { void apply(() => setUnitPublication(userId, confirming, true, confirming.textOnlyMode)); }}>{busy ? "Đang lưu…" : "Bật cho học viên"}</button></div>
      </div>}
    </>}
  </main></MobileScroll>;
}
