import { lazy, Suspense, useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { authRedirectUrl, backendConfigured, getSupabaseClient } from "../backend/supabase";
import "./owner.css";

const ContentReviewPanel = lazy(() => import("./ContentReviewPanel"));

type ModelOption = {
  id: string;
  name: string;
  provider: string;
  inputCostPerToken?: string;
  outputCostPerToken?: string;
};
type AiConfig = {
  enabled: boolean;
  model_id: string;
  system_prompt: string;
  temperature: number;
  max_output_tokens: number;
  per_user_daily_limit: number;
  global_daily_limit: number;
  version_no: number;
};
type OwnerPayload = {
  config: AiConfig;
  models: ModelOption[] | null;
  gatewayKeyConfigured: boolean;
  spendControlApproved: boolean;
  enableGateOpen: boolean;
  environment: "staging";
};

const promptDefault = "Bạn là trợ lý đồng hành nhẹ nhàng của Một chút yoga. Hãy lắng nghe điều người học chia sẻ, hỏi tối đa một câu làm rõ khi cần, rồi giúp họ nói rõ nhịp độ và hình thức thực hành mong muốn. Không chọn bài, chỉ định động tác hay diễn giải triệu chứng. Trả lời ngắn gọn, tự nhiên bằng ngôn ngữ người học đang dùng.";
const emptyConfig: AiConfig = {
  enabled: false,
  model_id: "",
  system_prompt: promptDefault,
  temperature: 0.3,
  max_output_tokens: 320,
  per_user_daily_limit: 10,
  global_daily_limit: 100,
  version_no: 1,
};

function displayError(error: unknown) {
  const context = (error as { context?: unknown } | null)?.context;
  if (context instanceof Response) {
    return context.clone().json().then((body: { error?: unknown }) => {
      const code = typeof body.error === "string" ? body.error : "";
      if (code === "owner_access_required") return "Tài khoản này chưa được cấp quyền Owner.";
      if (code === "gateway_key_required_before_enabling" || code === "ai_staging_gate_closed") return "Chưa mở gate AI staging. Cần cấu hình khóa dịch vụ và hoàn tất kiểm thử trước khi bật.";
      if (code === "unsupported_model") return "Model đã chọn không còn trong danh sách hỗ trợ. Hãy tải lại danh sách rồi chọn model khác.";
      if (code === "model_catalog_unavailable") return "Chưa tải được danh sách model hiện hành. Bạn vẫn có thể lưu cấu hình tắt hoặc thử lại sau.";
      if (code === "configuration_conflict") return "Cấu hình vừa được thay đổi ở nơi khác. Hãy tải lại trước khi lưu.";
      return "Không hoàn tất được thao tác. Hãy thử lại; chi tiết kỹ thuật không được hiển thị trong workspace.";
    }).catch(() => "Không hoàn tất được thao tác. Hãy thử lại sau.");
  }
  return Promise.resolve("Dịch vụ Owner chưa sẵn sàng. Không có thay đổi nào được lưu.");
}

function formatMillionTokens(value: string | undefined) {
  if (!value || !Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(Number(value) * 1_000_000);
}

export function OwnerWorkspace() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [config, setConfig] = useState<AiConfig | null>(null);
  const [models, setModels] = useState<ModelOption[] | null>(null);
  const [gatewayKeyConfigured, setGatewayKeyConfigured] = useState(false);
  const [spendControlApproved, setSpendControlApproved] = useState(false);
  const [contentReviewOpen, setContentReviewOpen] = useState(false);
  const sessionUserId = session?.user.id ?? null;
  const [enableGateOpen, setEnableGateOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Workspace Owner · Một chút yoga";
    return () => { document.title = "Một chút yoga"; };
  }, []);

  useEffect(() => {
    if (!backendConfigured) {
      setLoadingSession(false);
      return;
    }
    let active = true;
    let unsubscribe: (() => void) | null = null;
    void (async () => {
      try {
        const client = await getSupabaseClient();
        if (!active) return;
        if (!client) {
          setLoadingSession(false);
          return;
        }
        const listener = client.auth.onAuthStateChange((_event, nextSession) => {
          if (!active) return;
          setSession(nextSession);
          setLinkSent(false);
        });
        unsubscribe = () => listener.data.subscription.unsubscribe();
        const { data, error: sessionError } = await client.auth.getSession();
        if (!active) return;
        if (sessionError) setError("Chưa xác thực được phiên Owner. Hãy thử tải lại.");
        else setSession(data.session);
        setLoadingSession(false);
      } catch {
        if (active) {
          setError("Chưa tải được kết nối Owner. Hãy thử tải lại.");
          setLoadingSession(false);
        }
      }
    })();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!session || !backendConfigured) {
      setConfig(null);
      return;
    }
    let active = true;
    setLoadingConfig(true);
    setError("");
    void (async () => {
      try {
        const client = await getSupabaseClient();
        if (!client) throw new Error("Backend is not configured");
        const { data, error: invokeError } = await client.functions.invoke("owner-control-plane", { body: { action: "read_ai" } });
        if (!active) return;
        if (invokeError || !data?.config) {
          void displayError(invokeError).then(setError);
          return;
        }
        const result = data as OwnerPayload;
        setConfig(result.config);
        setModels(result.models);
        setGatewayKeyConfigured(result.gatewayKeyConfigured);
        setSpendControlApproved(result.spendControlApproved);
        setEnableGateOpen(result.enableGateOpen);
      } catch (cause) {
        if (active) void displayError(cause).then(setError);
      } finally {
        if (active) setLoadingConfig(false);
      }
    })();
    return () => { active = false; };
  }, [session]);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (!backendConfigured || !email.trim()) return;
    setSendingLink(true);
    setError("");
    setNotice("");
    try {
      const client = await getSupabaseClient();
      if (!client) throw new Error("Backend is not configured");
      const { error: authError } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: authRedirectUrl(), shouldCreateUser: false },
      });
      if (authError) throw authError;
      setLinkSent(true);
    } catch {
      setError("Chưa gửi được liên kết xác minh. Hãy kiểm tra email hoặc đăng nhập trong ứng dụng rồi mở lại workspace Owner.");
    } finally {
      setSendingLink(false);
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!backendConfigured || !config || saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const client = await getSupabaseClient();
      if (!client) throw new Error("Backend is not configured");
      const { data, error: invokeError } = await client.functions.invoke("owner-control-plane", {
        body: { action: "save_ai", config },
      });
      if (invokeError) throw invokeError;
      if (!data?.config) throw new Error("Configuration response missing");
      setConfig(data.config as AiConfig);
      setNotice("Đã lưu cấu hình AI vào staging và ghi audit. Cấu hình chưa tự bật inference.");
    } catch (cause) {
      setError(await displayError(cause));
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    if (!backendConfigured) return;
    try {
      const client = await getSupabaseClient();
      if (!client) return;
      const { error: signOutError } = await client.auth.signOut();
      if (signOutError) throw signOutError;
      setConfig(null);
    } catch {
      setError("Chưa đăng xuất được. Hãy thử lại.");
    }
  };

  return <div className="owner-shell">
    <header className="owner-topbar">
      <a className="owner-brand" href="/" aria-label="Một chút yoga, mở ứng dụng học viên"><span className="owner-mark" aria-hidden="true"><svg viewBox="0 0 100 100" focusable="false"><path d="M67 19C53 12 36 15 25 26C13 38 12 56 21 70C29 82 44 87 58 82" /><circle cx="74" cy="34" r="3.5" /></svg></span><span>Một chút yoga<small>WORKSPACE OWNER</small></span></a>
      {session && <div className="owner-session"><span>{session.user.email}</span><button type="button" onClick={() => { void signOut(); }}>Đăng xuất</button></div>}
    </header>

    {!backendConfigured && <main className="owner-main"><section className="owner-state-card"><span className="owner-kicker">CẤU HÌNH CẦN THIẾT</span><h1>Workspace Owner chưa kết nối.</h1><p>Chưa có cấu hình Supabase cho môi trường này. Thông tin tài khoản và quyền Owner chưa được tải.</p></section></main>}
    {backendConfigured && loadingSession && <main className="owner-main"><section className="owner-state-card"><span className="owner-kicker">ĐANG KIỂM TRA PHIÊN</span><h1>Đang xác thực workspace…</h1></section></main>}
    {backendConfigured && !loadingSession && !session && <main className="owner-main owner-auth-main"><section className="owner-intro"><span className="owner-kicker">QUẢN TRỊ · CHỈ DÀNH CHO OWNER</span><h1>Tùy chỉnh trợ lý AI cho MCY.</h1><p>Workspace xác minh phiên đăng nhập và quyền Owner ở máy chủ cho từng thao tác. Vai trò không thể chọn hoặc tự cấp từ trình duyệt.</p></section><form className="owner-panel owner-auth-card" onSubmit={event => { void signIn(event); }}><h2>Đăng nhập Owner</h2><p>Dùng email đã được cấp quyền Owner. Liên kết xác minh sẽ không tự tạo tài khoản hay quyền mới.</p><label>Email Owner<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label><button className="owner-primary" disabled={sendingLink}>{sendingLink ? "Đang gửi…" : "Gửi liên kết xác minh"}</button>{linkSent && <p className="owner-success" role="status">Nếu email có quyền đăng nhập, hãy mở liên kết trên thiết bị này, sau đó mở lại trang Owner.</p>}{error && <p className="owner-error" role="alert">{error}</p>}</form></main>}
    {backendConfigured && session && <main className="owner-main">
      <section className="owner-intro"><span className="owner-kicker">QUẢN TRỊ · STAGING</span><h1>AI và trải nghiệm học tập.</h1><p>Cấu hình AI chỉ có hiệu lực ở staging. Mọi thay đổi được kiểm tra role ở server và ghi audit; khóa dịch vụ chỉ tồn tại trong secret của Edge Function.</p><div className="owner-env-badge"><i />MCY STAGING · KHÔNG PHẢI PRODUCTION</div></section>
      {loadingConfig && <section className="owner-state-card"><h2>Đang tải cấu hình Owner…</h2></section>}
      {!loadingConfig && error && !config && <section className="owner-state-card"><span className="owner-kicker">KHÔNG CÓ QUYỀN HOẶC DỊCH VỤ</span><h2>Không thể mở cấu hình.</h2><p>{error}</p><p>Không hiển thị vai trò, cấu hình hay dữ liệu nếu server chưa xác nhận quyền Owner.</p></section>}
      {!loadingConfig && config && <>
        <nav className="owner-workspace-tabs" aria-label="Các phần quản trị"><button type="button" aria-pressed={!contentReviewOpen} onClick={() => setContentReviewOpen(false)}>Cấu hình AI</button><button type="button" aria-pressed={contentReviewOpen} onClick={() => setContentReviewOpen(true)}>Duyệt nội dung</button></nav>
        {contentReviewOpen ? <Suspense fallback={<p role="status">Đang mở phiếu duyệt…</p>}><ContentReviewPanel key={sessionUserId} userId={sessionUserId!} /></Suspense> : <>
        <section className="owner-status-grid" aria-label="Trạng thái AI staging">
          <article className={gatewayKeyConfigured ? "owner-status-card is-ready" : "owner-status-card"}><span className="owner-status-dot"/><div><strong>Khóa AI Gateway</strong><small>{gatewayKeyConfigured ? "Đã cấu hình phía server" : "Chưa cấu hình · không thể gọi model"}</small></div></article>
          <article className={spendControlApproved ? "owner-status-card is-ready" : "owner-status-card"}><span className="owner-status-dot"/><div><strong>Phê duyệt chi phí</strong><small>{spendControlApproved ? "Đã xác nhận phía server" : "Chưa xác nhận · AI và truy vấn model vẫn khóa"}</small></div></article>
          <article className={enableGateOpen ? "owner-status-card is-ready" : "owner-status-card"}><span className="owner-status-dot"/><div><strong>Gate inference staging</strong><small>{enableGateOpen ? "Đã mở phía server" : "Đang khóa cho đến khi kiểm thử và kiểm soát chi phí đạt"}</small></div></article>
          <article className={models ? "owner-status-card is-ready" : "owner-status-card"}><span className="owner-status-dot"/><div><strong>Danh sách model</strong><small>{models ? `${models.length} model văn bản hiện hành` : "Không tải được · nút bật vẫn bị khóa"}</small></div></article>
        </section>

        <form className="owner-panel owner-ai-form" onSubmit={event => { void save(event); }}>
          <div className="owner-panel-heading"><div><span className="owner-kicker">CẤU HÌNH AI · V{config.version_no}</span><h2>Trợ lý AI đồng hành</h2><p>Chọn model và giọng điệu; giới hạn an toàn bắt buộc được áp dụng riêng ở server.</p></div><label className="owner-switch"><input type="checkbox" checked={config.enabled} disabled={!config.enabled && !(gatewayKeyConfigured && enableGateOpen)} onChange={event => setConfig({ ...config, enabled: event.target.checked })} /><span aria-hidden="true"/><b>{config.enabled ? "Đang bật" : "Đang tắt"}</b></label></div>
          {!gatewayKeyConfigured && !config.enabled && <div className="owner-inline-warning"><strong>Inference đang được giữ tắt.</strong> Owner đã hoãn chọn mức chi và chu kỳ giới hạn; chưa tạo hoặc cấu hình Gateway key. Bạn vẫn có thể lưu prompt và giới hạn khi AI đang tắt.</div>}
          {!gatewayKeyConfigured && config.enabled && <div className="owner-inline-warning"><strong>Thiếu cấu hình provider.</strong> Cấu hình inference đang bật nhưng server không có Gateway key nên yêu cầu sẽ bị từ chối. Hãy tắt AI và lưu lại để giữ trạng thái fail-closed.</div>}
          {gatewayKeyConfigured && !enableGateOpen && <div className="owner-inline-warning"><strong>Gate đang khóa.</strong> Trước khi mở cần hoàn tất review privacy, actor/abuse tests, an toàn đầu ra, giám sát ngân sách và kill switch.</div>}

          <label className="owner-field">Model
            <select value={config.model_id} disabled={!models?.length} onChange={event => setConfig({ ...config, model_id: event.target.value })} required={config.enabled}>
              {!config.model_id && <option value="">{models?.length ? "Chọn model từ danh sách hiện hành" : "Chưa có danh sách model · AI giữ tắt"}</option>}
              {config.model_id && !models?.some(model => model.id === config.model_id) && <option value={config.model_id}>{config.model_id} · không còn trong danh sách</option>}
              {models?.map(model => <option key={model.id} value={model.id}>{model.name} · {model.provider} · ${formatMillionTokens(model.inputCostPerToken)}/${formatMillionTokens(model.outputCostPerToken)} / 1M token (input/output)</option>)}
            </select>
            <small>{config.enabled
              ? "Cần chọn model để bật inference. Danh sách và giá được lấy từ Gateway; giá có thể thay đổi. Hãy đặt giới hạn chi tiêu riêng với nhà cung cấp dịch vụ."
              : "AI đang tắt nên bạn có thể lưu cấu hình mà chưa chọn model. Nếu bật AI sau này, hãy chọn model và đặt giới hạn chi tiêu với nhà cung cấp dịch vụ."}</small>
          </label>

          <label className="owner-field">Vai trò và giọng điệu của trợ lý
            <textarea minLength={40} maxLength={6000} rows={7} value={config.system_prompt} onChange={event => setConfig({ ...config, system_prompt: event.target.value })} required />
            <small>40–6.000 ký tự. Không thể ghi đè quy tắc an toàn cố định; hiện AI chưa được phép tự chọn bài hoặc chỉ định động tác.</small>
          </label>

          <div className="owner-config-grid">
            <label className="owner-field">Mức sáng tạo <strong>{Number(config.temperature).toFixed(2)}</strong><input type="range" min="0" max="0.7" step="0.05" value={config.temperature} onChange={event => setConfig({ ...config, temperature: Number(event.target.value) })} /><small>Giới hạn server: 0–0,70.</small></label>
            <label className="owner-field">Số token đầu ra tối đa<select value={config.max_output_tokens} onChange={event => setConfig({ ...config, max_output_tokens: Number(event.target.value) })}>{[128, 192, 256, 320, 384, 512].map(value => <option key={value} value={value}>{value}</option>)}</select><small>Giới hạn server: 64–512 token/lượt.</small></label>
            <label className="owner-field">Lượt mỗi người / 24 giờ<input type="number" min="1" max="50" value={config.per_user_daily_limit} onChange={event => setConfig({ ...config, per_user_daily_limit: Number(event.target.value) })} /><small>Tối đa 50.</small></label>
            <label className="owner-field">Lượt toàn hệ thống / 24 giờ<input type="number" min="1" max="500" value={config.global_daily_limit} onChange={event => setConfig({ ...config, global_daily_limit: Number(event.target.value) })} /><small>Tối đa 500; đây không thay thế dollar-spend limit của provider.</small></label>
          </div>
          <div className="owner-form-footer"><span>Version {config.version_no} · cập nhật mới sẽ được ghi audit, không lưu prompt/chat vào usage log.</span><button className="owner-primary" type="submit" disabled={saving || (!models?.length && config.enabled)}>{saving ? "Đang lưu…" : "Lưu cấu hình staging"}</button></div>
          {notice && <p className="owner-success" role="status">{notice}</p>}{error && config && <p className="owner-error" role="alert">{error}</p>}
        </form>

        <section className="owner-panel owner-teacher-gate"><div><span className="owner-kicker">PILOT GIÁO VIÊN</span><h2>Chưa mở quyền mời hoặc tải media.</h2><p>Cần hoàn tất API lời mời, kiểm thử theo vai trò, reviewer độc lập, quyền và thời hạn lưu nội dung, cùng hạn mức lưu trữ. Hiện chưa thể gửi lời mời, tạo hồ sơ giáo viên hoặc lưu bản nháp tại đây.</p></div><span className="owner-locked">ĐANG KHÓA</span></section>
        </>}
      </>}
    </main>}
    <footer className="owner-footer"><span>Quyền thật ở server · không đọc dữ liệu học viên · không có thao tác publish</span><a href="/">Mở ứng dụng học viên</a></footer>
  </div>;
}
