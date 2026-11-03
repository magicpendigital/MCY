type RpcResult = { data: unknown; error: { code?: string } | null };
export type CollaborationClients = {
 user: { auth: { getUser(token: string): Promise<{ data: { user: { id: string; email_confirmed_at?: string | null } | null }; error: unknown }> } };
 server: { rpc(name: string, args: Record<string, unknown>): PromiseLike<RpcResult> };
};
export type CollaborationDependencies = {
 env(name: string): string | undefined;
 clients(authorization: string): CollaborationClients;
 readJson(request: Request, maxBytes: number): Promise<unknown>;
 isBodyTooLarge(error: unknown): boolean;
 isBodyTimeout(error: unknown): boolean;
};
const actions = new Set(['workspace','save_profile','invite_request','admit_member','admin_report','revoke_member','decide_invite_request',
 'read_document','save_document','submit_document','withdraw_document','assign_reviewer','review_document',
 'approved_catalog','admin_enrollment','admin_completion','read_feedback','save_feedback','send_feedback']);
const headers = { 'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info',
 'Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin' };
const response = (status: number, body: unknown) => new Response(JSON.stringify(body), {status,headers});
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value==='object' && !Array.isArray(value);

/** Authenticated identity only. SQL rechecks live roles, assignment and state for every operation. */
export function createTeacherCollaborationHandler(deps: CollaborationDependencies) {
 return async (request: Request): Promise<Response> => {
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='POST')return response(405,{error:'method_not_allowed'});
  if(deps.env('MCY_TEACHER_COLLABORATION_ENABLED')!=='true' || deps.env('SUPABASE_URL')!=='https://mhumbczqrzutdnraafhs.supabase.co')
   return response(404,{error:'collaboration_unavailable'});
  const authorization=request.headers.get('authorization')??'';
  if(!/^Bearer \S+$/i.test(authorization))return response(401,{error:'authentication_required'});
  try {
   const clients=deps.clients(authorization);
   const verified=await clients.user.auth.getUser(authorization.slice(7));
   const actor=verified.data.user;
   if(verified.error || !actor || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(actor.id) || !actor.email_confirmed_at)
    return response(401,{error:'authentication_required'});
   const body=await deps.readJson(request,55000);
   if(!record(body) || Object.keys(body).some(key=>!['action','payload'].includes(key)) || typeof body.action!=='string' || !actions.has(body.action) || !record(body.payload)
    || Object.keys(body.payload).some(key=>['actor_id','user_id','role','expert_verified','publish','publication_enabled'].includes(key)))
    return response(400,{error:'invalid_collaboration_request'});
   const result=await clients.server.rpc('mcy_collaboration_dispatch',{p_actor_id:actor.id,p_action:body.action,p_payload:body.payload});
   if(result.error){
    const code=result.error.code;
    if(code==='42501')return response(403,{error:'collaboration_access_denied'});
    // Domain conflicts are non-retryable; genuine SQLSTATE 40001 remains an infrastructure failure.
    if(code==='PT409' || code==='23505')return response(409,{error:'collaboration_conflict'});
    if(code==='22023' || code==='22P02' || code==='23514' || code==='23502')return response(400,{error:'invalid_collaboration_request'});
    if(code==='54000')return response(429,{error:'collaboration_limit'});
    return response(503,{error:'collaboration_unavailable'});
   }
   return response(200,{result:result.data});
  }catch(error){
   if(deps.isBodyTooLarge(error))return response(413,{error:'request_body_too_large'});
   if(deps.isBodyTimeout(error))return response(408,{error:'request_body_timeout'});
   if(error instanceof SyntaxError)return response(400,{error:'invalid_collaboration_request'});
   return response(503,{error:'collaboration_unavailable'});
  }
 };
}
