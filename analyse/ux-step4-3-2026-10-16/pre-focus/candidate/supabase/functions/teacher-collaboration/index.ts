import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { readBoundedJson, RequestBodyTimeoutError, RequestBodyTooLargeError } from "../_shared/boundedRequest.ts";
import { createTeacherCollaborationHandler, type CollaborationClients } from "../_shared/teacherCollaboration.ts";

Deno.serve(createTeacherCollaborationHandler({
 env: name => Deno.env.get(name), readJson: readBoundedJson,
 isBodyTooLarge: error => error instanceof RequestBodyTooLargeError,
 isBodyTimeout: error => error instanceof RequestBodyTimeoutError,
 clients: authorization => {
  const url=Deno.env.get('SUPABASE_URL');
  const publicKey=Deno.env.get('SUPABASE_PUBLISHABLE_KEY')??Deno.env.get('SUPABASE_ANON_KEY');
  const serverKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!url || !publicKey || !serverKey)throw Error('collaboration_unavailable');
  const auth={autoRefreshToken:false,persistSession:false,detectSessionInUrl:false};
  return { user:createClient(url,publicKey,{auth,global:{headers:{Authorization:authorization}}}),
   server:createClient(url,serverKey,{auth}) } as unknown as CollaborationClients;
 },
}));
