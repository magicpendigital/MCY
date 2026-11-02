import { newId } from '../compat';
import { CONSENT_POLICY_VERSIONS, emptyConsentState, saveConsentEvent, type LearnerClient, type ConsentState, type ConsentPurpose, type ConsentPolicyVersions } from './learnerData';

export async function persistConsentChoices(
  client: LearnerClient, userId: string, next: ConsentState, source: 'onboarding' | 'settings', retryKeys: Map<string,string>, channelValue: 'web' | 'ios' | 'android', current: () => boolean,
): Promise<{consents: ConsentState; policyVersions: ConsentPolicyVersions; matchesRequested: boolean; hasUnsettledWrites: boolean}> {
  if (!current()) throw Error('account_changed');
  const read = async () => {
    const [consentRead, versionRead] = await Promise.all([client.rpc("get_my_consent_state"), client.rpc("get_my_consent_policy_versions")]);
    if (consentRead.error || versionRead.error) throw new Error("Chưa đối chiếu được quyền dữ liệu đã lưu. Hãy thử lại.");
    const consents = consentRead.data as ConsentState | null;
    if (!consents || (Object.keys(emptyConsentState) as ConsentPurpose[]).some(p => typeof consents[p] !== "boolean")) throw new Error("Chưa đối chiếu được quyền dữ liệu đã lưu. Hãy thử lại.");
    return { consents, policyVersions: (versionRead.data as ConsentPolicyVersions) ?? {} };
  };
  // A lost response does not prove rollback. A user-triggered retry acknowledges
  // the original exact event first, before a contrary grant/revocation can follow.
  const settle = async (entries: Array<[string, string]>) => Promise.allSettled(entries.map(async ([signature, key]) => {
    const [entryUserId, purpose, granted, version, originalSource, channel] = JSON.parse(signature) as [string, ConsentPurpose, boolean, string, "onboarding" | "settings", "web" | "ios" | "android"];
    if (entryUserId !== userId) throw Error('account_changed');
    await saveConsentEvent(client, purpose, granted, version, originalSource, key, channel);
    if (retryKeys.get(signature) === key) retryKeys.delete(signature);
  }));
  const pending = [...retryKeys.entries()].filter(([signature]) => JSON.parse(signature)[0] === userId);
  const replay = await settle(pending);
  if (replay.some(result => result.status === "rejected")) return { ...await read(), matchesRequested: false, hasUnsettledWrites: true };
  // Every new choice reconciles committed state after uncertain events settle.
  const baseline = await read();
  if (!current()) throw Error("account_changed");
  const events = (Object.keys(next) as ConsentPurpose[]).filter(purpose => {
    const currentPolicyVersion = CONSENT_POLICY_VERSIONS[purpose];
    const needsReacceptance = baseline.policyVersions[purpose] !== currentPolicyVersion
      && next[purpose];
    return next[purpose] !== baseline.consents[purpose] || needsReacceptance;
  });
  const entries = events.map(purpose => {
    const signature = JSON.stringify([userId, purpose, next[purpose], CONSENT_POLICY_VERSIONS[purpose], source, channelValue]);
    if (!retryKeys.has(signature)) retryKeys.set(signature, newId());
    return [signature, retryKeys.get(signature)!] as [string,string];
  });
  const outcomes = await settle(entries);
  const { consents, policyVersions } = await read();
  const matchesRequested = outcomes.every(outcome => outcome.status === "fulfilled") && (Object.keys(next) as ConsentPurpose[]).every(purpose => next[purpose] === consents[purpose]
    && (!next[purpose] || policyVersions[purpose] === CONSENT_POLICY_VERSIONS[purpose]));
  return { consents, policyVersions, matchesRequested, hasUnsettledWrites: outcomes.some(result => result.status === "rejected") };
}
