import fs from 'node:fs';import assert from 'node:assert/strict';
const base='.vercel/ux-step4-2-20261014/',file=base+'src/Prototype.tsx';let s=fs.readFileSync(file,'utf8');
const start=s.indexOf('function CheckinScreen()'),end=s.indexOf('function CheckinFooter()',start);let c=s.slice(start,end);
c=c.replace('  const [regionGroup,',`  const [showBodyAreas, setShowBodyAreas] = useState(() => state.preObservations.length > 0);
  useEffect(() => {
    if (state.checkinStep === 1 && state.preObservations.length > 0) setShowBodyAreas(true);
  }, [state.checkinStep, flow.current.key]);
  const [regionGroup,`);
c=c.replace('    <p className="mcy-lead">{state.checkinStep === 2', '    <p className="mcy-lead">{state.checkinStep === 1 ? (locale === "en-US" ? "Choose what fits now. You can add a body area if you want." : "Chọn điều phù hợp lúc này. Bạn có thể ghi thêm một vùng nếu muốn.") : state.checkinStep === 2');
const a=c.indexOf('    {state.checkinStep === 1 ? <div'),b=c.indexOf('      <div className="mcy-checkin-illustration">',a);assert(a>0&&b>a);
c=c.slice(0,a)+`    {state.checkinStep === 1 ? <>
      <div className="mcy-checkin-quick-choices" aria-label={locale === "en-US" ? "How your body feels now" : "Cảm nhận cơ thể lúc này"}>
        <Choice selected={state.bodyStatus === "none_now"} onClick={() => chooseStatus("none_now")}>{msg(locale, "checkin.noDiscomfort")}</Choice>
        <button className="mcy-choice mcy-body-disclosure" aria-expanded={showBodyAreas} aria-controls="checkin-body-areas" onClick={() => setShowBodyAreas(open => !open)}>
          <span>{state.preObservations.length ? (locale === "en-US" ? "Edit body areas" : "Sửa vùng đã ghi") : (locale === "en-US" ? "Add a body area" : "Muốn ghi một vùng")}</span>
          {state.preObservations.length > 0 && <small>{locale === "en-US" ? state.preObservations.length + " entries retained" : "Giữ " + state.preObservations.length + " ghi nhận"}</small>}
          <ChevronDownIcon aria-hidden="true" />
        </button>
        <Choice selected={state.bodyStatus === "uncertain"} onClick={() => chooseStatus("uncertain")}>{msg(locale, "checkin.unsure")}</Choice>
      </div>
      {statusDescription && <p className="mcy-status-caption" role="status">{statusDescription}</p>}
      <div id="checkin-body-areas" hidden={!showBodyAreas}>
      {showBodyAreas && <div className="mcy-checkin-content checkin-step-body">
`+c.slice(b);
const statusStart=c.indexOf('        <div className="mcy-body-status-actions">'),statusEnd=c.indexOf('        <div className="mcy-inline-note">',statusStart);assert(statusStart>0);c=c.slice(0,statusStart)+c.slice(statusEnd);
c=c.replace('    </div> : <div className="mcy-checkin-step-two">','    </div>}\n      </div>\n      {!showBodyAreas && <div className="mcy-inline-note"><InfoCircledIcon />{msg(locale, "checkin.disclaimer")}</div>}\n    </> : <div className="mcy-checkin-step-two">');
s=s.slice(0,start)+c+s.slice(end);fs.writeFileSync(file,s);
fs.appendFileSync(base+'src/prototype.css',`\n/* Step 4.2: neutral choices precede optional body-area editing. */
.mcy-checkin-quick-choices { display:grid; gap:10px; width:100%; max-width:1000px; margin:16px auto; }
.mcy-checkin-quick-choices > .mcy-choice { width:100%; min-height:52px; padding:13px 16px; font-size:14px; text-align:left; }
.mcy-body-disclosure { display:flex; align-items:center; gap:12px; }
.mcy-body-disclosure > span { flex:1; }
.mcy-body-disclosure > small { color:var(--mcy-muted); font-size:11px; }
.mcy-body-disclosure > svg { width:18px; height:18px; flex:none; }
.mcy-body-disclosure[aria-expanded="true"] > svg { transform:rotate(180deg); }
.mcy-checkin-quick-choices + .mcy-status-caption { max-width:1000px; margin:8px auto 16px; }
#checkin-body-areas[hidden] { display:none; }
@media (min-width:900px) { .mobile-web-stage[data-runtime-mode="web"] .mcy-checkin-quick-choices { grid-template-columns:repeat(3,minmax(0,1fr)); } }
`);
for(const name of ['qa-global-setup.mjs','qa.playwright.config.mjs','preview.mjs']){let h=fs.readFileSync('analyse/ux-step4-1-2026-10-14/'+name,'utf8').replaceAll('ux-step4-1','ux-step4-2').replaceAll('4192','4194').replaceAll('4188','4189');if(name==='qa.playwright.config.mjs')h=h.replace("testMatch:[", "testMatch:['ux-checkin-layout.spec.ts',");fs.writeFileSync('analyse/ux-step4-2-2026-10-14/'+name,h);}
console.log('Scoped CheckinScreen disclosure and CSS prepared');
