import { useEffect, useRef, useState } from 'react';
import { getSupabaseClient } from '../backend/supabase';
import './teacher-collaboration.css';

type DocumentSummary={id:string;kind:'lesson'|'course';title:string;version_id:string;version_no:number;status:string;author_id:string};
type Enrollment={id:string;learner_label:string;course_version_id:string;completed:boolean;sessions:{id:string;lesson_version_id:string}[]};
type Workspace={role:'author'|'reviewer'|'admin'|'learner';profile:{display_name:string;bio:string}|null;documents:DocumentSummary[];enrollments:Enrollment[]};
type LessonSegment={instruction:string;stop_cue?:string};
type DocumentRead={document_id:string;kind:'lesson'|'course';version_id:string;version_no:number;status:string;payload:{title:string;instruction?:string;stop_cue?:string;segments?:LessonSegment[];lesson_version_ids?:string[]};pinned_lessons?:{version_id:string;version_no:number;payload:{title:string;segments:LessonSegment[]}}[];history:{version_no:number;status:string;author_id:string;created_at:string}[];reviews:{decision:string;message:string;reviewer_id:string}[]};
type Feedback={id:string;kind:'session'|'course';attendance_id:string|null;revision:number;teacher_id:string;body:string;provenance:string;sent_at:string|null};
type Editor={id:string|null;kind:'lesson'|'course';version:number;title:string;instruction:string;stopCue:string;lessons:string[];remainingSegments?:LessonSegment[]};
class CollaborationError extends Error { constructor(readonly code:string){super(code);} }
async function invoke<T>(action:string,payload:Record<string,unknown>={}):Promise<T>{
 const client=await getSupabaseClient();if(!client)throw new CollaborationError('collaboration_unavailable');
 const {data,error}=await client.functions.invoke('teacher-collaboration',{body:{action,payload}});
 if(error){
  let code='collaboration_unavailable';
  try{const context=(error as {context?:Response}).context;if(context instanceof Response){const body=await context.clone().json() as {error?:string};if(body.error)code=body.error;}}catch{/* Bounded generic failure. */}
  throw new CollaborationError(code);
 }
 if(!data || !('result' in data))throw new CollaborationError('collaboration_unavailable');
 return data.result as T;
}
const statusLabels:Record<string,string>={draft:'Bản nháp',submitted:'Chờ chuyên gia',changes_requested:'Cần chỉnh sửa',approved:'Đã được chuyên gia duyệt',withdrawn:'Đã thu hồi',superseded:'Đã có phiên bản mới'};
const messageFor=(cause:unknown)=>cause instanceof CollaborationError && cause.code==='collaboration_conflict'
 ? 'Dữ liệu đã thay đổi hoặc thao tác đã được ghi nhận. Tải lại trước khi tiếp tục.'
 : cause instanceof CollaborationError && cause.code==='collaboration_access_denied'
 ? 'Quyền hoặc phân công đã thay đổi. Không thể tiếp tục thao tác.'
 : 'Chưa hoàn tất thao tác. Kiểm tra nội dung hoặc thử lại sau.';

/** Additive invited-cohort UI. An unavailable gate leaves legacy own drafts available. */
export function TeacherCollaborationPanel({userId,onReadyChange}:{userId:string;onReadyChange:(userId:string|null)=>void}){
 const identity=useRef(userId);identity.current=userId;
 const callbacks=useRef(onReadyChange);callbacks.current=onReadyChange;
 const generation=useRef(0);
 const mutationInFlight=useRef<{actor:string}|null>(null);
 const [loadedUser,setLoadedUser]=useState<string|null>(null);
 const [workspace,setWorkspace]=useState<Workspace|null>(null);
 const [editor,setEditor]=useState<Editor|null>(null);
 const [read,setRead]=useState<DocumentRead|null>(null);
 const [feedback,setFeedback]=useState<Feedback[]>([]);
 const [enrollmentId,setEnrollmentId]=useState('');
 const [subject,setSubject]=useState('');
 const [feedbackBody,setFeedbackBody]=useState('');
 const [provenance,setProvenance]=useState('human');
 const [teacherConfirmed,setTeacherConfirmed]=useState(false);
 const [name,setName]=useState('');const [bio,setBio]=useState('');
 const [inviteEmail,setInviteEmail]=useState('');const [inviteReason,setInviteReason]=useState('');
 const [reviewMessage,setReviewMessage]=useState('');
 const [busy,setBusy]=useState(false);const [notice,setNotice]=useState('');const [error,setError]=useState('');
 const begin=()=>{const seq=++generation.current;const actor=userId;setBusy(true);setError('');setNotice('');return()=>seq===generation.current && identity.current===actor;};
 const beginMutation=()=>{
  if(mutationInFlight.current?.actor===userId)return null;
  const marker={actor:userId};mutationInFlight.current=marker;const current=begin();
  return {current,finish:()=>{if(mutationInFlight.current===marker)mutationInFlight.current=null;}};
 };
 const forget=()=>{setWorkspace(null);setLoadedUser(null);setEditor(null);setRead(null);setFeedback([]);callbacks.current(null);};
 const fail=(cause:unknown)=>{setError(messageFor(cause));if(cause instanceof CollaborationError && cause.code==='collaboration_access_denied')forget();};
 useEffect(()=>{
  const actor=userId,seq=++generation.current;let cancelled=false;
  mutationInFlight.current=null;
  forget();setEnrollmentId('');setSubject('');setFeedbackBody('');setTeacherConfirmed(false);setName('');setBio('');setBusy(true);setError('');setNotice('');
  void invoke<Workspace>('workspace').then(result=>{
   if(cancelled || seq!==generation.current || identity.current!==actor)return;
   if(!['author','reviewer','admin','learner'].includes(result.role) || !Array.isArray(result.documents) || !Array.isArray(result.enrollments))return;
   setWorkspace(result);setLoadedUser(actor);setName(result.profile?.display_name??'');setBio(result.profile?.bio??'');callbacks.current(actor);
  }).catch(()=>{/* Closed/new API does not erase working legacy fallback. */}).finally(()=>{if(!cancelled && seq===generation.current && identity.current===actor)setBusy(false);});
  return()=>{cancelled=true;++generation.current;callbacks.current(null);};
  // Callback is a ref; account changes invalidate every pending read/write.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[userId]);
 const refresh=async()=>{const next=await invoke<Workspace>('workspace');return next;};
 const act=async(action:string,payload:Record<string,unknown>,success:string,close=false)=>{
  const mutation=beginMutation();if(!mutation)return;const {current,finish}=mutation;
  try{await invoke(action,payload);const next=await refresh();if(!current())return;setWorkspace(next);setNotice(success);if(close){setEditor(null);setRead(null);}}
  catch(cause){if(current())fail(cause);}finally{finish();if(current())setBusy(false);}
 };
 const open=async(doc:DocumentSummary)=>{
  const current=begin();setEditor(null);setRead(null);setReviewMessage('');
  try{const result=await invoke<DocumentRead>('read_document',{document_id:doc.id});if(!current())return;
   setRead(result);setEditor({id:result.document_id,kind:result.kind,version:result.version_no,title:result.payload.title,
    instruction:result.payload.segments?.[0]?.instruction??result.payload.instruction??'',stopCue:result.payload.segments?.[0]?.stop_cue??result.payload.stop_cue??'',lessons:result.payload.lesson_version_ids??[],remainingSegments:result.payload.segments?.slice(1)??[]});
  }catch(cause){if(current())fail(cause);}finally{if(current())setBusy(false);}
 };
 const save=async()=>{
  if(!editor)return;const mutation=beginMutation();if(!mutation)return;const {current,finish}=mutation;
  const content=editor.kind==='lesson'?{title:editor.title,segments:[{instruction:editor.instruction,stop_cue:editor.stopCue},...(editor.remainingSegments??[])]}
   :{title:editor.title,lesson_version_ids:editor.lessons};
  try{const saved=await invoke<{document_id:string;version_no:number}>('save_document',{document_id:editor.id,expected_version:editor.id?editor.version:null,kind:editor.kind,content});
   const next=await refresh();if(!current())return;setWorkspace(next);setEditor(null);setRead(null);setNotice(`Đã lưu phiên bản ${saved.version_no}. Nội dung vẫn riêng tư.`);
  }catch(cause){if(current())fail(cause);}finally{finish();if(current())setBusy(false);}
 };
 const loadFeedback=async(id:string)=>{
  const current=begin();setEnrollmentId(id);setSubject('');setFeedback([]);setFeedbackBody('');setTeacherConfirmed(false);
  try{const result=await invoke<Feedback[]>('read_feedback',{enrollment_id:id});if(current())setFeedback(result);}
  catch(cause){if(current())fail(cause);}finally{if(current())setBusy(false);}
 };
 const selected=workspace?.enrollments.find(e=>e.id===enrollmentId);
 const matching=feedback.filter(f=>subject==='course'?f.kind==='course':f.attendance_id===subject).sort((a,b)=>b.revision-a.revision)[0];
 const saveFeedback=async()=>{
  if(!selected || !subject)return;const mutation=beginMutation();if(!mutation)return;const {current,finish}=mutation;
  try{await invoke('save_feedback',{enrollment_id:selected.id,kind:subject==='course'?'course':'session',attendance_id:subject==='course'?null:subject,
   expected_revision:matching?.revision??0,body:feedbackBody,provenance,teacher_confirmed:teacherConfirmed});
   const next=await invoke<Feedback[]>('read_feedback',{enrollment_id:selected.id});if(!current())return;setFeedback(next);setNotice('Đã lưu nhận xét riêng. Học viên chưa thấy bản nháp này.');
  }catch(cause){if(current())fail(cause);}finally{finish();if(current())setBusy(false);}
 };
 // Keep one send key across uncertain retries of the same exact revision.
 const sendKey=useRef<{id:string;revision:number;key:string}|null>(null);
 const sendFeedback=async()=>{
  if(!selected || !matching)return;const mutation=beginMutation();if(!mutation)return;const {current,finish}=mutation;
  if(sendKey.current?.id!==matching.id || sendKey.current.revision!==matching.revision)sendKey.current={id:matching.id,revision:matching.revision,key:crypto.randomUUID()};
  try{await invoke('send_feedback',{enrollment_id:selected.id,feedback_id:matching.id,expected_revision:matching.revision,idempotency_key:sendKey.current.key});
   const next=await invoke<Feedback[]>('read_feedback',{enrollment_id:selected.id});if(!current())return;setFeedback(next);setNotice('Đã gửi nhận xét cho đúng học viên được phân công.');
  }catch(cause){if(current())fail(cause);}finally{finish();if(current())setBusy(false);}
 };
 if(loadedUser!==userId || !workspace)return null;
 const author=workspace.role==='author',reviewer=workspace.role==='reviewer',learner=workspace.role==='learner';
 return <section className="teacher-collaboration" aria-label="Cộng tác giáo viên riêng tư" aria-busy={busy}>
  <div className="teacher-panel"><span className="teacher-kicker">NHÓM ĐƯỢC MỜI · RIÊNG TƯ</span><h2>{learner?'Nhận xét dành cho bạn':'Cộng tác và phản hồi'}</h2>
   <p>Nội dung chỉ dành cho người được phân quyền. Duyệt chuyên gia chưa đồng nghĩa với xuất bản.</p>
   {workspace.role==='admin' && <p>Phân công reviewer, xử lý yêu cầu mời và báo cáo vận hành được thực hiện qua Miu/admin. Trang này không mở rộng bảng điều khiển Owner.</p>}
   {notice && <p className="teacher-success" role="status">{notice}</p>}{error && <p className="teacher-error" role="alert">{error}</p>}
  </div>
  {!learner && <form className="teacher-panel" onSubmit={event=>{event.preventDefault();void act('save_profile',{display_name:name,bio},'Đã lưu hồ sơ riêng.');}}>
   <h3>Hồ sơ riêng của bạn</h3><label>Tên hiển thị<input required maxLength={120} value={name} onChange={e=>setName(e.target.value)}/></label>
   <label>Giới thiệu và chuyên môn<textarea maxLength={2000} value={bio} onChange={e=>setBio(e.target.value)}/></label><p>Phần giới thiệu không tự xác nhận tư cách chuyên gia hay cấp quyền.</p>
   <button className="teacher-secondary" disabled={busy}>Lưu hồ sơ</button>
  </form>}
  {(author || reviewer) && <div className="teacher-workspace-grid">
   <aside className="teacher-panel"><h3>{reviewer?'Nội dung được phân công':'Bài học và khóa học của bạn'}</h3>
    {author && <div className="collaboration-actions">{(['lesson','course'] as const).map(kind=><button key={kind} type="button" className="teacher-secondary" disabled={busy} onClick={()=>{++generation.current;setRead(null);setEditor({id:null,kind,version:0,title:'',instruction:'',stopCue:'',lessons:[]});}}>{kind==='lesson'?'Bài học mới':'Khóa học mới'}</button>)}</div>}
    {!workspace.documents.length && <p>Chưa có nội dung.</p>}{workspace.documents.map(doc=><button type="button" className="teacher-draft-item" disabled={busy} key={doc.id} onClick={()=>void open(doc)}><strong>{doc.title}</strong><span>{doc.kind==='lesson'?'Bài học':'Khóa học'} · v{doc.version_no} · {statusLabels[doc.status]??doc.status}</span></button>)}
   </aside>
   {editor && <div className="teacher-panel"><h3>{editor.kind==='lesson'?'Soạn bài học':'Soạn khóa học'}</h3>
    <form onSubmit={event=>{event.preventDefault();void save();}}><fieldset disabled={busy || !author || read?.status==='withdrawn'}><label>Tiêu đề<input required maxLength={120} value={editor.title} onChange={e=>setEditor({...editor,title:e.target.value})}/></label>
     {editor.kind==='lesson'?<><label>Hướng dẫn thực hành<textarea required maxLength={12000} value={editor.instruction} onChange={e=>setEditor({...editor,instruction:e.target.value})}/></label><label>Dấu hiệu dừng hoặc điều chỉnh<textarea required maxLength={2000} value={editor.stopCue} onChange={e=>setEditor({...editor,stopCue:e.target.value})}/></label></>
      :<><p>Khóa học ghim đúng phiên bản bài học; chuyên gia chỉ duyệt khi các bài đã được duyệt.</p>{workspace.documents.filter(doc=>doc.kind==='lesson').map(doc=><label key={doc.id} className="collaboration-check"><input type="checkbox" checked={editor.lessons.includes(doc.version_id)} onChange={e=>setEditor({...editor,lessons:e.target.checked?[...editor.lessons,doc.version_id]:editor.lessons.filter(id=>id!==doc.version_id)})}/>{doc.title} · v{doc.version_no} · {statusLabels[doc.status]}</label>)}</>}
     {author && <button className="teacher-primary">Lưu phiên bản mới</button>}</fieldset></form>
    {author && read && <div className="collaboration-actions">
     {['draft','changes_requested'].includes(read.status) && <button className="teacher-secondary" type="button" disabled={busy} onClick={()=>void act('submit_document',{document_id:read.document_id,expected_version:read.version_no},'Đã gửi phiên bản đã lưu cho chuyên gia.',true)}>Gửi phiên bản đã lưu để review</button>}
     <button className="teacher-secondary" type="button" disabled={busy} onClick={()=>void act('withdraw_document',{document_id:read.document_id,expected_version:read.version_no},'Đã thu hồi mọi phiên bản của nội dung.',true)}>Thu hồi nội dung</button>
    </div>}
    {reviewer && read && <div><label>Phản hồi chuyên gia<textarea maxLength={4000} value={reviewMessage} onChange={e=>setReviewMessage(e.target.value)}/></label>
     <div className="collaboration-actions">{(['changes_requested','approved'] as const).map(decision=><button type="button" className="teacher-secondary" key={decision} disabled={busy || !reviewMessage.trim()} onClick={()=>void act('review_document',{document_id:read.document_id,expected_version:read.version_no,decision,message:reviewMessage},'Đã ghi nhận quyết định chuyên gia.',true)}>{decision==='approved'?'Duyệt chuyên gia':'Yêu cầu chỉnh sửa'}</button>)}</div></div>}
    {read?.payload.segments && <div><h4>Toàn bộ hướng dẫn của phiên bản đang xem</h4>{read.payload.segments.map((segment,i)=><article key={i}><strong>Phần thực hành {i+1}</strong><p>{segment.instruction}</p><p>Dừng hoặc điều chỉnh: {segment.stop_cue||'Chưa ghi rõ; cần chuyên gia xem xét.'}</p></article>)}</div>}
    {read?.kind==='course' && <div><h4>Bài học ghim trong khóa</h4>{(read.payload.lesson_version_ids??[]).map(id=>{const lesson=read.pinned_lessons?.find(l=>l.version_id===id);return <article key={id}><strong>{lesson?`${lesson.payload.title} · v${lesson.version_no}`:'Phiên bản bài học chưa đủ điều kiện xem/duyệt'}</strong>{lesson?.payload.segments.map((segment,i)=><p key={i}>{segment.instruction} · Dừng/điều chỉnh: {segment.stop_cue||'Chưa ghi rõ'}</p>)}</article>;})}</div>}
    {read && <><h4>Lịch sử tác giả và phiên bản</h4>{read.history.map(h=><p key={h.version_no}>v{h.version_no} · {statusLabels[h.status]} · tác giả {h.author_id}</p>)}<h4>Nhận xét chuyên gia</h4>{read.reviews.length?read.reviews.map((rev,i)=><p key={i}>{statusLabels[rev.decision]}: {rev.message}</p>):<p>Chưa có quyết định chuyên gia.</p>}</>}
   </div>}
  </div>}
  {(author || learner) && <div className="teacher-panel"><h3>{learner?'Nhận xét giáo viên đã gửi':'Nhận xét học viên sau buổi tập / khóa học'}</h3>
   <label>{learner?'Khóa học của bạn':'Học viên được phân công'}<select value={enrollmentId} disabled={busy} onChange={e=>{if(e.target.value)void loadFeedback(e.target.value);else{++generation.current;setEnrollmentId('');setFeedback([]);}}}><option value="">Chọn enrollment</option>{workspace.enrollments.map(en=><option key={en.id} value={en.id}>{en.learner_label} · {en.id.slice(0,8)}</option>)}</select></label>
   {!workspace.enrollments.length && <p>Chưa có phân công đang hiệu lực. Trang này không tự tạo enrollment hoặc kết quả buổi tập.</p>}
   {author && selected && <><label>Buổi tập hoặc kết thúc khóa<select value={subject} disabled={busy} onChange={e=>{setSubject(e.target.value);setFeedbackBody('');setTeacherConfirmed(false);setProvenance('human');}}><option value="">Chọn buổi đã hoàn thành</option>{selected.sessions.map((s,i)=><option key={s.id} value={s.id}>Buổi tập {i+1} · {s.id.slice(0,8)}</option>)}{selected.completed && <option value="course">Hoàn thành khóa học</option>}</select></label>
    {subject && <><label>Nhận xét gửi cho học viên<textarea maxLength={4000} value={feedbackBody} onChange={e=>setFeedbackBody(e.target.value)}/></label><p>Nhận xét quan sát và hỗ trợ thực hành; không chẩn đoán hay chấm điểm sức khỏe. Không nhập ghi chú riêng vào phần này.</p>
     <label>Nguồn nội dung<select value={provenance} onChange={e=>{setProvenance(e.target.value);setTeacherConfirmed(false);}}><option value="human">Giáo viên tự viết</option><option value="ai_assisted_teacher_confirmed">AI hỗ trợ, giáo viên kiểm tra và xác nhận</option></select></label>
     {provenance!=='human' && <label className="collaboration-check"><input type="checkbox" checked={teacherConfirmed} onChange={e=>setTeacherConfirmed(e.target.checked)}/>Tôi đã kiểm tra và chịu trách nhiệm về nội dung có AI hỗ trợ.</label>}
     <div className="collaboration-actions"><button className="teacher-secondary" type="button" disabled={busy || !feedbackBody.trim() || (provenance!=='human' && !teacherConfirmed)} onClick={()=>void saveFeedback()}>Lưu nháp nhận xét</button>
      {matching && <button className="teacher-primary" type="button" disabled={busy || !!matching.sent_at} onClick={()=>void sendFeedback()}>Gửi bản đã lưu v{matching.revision} cho học viên</button>}</div>
    </>}
   </>}
   {feedback.map(f=><article className="collaboration-feedback" key={`${f.id}:${f.revision}`}><strong>{f.kind==='course'?'Kết thúc khóa':'Sau buổi tập'} · v{f.revision} · {f.sent_at?'Đã gửi':'Bản nháp riêng'}</strong><p>{f.body}</p><small>{f.provenance==='human'?'Giáo viên tự viết':'AI hỗ trợ · giáo viên đã xác nhận'} · giáo viên {f.teacher_id}</small></article>)}
   {selected && !feedback.length && <p>{learner?'Chưa có nhận xét đã gửi.':'Chưa có nhận xét cho enrollment này.'}</p>}
  </div>}
  {author && <form className="teacher-panel" onSubmit={event=>{event.preventDefault();void act('invite_request',{email:inviteEmail,reason:inviteReason},'Đã gửi yêu cầu tới Miu/admin. Chưa gửi lời mời hay cấp quyền.');}}><h3>Đề xuất mời thêm giáo viên</h3>
   <label>Email giáo viên<input required type="email" maxLength={254} value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)}/></label><label>Lý do cộng tác<textarea required maxLength={1000} value={inviteReason} onChange={e=>setInviteReason(e.target.value)}/></label>
   <p>Admin xem xét riêng; yêu cầu này không tự gửi email hay cấp vai trò.</p><button className="teacher-secondary" disabled={busy}>Gửi yêu cầu mời</button>
  </form>}
 </section>;
}
