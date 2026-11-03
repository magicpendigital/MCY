import fs from 'node:fs';
import assert from 'node:assert/strict';
const root='.vercel/ux-step4-5-20261017/src/';
let s=fs.readFileSync(root+'Prototype.tsx','utf8');
const a=s.indexOf('    <div className="mcy-before-after">',s.indexOf('function ReflectionScreen()'));
const b=s.indexOf('    <RegionEditor region={editing}',a);
const old=s.slice(a,b);
const comparison=old.slice(0,old.indexOf('    <section className="mcy-field-section"><h2>{msg(locale, "reflection.overall")}'));
const overall=old.slice(old.indexOf('    <section className="mcy-field-section"><h2>{msg(locale, "reflection.overall")}'),old.indexOf('    <section className="mcy-field-section compact"'));
const pace=old.slice(old.indexOf('    <section className="mcy-field-section compact"'),old.indexOf('    {state.outcome ==='));
const alert=old.slice(old.indexOf('    {state.outcome ==='),old.indexOf('    <label className="mcy-note-label"'));
const note=old.slice(old.indexOf('    <label className="mcy-note-label"'),old.indexOf('    <DemoNote>'));
const maps=comparison.slice(0,comparison.indexOf('    <p className="mcy-reflection-hint">'))
 .replace('<div className="mcy-before-after">','<div className="mcy-before-after" role="group" aria-label={msg(locale, "reflection.comparison")}>')
 .replaceAll('<div><BodyMap','<figure><BodyMap').replaceAll('/><span>{msg(locale, "reflection.before")}</span></div>','/><figcaption>{msg(locale, "reflection.before")}</figcaption></figure>')
 .replaceAll('/><span>{msg(locale, "reflection.after")}</span></div>','/><figcaption>{msg(locale, "reflection.after")}</figcaption></figure>');
const rows=comparison.slice(comparison.indexOf('    <section className="mcy-field-section">'),comparison.indexOf('    <button className="mcy-standalone-link"'));
const options=comparison.slice(comparison.indexOf('    {beforeObservations.length > 0'));
const add=comparison.slice(comparison.indexOf('    <button className="mcy-standalone-link"'),comparison.indexOf('    {beforeObservations.length > 0'));
const replacement=`    {beforeObservations.length > 0 ? <section className="mcy-reflection-comparison">
${maps}    <p className="mcy-reflection-hint">{msg(locale, "reflection.hint")}</p>
${rows}${options}    </section> : <p className="mcy-reflection-baseline">{msg(locale, state.reflectionBeforeStatus === "none_now" ? "reflection.beforeNone" : state.reflectionBeforeStatus === "uncertain" ? "reflection.beforeUnsure" : "reflection.noRegionalBaseline")}</p>}
${overall}${alert}    {state.postObservations.filter(item => !beforeObservations.some(before => before.region === item.region && before.side === item.side)).length > 0 && <section className="mcy-reflection-current"><h2>{msg(locale, "reflection.currentAreas")}</h2><div className="mcy-reflection-current-list">{state.postObservations.filter(item => !beforeObservations.some(before => before.region === item.region && before.side === item.side)).map(item => <button key={item.region + "-" + item.side} onClick={() => openRegion(item.region, item.side)}><span><strong>{regionLabel(locale, item.region)}{isPairedBodyRegion(item.region) && item.side !== "unspecified" ? " · " + sideLabel(locale, item.side) : ""}</strong><small>{item.status === "uncertain" ? bodyLevelLabel(locale, "Chưa rõ") : bodyLevelLabel(locale, item.level ?? msg(locale, "checkin.notRecorded"))}</small></span><ArrowRightIcon /></button>)}</div></section>}
    {state.postBodyStatus === "uncertain" && <p className="mcy-reflection-hint">{msg(locale, "reflection.unsureAfter")}</p>}
    <details className="mcy-reflection-details"><summary><span>{msg(locale, "reflection.details")}<small>{msg(locale, "reflection.optional")}</small></span><ChevronDownIcon /></summary><div className="mcy-reflection-details-content">
    {beforeObservations.length === 0 && <figure className="mcy-reflection-after-map"><BodyMap observations={state.postObservations} bodyStyle={state.bodyStyle} compact locale={locale} /><figcaption>{msg(locale, "reflection.after")}</figcaption></figure>}
${add}${pace}${note}    <DemoNote>{msg(locale, "reflection.note")}</DemoNote>
    </div></details>
    <p className="mcy-reflection-scope"><InfoCircledIcon />{msg(locale, "reflection.noteScope")}</p>
`;
s=s.slice(0,a)+replacement+s.slice(b);
s=s.replace('<p className="mcy-lead">{msg(locale, "reflection.lead")}</p>','<p className="mcy-lead">{msg(locale, beforeObservations.length ? "reflection.lead" : "reflection.generalLead")}</p>');
assert(s.includes('function ReflectionFooter()'));fs.writeFileSync(root+'Prototype.tsx',s);
let i=fs.readFileSync(root+'i18n.ts','utf8');
const entries={vi:{comparison:'Ghi nhận trước và sau tập',beforeNone:'Trước tập, bạn đã chọn không thấy khó chịu; chưa ghi riêng từng vùng.',beforeUnsure:'Trước tập, bạn đã chọn chưa rõ; chưa ghi riêng từng vùng.',noRegionalBaseline:'Chưa có ghi nhận vùng trước tập để so sánh.',generalLead:'Bạn có thể ghi cảm nhận chung theo trải nghiệm của mình, hoặc bỏ qua.',currentAreas:'Vùng bạn đã ghi sau tập',details:'Ghi thêm vùng, nhịp tập hoặc lời nhắn',general:'Cảm nhận chung'},en:{comparison:'Before and after self-reports',beforeNone:'Before practice, you chose no discomfort; no individual areas were recorded.',beforeUnsure:'Before practice, you chose not sure; no individual areas were recorded.',noRegionalBaseline:'There are no before-practice area entries to compare.',generalLead:'You can reflect on your overall experience, or skip.',currentAreas:'Areas you recorded after practice',details:'Add an area, pace or note',general:'Overall feeling'}};
for(const [lang,values] of Object.entries(entries)){
 const marker=lang==='vi'?'  "reflection.before": "Trước tập",':'  "reflection.before": "Before practice",';
 assert(i.includes(marker));i=i.replace(marker,Object.entries(values).map(([k,v])=>`  "reflection.${k}": ${JSON.stringify(v)},`).join('\n')+'\n'+marker);
}
fs.writeFileSync(root+'i18n.ts',i);
fs.appendFileSync(root+'prototype.css',`
/* Step 4.5: Reflection content only; retained routes cannot style shared chrome. */
.mcy-reflection-page { max-width:720px; margin-inline:auto; }
.mcy-reflection-page > h1 { font-size:clamp(27px,7vw,34px); line-height:1.16; margin-bottom:12px; }
.mcy-reflection-page > .mcy-lead { margin-bottom:16px; }
.mcy-reflection-page > .mcy-inline-note { margin:0 0 16px; font-size:12px; }
.mcy-reflection-page .mcy-reflection-baseline { margin:0 0 22px; color:var(--mcy-muted); font-size:12px; line-height:1.5; }
.mcy-reflection-page .mcy-field-section { margin:0 0 22px; }
.mcy-reflection-page .mcy-field-section h2 { display:flex; flex-wrap:wrap; gap:5px 9px; align-items:baseline; margin-bottom:12px; font-size:22px; }
.mcy-reflection-page .mcy-field-section h2 small { color:var(--mcy-muted); font:12px/1.5 var(--font-sans); }
.mcy-reflection-page .mcy-reflection-grid { gap:10px; }
.mcy-reflection-page .mcy-reflection-grid .mcy-choice { min-height:58px; padding:12px 9px; font-size:14px; font-weight:500; line-height:1.4; overflow-wrap:anywhere; }
.mcy-reflection-page .mcy-reflection-grid .mcy-choice.selected { border-color:var(--mcy-sage); background:var(--mcy-pale); }
.mcy-reflection-page .mcy-before-after { margin:0 0 14px; gap:8px; grid-template-columns:minmax(0,1fr) 20px minmax(0,1fr); }
.mcy-reflection-page .mcy-before-after figure { min-width:0; margin:0; text-align:center; }
.mcy-reflection-page figcaption { margin-top:8px; font-size:12px; line-height:1.5; color:var(--mcy-ink); }
.mcy-reflection-page .mcy-before-arrow { text-align:center; color:var(--mcy-muted); }
.mcy-reflection-page .mcy-reflection-hint { color:var(--mcy-muted); font-size:12px; line-height:1.55; margin:0 0 16px; }
.mcy-reflection-page .mcy-reflection-region-row > button:first-child { min-height:72px; grid-template-columns:minmax(0,1fr) minmax(0,1fr) 16px; padding:12px; }
.mcy-reflection-page .mcy-reflection-region-row strong { font-size:13px; line-height:1.4; overflow-wrap:anywhere; }
.mcy-reflection-page .mcy-reflection-region-row small { color:var(--mcy-muted); font-size:12px; line-height:1.4; }
.mcy-reflection-page .mcy-keep-region { min-height:44px; font-size:12px; line-height:1.45; padding:9px 12px; }
.mcy-reflection-page .mcy-post-options { flex-wrap:wrap; margin:0 0 24px; }
.mcy-reflection-page .mcy-post-options button { flex:1 1 120px; min-height:48px; font-size:12px; line-height:1.4; }
.mcy-reflection-page .mcy-alert { margin:0 0 22px; }
.mcy-reflection-page .mcy-reflection-current { margin:0 0 24px; }
.mcy-reflection-page .mcy-reflection-current h2 { font-size:20px; margin-bottom:12px; }
.mcy-reflection-page .mcy-reflection-current-list { display:grid; gap:8px; }
.mcy-reflection-page .mcy-reflection-current-list button { display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:60px; padding:12px 14px; border:1px solid var(--mcy-border); border-radius:12px; background:var(--mcy-paper); color:var(--mcy-ink); text-align:left; }
.mcy-reflection-page .mcy-reflection-current-list button span { display:grid; gap:5px; }
.mcy-reflection-page .mcy-reflection-current-list strong { font-size:14px; line-height:1.4; }
.mcy-reflection-page .mcy-reflection-current-list small { color:var(--mcy-muted); font-size:12px; }
.mcy-reflection-page .mcy-reflection-current-list svg { flex:none; }
.mcy-reflection-page .mcy-reflection-details { border-block:1px solid var(--mcy-border); margin:0 0 18px; }
.mcy-reflection-page .mcy-reflection-details > summary { display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:64px; padding:12px 0; color:var(--mcy-ink); font-size:14px; line-height:1.5; list-style:none; cursor:pointer; }
.mcy-reflection-page .mcy-reflection-details > summary::-webkit-details-marker { display:none; }
.mcy-reflection-page .mcy-reflection-details > summary > span { display:grid; gap:2px; }
.mcy-reflection-page .mcy-reflection-details > summary small { color:var(--mcy-muted); font-size:12px; }
.mcy-reflection-page .mcy-reflection-details > summary svg { flex:none; }
.mcy-reflection-page .mcy-reflection-details[open] > summary svg { transform:rotate(180deg); }
.mcy-reflection-page .mcy-reflection-details-content { padding:4px 0 20px; }
.mcy-reflection-page .mcy-reflection-after-map { margin:0 auto 18px; max-width:180px; text-align:center; }
.mcy-reflection-page .mcy-standalone-link { width:100%; min-height:48px; margin:0 0 22px; padding:10px 12px; border:1px solid var(--mcy-border); border-radius:12px; background:var(--mcy-paper); text-align:center; font-size:14px; }
.mcy-reflection-page .mcy-note-label { margin-top:0; font-size:16px; }
.mcy-reflection-page .mcy-note-label small { display:block; color:var(--mcy-muted); font-size:12px; line-height:1.5; }
.mcy-reflection-page .mcy-note-label textarea { min-height:100px; max-width:100%; font-size:16px; }
.mcy-reflection-page .mcy-reflection-scope { display:flex; gap:8px; align-items:flex-start; margin:0 0 12px; color:var(--mcy-muted); font-size:12px; line-height:1.6; }
.mcy-reflection-page .mcy-reflection-scope svg { flex:none; margin-top:3px; }
.mcy-reflection-page :is(button,summary,textarea):focus-visible { outline:3px solid var(--color-focus); outline-offset:3px; scroll-margin-block:24px; }
@container mcy-app-viewport (max-width:340px) { .mcy-reflection-page { padding-inline:18px; } }
`);
console.log('Reflection presentation applied; handlers/footer/routes unchanged by construction.');
