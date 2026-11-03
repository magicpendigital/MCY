import fs from 'node:fs';import assert from 'node:assert/strict';
const p='.vercel/ux-step4-5-20261017/src/Prototype.tsx';let s=fs.readFileSync(p,'utf8');
const intro='    <h1>{msg(locale, "reflection.title")}</h1><p className="mcy-lead">{msg(locale, beforeObservations.length ? "reflection.lead" : "reflection.generalLead")}</p>\n    {state.reflectionLessonTitle && <div className="mcy-inline-note"><InfoCircledIcon />{msg(locale, "course.reflectionLesson")} {state.reflectionLessonTitle}</div>}';
assert(s.includes(intro));s=s.replace(intro,'    <h1>{msg(locale, "reflection.title")}</h1>\n    {beforeObservations.length > 0 && <><p className="mcy-reflection-scope"><InfoCircledIcon />{msg(locale, "reflection.noteScope")}</p><p className="mcy-lead">{msg(locale, "reflection.lead")}</p></>}');
const helper='<p className="mcy-reflection-baseline">{msg(locale, state.reflectionBeforeStatus === "none_now" ? "reflection.beforeNone" : state.reflectionBeforeStatus === "uncertain" ? "reflection.beforeUnsure" : "reflection.noRegionalBaseline")}</p>';
assert(s.includes(helper));s=s.replace('</section> : '+helper+'}', '</section> : null}');
const start=s.indexOf('function ReflectionScreen()'),a=s.indexOf('    {state.outcome === "Khó chịu hơn"',start),b=s.indexOf('\n',a);
s=s.slice(0,b)+'\n    {beforeObservations.length === 0 && <><p className="mcy-reflection-scope"><InfoCircledIcon />{msg(locale, "reflection.noteScope")}</p>'+helper+'</>}'+s.slice(b);
const details='<div className="mcy-reflection-details-content">';
const context='\n    {state.reflectionLessonTitle && <div className="mcy-inline-note"><InfoCircledIcon />{msg(locale, "course.reflectionLesson")} {state.reflectionLessonTitle}</div>}';
s=s.replace(details,details+context);
const scope='    <p className="mcy-reflection-scope"><InfoCircledIcon />{msg(locale, "reflection.noteScope")}</p>\n    <RegionEditor';
assert(s.includes(scope));s=s.replace(scope,'    <RegionEditor');fs.writeFileSync(p,s);
// No-baseline lead is no longer displayed. Remove the unconsumed presentation key.
const ip='.vercel/ux-step4-5-20261017/src/i18n.ts';let i=fs.readFileSync(ip,'utf8');i=i.replace(/^  "reflection\.(generalLead|general)":.*\r?\n/gm,'');fs.writeFileSync(ip,i);
console.log('Core feeling and exact session notice precede secondary no-baseline context; handlers unchanged.');
