export type AiGateEnvironment = {
  supabaseUrl?: string;
  stagingEnabled?: string;
  spendControlApproved?: string;
  gatewayApiKey?: string;
};

const STAGING_SUPABASE_URL = "https://mhumbczqrzutdnraafhs.supabase.co";

export function aiSpendGateOpen(environment: AiGateEnvironment): boolean {
  return environment.supabaseUrl?.replace(/\/$/, "") === STAGING_SUPABASE_URL
    && environment.stagingEnabled === "true"
    && environment.spendControlApproved === "true"
    && Boolean(environment.gatewayApiKey?.trim());
}
