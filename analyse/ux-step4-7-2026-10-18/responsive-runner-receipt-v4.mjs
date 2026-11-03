export function buildCloseReceipt({ startedAt, endedAt, command, cwd, exitCode, signal, budgetExceeded, runnerBudgetMs, caseTimeoutMs, freezeSha256, sourceSha256, runnerSha256, spawnError, verifyPostPins }) {
  let postPinsMatch = true;
  let postPinError = null;
  try {
    verifyPostPins();
  } catch (error) {
    postPinsMatch = false;
    postPinError = String(error);
  }
  const status = exitCode === 0 && !budgetExceeded && postPinsMatch && !spawnError ? 'PASS' : 'FAIL';
  return {
    startedAt, endedAt, command, cwd, exitCode, signal, budgetExceeded,
    runnerBudgetMs, caseTimeoutMs, freezeSha256,
    sourceFreezeSha256: sourceSha256, runnerSha256,
    postPinsMatch, postPinError, spawnError, status,
    forcedBudgetCleanup: budgetExceeded ? 'UNVERIFIED_NO_AUTOMATIC_RETRY' : 'NOT_TRIGGERED',
    executionMode: 'Scoped local Edge review; exact synthetic frame, deny proxy and CSP; no real outbound media/backend.',
  };
}
